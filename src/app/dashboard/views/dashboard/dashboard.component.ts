import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef, HostListener, Inject } from '@angular/core';
import { MdbTableDirective } from 'ng-uikit-pro-standard';
import { DOCUMENT } from '@angular/common';
import { ProximaxProvider } from '../../../shared/services/proximax.provider';
import { DashboardService } from '../../services/dashboard.service';
import { TransactionsInterface, TransactionsService } from '../../../transfer/services/transactions.service';
import { WalletService, AccountsInterface } from '../../../wallet/services/wallet.service';
import { SharedService } from '../../../shared/services/shared.service';
import { environment } from '../../../../environments/environment';
import { AppConfig } from 'src/app/config/app.config';
import { UInt64 } from 'tsjs-xpx-chain-sdk';
import { DataBridgeService } from 'src/app/shared/services/data-bridge.service';
import { NamespacesService } from 'src/app/servicesModule/services/namespaces.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})


export class DashboardComponent implements OnInit, OnDestroy {


  currentAccount: AccountsInterface = null;
  nameAccount = '';
  typeTransactions: any;
  vestedBalance = '';

  // --------------------------------------------------------------------------
  @ViewChild(MdbTableDirective, { static: true }) mdbTable: MdbTableDirective;
  @HostListener('input') oninput() {
    this.searchItems();
  }
  previous: any = [];
  // myAddress: Address = null;
  cantConfirmed = 0;
  cantUnconfirmed = 0;
  confirmedSelected = true;
  dataSelected: TransactionsInterface = null;
  headElements = ['Type', 'Deadline', 'Fee', '', 'Sender', 'Recipient'];
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
  transactionsConfirmed: TransactionsInterface[] = [];
  transactionsUnconfirmed: TransactionsInterface[] = [];
  unconfirmedSelected = false;
  searchTransaction = '';
  viewDashboard = true;
  transactions: TransactionsInterface[] = [];
  viewDetailsAccount = `/${AppConfig.routes.account}/`;
  windowScrolled: boolean;
  nameWallet = '';
  p: number = 1;

  constructor(
    private cdRef: ChangeDetectorRef,
    private dashboardService: DashboardService,
    private walletService: WalletService,
    private transactionService: TransactionsService,
    private sharedService: SharedService,
    private proximaxProvider: ProximaxProvider,
    private dataBridgeService: DataBridgeService,
    private namespacesService: NamespacesService,
    @Inject(DOCUMENT) private document: Document
  ) { }


  ngOnInit() {
    this.dashboardService.incrementViewDashboard();
    this.dashboardService.subscribeLogged();
    this.currentAccount = Object.assign({}, this.walletService.getCurrentAccount());
    this.currentAccount.address = this.proximaxProvider.createFromRawAddress(this.currentAccount.address).pretty();
    this.typeTransactions = this.transactionService.getTypeTransactions();
    this.vestedBalance = `0.000000 ${environment.mosaicXpxInfo.coin}`;
    this.balance();
    this.subscribeTransactionsConfirmedUnconfirmed();
    this.getRecentTransactions();
  }

  ngOnDestroy(): void {
    // this.transactionService.setTransactionsConfirmed$([]);
    this.subscriptions.forEach(element => {
      if (this.subscriptions[element] !== undefined) {
        this.subscriptions[element].unsubscribe();
      }
    });
  }

