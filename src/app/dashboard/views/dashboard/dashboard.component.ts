import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef, HostListener, Inject } from '@angular/core';
import { MdbTableDirective } from 'ng-uikit-pro-standard';
import { DOCUMENT } from '@angular/common';
import { Address } from 'tsjs-xpx-chain-sdk';
import { ProximaxProvider } from '../../../shared/services/proximax.provider';
import { DashboardService } from '../../services/dashboard.service';
import { TransactionsInterface, TransactionsService } from 'src/app/transfer/services/transactions.service';
import { WalletService } from 'src/app/wallet/services/wallet.service';
import { SharedService } from 'src/app/shared/services/shared.service';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})


export class DashboardComponent implements OnInit, OnDestroy {

  @ViewChild(MdbTableDirective, {static: true}) mdbTable: MdbTableDirective;
  @HostListener('input') oninput() {
    this.searchItems();
  }
  previous: any = [];
  cantTransactions = 0;
  // myAddress: Address = null;
  myAddress: string;
  cantConfirmed = 0;
  cantUnconfirmed = 0;
  confirmedSelected = true;
  dataSelected: TransactionsInterface = null;
  headElements = ['Type', 'Deadline', 'Fee', 'Sender', 'Recipient'];
  iconReloadDashboard = false;
  searching = true;
  searchTransactions = true;
  subscriptions = [
    'balance',
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
  transactions: TransactionsInterface[] = [];
  windowScrolled: boolean;


  constructor(
    private cdRef: ChangeDetectorRef,
    private dashboardService: DashboardService,
    private walletService: WalletService,
    private transactionService: TransactionsService,
    private sharedService: SharedService,
    private proximaxProvider: ProximaxProvider,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.myAddress = this.walletService.address.pretty();
  }

  @HostListener("window:scroll", [])
  onWindowScroll() {
      if (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop > 100) {
          this.windowScrolled = true;
      }
      else if (this.windowScrolled && window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop < 10) {
          this.windowScrolled = false;
      }
  }
  scrollToTop() {
      (function smoothscroll() {
          var currentScroll = document.documentElement.scrollTop || document.body.scrollTop;
          if (currentScroll > 0) {
              window.requestAnimationFrame(smoothscroll);
              window.scrollTo(0, currentScroll - (currentScroll / 8));
          }
      })();
  }

  ngOnInit() {
    this.typeTransactions = this.transactionService.arraTypeTransaction;
    this.dashboardService.incrementViewDashboard();
    this.dashboardService.subscribeLogged();
    this.subscribeTransactionsConfirmedUnconfirmed();
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
    // this.mdbTablePagination.setMaxVisibleItemsNumberTo(5);
    // this.mdbTablePagination.calculateFirstItemIndex();
    // this.mdbTablePagination.calculateLastItemIndex();
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

  copyMessage(message: string) {
    this.sharedService.showSuccess('', `${message} copied`);
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
      this.loadTransactions();
    } else {
      this.iconReloadDashboard = (this.dashboardService.searchComplete === false) ? true : false;
      this.searching = false;
    }
  }

  /**
   * Method to get more transactions when scrolling in the screen
   */
  onScroll() {
    if (this.searchTransactions) {
      // console.log(this.transactions[this.transactions.length - 1].data.transactionInfo.id);
      const lastTransactionId = (this.transactions.length > 0) ? this.transactions[this.transactions.length - 1].data.transactionInfo.id : null;
      this.loadTransactions(lastTransactionId);
    }
  }

  /**
   * Method to load transactions by public account.
   * @param {string} id Id of the transaction to start the next search.
   */
  loadTransactions(id = null) {
    this.transactions = (id) ? this.transactions : [];
    this.proximaxProvider.getTransactionsFromAccountId(this.walletService.publicAccount, id).toPromise().then(response => {
      this.searchTransactions = !(response.length < 25);
      const data = [];
      response.forEach(element => {
        //Sets the data structure of the dashboard
        const builderTransactions = this.transactionService.getStructureDashboard(element);
        if (builderTransactions !== null) {
          data.push(builderTransactions);
        }
      });

      // Establishes confirmed transactions in the observable type variable
      this.transactions = this.transactions.concat(data);
      this.transactionService.setTransactionsConfirmed$(this.transactions);
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
  }

  /**
   *
   *
   * @memberof DashboardComponent
   */
  subscribeTransactionsConfirmedUnconfirmed() {
    this.subscriptions['transactionsConfirmed'] = this.transactionService.getTransactionsConfirmed$().subscribe(
      (next: TransactionsInterface[]) => {
        this.cantConfirmed = next.length;
        this.transactionsConfirmed = next;
        this.cantTransactions = this.cantConfirmed;
        this.transactions = next;

        // Datatable
        this.mdbTable.setDataSource(this.transactionsConfirmed);
        this.transactions = this.mdbTable.getDataSource();
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

  /**
   *
   *
   * @memberof DashboardComponent
   */
  searchItems() {
    const prev = this.mdbTable.getDataSource();
    if (!this.searchTransaction) {
      this.mdbTable.setDataSource(this.previous);
      this.transactions = this.mdbTable.getDataSource();
    }

    if (this.searchTransaction) {
      this.transactions = this.mdbTable.searchLocalDataBy(this.searchTransaction);
      this.mdbTable.setDataSource(prev);
    }

    this.cantTransactions = this.transactions.length;
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

  selectTransactions(type: number) {
    if (type === 1) {
      // Confirmed
      this.mdbTable.setDataSource(this.transactionsConfirmed);
      this.transactions = this.mdbTable.getDataSource();
      this.previous = this.mdbTable.getDataSource();
      this.cantTransactions = this.transactions.length;
    } else {
      // Unconfirmed
      this.mdbTable.setDataSource(this.transactionsUnconfirmed);
      this.transactions = this.mdbTable.getDataSource();
      this.previous = this.mdbTable.getDataSource();
      this.cantTransactions = this.transactions.length;
    }
  }
}
22
