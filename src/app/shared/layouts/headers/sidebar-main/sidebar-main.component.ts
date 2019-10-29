import { Router, NavigationEnd } from '@angular/router';
import { Component, OnInit } from '@angular/core';
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
import { ProximaxProvider } from 'src/app/shared/services/proximax.provider';
import { NodeTime } from 'tsjs-xpx-chain-sdk';
import { ConnectionService } from 'ng-connection-service';

@Component({
  selector: 'app-sidebar-main',
  templateUrl: './sidebar-main.component.html',
  styleUrls: ['./sidebar-main.component.css']
})

export class SidebarMainComponent implements OnInit {
  statusLine = 'ONLINE';
  isConnectedLine = true;

  cacheBlock = 0;
  colorStatus = 'color-red';
  currentBlock = 0;
  itemsHeader: ItemsHeaderInterface;
  keyObject = Object.keys;
  prorroga = false;
  reconnecting = false;
  routePartial = `/${AppConfig.routes.partial}`
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
  subscriptiontimer: Subscription;


  constructor(
    private dataBridge: DataBridgeService,
    private sharedService: SharedService,
    private route: Router,
    private authService: AuthService,
    private dashboardService: DashboardService,
    private transactionService: TransactionsService,
    private walletService: WalletService,
    private nodeService: NodeService,
    private proximaxProvider: ProximaxProvider,
    private connectionService: ConnectionService
  ) {
    this.version = environment.version
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
    ));



  }

  ngOnDestroy(): void {
    this.subscription.forEach(subscription => {
      subscription.unsubscribe();
    });

    if (this.subscriptiontimer !== undefined)
      this.subscriptiontimer.unsubscribe();
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
    }

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
    }

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
    }

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
    }

    this.itemsHeader = {
      dashboard: this.sharedService.buildHeader(paramsDashboard),
      transfer: this.sharedService.buildHeader(paramsTransfer),
      account: this.sharedService.buildHeader(paramsAccount),
      services: this.sharedService.buildHeader(paramsServices)
    }
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
        for (let element of next) {
          if (element && element.accountInfo) {
            if (element.accountInfo.mosaics && element.accountInfo.mosaics.length > 0) {
              const mosaicXpx = element.accountInfo.mosaics.find(mosaic => mosaic.id.toHex() === environment.mosaicXpxInfo.id);
              if (mosaicXpx) {
                amountTotal = amountTotal + mosaicXpx.amount.compact();
              }
            }
          }
        };


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
          this.prorroga = false;
          this.statusNode = true;
          this.currentBlock = next;
        } else {
          this.currentBlock = 0;
          this.statusNode = false;
          if (!this.reconnecting) {

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
    }))
  }



  /**
   *
   */
  validate() {
    this.subscription.push(this.nodeService.getNodeStatus().subscribe(status => {
      if (!status) {
        this.colorStatus = 'color-red';
        this.statusNodeName = 'Inactive';
      } else {
        this.reconnecting = true;
        this.getNodeTime();
        this.colorStatus = 'green-color';
        this.statusNodeName = 'Active';
      }
    }))

    this.subscription.push(this.connectionService.monitor().subscribe(isConnected => {
      this.isConnectedLine = isConnected;
      if (this.isConnectedLine) {
        this.statusLine = "ONLINE";
      }
      else {
        this.statusLine = "OFFLINE";
        this.colorStatus = 'color-red';
        this.statusNodeName = 'Inactive';
        this.dataBridge.closeConection(false);
        this.dataBridge.connectnWs();
        this.reconnecting = false;
      }
    }))

  }

  // validateNode() {
  //   //emit 0 after 1 second then complete, since no second argument is supplied
  //   const source = timer(30000, 50000);
  //   this.subscription.push(source.subscribe(val => {
  //     // console.log('CURRENT_BLOCK =>', this.currentBlock);
  //     // console.log('CACHE_BLOCK =>', this.cacheBlock);
  //     console.log('=== RESETED ===', this.reset);
  //     console.log('=== CURRENT BLOCK ===', this.currentBlock);
  //     console.log('=== CACHE BLOCK ===', this.cacheBlock, '\n\n\n');

  //     if (this.currentBlock > this.cacheBlock) {
  //       this.reconnecting = false;
  //       this.cacheBlock = this.currentBlock;
  //       this.prorroga = false;
  //     } else if (this.prorroga) {
  //       this.reset = this.reset + 1;
  //       this.reconnecting = true;
  //       this.statusNodeName = 'Reconnecting';
  //       this.colorStatus = 'color-light-orange';
  //       this.dataBridge.closeConection(false);
  //       this.dataBridge.connectnWs();
  //     } else {
  //       this.statusNodeName = 'Reconnecting';
  //       this.colorStatus = 'color-light-orange';
  //       this.reconnecting = true;
  //       this.prorroga = true;
  //     }
  //   }));


  // }

  getNodeTime(ban = false) {
    if (this.subscriptiontimer !== undefined)
      this.subscriptiontimer.unsubscribe();
    const source = timer(40000, 50000);
    this.subscriptiontimer = source.subscribe(async val => {
      let times: NodeTime = null;
      try {
        times = await this.proximaxProvider.getNodeTime().toPromise();
      } catch (error) {
        times = null;
      }
      if (times) {
        this.colorStatus = 'green-color';
        this.statusNodeName = 'Active';
      } else if (this.reconnecting ) {
        console.warn("reconnecting time node...")
        this.colorStatus = 'color-red';
        this.statusNodeName = 'Inactive';
        this.dataBridge.closeConection(false);
        this.dataBridge.connectnWs();
        this.reconnecting = false;
      }

    })
  }

  /**
   *
   *
   * @memberof SidebarMainComponent
   */
  myFunction() {
    let menuNav = document.getElementById("myTopnav");
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
    this.authService.setLogged(false);
    this.authService.destroyNodeSelected();
    this.walletService.setAccountSelectedWalletNis1(null);
    this.walletService.setAccountInfoNis1(null);
    this.walletService.setNis1AccountSelected(null);
    this.walletService.setSwapTransactions$([]);
    this.walletService.setNis1AccountsWallet$([]);
    this.route.navigate([`/${AppConfig.routes.auth}`]);
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
          var objRoute = event.url.split('/')[event.url.split('/').length - 1];
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
