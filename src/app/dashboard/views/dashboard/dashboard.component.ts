import { Component, OnInit, OnDestroy } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { WalletService, SharedService } from '../../../shared';
import { TransactionsInterface } from '../../services/dashboard.interface';
import { TransactionsService } from '../../../transactions/service/transactions.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})




export class DashboardComponent implements OnInit, OnDestroy {

  // count = 0;
  cantConfirmed = 0;
  cantUnconfirmed = 0;
  confirmedSelected = true;
  dataSelected: any = {};
  iconReloadDashboard = false;
  searching = true;
  transactionsConfirmed: TransactionsInterface[] = [];
  transactionsUnconfirmed: TransactionsInterface[] = [];
  unconfirmedSelected = false;
  // confirmedSelected = true;
  // unconfirmedSelected = false;
  // iconReloadDashboard = false;

  headElements = ['Type', 'Timestamp', 'Fee', 'Sender', 'Recipient'];
  subscriptions = [
    'transactionsConfirmed',
    'transactionsUnconfirmed',
    'getAllTransactions',
    'transactionsConfirmed'
  ];
  // infoMosaic: MosaicInfo;
  // typeTransactions: any;


  constructor(
    private dashboardService: DashboardService,
    private walletService: WalletService,
    private transactionService: TransactionsService,
    private sharedService: SharedService
  ) { }

  ngOnInit() {
    this.dashboardService.incrementViewDashboard();
    this.dashboardService.subscribeLogged();
    this.subscribeTransactions();
    this.loadDashboard();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(element => {
      if (this.subscriptions[element] !== undefined) {
        this.subscriptions[element].unsubscribe();
      }
    });
  }

  /**
   *
   *
   * @memberof DashboardComponent
   */
  async loadDashboard(reload = false) {
    this.iconReloadDashboard = true;
    if (this.dashboardService.getCantViewDashboard() === 1 || reload) {
      this.searching = true;
      this.iconReloadDashboard = false;
      this.dashboardService.getAllTransactionsPromise(this.walletService.publicAccount)
        .then(response => {
          const data = [];
          response.forEach(element => {
            data.push(this.transactionService.buildDashboard(element));
          });

          this.transactionService.setTransactionsConfirmed$(data);
          this.iconReloadDashboard = false;
          this.searching = false;
          this.dashboardService.searchComplete = true;
          console.log(' ----- DATA CONFIRMED TRANSACTIONS ----', data);
        }).catch(err => {
          this.dashboardService.searchComplete = false;
          this.searching = false;
          this.iconReloadDashboard = true;
          this.sharedService.showError('Has ocurred a error', 'Possible causes: the network is offline');
          console.log('This is error ----> ', err);
        });
    } else {
      this.iconReloadDashboard = (this.dashboardService.searchComplete === false) ? true : false;
      this.searching = false;
    }
  }


  /**
   * Select tab
   *
   * @param {*} param
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

  subscribeTransactions() {
    this.subscriptions['transactionsConfirmed'] = this.transactionService.getTransactionsConfirmed$().subscribe(
      (next: TransactionsInterface[]) => {
        this.cantConfirmed = next.length;
        this.transactionsConfirmed = next;
      }
    );

    this.subscriptions['transactionsUnconfirmed'] = this.transactionService.getTransactionsUnConfirmed$().subscribe(
      (next: TransactionsInterface[]) => {
        this.cantUnconfirmed = next.length;
        this.transactionsUnconfirmed = next;
      }
    );
  }
}
