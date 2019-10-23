import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { NetworkType, UInt64, Address, BlockInfo } from 'tsjs-xpx-chain-sdk';

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
    private mosaicService: MosaicService
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
  * Method to login
  *
  * @param {*} common
  * @param {*} wallet
  * @returns
  * @memberof LoginService
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
        this.sharedService.showError('', 'Please, select a node.');
        this.route.navigate([`/${AppConfig.routes.selectNode}`]);
        return false;
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


    this.nemProvider.validaTransactionsSwap();
    this.setLogged(true);
    this.dataBridgeService.closeConection();
    this.dataBridgeService.connectnWs();

    let wallet = this.walletService.getWalletTransNisStorage().find(el => el.name === this.walletService.getCurrentWallet().name);
    if (wallet !== undefined && wallet !== null) {
      this.walletService.setSwapTransactions$(wallet.transactions);
    } else {
      this.walletService.setSwapTransactions$([]);
    }
    // load services and components
    this.route.navigate([`/${AppConfig.routes.dashboard}`]);
    this.serviceModuleService.changeBooksItem();

    const address: Address[] = [];
    for (let account of currentWallet.accounts) {
      address.push(this.proximaxProvider.createFromRawAddress(account.address));
    }

    this.mosaicService.getMosaicXPX();
    // this.dataBridgeService.searchTransactionStatus();
    this.namespaces.searchNamespacesFromAccounts(address);
    this.transactionService.searchAccountsInfo(this.walletService.currentWallet.accounts);
    this.dataBridgeService.searchBlockInfo();
    // this.nemProvider.searchUnconfirmedSwap(this.walletService.currentWallet.accounts, commonCopy);
    return true;
  }

  /**
   * Allow to load the component in the routing
   *
   * @param {*} params
   * @memberof LoginService
   **/
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
   *Set value to log in and log out
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


}
