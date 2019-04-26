import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  MosaicInfo
} from 'proximax-nem2-sdk';
import { first, switchMap, catchError } from 'rxjs/operators';
import { DashboardService } from '../../services/dashboard.service';
import { TransactionsService } from '../../../transactions/service/transactions.service';
import { WalletService } from '../../../shared/services/wallet.service';
import { NemProvider } from '../../../shared/services/nem.provider';
import { AuthService } from '../../../auth/services/auth.service';
import { SharedService } from '../../../shared/services/shared.service';

@Component({
  selector: 'app-dashboard2',
  templateUrl: './dashboard2.component.html',
  styleUrls: ['./dashboard2.component.css']
})
export class DashboardComponent2 implements OnInit, OnDestroy {

  count = 0;
  cantConfirmed = 0;
  transactionsConfirmed: any = [];
  elementsUnconfirmed: any;
  confirmedSelected = true;
  unconfirmedSelected = false;
  cantUnconfirmed = 0;
  dataSelected: any = {};
  searching = true;
  iconReloadDashboard = false;

  headElements = ['Type', 'Timestamp', 'Fee', 'Sender', 'Recipient'];
  subscriptions = [
    'getConfirmedTransactionsCache',
    'transactionsUnconfirmed',
    'getAllTransactions',
    'transactionsConfirmed'
  ];
  infoMosaic: MosaicInfo;
  typeTransactions: any;

  constructor(
    public transactionsService: TransactionsService,
    private dashboardService: DashboardService,
    private walletService: WalletService,
    private nemProvider: NemProvider,
    private authService: AuthService,
    private sharedService: SharedService,
  ) {

  }

  ngOnInit() {
    this.typeTransactions = this.transactionsService.arraTypeTransaction;
    this.dashboardService.incrementViewDashboard();
    this.dashboardService.subscribeLogged();
    this.destroySubscription();
    this.getTransactions();
    this.getUnconfirmedTransactionsCache();
  }

  ngOnDestroy(): void {
    this.destroySubscription();
  }


  /**
   * Destroy all subscriptions
   *
   * @memberof DashboardComponent
   */
  destroySubscription() {
    this.subscriptions.forEach(element => {
      if (this.subscriptions[element] !== undefined) {
        this.subscriptions[element].unsubscribe();
      }
    });
  }


  getTransactions(reload = false) {
    this.sharedService.logInfo('-------------- BUSCA LAS TRANSACCIONES ------------------------');
    this.searching = true;
    this.iconReloadDashboard = false;
    //Gets all transactions confirmed in cache
    this.subscriptions['transactionsConfirmed'] = this.transactionsService.getConfirmedTransactionsCache$().subscribe(
      transactionsConfirmedCache => {
        if (this.authService.logged) {
          //  console.log("Obtiene las transacciones confirmadas en cache", transactionsConfirmedCache);
          //  console.log("proceso completado?", this.dashboardService.processComplete);
          if (transactionsConfirmedCache.length > 0) {
            this.searching = false;
            this.cantConfirmed = transactionsConfirmedCache.length;
            this.transactionsConfirmed = transactionsConfirmedCache.slice(0, 10);
          } else if (this.authService.logged && this.dashboardService.isIncrementViewDashboard === 1 || reload) {
            this.dashboardService.incrementViewDashboard();
            this.getAllTransactions();
          } else {
            this.searching = false;
            this.iconReloadDashboard = true;
          }
        }
      }, error => {
        this.sharedService.logInfo('-------------- ERROR OBTENIENDO LAS TRANSACCIONES DE CACHE ------------------------');
        //  console.log("------> ", error);

        this.searching = false;
        this.iconReloadDashboard = true;
        this.sharedService.showInfo("", "An error occurred while searching for transactions");
      });
  }

  /**
   *Get all transactions
   *
   * @memberof DashboardComponent
   */
  getAllTransactions() {
    //  console.log("***** BUSCA TODAS LAS TRANSACCIONES *****");
    this.subscriptions['getAllTransactions'] = this.nemProvider.getAllTransactionsFromAccount(this.walletService.publicAccount, this.walletService.network).pipe(first()).subscribe(
      allTrasactions => {
        const elementsConfirmed = this.transactionsService.buildTransactions(allTrasactions);
        this.transactionsService.setConfirmedTransaction$(elementsConfirmed)
      }, error => {
        //  console.log('-------------- ERROR TO SEARCH ALL TRANSACTIONS -------------', error);
        this.sharedService.showInfo("", "An error occurred while searching for transactions");
        this.searching = false;
        this.iconReloadDashboard = true;
      }
    );
  }


  /**
   * Get unconfirmed transactions in cache
   *
   * @memberof DashboardComponent
   */
  getUnconfirmedTransactionsCache() {
    this.subscriptions['transactionsUnconfirmed'] = this.transactionsService.getTransactionsUnconfirmedCache$().subscribe(
      resp => {
        this.elementsUnconfirmed = resp;
        this.cantUnconfirmed = resp.length;
      }
    );
  }


  /**
   *
   *
   * @param {any} param
   * @memberof DashboardComponent
   */
  selectTab(param: any) {
    if (param === 1) {
      this.confirmedSelected = true;
      this.unconfirmedSelected = false;
    } else {
      this.confirmedSelected = false;
      this.unconfirmedSelected = true;
    }
  }


}
