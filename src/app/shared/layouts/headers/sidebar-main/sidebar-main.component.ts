import { Router, NavigationEnd } from '@angular/router';
import { Component, OnInit, NgZone } from '@angular/core';
import { ItemsHeaderInterface, SharedService, MenuInterface } from '../../../services/shared.service';
import { AppConfig } from '../../../../config/app.config';
import { environment } from '../../../../../environments/environment';
import { DashboardService } from '../../../../dashboard/services/dashboard.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { WalletService } from '../../../../wallet/services/wallet.service';
import { TransactionsService } from '../../../../transactions/services/transactions.service';
import { DataBridgeService } from 'src/app/shared/services/data-bridge.service';
import { Subscription, timer } from 'rxjs';
import { NodeService } from 'src/app/servicesModule/services/node.service';
import { NamespacesService } from 'src/app/servicesModule/services/namespaces.service';

@Component({
  selector: 'app-sidebar-main',
  templateUrl: './sidebar-main.component.html',
  styleUrls: ['./sidebar-main.component.css']
})

export class SidebarMainComponent implements OnInit {


  cacheBlock = 0;
  colorStatus = 'color-red';
  currentBlock = 0;
  itemsHeader: ItemsHeaderInterface;
  keyObject = Object.keys;
  prorroga = false;
  reconnecting = false;
  routeNotification = `/${AppConfig.routes.notification}`;
  routesExcludedInServices = [
    AppConfig.routes.viewAllAccount,
    AppConfig.routes.auth,
    AppConfig.routes.createTransfer,
    AppConfig.routes.createWallet,
    AppConfig.routes.dashboard,
    AppConfig.routes.importWallet,
    AppConfig.routes.service
  ];
  searchBalance = false;
  statusNode = false;
  statusNodeName = 'Inactive';
  subscription: Subscription[] = [];
  vestedBalance: object;
  version = '';
  viewParcial = false;
  walletName = '';
  reset = 0;
  netType;
  nodeSelected: string;
  alertNamespaceShowed = false;
  namespaceToExpire: any[] = [];
  viewNotifications = false;


  constructor(
    private dataBridge: DataBridgeService,
    private sharedService: SharedService,
    private route: Router,
    private authService: AuthService,
    private dashboardService: DashboardService,
    private transactionService: TransactionsService,
    private walletService: WalletService,
    private nodeService: NodeService,
    private namespaces: NamespacesService,
    private ngZone: NgZone
  ) {
    this.version = environment.version;
    this.netType = environment.typeNetwork.value;
  }

  ngOnInit() {
    this.statusNode = false;
    this.walletName = this.walletService.currentWallet.name;
    this.buildItemsHeader();
    this.getAccountInfo();
    this.getBlocks();
    this.getNodeSeletcd();
    this.readRoute();
    this.validate();
    this.subscription.push(this.transactionService.getAggregateBondedTransactions$().subscribe(
      next => this.viewParcial = (next && next.length > 0) ? true : false
      // {
      // this.transactionService.viewPartial(next);
      // this.viewParcial = (next && next.length > 0) ? true : false
      // }
    ));
  }

  ngOnDestroy(): void {
    this.subscription.forEach(subscription => {
      subscription.unsubscribe();
    });
  }

