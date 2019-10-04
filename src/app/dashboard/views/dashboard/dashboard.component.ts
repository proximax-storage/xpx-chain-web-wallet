import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef, HostListener, Inject } from '@angular/core';
import { MdbTableDirective, ModalDirective } from 'ng-uikit-pro-standard';
import * as qrcode from 'qrcode-generator';
import { first } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { ProximaxProvider } from '../../../shared/services/proximax.provider';
import { DashboardService } from '../../services/dashboard.service';
import { TransactionsInterface, TransactionsService } from '../../../transactions/services/transactions.service';
import { WalletService, AccountsInterface, CurrentWalletInterface } from '../../../wallet/services/wallet.service';
import { SharedService } from '../../../shared/services/shared.service';
import { environment } from '../../../../environments/environment';
import { AppConfig } from '../../../config/app.config';
import { NamespacesService } from 'src/app/servicesModule/services/namespaces.service';
import { PaginationInstance } from 'ngx-pagination';
import { DataBridgeService } from 'src/app/shared/services/data-bridge.service';
import { UInt64 } from 'tsjs-xpx-chain-sdk';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})


export class DashboardComponent implements OnInit, OnDestroy {


  currentAccount: AccountsInterface = null;
  nameAccount = '';
  typeTransactions: any;
  vestedBalance = null;

  // --------------------------------------------------------------------------
  @ViewChild(MdbTableDirective, { static: true }) mdbTable: MdbTableDirective;
  @ViewChild('modalDashboard', { static: true }) modalDashboard: ModalDirective;
  currentWallet: CurrentWalletInterface;
  @HostListener('input') oninput() {
    this.searchItems();
  }
  previous: any = [];
  // myAddress: Address = null;
  accountChanged: boolean = false;
  cantConfirmed = 0;
  cantUnconfirmed = 0;
  confirmedSelected = true;
  configFilesDashboard: PaginationInstance = {
    id: 'fileDashboard',
    itemsPerPage: 10,
    currentPage: 1
  };
  dataSelected: TransactionsInterface = null;
  headElements = ['Type', '', 'Sender', 'Recipient'];
  iconReloadDashboard = false;
  objectKeys = Object.keys;
  partialTransactions = 0;
  searching = true;
  searchTransactions = true;
  subscription: Subscription[] = [];
  transactionsConfirmed: TransactionsInterface[] = [];
  transactionsUnconfirmed: TransactionsInterface[] = [];
  unconfirmedSelected = false;
  searchTransaction = '';
  viewDashboard = true;
  transactions: TransactionsInterface[] = [];
  viewDetailsAccount = `/${AppConfig.routes.account}/`;
  viewDetailsPartial = `/${AppConfig.routes.partial}`;
  viewSwapTransactions = `/${AppConfig.routes.swapTransactions}`;
  swapTransactions: number = 0;
  windowScrolled: boolean;
  nameWallet = '';
  p: number = 1;
  qr = '';
  routes = {
    backToService: `/${AppConfig.routes.service}`,
    createNewAccount: `/${AppConfig.routes.selectTypeCreationAccount}`,
    viewDetails: `/${AppConfig.routes.account}/`,
    deleteAccount: `/${AppConfig.routes.deleteAccount}/`,
  };

  constructor(
    private dataBridge: DataBridgeService,
    private cdRef: ChangeDetectorRef,
    private dashboardService: DashboardService,
    private walletService: WalletService,
    private transactionService: TransactionsService,
    private sharedService: SharedService,
    private proximaxProvider: ProximaxProvider,
    private namespacesService: NamespacesService
  ) { }


