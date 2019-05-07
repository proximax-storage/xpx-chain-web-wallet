import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AppConfig } from '../config/app.config';
import { AuthService } from '../auth/services/auth.service';
import { StructureHeader, SharedService } from "../shared";
import { NodeService } from "../servicesModule/services/node.service";
import { DataBridgeService } from '../shared/services/data-bridge.service';
import { DashboardService } from '../dashboard/services/dashboard.service';
import { TransactionsService } from '../transactions/service/transactions.service';

export interface HorizontalHeaderInterface {
  home: StructureHeader;
  node: StructureHeader;
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

  routeLogin = AppConfig.routes.login;
  imageLogin = false;
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
              this.vestedBalance = `Balance ${next} XPX`;
              // this.horizontalHeader.amount.name = `Balance ${next} XPX`;
            }, error => {
              this.vestedBalance = `Balance 0.000000 XPX`;
              // this.horizontalHeader.amount.name = `Balance 0.000000 XPX`;
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
      home: this.sharedService.buildStructureHeader('default', 'Home', '', '', false, AppConfig.routes.home, true, {}),
      login: this.sharedService.buildStructureHeader('default', `SIGN IN`, '', '', false, AppConfig.routes.login, true, {}),
      dashboard: this.sharedService.buildStructureHeader('default', 'dashboard', '', '', true, AppConfig.routes.dashboard, true, {}),
      transactions: this.sharedService.buildStructureHeader('dropdown', 'Transactions', '', '', true, '', true,
        {
          transfer: this.sharedService.buildStructureHeader('default', 'Transfer', '', '', true, AppConfig.routes.transferTransaction, true, {})
        }
      ),
      node: this.sharedService.buildStructureHeader('dropdown', 'Node', '', '', true, '', false,
        {
          addNode: this.sharedService.buildStructureHeader('default', 'Add node', '', '', true, AppConfig.routes.addNode, false, {}),
          selectNode: this.sharedService.buildStructureHeader('default', 'Select node', '', '', true, AppConfig.routes.selectNode, false, {})
        }
      ),
      nodeSelected: this.sharedService.buildStructureHeader('default', `Node selected: ${this.nodeService.getNodeSelected()}`, 'green-color', '', false, '', false, {}),
      createWallet: this.sharedService.buildStructureHeader('default', `Create wallet`, '', '', false, AppConfig.routes.createWallet, false, {}),
      importWallet: this.sharedService.buildStructureHeader('default', `Import wallet`, '', '', false, AppConfig.routes.importWallet, false, {}),
      account: this.sharedService.buildStructureHeader('default', `Account`, '', '', true, AppConfig.routes.account, true, {}),
      services: this.sharedService.buildStructureHeader('default', `Services`, '', '', true, AppConfig.routes.services, true, {}),
      signout: this.sharedService.buildStructureHeader('default', `Signout`, '', '', true, AppConfig.routes.login, false, {})
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
          // background image other module or login
          if (objRoute === AppConfig.routes.login && !this.imageLogin) {
            // set background to module login
            this.imageLogin = true;
            document.getElementById('footer-prx').className = 'footer-copyright text-center py-3 background-white';
            document.getElementById('first').style.backgroundImage = "url('assets/images/background-black-white.jpg')";
          } else {
            if (this.imageLogin) {
              // set background to other module
              this.imageLogin = false;
              document.getElementById('footer-prx').className = 'footer-copyright text-center py-3 background-gray-prx';
              document.getElementById('first').style.backgroundImage = "url('assets/images/background-color.jpg')";
            }
          }

          Object.keys(this.horizontalHeader).forEach(element => {
            if (this.horizontalHeader[element].link === objRoute) {
              this.horizontalHeader[element].selected = true;
            } else {
              this.horizontalHeader[element].selected = false;
            }
          });
        }

      });
  }
}
