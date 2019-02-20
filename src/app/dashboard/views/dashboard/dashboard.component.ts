import { Component, OnInit } from '@angular/core';
import {
  MosaicInfo
} from 'proximax-nem2-sdk';
import { first } from 'rxjs/operators';
import { DashboardService } from '../../services/dashboard.service';
import { TransactionsService } from '../../../transactions/service/transactions.service';
import { WalletService } from '../../../shared/services/wallet.service';
import { NemProvider } from '../../../shared/services/nem.provider';
import { LoginService } from '../../../login/services/login.service';
import { SharedService } from '../../../shared/services/shared.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  count = 0;
  cantConfirmed = 0;
  elementsConfirmed: any = [];
  elementsUnconfirmed: any;
  confirmedSelected = true;
  unconfirmedSelected = false;
  cantUnconfirmed = 0;
  dataSelected: any = {};
  searching = true;
  reload = false;

  headElements = ['Type', 'Timestamp', 'Fee', 'Sender', 'Recipient'];
  subscriptions = [
    'getConfirmedTransactionsCache',
    'transactionsUnconfirmed',
    'getAllTransactions',
    'transactionsConfirmed'
  ];
  infoMosaic: MosaicInfo;
  typeTransaction: any;

  constructor(
    public transactionsService: TransactionsService,
    private dashboardService: DashboardService,
    private walletService: WalletService,
    private nemProvider: NemProvider,
    private loginService: LoginService,
    private sharedService: SharedService,
  ) {

  }

  ngOnInit() {
    this.typeTransaction = this.transactionsService.arraTypeTransaction;
    this.dashboardService.loadedDashboard();
    this.dashboardService.subscribeLogged();
    this.getTransactions();
    this.getUnconfirmedTransactionsCache();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(element => {
      if (this.subscriptions[element] !== undefined && this.subscriptions[element] !== 'isLogged') {
        this.subscriptions[element].unsubscribe();
      }
    });
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


  /**
   * Get transactions
   *
   * @memberof DashboardComponent
   */
  async getTransactions() {
    //Gets all transactions confirmed in cache
    this.searching = true;
    this.reload = false;
    this.destroySubscription();
    this.subscriptions['transactionsConfirmed'] = this.transactionsService.getConfirmedTransactionsCache$().subscribe(
      async transactionsConfirmedCache => {
        if (this.loginService.logged) {
          console.log("Obtiene las transacciones confirmadas en cache", transactionsConfirmedCache);
          console.log("proceso completado?", this.dashboardService.processComplete);
          if (transactionsConfirmedCache.length > 0) {
            this.elementsConfirmed = transactionsConfirmedCache.slice(0, 10);
            this.cantConfirmed = this.elementsConfirmed.length;
            this.searching = false;
          } else if (this.dashboardService.isLoadedDashboard === 1 && this.loginService.logged || !this.dashboardService.processComplete) {
            this.getAllTransactions();
          }
        }
      }, error => {
        console.log("Has ocurred a error", error);
      });
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
   *Get all transactions
   *
   * @memberof DashboardComponent
   */
  async getAllTransactions() {
    console.log("***** BUSCA TODAS LAS TRANSACCIONES *****");
    this.subscriptions['getAllTransactions'] =
      this.nemProvider.getAllTransactionsFromAccount(this.walletService.publicAccount, this.walletService.network).pipe(first()).subscribe(
        async allTrasactions => {
          const response = await this.transactionsService.buildTransactions(allTrasactions);
          this.searching = false;
          this.dashboardService.processComplete = true;
          this.transactionsService.setConfirmedTransaction$(response);
        }, error => {
          this.sharedService.showInfo("", "An error occurred while searching for transactions");
          this.searching = false;
          this.reload = true;
        });
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
