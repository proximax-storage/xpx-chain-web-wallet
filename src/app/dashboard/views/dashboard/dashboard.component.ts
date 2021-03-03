import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef, HostListener, Inject, AfterViewInit } from '@angular/core';
import { MdbTableDirective, ModalDirective } from 'ng-uikit-pro-standard';
import * as qrcode from 'qrcode-generator';
import { first } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { UInt64 } from 'tsjs-xpx-chain-sdk';
import { PaginationInstance } from 'ngx-pagination';
import { ProximaxProvider } from '../../../shared/services/proximax.provider';
import { DashboardService, DashboardNamespaceInfo, DashboardMosaicInfo } from '../../services/dashboard.service';
import { TransactionsInterface, TransactionsService } from '../../../transactions/services/transactions.service';
import { WalletService, AccountsInterface, CurrentWalletInterface } from '../../../wallet/services/wallet.service';
import { SharedService } from '../../../shared/services/shared.service';
import { environment } from '../../../../environments/environment';
import { AppConfig } from '../../../config/app.config';
import { NamespacesService } from '../../../servicesModule/services/namespaces.service';
import { MosaicService } from '../../../servicesModule/services/mosaic.service';
import { DataBridgeService } from '../../../shared/services/data-bridge.service';
import { NemProviderService } from '../../../swap/services/nem-provider.service';
import { AuthService } from 'src/app/auth/services/auth.service';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})


