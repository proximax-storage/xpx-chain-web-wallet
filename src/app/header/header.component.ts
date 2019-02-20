import { Component, OnInit } from '@angular/core';
import { AppConfig, NameRoute } from '../config/app.config';
import { Observable } from 'rxjs';
import { LoginService } from '../login/services/login.service';
import { Router, NavigationEnd } from '@angular/router';
import { WalletService } from "../shared";
import { NodeService } from "../servicesModule/services/node.service";
import { NemProvider } from '../shared/services/nem.provider';
import { mergeMap, first } from 'rxjs/operators';
import { MessageService } from '../shared/services/message.service';
import { DataBridgeService } from '../shared/services/data-bridge.service';
import { DashboardService } from '../dashboard/services/dashboard.service';

export interface HorizontalHeaderInterface {
  home: Header;
  node: Header;
  amount: Header;
  dashboard: Header;
  nodeSelected: Header;
  createWallet: Header;
  importWallet: Header;
  transactions: Header;
  login: Header;
  account: Header;
  services: Header;
  signout: Header;
}

export interface VerticalHeaderInterface {
}

export interface Header {
  type: string;
  name: string;
  class: string;
  icon: string;
  rol: boolean;
  link: string;
  show: boolean;
  submenu: object;
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
  verticalHeader: VerticalHeaderInterface;
  vestedBalance: string = '0.00';
  message: string;

  constructor(
    private loginService: LoginService,
    private route: Router,
    private walletService: WalletService,
    private nemProvider: NemProvider,
    private nodeService: NodeService,
    private messageService: MessageService,
    private dataBridgeService: DataBridgeService,
    private dashboardService: DashboardService
  ) {

  }

  ngOnInit() {
    this.buildHeader();
    this.readRoute();
    this.readLogged();
    this.balance();
  }

  /**
      * Observable state of the login
      *
      * @memberof HeaderComponent
      */
  balance() {
    this.messageService.getCurrentMessage().subscribe(async message => {
      this.message = message;
      console.log(message);
      if (this.message === 'balanceChanged') {
        if (this.showOnlyLogged) {
          console.log("Consulta el balance...");
          this.getBalance();
        }
      }
    });
  }

