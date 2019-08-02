import { Router } from '@angular/router';
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

  walletName = '';
  vestedBalance: string = '0.000000';
  subscriptions = [
    'balance'
  ];
  changeMenu = true;
  itemsHeader: ItemsHeaderInterface;
  itemsMenu = [
    {
      label: 'DASHBOARD',
      url: `/${AppConfig.routes.dashboard}`
    },
    {
      label: 'TRANSFER',
      url: `/${AppConfig.routes.createTransfer}`
    },
    {
      label: 'ACCOUNT',
      url: `/${AppConfig.routes.account}`
    },
    {
      label: 'SERVICES',
      url: `/${AppConfig.routes.service}`
    },
  ];
  keyObject = Object.keys;
  version = '';
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

  ngOnInit() {
    this.destroySubscription();
    this.walletName = this.walletService.current.name;
    this.subscriptions['balance'] = this.transactionService.getBalance$().subscribe(
      next => {
        this.vestedBalance = `Balance ${next} XPX`;
        // this.horizontalHeader.amount.name = `Balance ${next} XPX`;
      }, error => {
        this.vestedBalance = `Balance 0.000000 XPX`;
        // this.horizontalHeader.amount.name = `Balance 0.000000 XPX`;
      }
    );
    this.itemsHeader = {
      signout: this.sharedService.buildHeader('default', 'LOG OUT', '', '', false, `/${AppConfig.routes.home}`, false, {}, false),
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
  myFunction() {
    let menuNav = document.getElementById("myTopnav");
    if (menuNav.classList.contains('responsive')) {
      menuNav.classList.remove('responsive');
    } else {
      menuNav.classList.add('responsive');
    }
  }
}