  /**
   *
   *
   * @memberof SidebarMainComponent
   */
  buildItemsHeader() {
    const paramsDashboard: MenuInterface = {
      type: 'default',
      name: 'Dashboard',
      class: '',
      icon: '',
      rol: false,
      link: `/${AppConfig.routes.dashboard}`,
      view: true,
      subMenu: {},
      selected: true
    };

    const paramsTransfer: MenuInterface = {
      type: 'default',
      name: 'Transfer',
      class: '',
      icon: '',
      rol: false,
      link: `/${AppConfig.routes.createTransfer}`,
      view: true,
      subMenu: {},
      selected: false
    };

    const paramsAccount: MenuInterface = {
      type: 'default',
      name: 'Accounts',
      class: '',
      icon: '',
      rol: false,
      link: `/${AppConfig.routes.viewAllAccount}`,
      view: true,
      subMenu: {},
      selected: false
    };

    const paramsServices: MenuInterface = {
      type: 'default',
      name: 'Services',
      class: '',
      icon: '',
      rol: false,
      link: `/${AppConfig.routes.service}`,
      view: true,
      subMenu: {},
      selected: false
    };

    this.itemsHeader = {
      //dashboard: this.sharedService.buildHeader(paramsDashboard),
      //transfer: this.sharedService.buildHeader(paramsTransfer),
      //account: this.sharedService.buildHeader(paramsAccount),
      services: this.sharedService.buildHeader(paramsServices)
    };
  }


  /**
   *
   *
   * @param {number} block
   * @memberof SidebarMainComponent
   */
  expiredNamespace(block: number) {
    this.subscription.push(this.namespaces.getNamespaceChanged().subscribe(
      namespaceChanged => {
        if (this.walletService.getCurrentWallet()) {
          const allNamespaceInfo = this.namespaces.getNamespacesStorage();
          const namespaceInfo = [];
          allNamespaceInfo.forEach(element => {
            const isOwner = this.walletService.getCurrentWallet().accounts.find(x => x.publicAccount.publicKey === element.namespaceInfo.owner.publicKey);
            if (isOwner) {
              namespaceInfo.push(element);
            }
          });

          if (namespaceInfo && block) {
            this.alertNamespaceShowed = true;
            this.namespaceToExpire = [];
            // tslint:disable-next-line: prefer-for-of
            for (let index = 0; index < namespaceInfo.length; index++) {
              const element = namespaceInfo[index];
              const endHeight = element.namespaceInfo.endHeight.lower;
              const result = endHeight - block;
              if (result > 0) {
                if (result < environment.blockHeightMax.heightMax) {
                  const namespaceToExpire = {
                    namespace: element,
                    expired: result
                  };
                  this.namespaceToExpire.push(namespaceToExpire);
                }
              }
            }

            const viewNotifications = (this.namespaceToExpire && this.namespaceToExpire.length > 0) ? true : false;
            this.transactionService.setViewNotifications$(viewNotifications);
            this.transactionService.getViewNotifications$().subscribe(next => this.viewNotifications = next);
            this.namespaces.namespaceExpired(this.namespaceToExpire, viewNotifications);
          }
        }
      }));
  }

  /**
   *
   *
   * @memberof SidebarMainComponent
   */
  getAccountInfo() {
    this.subscription.push(this.walletService.getAccountsInfo$().subscribe(next => {
      this.searchBalance = true;
      // NAME ACCOUNT
      if (next && next.length > 0) {
        let amountTotal = 0.000000;
        for (const element of next) {
          if (element && element.accountInfo) {
            if (element.accountInfo.mosaics && element.accountInfo.mosaics.length > 0) {
              const mosaicXpx = element.accountInfo.mosaics.find(mosaic => mosaic.id.toHex() === environment.mosaicXpxInfo.id);
              if (mosaicXpx) {
                amountTotal = amountTotal + mosaicXpx.amount.compact();
              }
            }
          }
        }


        const amountFormatter = this.transactionService.amountFormatterSimple(amountTotal);
        this.vestedBalance = this.transactionService.getDataPart(amountFormatter, 6);
        setTimeout(() => {
          this.searchBalance = false;
        }, 1000);
      } else {
        this.vestedBalance = this.transactionService.getDataPart('0.000000', 6);
        setTimeout(() => {
          this.searchBalance = false;
        }, 1000);
      }
    }));
  }

