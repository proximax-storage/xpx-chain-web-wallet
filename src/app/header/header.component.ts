import { Component, OnInit } from '@angular/core';
import { AppConfig, Config, NameRoute } from '../config/app.config';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { LoginService } from '../login/services/login.service';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { WalletService } from "../shared";
import { NodeService } from "../servicesModule/services/node.service";
import { TransactionsService } from "../transactions/service/transactions.service";

export interface HorizontalHeaderInterface {
  node: Header;
  dashboard: Header;
  nodeSelected: Header;
  createWallet: Header;
  importWallet: Header;
  transactions: Header;
  login: Header;
  services: Header;
  signout: Header;
}

export interface VerticalHeaderInterface {
  dashboard: Header;
  services: Header;
  transactions: Header;
  node:Header;
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

  constructor(
    private _loginService: LoginService,
    private route: Router,
    private activatedRoute: ActivatedRoute,
    private walletService: WalletService,
    private nodeService: NodeService,
    private transactionsService: TransactionsService
  ) {
    this.route.events
      .subscribe((event) => {
        if (event instanceof NavigationEnd) {
          var objRoute = event.url.split('/')[event.url.split('/').length-1];
          if (NameRoute[objRoute] !== undefined) {
            this.nameRoute = NameRoute[objRoute];
          } else {
            this.nameRoute = '';
          }
        }
      });
  }

  ngOnInit() {
    this.buildHeader();

    /**
     * Observable state of the login
     *
     * @memberof HeaderComponent
     */
    this.isLogged$ = this._loginService.getIsLogged();
    this.isLogged$.subscribe(
      response => {
        this.showOnlyLogged = response;
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
        'show': true,
        'submenu': {
          'addNode': {
            'type': 'default',
            'name': 'Add node',
            'class': '',
            'icon': '',
            'rol': true,
            'link': AppConfig.routes.addNode,
            'show': true,
            'submenu': {}
          },
          'selectNode': {
            'type': 'default',
            'name': 'Select Node',
            'class': '',
            'icon': '',
            'rol': true,
            'link': AppConfig.routes.selectNode,
            'show': true,
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
        'submenu': { }
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
      },services: {
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
          },'polls': {
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
    this._loginService.setLogged(false);
    this.route.navigate([`/${param}`]);
  }
}
