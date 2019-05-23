import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef, HostListener } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { WalletService, SharedService } from '../../../shared';
import { TransactionsInterface } from '../../services/transaction.interface';
import { TransactionsService } from '../../../transactions/service/transactions.service';
import { MdbTablePaginationComponent, MdbTableDirective } from 'ng-uikit-pro-standard';
import { Address } from 'tsjs-xpx-catapult-sdk';
import { ProximaxProvider } from 'src/app/shared/services/proximax.provider';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})


export class DashboardComponent implements OnInit, OnDestroy {

  @ViewChild(MdbTablePaginationComponent) mdbTablePagination: MdbTablePaginationComponent;
  @ViewChild(MdbTableDirective) mdbTable: MdbTableDirective;
  @HostListener('input') oninput() {
    this.searchItems();
  }

  previous: any = [];
  cantTransactions = 0;
  myAddress: Address = null;
  cantConfirmed = 0;
  cantUnconfirmed = 0;
  confirmedSelected = true;
  dataSelected: TransactionsInterface = null;
  headElements = ['Type', 'Timestamp', 'Fee', 'Sender', 'Recipient'];
  iconReloadDashboard = false;
  searching = true;
  subscriptions = [
    'transactionsConfirmed',
    'transactionsUnconfirmed',
    'getAllTransactions',
    'transactionsConfirmed'
  ];
  typeTransactions: any;
  transactionsConfirmed: TransactionsInterface[] = [];
  transactionsUnconfirmed: TransactionsInterface[] = [];
  unconfirmedSelected = false;
  vestedBalance: string;
  searchTransaction = '';
  viewDashboard = true;



  constructor(
    private cdRef: ChangeDetectorRef,
    private dashboardService: DashboardService,
    private walletService: WalletService,
    private transactionService: TransactionsService,
    private sharedService: SharedService,
    private proximaxProvider: ProximaxProvider
  ) {
    this.myAddress = this.walletService.address;
  }

  ngOnInit() {
    this.typeTransactions = this.transactionService.arraTypeTransaction;
    this.dashboardService.incrementViewDashboard();
    this.dashboardService.subscribeLogged();
    this.getConfirmedAndUnconfirmedTransactions();
    this.getRecentTransactions();
    this.balance();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(element => {
      if (this.subscriptions[element] !== undefined) {
        this.subscriptions[element].unsubscribe();
      }
    });
  }

  ngAfterViewInit() {
    this.mdbTablePagination.setMaxVisibleItemsNumberTo(5);
    this.mdbTablePagination.calculateFirstItemIndex();
    this.mdbTablePagination.calculateLastItemIndex();
    this.cdRef.detectChanges();
  }

  /**
   * Get balance from account
   *
   * @memberof DashboardComponent
   */
  balance() {
    this.subscriptions['balance'] = this.transactionService.getBalance$().subscribe(
      next => {
        this.vestedBalance = `${next} XPX`;
      }, () => {
        this.vestedBalance = `0.000000 XPX`;
      }
    );
  }

  /**
   * Get the recent transactions of an account
   *
   * @memberof DashboardComponent
   */
  getRecentTransactions(reload = false) {
    this.iconReloadDashboard = true;
    // Update balance
    this.transactionService.updateBalance();
    // Validate if it is the first time the dashboard is loaded or if you click on the reload button
    if (this.dashboardService.getCantViewDashboard() === 1 || reload) {
      this.searching = true;
      this.iconReloadDashboard = false;
      this.proximaxProvider.getTransactionsFromAccount(this.walletService.publicAccount, this.walletService.network).toPromise().then(response => {
        const data = [];
        response.forEach(element => {
          //Sets the data structure of the dashboard
          const builderTransactions = this.transactionService.getStructureDashboard(element);
          if (builderTransactions !== null) {
            data.push(builderTransactions);
          }
        });

        // Establishes confirmed transactions in the observable type variable
        this.transactionService.setTransactionsConfirmed$(data);
        this.iconReloadDashboard = false;
        this.searching = false;
        this.dashboardService.searchComplete = true;
      }).catch(err => {
        this.dashboardService.searchComplete = false;
        this.searching = false;
        this.iconReloadDashboard = true;
        this.sharedService.showError('Has ocurred a error', 'Possible causes: the network is offline');
        //console.log('This is error ----> ', err);
      });
    } else {
      this.iconReloadDashboard = (this.dashboardService.searchComplete === false) ? true : false;
      this.searching = false;
    }
  }

  /**
   *
   *
   * @memberof DashboardComponent
   */
  getConfirmedAndUnconfirmedTransactions() {
    this.subscriptions['transactionsConfirmed'] = this.transactionService.getTransactionsConfirmed$().subscribe(
      (next: TransactionsInterface[]) => {
        this.cantConfirmed = next.length;
        this.transactionsConfirmed = next;
        this.cantTransactions = this.cantConfirmed;

        // Datatable
        this.mdbTable.setDataSource(this.transactionsConfirmed);
        this.transactionsConfirmed = this.mdbTable.getDataSource();
        this.previous = this.mdbTable.getDataSource();
      }
    );

    this.subscriptions['transactionsUnconfirmed'] = this.transactionService.getTransactionsUnConfirmed$().subscribe(
      (next: TransactionsInterface[]) => {
        this.cantUnconfirmed = next.length;
        this.transactionsUnconfirmed = next;

        // Datatable
        /*this.mdbTable.setDataSource(this.transactionsUnconfirmed);
        this.transactionsUnconfirmed = this.mdbTable.getDataSource();
        this.previous = this.mdbTable.getDataSource();*/
      }
    );
  }

  searchItems() {
    const prev = this.mdbTable.getDataSource();
    if (!this.searchTransaction) {
      this.mdbTable.setDataSource(this.previous);
      this.transactionsConfirmed = this.mdbTable.getDataSource();
    }

    if (this.searchTransaction) {
      this.transactionsConfirmed = this.mdbTable.searchLocalDataBy(this.searchTransaction);
      this.mdbTable.setDataSource(prev);
    }
    this.cantTransactions = this.transactionsConfirmed.length;
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
}
