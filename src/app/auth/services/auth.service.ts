import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { NetworkType, UInt64, Address, BlockInfo, Account, Password } from 'tsjs-xpx-chain-sdk';

import { AppConfig } from '../../config/app.config';
import { WalletService, CurrentWalletInterface } from '../../wallet/services/wallet.service';
import { DataBridgeService } from '../../shared/services/data-bridge.service';
import { NodeService } from '../../servicesModule/services/node.service';
import { NamespacesService } from '../../servicesModule/services/namespaces.service';
import { TransactionsService } from '../../transactions/services/transactions.service';
import { ServicesModuleService } from '../../servicesModule/services/services-module.service';
import { SharedService } from '../../shared/services/shared.service';
import { ProximaxProvider } from '../../shared/services/proximax.provider';
import { MosaicService } from '../../servicesModule/services/mosaic.service';
import { NemProviderService } from '../../swap/services/nem-provider.service';
import { environment } from '../../../environments/environment';
import Peer from 'peerjs';
import {InvitationRequestMessage, InvitationResponseMessage} from 'siriusid-sdk';
import { setTimeout } from 'timers';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  eventShowModalSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  eventShowModal$: Observable<number> = this.eventShowModalSubject.asObservable();
  isLogged = false;
  subscription = {};
  logged = false;
  isLoggedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(this.logged);
  isLogged$: Observable<boolean> = this.isLoggedSubject.asObservable();

  qrInvitation;
  peer: Peer;
  withSiriusID = false;
  walletNameSID = null;

  constructor(
    private walletService: WalletService,
    private route: Router,
    private dataBridgeService: DataBridgeService,
    private nodeService: NodeService,
    private nemProvider: NemProviderService,
    private namespaces: NamespacesService,
    private transactionService: TransactionsService,
    private serviceModuleService: ServicesModuleService,
    private sharedService: SharedService,
    private proximaxProvider: ProximaxProvider,
    private mosaicService: MosaicService,
    private ngZone: NgZone
  ) {
    this.setLogged(false);
  }

  /**
   * Destroy node selected
   *
   * @memberof LoginService
   */
  destroyNodeSelected() {
    this.dataBridgeService.closeConection();
    if (this.subscription['nodeSelected'] !== undefined) {
      this.subscription['nodeSelected'].unsubscribe();
    }
  }

  /**
   *
   *
   * @param {*} common
   * @param {CurrentWalletInterface} currentWallet
   * @returns
   * @memberof AuthService
   */
  async login(common: any, currentWallet: CurrentWalletInterface) {
    this.walletService.destroyDataWalletAccount();
    // console.log('This current Wallet------------------------->', currentWallet);
    // const commonCopy = Object.assign({}, common);
    const currentAccount = Object.assign({}, currentWallet.accounts.find(elm => elm.firstAccount === true));
    // let isValid = false;
    if (currentAccount) {
      if (!currentWallet) {
        this.sharedService.showError('', 'Dear user, the wallet is missing');
        return false;
      } else if (!this.nodeService.getNodeSelected()) {
        this.nodeService.initNode();
      }
      const decrypted = this.walletService.decrypt(common, currentAccount);
      if (!decrypted) {
        return false;
      } else {
        let isValid = true;
        currentWallet.accounts.forEach(element => {
          if (element.network !== environment.typeNetwork.value) {
            isValid = false;
          }
        });

        if (isValid) {
          this.walletService.use(currentWallet);
        } else {
          this.sharedService.showError('', 'Account not allowed for this network');
          return false;
        }
      }
    } else {
      this.sharedService.showError('', 'Dear user, the main account is missing');
      return false;
    }

   /* this.namespaces.destroyDataNamespace();
    this.mosaicService.resetMosaicsStorage();*/
    this.nemProvider.validaTransactionsSwap();
    this.setLogged(true);
    this.dataBridgeService.closeConection();
    this.dataBridgeService.connectnWs();
    this.serviceModuleService.changeBooksItem();
    const address: Address[] = [];
    for (const account of currentWallet.accounts) {
      address.push(this.proximaxProvider.createFromRawAddress(account.address));
    }

    this.mosaicService.getMosaicXPX();
    this.namespaces.searchNamespacesFromAccounts(address);
    // if (!this.walletNameSID){
    //   this.transactionService.searchAccountsInfo(this.walletService.currentWallet.accounts);
    // }
    this.transactionService.searchAccountsInfo(this.walletService.currentWallet.accounts);
    this.dataBridgeService.searchBlockInfo();
    this.dataBridgeService.searchBlockInfo(true);

    //this.route.navigate([`/${AppConfig.routes.dashboard}`]);
    this.ngZone.run(() => this.route.navigate([`/${AppConfig.routes.dashboard}`])).then();
    return true;
  }

  /**
   * Allow to load the component in the routing
   *
   * @param {*} params
   * @memberof AuthService
   */
  setLogged(params: any) {
    this.eventShowModalSubject.next(0);
    this.logged = params;
    this.isLogged = params;
    this.isLoggedSubject.next(this.logged);
    this.transactionService.setBalance$('0.000000');
  }

  setEventShowModal(num: number) {
    this.eventShowModalSubject.next(num);
  }


  /**
   * Subscribe to node
   *
   * @memberof LoginService
   */
  subscribeNodeSelected() {
    this.subscription['nodeSelected'] = this.nodeService.getNodeObservable().subscribe(
      next => {
        this.dataBridgeService.closeConection();
        this.dataBridgeService.connectnWs(next);
      }
    );
  }


  getEventShowModal(): Observable<number> {
    return this.eventShowModal$;
  }


  /**
   * set value to log in and log out
   *
   * @returns
   * @memberof LoginService
   */
  getIsLogged() {
    return this.isLogged$;
  }

  /**
   * Structuring the information of the wallet for selection
   *
   * @param {*} wallets
   * @returns
   * @memberof LoginService
   */
  walletsOption(wallets: Array<any> = []) {
    wallets = (wallets == null) ? [] : wallets;
    const r = [];
    wallets.forEach((item) => {
      const a = item.accounts.find(x => x.label === 'Primary');
      r.push({ value: item, label: item.name });
    });
    return r;
  }


  /**
   * Create QR Code for Login by SiriusID
   */
  createInvitationRequestMessage(){
    let networkType = environment.typeNetwork.value;
      let nodeUrl = environment.blockchainConnection.protocol + '://' + environment.blockchainConnection.host;
      let account = Account.generateNewAccount(networkType);
      let mess = InvitationRequestMessage.create("Login request from Proximax Sirius Wallet", account.publicKey, nodeUrl);
      this.qrInvitation = mess.generateQR();
  
      //console.log('channel: ' + mess.getSessionId());
      this.peer = new Peer(mess.getSessionId()); 
      this.peer.on('connection', (conn) => {
        conn.on('data', async (data) => {
          let resMess = InvitationResponseMessage.createFromPayload(data,account.privateKey);  
          await this.importWalletAndLogin(resMess.getWltBase64(),resMess.getSecretKey());
        });
        conn.on('open', () => {
          let interval = setInterval(() => {
            if (this.withSiriusID){
              console.log("response message to SiriusID");
              conn.send('Received');
              this.withSiriusID = false;
              clearInterval(interval);
            }
          },100)
          
        });
        conn.on('close', () => {
          console.log('connection close');
        })
      });
  
      this.peer.on('error', (error) => {
        console.log("connection has an error");
        console.log(error);
      })
  
      this.peer.on('close', () => {
        console.log("peer close");
      })
  }

  async importWalletAndLogin(wlt: any, secretKey: string) {
    if (wlt) {
      const existWallet = this.walletService.getWalletStorage().find(
        (element: any) => {
          let publicKey = wlt.accounts[0].publicAccount.publicKey;
          return element.accounts[0].publicAccount.publicKey === publicKey;
        }
      );
      if (existWallet !== undefined) {
        this.walletService.removeWallet(existWallet.name);
      }
      if (wlt.accounts[0].network === environment.typeNetwork.value) {
        let walletName = wlt.name;
        this.walletNameSID = walletName;
        walletName = (walletName.includes(' ') === true) ? walletName.split(' ').join('_') : walletName
        const accounts = [];
        const contacs = [];
        if (wlt.accounts.length !== undefined) {
          for (const element of wlt.accounts) {
            accounts.push(element);
            contacs.push({ label: element.name, value: element.address.split('-').join(''), walletContact: true });
          }
          this.serviceModuleService.setBookAddress(contacs, walletName);
        }
        const wallet = {
          name: walletName,
          accounts: accounts
        }
        let walletsStorage = JSON.parse(localStorage.getItem(environment.nameKeyWalletStorage));
        walletsStorage.push(wallet);
        localStorage.setItem(environment.nameKeyWalletStorage, JSON.stringify(walletsStorage));

        let pass = new Password(secretKey);
        
        let privateKey = this.proximaxProvider.decryptPrivateKey(pass,wallet.accounts[0]['encrypted'],wallet.accounts[0]['iv']);
        
        let commonValue = {
          password: secretKey,
          privateKey: privateKey
        }
        await this.login(commonValue, wallet);
        
        setTimeout(() => {
          this.withSiriusID = true;
        },1500)
        setTimeout(() => {
          this.peer.destroy();
        },2000)
      } else {
        this.sharedService.showError('', 'Invalid network type');
      }
    }
  }
}