  /**
   * Init var with content of header
   *
   * @memberof HeaderComponent
   */
  buildHeader() {
    this.horizontalHeader = {
      home: {
        'type': 'default',
        'name': 'Home',
        'class': '',
        'icon': 'fa fa-home',
        'rol': false,
        'link': AppConfig.routes.home,
        'show': true,
        'submenu': {}
      },
      amount: {
        'type': 'default',
        'name': `Balance ${this.vestedBalance}`,
        'class': '',
        'icon': '',
        'rol': true,
        'link': '',
        'show': true,
        'submenu': {}
      },
      dashboard: {
        'type': 'default',
        'name': 'dashboard',
        'class': '',
        'icon': 'fa fa-home',
        'rol': true,
        'link': AppConfig.routes.dashboard,
        'show': true,
        'submenu': {}
      },
      transactions: {
        'type': 'dropdown',
        'name': 'Transactions',
        'class': '',
        'icon': 'fa fa-tachometer',
        'rol': true,
        'link': '',
        'show': true,
        'submenu': {
          'transfer': {
            'type': 'default',
            'name': 'Transfer',
            'class': '',
            'icon': '',
            'rol': true,
            'link': AppConfig.routes.transferTransaction,
            'show': true,
            'submenu': {}
          }
        }
      },
      node: {
        'type': 'dropdown',
        'name': 'Node',
        'class': '',
        'icon': 'fa fa-codepen',
        'rol': true,
        'link': '',
        'show': false,
        'submenu': {
          'addNode': {
            'type': 'default',
            'name': 'Add node',
            'class': '',
            'icon': '',
            'rol': true,
            'link': AppConfig.routes.addNode,
            'show': false,
            'submenu': {}
          },
          'selectNode': {
            'type': 'default',
            'name': 'Select Node',
            'class': '',
            'icon': '',
            'rol': true,
            'link': AppConfig.routes.selectNode,
            'show': false,
            'submenu': {}
          }
        }
      },
      nodeSelected: {
        'type': 'default',
        'name': `Node selected: ${this.nodeService.getNodeSelected()}`,
        'class': 'green-color',
        'icon': 'fa-codepen',
        'rol': false,
        'link': '',
        'show': false,
        'submenu': {}
      },
      createWallet: {
        'type': 'default',
        'name': 'Create wallet',
        'class': '',
        'icon': 'fa fa-envelope',
        'rol': false,
        'link': AppConfig.routes.createWallet,
        'show': true,
        'submenu': {}
      },
      importWallet: {
        'type': 'default',
        'name': 'Import wallet',
        'class': '',
        'icon': 'fa fa-key',
        'rol': false,
        'link': AppConfig.routes.importWallet,
        'show': true,
        'submenu': {}
      },
      login: {
        'type': 'default',
        'name': 'login',
        'class': '',
        'icon': 'fa fa-home',
        'rol': false,
        'link': AppConfig.routes.login,
        'show': true,
        'submenu': {}
      },
      account: {
        'type': 'default',
        'name': 'Account',
        'class': '',
        'icon': 'fa fa-vcard',
        'rol': true,
        'link': AppConfig.routes.account,
        'show': true,
        'submenu': {}
      },
      services: {
        'type': 'default',
        'name': 'Services',
        'class': '',
        'icon': 'fa fa-wrench',
        'rol': true,
        'link': AppConfig.routes.services,
        'show': true,
        'submenu': {}
      },
      signout: {
        'type': 'default',
        'name': 'signout',
        'class': '',
        'icon': 'fa fa-lock',
        'rol': true,
        'link': AppConfig.routes.login,
        'show': true,
        'submenu': {}
      }
    }

    this.verticalHeader = {
      dashboard: {
        'type': 'default',
        'name': 'dashboard',
        'class': '',
        'icon': 'fa fa-home',
        'rol': true,
        'link': AppConfig.routes.dashboard,
        'show': true,
        'submenu': {}
      }, services: {
        'type': 'dropdown',
        'name': 'services',
        'class': '',
        'icon': 'fa fa-tachometer',
        'rol': true,
        'link': '',
        'show': true,
        'submenu': {
          'explorer': {
            'type': 'default',
            'name': 'Transaction explorer',
            'class': '',
            'icon': 'fa fa-home',
            'rol': true,
            'link': AppConfig.routes.explorer,
            'show': true,
            'submenu': {}
          },
          'apostille': {
            'type': 'default',
            'name': 'Apostille Create',
            'class': '',
            'icon': 'fa fa-codepen',
            'rol': true,
            'link': `${AppConfig.routes.apostille}`,
            'show': true,
            'submenu': {}
          },
          'auditApostille': {
            'type': 'default',
            'name': 'Apostille Audit',
            'class': '',
            'icon': 'fa fa-codepen',
            'rol': true,
            'link': `${AppConfig.routes.audiApostille}`,
            'show': true,
            'submenu': {}
          },
          'createPoll': {
            'type': 'default',
            'name': 'Create a Poll',
            'class': '',
            'icon': 'fa fa-codepen',
            'rol': true,
            'link': `${AppConfig.routes.createPoll}`,
            'show': true,
            'submenu': {}
          }, 'polls': {
            'type': 'default',
            'name': 'See Polls',
            'class': '',
            'icon': 'fa fa-codepen',
            'rol': true,
            'link': `${AppConfig.routes.polls}`,
            'show': true,
            'submenu': {}
          }
        }
      },
      transactions: {
        'type': 'dropdown',
        'name': 'Transactions',
        'class': '',
        'icon': 'fa fa-tachometer',
        'rol': true,
        'link': '',
        'show': true,
        'submenu': {
          'transfer': {
            'type': 'default',
            'name': 'Transfer',
            'class': '',
            'icon': 'fa fa-home',
            'rol': true,
            'link': AppConfig.routes.transferTransaction,
            'show': true,
            'submenu': {}
          }
        }
      },
      node: {
        'type': 'dropdown',
        'name': 'Node',
        'class': '',
        'icon': 'fa fa-codepen',
        'rol': false,
        'link': '',
        'show': true,
        'submenu': {
          'addNode': {
            'type': 'dropdown',
            'name': 'Add node',
            'class': '',
            'icon': '',
            'rol': false,
            'link': AppConfig.routes.addNode,
            'show': true,
            'submenu': {}
          },
          'selectNode': {
            'type': 'default',
            'name': 'Select Node',
            'class': '',
            'icon': '',
            'rol': false,
            'link': AppConfig.routes.selectNode,
            'show': true,
            'submenu': {}
          }
        }
      }
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
    this.loginService.setLogged(false);
    this.loginService.destroyNodeSelected();
    // this.dataBridgeService.closeConenection();
    this.route.navigate([`/${param}`]);
  }

  /**
   * Get Balance
   *
   * @memberof HeaderComponent
   */
  getBalance() {
    this.nemProvider.getBalance(this.walletService.address).pipe(mergeMap((_) => _)).pipe(first()).subscribe(
      next => {
        console.log("balance...", next);
        console.log('You have', next.relativeAmount());
        this.horizontalHeader.amount.name = `Balance ${next.relativeAmount().toFixed(6)} ${next.mosaicName}`;
      },
      err => {
        this.vestedBalance = '0';
        console.log(err);
      }
    );
  }

  /**
   * Read logged
   *
   * @memberof HeaderComponent
   */
  readLogged() {
    this.isLogged$ = this.loginService.getIsLogged();
    this.isLogged$.subscribe(
      async response => {
        this.showOnlyLogged = response;
        if (this.showOnlyLogged) {
          // this.getBalance();
          console.log("Get balance in read logged");
        } else {
          this.horizontalHeader.amount.name = '';
          this.dataBridgeService.closeConenection();
        }
      }
    );
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
