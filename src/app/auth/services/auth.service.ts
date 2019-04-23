import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { WalletService } from '../../shared/services/wallet.service';
import { AppConfig } from '../../config/app.config';
import { DataBridgeService } from "../../shared/services/data-bridge.service";
import { NodeService } from '../../servicesModule/services/node.service';
import { MosaicService } from '../../servicesModule/services/mosaic.service';
import { NamespacesService } from '../../servicesModule/services/namespaces.service';
import { TransactionsService } from '../../transactions/service/transactions.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {


  subscription = {};
  logged = false;
  isLoggedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(this.logged);
  isLogged$: Observable<boolean> = this.isLoggedSubject.asObservable();


  constructor(
    private walletService: WalletService,
    private route: Router,
    private dataBridgeService: DataBridgeService,
    private nodeService: NodeService,
    private mosaicService: MosaicService,
    private nameSpaces: NamespacesService,
    private transactionService: TransactionsService
  ) {
    this.setLogged(false);
  }


  /**
   * Destroy node selected
   *
   * @memberof LoginService
   */
  destroyNodeSelected() {
    // if (this.subscription['nodeSelected'] !== undefined) {
    //   this.subscription['nodeSelected'].unsubscribe();
    // }
  }


  /**
   * Method to login
   *
   * @param {*} common
   * @param {*} wallet
   * @returns
   * @memberof LoginService
   */
  login(common: any, wallet: any) {
    if (!this.walletService.login(common, wallet)){
      return false;
    }

    // this.transactionsService.destroyAllTransactions();
    this.setLogged(true);
    this.route.navigate([`/${AppConfig.routes.dashboard}`]);
    this.dataBridgeService.closeConenection();
    this.dataBridgeService.connectnWs();

    // load services and components
    this.transactionService.updateBalance();
    this.nameSpaces.buildNamespaceStorage();
    // this.getMosaics();
    return true;
  }


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
   * Allow to load the component in the routing
   *
   * @param {*} params
   * @memberof LoginService
   */
  setLogged(params: any) {
    this.logged = params;
    this.isLoggedSubject.next(this.logged);
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
    wallets = (wallets == null) ? [] : wallets
    const r = [{ 'value': '', 'label': 'Select wallet' }];
    wallets.forEach((item) => {
      r.push({ value: item, label: item.name });
    });
    return r;
  }

}