  ngOnInit() {
    this.dashboardService.incrementViewDashboard();
    this.dashboardService.subscribeLogged();
    this.currentAccount = Object.assign({}, this.walletService.getCurrentAccount());

    this.currentAccount.address = this.proximaxProvider.createFromRawAddress(this.currentAccount.address).pretty();
    this.currentAccount.name = (this.currentAccount.name === 'Primary') ? `${this.currentAccount.name}_Account` : this.currentAccount.name;
    const qr = qrcode(10, 'H');
    qr.addData(this.currentAccount.address);
    qr.make();
    this.qr = qr.createDataURL();
    this.typeTransactions = this.transactionService.getTypeTransactions();
    this.vestedBalance = {
      part1: '0',
      part2: '000000'
    }

    this.balance();
    this.subscribeTransactionsConfirmedUnconfirmed();
    this.getRecentTransactions();

    const walletNis1 = this.walletService.getWalletTransNisStorage().find(el => el.name === this.walletService.getCurrentWallet().name);
    if (walletNis1 !== undefined && walletNis1 !== null) {
      this.swapTransactions = walletNis1.transactions.length;
    }

    this.subscription.push(this.transactionService.getAggregateBondedTransactions$().subscribe(
      next => this.partialTransactions = (next && next.length > 0) ? next.length : 0
    ));

    this.subscription.push(this.walletService.getSwapTransactions$().subscribe(
      next => this.swapTransactions = next.length
    ));

    this.currentWallet = Object.assign({}, this.walletService.currentWallet);
  }

  ngOnDestroy(): void {
    // this.transactionService.setTransactionsConfirmed$([]);
    this.subscription.forEach(subscription => {
      subscription.unsubscribe();
    });
  }

