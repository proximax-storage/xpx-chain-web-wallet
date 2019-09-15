import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { NetworkType, UInt64, Address, BlockInfo, WalletAlgorithm } from 'tsjs-xpx-chain-sdk';

import { AppConfig } from '../../config/app.config';
import { WalletService, CurrentWalletInterface } from '../../wallet/services/wallet.service';
import { DataBridgeService } from '../../shared/services/data-bridge.service';
import { NodeService } from '../../servicesModule/services/node.service';
import { NamespacesService } from '../../servicesModule/services/namespaces.service';
import { TransactionsService } from '../../transactions/services/transactions.service';
import { ServicesModuleService } from '../../servicesModule/services/services-module.service';
import { SharedService } from '../../shared/services/shared.service';
import { ProximaxProvider } from 'src/app/shared/services/proximax.provider';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

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
    private namespaces: NamespacesService,
    private transactionService: TransactionsService,
    private serviceModuleService: ServicesModuleService,
    private sharedService: SharedService,
    private proximaxProvider: ProximaxProvider
  ) {
    this.setLogged(false);
  }

  /**
   * Destroy node selected
   *
   * @memberof LoginService
   */
  destroyNodeSelected() {
    this.dataBridgeService.closeConenection();
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
    this.walletService.destroyAll();
    const currentAccount = Object.assign({}, currentWallet.accounts.find(elm => elm.default === true));
    let isValid = false;
    if (currentAccount) {
      if (!currentWallet) {
        this.sharedService.showError('', 'Dear user, the wallet is missing');
        isValid = false;
      } else if (!this.nodeService.getNodeSelected()) {
        this.sharedService.showError('', 'Please, select a node.');
        this.route.navigate([`/${AppConfig.routes.selectNode}`]);
        isValid = false;
      } else if (!this.walletService.decrypt(common, currentAccount)) {
        // Decrypt / generate and check primary
        isValid = false;
      } else if (currentAccount.network === NetworkType.MAIN_NET && currentAccount.algo === WalletAlgorithm.Pass_6k && common.password.length < 40) {
        this.sharedService.showError('', 'Dear user, the wallet is missing');
      } else {
        isValid = true;
        this.walletService.use(currentWallet);
      }
    } else {
      this.sharedService.showError('', 'Dear user, the main account is missing');
    }

    if (!isValid) {
      return false;
    }

    this.setLogged(true);
    this.dataBridgeService.closeConenection();
    this.dataBridgeService.connectnWs();


    // load services and components
    this.route.navigate([`/${AppConfig.routes.dashboard}`]);
    this.serviceModuleService.changeBooksItem(
      this.proximaxProvider.createFromRawAddress(currentAccount.address)
    );

    const address: Address[] = [];
    for (let account of currentWallet.accounts) {
      address.push(this.proximaxProvider.createFromRawAddress(account.address));
    }

    this.dataBridgeService.searchTransactionStatus();
    this.namespaces.searchNamespacesFromAccounts(address);
    this.transactionService.searchAccountsInfo(this.walletService.currentWallet.accounts);
    const blockchainHeight: UInt64 = await this.proximaxProvider.getBlockchainHeight().toPromise();
    const BlockInfo : BlockInfo = await this.proximaxProvider.getBlockInfo().toPromise(); //Update-sdk-dragon
    this.dataBridgeService.setblock(blockchainHeight.compact());
    this.dataBridgeService.setblockInfo(BlockInfo); //Update-sdk-dragon
    return true;
  }

  /**
   * Allow to load the component in the routing
   *
   * @param {*} params
   * @memberof LoginService
   */
  setLogged(params: any) {
    this.logged = params;
    this.isLogged = params;
    this.isLoggedSubject.next(this.logged);
    this.transactionService.setBalance$('0.000000');
  }

  /**************************************************/


  /**
   * Subscribe to node
   *
   * @memberof LoginService
   */
  subscribeNodeSelected() {
    this.subscription['nodeSelected'] = this.nodeService.getNodeObservable().subscribe(
      next => {
        this.dataBridgeService.closeConenection();
        this.dataBridgeService.connectnWs(next);
      }
    );
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
