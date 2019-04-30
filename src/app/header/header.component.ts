import { Router, NavigationEnd } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AppConfig, NameRoute } from '../config/app.config';
import { AuthService } from '../auth/services/auth.service';
import { StructureHeader, SharedService } from "../shared";
import { NodeService } from "../servicesModule/services/node.service";
import { DataBridgeService } from '../shared/services/data-bridge.service';
import { DashboardService } from '../dashboard/services/dashboard.service';
import { TransactionsService } from '../transactions/service/transactions.service';

export interface HorizontalHeaderInterface {
  home: StructureHeader;
  node: StructureHeader;
  amount: StructureHeader;
  dashboard: StructureHeader;
  nodeSelected: StructureHeader;
  createWallet: StructureHeader;
  importWallet: StructureHeader;
  transactions: StructureHeader;
  login: StructureHeader;
  account: StructureHeader;
  services: StructureHeader;
  signout: StructureHeader;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  nameRoute = '';
  showOnlyLogged = false;
  keyObject = Object.keys;
  isLogged$: Observable<boolean>;
  horizontalHeader: HorizontalHeaderInterface;
  vestedBalance: string = '0.000000';
  message: string;
  subscriptions = [
    'balance'
  ];

  constructor(
    private authService: AuthService,
    private route: Router,
    private nodeService: NodeService,
    private dataBridgeService: DataBridgeService,
    private dashboardService: DashboardService,
    private transactionService: TransactionsService,
    private sharedService: SharedService
  ) {

  }

  ngOnInit() {
    this.destroySubscription();
    this.buildHeader();
    this.readRoute();
    this.balance();
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
   * @memberof HeaderComponent
   */
  balance() {
    this.isLogged$ = this.authService.getIsLogged();
    this.isLogged$.subscribe(
      response => {
        this.showOnlyLogged = response;
        if (this.showOnlyLogged) {
          this.subscriptions['balance'] = this.transactionService.getBalance$().subscribe(
            next => {
              this.horizontalHeader.amount.name = `Balance ${next} XPX`;
            }, error => {
              this.horizontalHeader.amount.name = `Balance 0.000000 XPX`;
            }
          );
        } else {
          this.transactionService.setBalance$('0.000000');
          this.destroySubscription();
          this.dataBridgeService.closeConenection();
        }
      }
    );
  }


  /**
   * Init var with content of header
   *
   * @memberof HeaderComponent
   */
  buildHeader() {
    this.horizontalHeader = {
      home: this.sharedService.buildStructureHeader('default', 'Home', '', 'fa fa-home', false, AppConfig.routes.home, true, {}),
      login: this.sharedService.buildStructureHeader('default', `Login`, '', 'fa fa-sign-in', false, AppConfig.routes.login, true, {}),
      amount: this.sharedService.buildStructureHeader('default', '', '', 'fa fa-money', true, '', true, {}),
      dashboard: this.sharedService.buildStructureHeader('default', 'dashboard', '', 'fa fa-home', true, AppConfig.routes.dashboard, true, {}),
      transactions: this.sharedService.buildStructureHeader('dropdown', 'Transactions', '', 'fa fa-tachometer', true, '', true,
        {
          transfer: this.sharedService.buildStructureHeader('default', 'Transfer', '', '', true, AppConfig.routes.transferTransaction, true, {})
        }
      ),
      node: this.sharedService.buildStructureHeader('dropdown', 'Node', '', 'fa fa-codepen', true, '', false,
        {
          addNode: this.sharedService.buildStructureHeader('default', 'Add node', '', '', true, AppConfig.routes.addNode, false, {}),
          selectNode: this.sharedService.buildStructureHeader('default', 'Select node', '', '', true, AppConfig.routes.selectNode, false, {})
        }
      ),
      nodeSelected: this.sharedService.buildStructureHeader('default', `Node selected: ${this.nodeService.getNodeSelected()}`, 'green-color', 'fa fa-codepen', false, '', false, {}),
      createWallet: this.sharedService.buildStructureHeader('default', `Create wallet`, '', 'fa fa-envelope', false, AppConfig.routes.createWallet, true, {}),
      importWallet: this.sharedService.buildStructureHeader('default', `Import wallet`, '', 'fa fa-key', false, AppConfig.routes.importWallet, true, {}),
      account: this.sharedService.buildStructureHeader('default', `Account`, '', 'fa fa-vcard', true, AppConfig.routes.account, true, {}),
      services: this.sharedService.buildStructureHeader('default', `Services`, '', 'fa fa-wrench', true, AppConfig.routes.services, true, {}),
      signout: this.sharedService.buildStructureHeader('default', `Signout`, '', 'fa fa-sign-out', true, AppConfig.routes.login, true, {})
    }
  }

  /**
   *
   *
   * @param {String} [param]
   * @memberof HeaderComponent
   */
  logout(param?: String) {
    this.dashboardService.processComplete = false;
    this.authService.setLogged(false);
    this.authService.destroyNodeSelected();
    this.route.navigate([`/${param}`]);
  }

  /**
   * Read route
   *
   * @memberof HeaderComponent
   */
  readRoute() {
    this.route.events
      .subscribe((event) => {
        if (event instanceof NavigationEnd) {
          var objRoute = event.url.split('/')[event.url.split('/').length - 1];
          if (NameRoute[objRoute] !== undefined) {
            this.nameRoute = NameRoute[objRoute];
          } else {
            this.nameRoute = '';
          }
        }
      });
  }
}