  ngAfterViewInit() {
    this.cdRef.detectChanges();
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
   * Method to load transactions by public account.
   * @param {string} id Id of the transaction to start the next search.
   */
  async loadTransactions(id: any = null) {
    const data = this.transactions.slice(0);
    const transactionUnconfirmed = this.transactionsUnconfirmed.slice(0);
    this.walletService.currentWallet.accounts.forEach(account => {
      this.searching = true;
      this.getTransactionsConfirmed(account, id);

      // Unconfirmed transactions
      this.proximaxProvider.getUnconfirmedTransactions(account.publicAccount, id).pipe(first()).subscribe(
        transactionsUnconfirmed => {
          if (transactionsUnconfirmed && transactionsUnconfirmed.length > 0) {
            //Sets the data structure of the dashboard
            transactionsUnconfirmed.forEach(element => {
              const builderTransactions = this.transactionService.getStructureDashboard(element, this.transactionsUnconfirmed);
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
   * Get balance from account
   *
   * @memberof DashboardComponent
   */
  balance() {
    this.subscription.push(this.transactionService.getBalance$().subscribe(
      next => this.vestedBalance = this.transactionService.getDataPart(next, 6),
      error => this.vestedBalance = {
        part1: '0',
        part2: '000000'
      }
    ));
  }

  /**
   *
   *
   * @memberof DashboardComponent
   */
  buildBalance() {
    // console.log('build',this.walletService.currentWallet)
    const currentWallet = Object.assign({}, this.walletService.currentWallet);
    if (currentWallet && Object.keys(currentWallet).length > 0) {
      for (let element of currentWallet.accounts) {
        const accountFiltered = this.walletService.filterAccountInfo(element.name);
        if (accountFiltered && accountFiltered.accountInfo) {
          const mosaicXPX = accountFiltered.accountInfo.mosaics.find(next => next.id.toHex() === environment.mosaicXpxInfo.id);
          if (mosaicXPX) {
            element['balance'] = this.transactionService.amountFormatterSimple(mosaicXPX.amount.compact());
          } else {
            element['balance'] = '0.000000';
          }
        } else {
          element['balance'] = '0.000000';
        }
      }
      this.currentWallet = currentWallet;
    }
  }

  /**
   *
   *
   * @param {string} nameSelected
   * @memberof DashboardComponent
   */
  changeAsPrimary(nameSelected: string) {
    this.walletService.changeAsPrimary(nameSelected);
    this.walletService.use(this.walletService.currentWallet);
    this.namespacesService.fillNamespacesDefaultAccount();
    this.buildBalance();
    this.transactionService.updateBalance();
    this.currentWallet = Object.assign({}, this.walletService.currentWallet);
    this.currentAccount = Object.assign({}, this.walletService.getCurrentAccount());
    this.currentAccount.address = this.proximaxProvider.createFromRawAddress(this.currentAccount.address).pretty();
    this.currentAccount.name = (this.currentAccount.name === 'Primary') ? `${this.currentAccount.name}_Account` : this.currentAccount.name;
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
   * @param {AccountsInterface} account
   * @param {number} [id=null]
   * @param {TransactionsInterface[]} cacheTransactions
   * @memberof DashboardComponent
   */
  getTransactionsConfirmed(account: AccountsInterface, id: string = null) {
    // Confirmed transactions
    this.proximaxProvider.getTransactionsFromAccountId(account.publicAccount, id).pipe(first()).subscribe(
      transactions => {
        if (transactions && transactions.length > 0) {
          //Sets the data structure of the dashboard
          transactions.forEach(element => {
            const builderTransactions = this.transactionService.getStructureDashboard(element, this.transactions);
            (builderTransactions !== null) ? this.transactions.push(builderTransactions) : '';
          });

          this.transactionService.setTransactionsConfirmed$(this.transactions);
          this.dashboardService.searchComplete = true;
          this.iconReloadDashboard = false;
          this.searching = false;
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
    this.subscription.push(this.transactionService.getConfirmedTransactions$().subscribe((next: TransactionsInterface[]) => {
      this.cantConfirmed = next.length;
      this.transactionsConfirmed = next;
      this.transactions = next;

      // Datatable
      this.mdbTable.setDataSource(this.transactionsConfirmed);
      this.transactions = this.mdbTable.getDataSource();
      this.previous = this.mdbTable.getDataSource();
    }));

    this.subscription.push(this.transactionService.getUnconfirmedTransactions$().subscribe((next: TransactionsInterface[]) => {
      this.cantUnconfirmed = next.length;
      this.transactionsUnconfirmed = next;
    }));
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

  /**
   *
   *
   * @param {number} type
   * @memberof DashboardComponent
   */
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

  /**
   *
   *
   * @param {TransactionsInterface} transaction
   * @memberof DashboardComponent
   */
  openModal(transaction: TransactionsInterface) {
    const height = transaction.data['transactionInfo'].height.compact();
    if (typeof (height) === 'number') {
      const existBlock = this.dataBridge.filterBlockStorage(height);
      if (existBlock) {
        console.log('In cache', existBlock);
        transaction.timestamp = this.transactionService.dateFormatUTC(new UInt64([existBlock.timestamp.lower, existBlock.timestamp.higher]));
        const calculateEffectiveFee = this.transactionService.amountFormatterSimple(existBlock.feeMultiplier * transaction.data.size)
        transaction.effectiveFee = this.transactionService.getDataPart(calculateEffectiveFee, 6);
        console.log('Effective fee ---> ', transaction.effectiveFee);
      }else {
        this.proximaxProvider.getBlockInfo(height).subscribe(
          next => {
            console.log('Http', next);
            this.dataBridge.validateBlock(next);
            transaction.timestamp = this.transactionService.dateFormatUTC(next.timestamp);
            const calculateEffectiveFee = this.transactionService.amountFormatterSimple(next.feeMultiplier * transaction.data.size);
            transaction.effectiveFee = this.transactionService.getDataPart(calculateEffectiveFee, 6);
            console.log('Effective fee ---> ', transaction.effectiveFee);
          }
        );
      }
    } else {
      transaction.effectiveFee = this.transactionService.getDataPart('0.00000', 6);
      console.log('Effective fee ---> ', transaction.effectiveFee);
    }

    this.dataSelected = transaction;
    this.modalDashboard.show();
  }
}