  /**
   *
   *
   * @memberof SidebarMainComponent
   */
  getBlocks() {
    this.subscription.push(this.dataBridge.getBlock().subscribe(
      next => {
        // console.log('=== NEW BLOCK === ', next);
        if (next !== null) {
          if (next !== 1 && !this.alertNamespaceShowed) {
            this.expiredNamespace(next);
          }
          this.prorroga = false;
          this.reconnecting = false;
          this.statusNode = true;
          this.currentBlock = next;
          this.colorStatus = 'green-color';
          this.statusNodeName = 'Active';
        } else {
          this.currentBlock = 0;
          this.statusNode = false;
          if (!this.reconnecting) {
            this.colorStatus = 'color-red';
            this.statusNodeName = 'Inactive';
          }
        }
      }
    ));
  }

  /**
   *
   *
   * @memberof SidebarMainComponent
   */
  getNodeSeletcd() {
    this.subscription.push(this.nodeService.nodeObsSelected.subscribe(node => {
      this.nodeSelected = `${environment.protocol}://${node}`;
    }));
  }



  /**
   *
   */
  validate() {
    // emit 0 after 1 second then complete, since no second argument is supplied
    const source = timer(30000, 50000);
    this.subscription.push(source.subscribe(val => {
      // console.log('CURRENT_BLOCK =>', this.currentBlock);
      // console.log('CACHE_BLOCK =>', this.cacheBlock);
      /*console.log('=== RESETED ===', this.reset);
      console.log('=== CURRENT BLOCK ===', this.currentBlock);
      console.log('=== CACHE BLOCK ===', this.cacheBlock, '\n\n\n');*/

      if (this.currentBlock > this.cacheBlock) {
        this.reconnecting = false;
        this.cacheBlock = this.currentBlock;
        this.prorroga = false;
      } else if (this.prorroga) {
        this.reset = this.reset + 1;
        this.reconnecting = true;
        this.statusNodeName = 'Reconnecting';
        this.colorStatus = 'color-light-orange';
        this.dataBridge.closeConection(false);
        this.dataBridge.connectnWs();
      } else {
        this.statusNodeName = 'Reconnecting';
        this.colorStatus = 'color-light-orange';
        this.reconnecting = true;
        this.prorroga = true;
      }
    }));
  }

  /**
   *
   *
   * @memberof SidebarMainComponent
   */
  myFunction() {
    const menuNav = document.getElementById('myTopnav');
    if (menuNav.classList.contains('responsive')) {
      menuNav.classList.remove('responsive');
    } else {
      menuNav.classList.add('responsive');
    }
  }

  /**
   *
   *
   * @param {String} [param]
   * @memberof HeaderComponent
   */
  logOut() {
    this.currentBlock = 0;
    this.walletService.destroyDataWalletAccount();
    this.dashboardService.processComplete = false;
    this.dashboardService.isIncrementViewDashboard = 0;
    this.authService.setLogged(false);
    this.authService.destroyNodeSelected();
    this.walletService.setAccountSelectedWalletNis1(null);
    this.walletService.setAccountInfoNis1(null);
    this.walletService.setNis1AccountSelected(null);
    this.walletService.setSwapTransactions$([]);
    this.walletService.setNis1AccountsWallet$([]);
    this.namespaces.setNamespaceChanged(null);
    //this.route.navigate([`/${AppConfig.routes.auth}`]);
    this.ngZone.run(() => this.route.navigate([`/${AppConfig.routes.auth}`])).then();
  }

  /**
   *
   *
   * @memberof SidebarMainComponent
   */
  readRoute() {
    this.route.events
      .subscribe((event) => {
        if (event instanceof NavigationEnd) {
          let objRoute = event.url.split('/')[event.url.split('/').length - 1];
          Object.keys(this.itemsHeader).forEach(element => {
            if (this.itemsHeader[element].link === `/${objRoute}`) {
              this.itemsHeader[element].selected = true;
            } else {
              let x = false;
              this.itemsHeader[element].selected = false;
              this.routesExcludedInServices.forEach(element => {
                if (objRoute === element) {
                  x = true;
                }
              });

              (!x) ? this.itemsHeader[AppConfig.routes.service].selected = true : this.itemsHeader[element].selected = false;
            }
          });
        }
      });
  }
}
