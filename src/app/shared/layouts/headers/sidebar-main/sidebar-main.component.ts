import { Router, NavigationEnd } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { ItemsHeaderInterface, SharedService } from '../../../services/shared.service';
import { AppConfig } from 'src/app/config/app.config';
import { environment } from 'src/environments/environment.prod';
import { DashboardService } from '../../../../dashboard/services/dashboard.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { WalletService } from 'src/app/wallet/services/wallet.service';
import { TransactionsService } from 'src/app/transfer/services/transactions.service';

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
    AppConfig.routes.service,
    AppConfig.routes.viewAllAccount
  ];


  constructor(
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
    this.destroySubscription();
    this.readRoute();
    const currentPrimary = this.walletService.getAccountPrimary(this.walletService.current);
    this.walletName = currentPrimary.name;
    this.subscriptions['balance'] = this.transactionService.getBalance$().subscribe(next => {
      this.vestedBalance = `Balance ${next} XPX`;
    }, error => {
      this.vestedBalance = `Balance 0.000000 XPX`;
    });


    this.itemsHeader = {
      dashboard: this.sharedService.buildHeader(
        'default', 'Dashboard', '', '', false, `/${AppConfig.routes.dashboard}`, true, {}, true
      ),
      transfer: this.sharedService.buildHeader(
        'default', 'Transfer', '', '', false, `/${AppConfig.routes.createTransfer}`, true, {}, false
      ),
      account: this.sharedService.buildHeader(
        'default', 'Account', '', '', false, `/${AppConfig.routes.viewAllAccount}`, true, {}, false
      ),
      services: this.sharedService.buildHeader(
        'default', 'Services', '', '', false, `/${AppConfig.routes.service}`, true, {}, false
      )
    }


    // this.itemsHeader = {
    //   signout: this.sharedService.buildHeader('default', 'LOG OUT', '', '', false, `/${AppConfig.routes.home}`, false, {}, false),
    // }
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
