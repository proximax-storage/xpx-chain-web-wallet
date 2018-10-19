import { Component, OnInit } from '@angular/core';
import { AppConfig, Config, NameRoute } from '../config/app.config';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { LoginService } from '../login/services/login.service';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { WalletService } from "../shared";
export interface HorizontalHeaderInterface{
  createWallet: Header;
  importWallet: Header;
  login: Header;
  signout: Header;
}

export interface VerticalHeaderInterface{
  dashboard: Header;
}

export interface Header{
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
    private walletService: WalletService
  ) {
    this.route.events
      .subscribe((event) => {
        if (event instanceof NavigationEnd) {
          var objRoute = event.url.split('/')[1];
          if (NameRoute[objRoute] !== undefined) {
            this.nameRoute = NameRoute[objRoute];
          }else {
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
  buildHeader(){
    this.horizontalHeader = {
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
      signout: {
        'type': 'default',
        'name': 'signout',
        'class': '',
        'icon': 'fa fa-tachometer',
        'rol': true,
        'link': AppConfig.routes.login,
        'show': true,
        'submenu': {}
      }
    }

    this.verticalHeader = {
      dashboard: {
        'type': 'dropdown',
        'name': 'dashboard',
        'class': '',
        'icon': 'fa fa-home',
        'rol': true,
        'link': AppConfig.routes.dashboard,
        'show': true,
        'submenu': {
          'dashboard': {
            'type': 'default',
            'name': 'dashboard',
            'class': '',
            'icon': 'fa fa-home',
            'rol': true,
            'link': AppConfig.routes.dashboard,
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
