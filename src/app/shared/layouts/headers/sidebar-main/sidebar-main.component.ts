import { Router, NavigationEnd } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { ItemsHeaderInterface, SharedService } from '../../../services/shared.service';
import { AppConfig } from '../../../../config/app.config';
import { environment } from '../../../../../environments/environment.prod';
import { DashboardService } from '../../../../dashboard/services/dashboard.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { WalletService } from '../../../../wallet/services/wallet.service';
import { TransactionsService } from '../../../../transfer/services/transactions.service';
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
  reconnecting = false;
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
  walletName = '';


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
    this.readRoute();
    this.getBlocks();
    this.validate();

    this.getAccountInfo();
    this.buildItemsHeader();


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
    this.itemsHeader = {
      dashboard: this.sharedService.buildHeader(
        'default', 'Dashboard', '', '', false, `/${AppConfig.routes.dashboard}`, true, {}, true
      ),
      transfer: this.sharedService.buildHeader(
        'default', 'Transfer', '', '', false, `/${AppConfig.routes.createTransfer}`, true, {}, false
      ),
      account: this.sharedService.buildHeader(
        'default', 'Account', '', '', false, `/${AppConfig.routes.account}`, true, {}, false
      ),
      services: this.sharedService.buildHeader(
        'default', 'Services', '', '', false, `/${AppConfig.routes.service}`, true, {}, false
      )
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
      let amountTotal = 0.000000;
      if (next && next.length > 0) {
        for (let element of next) {
          if (element && element.accountInfo) {
            if (element.accountInfo.mosaics && element.accountInfo.mosaics.length > 0) {
              const mosaicXpx = element.accountInfo.mosaics.find(next => next.id.toHex() === environment.mosaicXpxInfo.id);
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
        console.log('Block', next);
        if (next !== null) {
          this.colorStatus = 'green-color';
          this.currentBlock = next;
          this.statusNodeName = 'Active';
          this.statusNode = true;
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

  validate() {
    //emit 0 after 1 second then complete, since no second argument is supplied
    const source = timer(20000, 20000);
    this.subscription.push(source.subscribe(val => {
      console.log('---val--', val);
      if (this.currentBlock > this.cacheBlock) {
        this.reconnecting = false;
        this.cacheBlock = this.currentBlock;
      } else {
        this.reconnecting = true;
        this.statusNodeName = 'Reconnecting';
        this.colorStatus = 'color-light-orange';
        this.dataBridge.closeConenection(false);
        this.dataBridge.connectnWs();
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
    this.walletService.destroyAll();
    this.dashboardService.processComplete = false;
    this.authService.setLogged(false);
    this.authService.destroyNodeSelected();
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
