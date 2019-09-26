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
  routePartial = `/${AppConfig.routes.partial}`
  routesExcludedInServices = [
    AppConfig.routes.account,
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
  vestedBalance: string = '0.000000';
  version = '';
  viewParcial = false;
  walletName = '';
  reset = 0;


  constructor(
    private dataBridge: DataBridgeService,
    private sharedService: SharedService,
    private route: Router,
    private authService: AuthService,
    private dashboardService: DashboardService,
    private transactionService: TransactionsService,
    private walletService: WalletService
  ) {
    this.version = environment.version;
  }

  ngOnInit() {
    this.statusNode = false;
    this.walletName = this.walletService.currentWallet.name;
    this.buildItemsHeader();
    this.getAccountInfo();
    this.getBlocks();
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
      name: 'Account',
      class: '',
      icon: '',
      rol: false,
      link: `/${AppConfig.routes.account}`,
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
        this.vestedBalance = `Total Balance ${amountFormatter} XPX`;
        setTimeout(() => {
          this.searchBalance = false;
        }, 1000);
      } else {
        this.vestedBalance = `Total Balance 0.000000 XPX`;
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
   */
  validate() {
    //emit 0 after 1 second then complete, since no second argument is supplied
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
    this.walletService.clearNis1AccounsWallet();
    this.walletService.setAccountSelectedWalletNis1(null);
    this.walletService.setAccountInfoNis1(null);
    this.walletService.setNis1AccountSelected(null);
    this.walletService.setSwapTransactions$([]);
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