  ngAfterViewInit() {
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
        // console.log(next);
        this.vestedBalance = `${next} XPX`;
      }, () => {
        this.vestedBalance = `0.000000 XPX`;
      }
    );
  }

  /**
   *
   *
   * @param {string} message
   * @memberof DashboardComponent
   */
  copyMessage(message: string) {
    this.sharedService.showSuccess('', `${message} copied`);
  }

  /**
   * Get the recent transactions of an account
   *
   * @memberof DashboardComponent
   */
  async getRecentTransactions(reload = false) {
    this.iconReloadDashboard = true;
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
    if (this.searchTransactions && !this.searching) {
      this.searching = true;
      const lastTransactionId = (this.transactions.length > 0) ? this.transactions[this.transactions.length - 1].data.transactionInfo.id : null;
      this.loadTransactions(lastTransactionId);
    }
  }

  /**
   *
   *
   * @memberof DashboardComponent
   */
  @HostListener("window:scroll", [])
  onWindowScroll() {
    if (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop > 100) {
      this.windowScrolled = true;
    }
    else if (this.windowScrolled && window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop < 10) {
      this.windowScrolled = false;
    }
  }

  /**
   * Method to load transactions by public account.
   * @param {string} id Id of the transaction to start the next search.
   */
  async loadTransactions(id: any = null) {
    // this.transactions = (id) ? this.transactions.slice(0) : [];
    const data = this.transactions.slice(0);
    const transactionUnconfirmed = this.transactionsUnconfirmed.slice(0);
    this.walletService.currentWallet.accounts.forEach(account => {
      this.searching = true;
      this.getTransactionsConfirmed(account, id);

      // Unconfirmed transactions
      this.proximaxProvider.getUnconfirmedTransactions(account.publicAccount, id).pipe(first()).subscribe(
        transactionsUnconfirmed => {
          if (transactionsUnconfirmed && transactionsUnconfirmed.length > 0) {
            transactionsUnconfirmed.forEach(element => {
              //Sets the data structure of the dashboard
              const builderTransactions = this.transactionService.getStructureDashboard(element);
              if (builderTransactions !== null) {
                transactionUnconfirmed.push(builderTransactions);
              }
            });

            this.transactionsUnconfirmed = transactionUnconfirmed;
            this.cantUnconfirmed = this.transactionsUnconfirmed.length;
            this.transactionService.setTransactionsUnConfirmed$(this.transactionsUnconfirmed);
          } else {
            this.iconReloadDashboard = false;
            this.searching = false;
            this.dashboardService.searchComplete = true;
          }

        }, error => {
          this.iconReloadDashboard = false;
          this.searching = false;
          this.dashboardService.searchComplete = true;
        }
      );
    });
  }


  /**
   *
   *
   * @param {AccountsInterface} account
   * @param {number} [id=null]
   * @param {TransactionsInterface[]} cacheTransactions
   * @memberof DashboardComponent
   */
  getTransactionsConfirmed(account: AccountsInterface, id: string = null) {
    // Confirmed transactions
    this.proximaxProvider.getTransactionsFromAccountId(account.publicAccount, id).pipe(first()).subscribe(
      transactions => {
        console.log('ALL TRANSACTIONS --> ', transactions);
        if (transactions && transactions.length > 0) {
          transactions.forEach(element => {
            //Sets the data structure of the dashboard
            const builderTransactions = this.transactionService.getStructureDashboard(element);
            if (builderTransactions !== null) {
              this.transactions.push(builderTransactions);
            }
          });

          // this.transactions = this.transactions;
          this.cantConfirmed = this.transactions.length;
          this.transactionService.setTransactionsConfirmed$(this.transactions);
          this.iconReloadDashboard = false;
          this.searching = false;
          this.dashboardService.searchComplete = true;
          const lastTransactionId = (transactions.length > 0) ? transactions[transactions.length - 1].transactionInfo.id : null;
          this.getTransactionsConfirmed(account, lastTransactionId);
        } else {
          this.iconReloadDashboard = false;
          this.searching = false;
          this.dashboardService.searchComplete = true;
        }
      }, error => {
        this.searching = false;
        this.iconReloadDashboard = true;
        this.dashboardService.searchComplete = false;
      }
    );
  }

  /**
   *
   *
   * @memberof DashboardComponent
   */
  scrollToTop() {
    (function smoothscroll() {
      var currentScroll = document.documentElement.scrollTop || document.body.scrollTop;
      if (currentScroll > 0) {
        window.requestAnimationFrame(smoothscroll);
        window.scrollTo(0, currentScroll - (currentScroll / 8));
      }
    })();
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
    } else {
      // Unconfirmed
      this.mdbTable.setDataSource(this.transactionsUnconfirmed);
      this.transactions = this.mdbTable.getDataSource();
      this.previous = this.mdbTable.getDataSource();
    }
  }
}
