import { Router, NavigationEnd } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { ItemsHeaderInterface, SharedService } from '../../../services/shared.service';
import { AppConfig } from '../../../../config/app.config';
import { environment } from '../../../../../environments/environment.prod';
import { DashboardService } from '../../../../dashboard/services/dashboard.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { WalletService } from '../../../../wallet/services/wallet.service';
import { TransactionsService } from '../../../../transfer/services/transactions.service';

@Component({
  selector: 'app-sidebar-main',
  templateUrl: './sidebar-main.component.html',
  styleUrls: ['./sidebar-main.component.css']
})

export class SidebarMainComponent implements OnInit {

  itemsHeader: ItemsHeaderInterface;
  keyObject = Object.keys;
  walletName = '';
  subscriptions = [
    'balance'
  ];
  vestedBalance: string = '0.000000';
  version = '';
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


  constructor(
    private sharedService: SharedService,
    private route: Router,
    private authService: AuthService,
    private dashboardService: DashboardService,
    private transactionService: TransactionsService,
    public walletService: WalletService
  ) {
    this.version = environment.version;
  }

  ngOnInit() {
    this.destroySubscription();
    this.readRoute();
    this.walletName = this.walletService.currentWallet.name;
    // console.log(this.walletService.currentWallet);

    this.subscriptions['nameAccount'] = this.walletService.getAccountsInfo$().subscribe(next => {
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
    });

    // BALANCE
    /* this.subscriptions['balance'] = this.transactionService.getBalance$().subscribe(next => {
      if (next) {
        this.vestedBalance = `Balance ${next} XPX`;
      }
    }, error => {
      this.vestedBalance = `Balance 0.000000 XPX`;
    });*/


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

  ngOnDestroy(): void {
    this.destroySubscription();
  }

  /**
   *
   *
   * @memberof HeaderComponent
   */
  destroySubscription() {
    this.subscriptions.forEach(element => {
      if (this.subscriptions[element] !== undefined) {
        this.subscriptions[element].unsubscribe();
      }
    });
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