export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {

  constructor(
    private cdRef: ChangeDetectorRef,
    private dataBridge: DataBridgeService,
    private dashboardService: DashboardService,
    private nemProvider: NemProviderService,
    private namespacesService: NamespacesService,
    private mosaicService: MosaicService,
    private transactionService: TransactionsService,
    private sharedService: SharedService,
    private proximaxProvider: ProximaxProvider,
    private walletService: WalletService,
    private authService: AuthService
  ) { }

  @ViewChild(MdbTableDirective, { static: true }) mdbTable: MdbTableDirective;
  @ViewChild('modalDashboard', { static: true }) modalDashboard: ModalDirective;

  currentAccount: AccountsInterface = null;
  nameAccount = '';
  typeTransactions: any;
  vestedBalance = null;

  currentWallet: CurrentWalletInterface;
  coinUsd: any = '0.00';
  xpxUsd: any;
  previous: any = [];
  // myAddress: Address = null;
  accountChanged = false;
  cantConfirmed = 0;
  cantUnconfirmed = 0;
  confirmedSelected = true;
  configFilesDashboard: PaginationInstance = {
    id: 'fileDashboard',
    itemsPerPage: 10,
    currentPage: 1
  };
  dataSelected: TransactionsInterface = null;
  headElements = ['Type', 'In/Out', 'Sender', 'Recipient'];
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
  swapTransactions = 0;
  windowScrolled: boolean;
  nameWallet = '';
  p = 1;
  qr = '';
  routes = {
    backToService: `/${AppConfig.routes.service}`,
    createNewAccount: `/${AppConfig.routes.selectTypeCreationAccount}`,
    viewDetails: `/${AppConfig.routes.account}/`,
    deleteAccount: `/${AppConfig.routes.deleteAccount}/`,
  };

  namespaceHeaders = ['NAMESPACE ID', 'NAME', 'LINK TYPE', 'MOSAIC ID/ADDRESS', 'ACTIVE'];
  assetHeaders = ['OWNER', 'MOSAIC ID', 'NAMESPACE ID', 'ALIAS NAME', 'QUANTITY', 'ACTIVE'];
  namespaceAssetView = 0;
  dashBoardNamespaceInfoList: DashboardNamespaceInfo[] = [];
  dashBoardAssetInfoList: DashboardMosaicInfo[] = [];

  @HostListener('input') oninput() {
    this.searchItems();
  }


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
    };

    this.coingecko();
    this.subscribeTransactionsConfirmedUnconfirmed();
    this.getRecentTransactions();

    const walletNis1 = this.nemProvider.getWalletTransNisStorage().find(el => el.name === this.walletService.getCurrentWallet().name);
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

    if(this.authService.walletNameSID){
      this.walletService.removeWallet(this.authService.walletNameSID);
      this.authService.walletNameSID = null;
    }

    this.subscription.push(this.walletService.getAccountsInfo$().subscribe(next => {
      if (next && next.length > 0) {
        this.getAccountMosaicNamespace();
      }
    }));

    this.subscription.push(this.mosaicService.getMosaicChanged().subscribe(next => {
      if (next > 0) {
        this.getAccountMosaicNamespace();
      }
    }));

    this.subscription.push(this.namespacesService.getNamespaceChanged().subscribe(next => {
      if (next.length > 0) {
        this.getAccountMosaicNamespace();
      }
    }));
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
   *
   *
   * @memberof DashboardComponent
   */
  async getAccountMosaicNamespace(){

    const accountInfo = this.walletService.filterAccountInfo(this.currentAccount.address, true);

    const ownedMosaics = await this.mosaicService.filterMosaics(null, this.walletService.currentAccount.name);
    
    const ownedNamespaces = this.namespacesService.filterNamespacesFromAccount(this.walletService.getCurrentAccount().publicAccount.publicKey);

    this.dashBoardNamespaceInfoList = [];
    this.dashBoardAssetInfoList = [];

    mosaicsLoop: for(var ownedMosaic of ownedMosaics){

      var mosaicNames: string[] = [];
      var namespaceIds: string[] = [];
      var idInHex = this.proximaxProvider.getNamespaceId(ownedMosaic.idMosaic).toHex();
      var matchedMosaic = accountInfo.accountInfo.mosaics.find(mosaic=> mosaic.id.toHex() === idInHex);

      var rawQuantity = matchedMosaic ? matchedMosaic.amount.compact() : 0;

      let mosaicBalance = this.transactionService.amountFormatterSimple(rawQuantity, ownedMosaic.mosaicInfo.divisibility);
      //let mosaicBalance = this.transactionService.getDataPart(amountFormatter, ownedMosaic.mosaicInfo.divisibility);

      if(ownedMosaic.isNamespace){
        for (const iterator of ownedMosaic.mosaicNames.names) {

          var namespaceId = this.proximaxProvider.getNamespaceId([iterator.namespaceId.id.lower, iterator.namespaceId.id.higher]).toHex();
          
          if(namespaceId === environment.mosaicXpxInfo.namespaceId){
            continue mosaicsLoop;
          }

          if(!namespaceIds.includes(namespaceId)){
            mosaicNames.push(iterator.name);
            namespaceIds.push(namespaceId);
          }
        }
      }

      var dashBoardMosaicInfo: DashboardMosaicInfo = {
        id: idInHex,
        name: mosaicNames.length > 0 ? mosaicNames.join("\n") : "-",
        namespaceId: namespaceIds.length > 0 ? namespaceIds.join("\n") : "-",
        owner: ownedMosaic.mosaicInfo.owner.publicKey === this.walletService.getCurrentAccount().publicAccount.publicKey,
        quantity: mosaicBalance,
        active: true
      };

      this.dashBoardAssetInfoList.push(dashBoardMosaicInfo); 
    }

    for(var ownedNamespace of ownedNamespaces){

      var aliasType: string;
      var linkedInfo: string;

      switch (ownedNamespace.namespaceInfo.alias.type) {
        case 0:
          aliasType = "-";
          linkedInfo = "-";
          break;
        case 1:
          aliasType = "Mosaic";
          linkedInfo = ownedNamespace.namespaceInfo.alias.mosaicId.toHex();
          break;
        case 2:
          aliasType = "Address";
          linkedInfo = ownedNamespace.namespaceInfo.alias.address.pretty();
          break;
      
        default:
          break;
      }

      var dashBoardNamespaceInfo: DashboardNamespaceInfo = {
        id:ownedNamespace.idToHex,
        name: ownedNamespace.namespaceName.name,
        linkType: aliasType,
        linkedInfo: linkedInfo,
        active: ownedNamespace.namespaceInfo.active
      };

      this.dashBoardNamespaceInfoList.push(dashBoardNamespaceInfo); 
    }
  }

  /**
   *
   *
   * @param {boolean} [reload=false]
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
            // Sets the data structure of the dashboard
            transactionsUnconfirmed.forEach(element => {
              const builderTransactions = this.transactionService.getStructureDashboard(element, this.transactionsUnconfirmed, 'unconfirmed');
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
  coingecko() {
    this.proximaxProvider.coingecko('proximax').toPromise()
      .then(details => {
        this.xpxUsd = details['market_data']['current_price'].usd;
        this.balance(this.xpxUsd);
      }).catch(err => {
        this.xpxUsd = 0;
        this.balance(this.xpxUsd);
      });

  }

  balance(xpxUsd) {
    this.subscription.push(this.transactionService.getBalance$().subscribe(
      next => {
        this.vestedBalance = this.transactionService.getDataPart(next, 6);
        if (this.xpxUsd != undefined) {
          this.coinUsd = Number(next.replace(/,/g, '')) * xpxUsd;
        }
      },
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
      for (const element of currentWallet.accounts) {
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
    this.getAccountMosaicNamespace();
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
          // Sets the data structure of the dashboard
          transactions.forEach(element => {
            const builderTransactions = this.transactionService.getStructureDashboard(element, this.transactions, 'confirmed');
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
      const currentScroll = document.documentElement.scrollTop || document.body.scrollTop;
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

      this.transactionsConfirmed.sort((a,b)=>{ return b.data.transactionInfo.height.compact() - a.data.transactionInfo.height.compact() } );
      this.transactions = next;

      // Datatable
      this.mdbTable.setDataSource(this.transactionsConfirmed);
      this.transactions = this.mdbTable.getDataSource();
      this.previous = this.mdbTable.getDataSource();
      this.getAccountMosaicNamespace();
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
    if (transaction.data['transactionInfo'] && transaction.data['transactionInfo'].height) {
      const height = transaction.data['transactionInfo'].height.compact();
      if (typeof (height) === 'number') {
        const existBlock = this.dataBridge.filterBlockStorage(height);
        if (existBlock) {
          // console.log('In cache', existBlock);
          transaction.timestamp = `${this.transactionService.dateFormatUTC(new UInt64([existBlock.timestamp.lower, existBlock.timestamp.higher]))} - UTC`;
          const calculateEffectiveFee = this.transactionService.amountFormatterSimple(existBlock.feeMultiplier * transaction.data.size);
          transaction.effectiveFee = this.transactionService.getDataPart(calculateEffectiveFee, 6);
          // console.log('Effective fee ---> ', transaction.effectiveFee);
        } else {
          this.proximaxProvider.getBlockInfo(height).subscribe(
            next => {
              // console.log('Http', next);
              this.dataBridge.validateBlock(next);
              transaction.timestamp = `${this.transactionService.dateFormatUTC(next.timestamp)} - UTC`;
              const calculateEffectiveFee = this.transactionService.amountFormatterSimple(next.feeMultiplier * transaction.data.size);
              transaction.effectiveFee = this.transactionService.getDataPart(calculateEffectiveFee, 6);
              // console.log('Effective fee ---> ', transaction.effectiveFee);
            }
          );
        }
      } else {
        transaction.effectiveFee = this.transactionService.getDataPart('0.00000', 6);
      }
    } else {
      transaction.effectiveFee = this.transactionService.getDataPart('0.00000', 6);
    }


    this.dataSelected = transaction;
    this.modalDashboard.show();
  }
}
