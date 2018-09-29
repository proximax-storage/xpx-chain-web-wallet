import { Component, OnInit } from '@angular/core';
import { AppConfig, Config } from '../config/app.config';
import { Observable, Subject } from 'rxjs';
import { LoginService } from '../login/services/login.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  header: object;
  isLogged$: Observable<boolean>;
  showMenu = false;
  keyObject = Object.keys;
  routes = {
    login: `/${AppConfig.routes.login}`,
    createWallet: `/${AppConfig.routes.createWallet}`
  };

  constructor(
    private _loginService: LoginService,
    private route: Router,
  ) {
  }

  ngOnInit() {

    /**
   * array data header
   *
   * @memberof HeaderComponent
   */
    this.header = {
      'home': {
        'type': 'default',
        'name': 'Create wallet',
        'class': 'active',
        'icon': 'fa fa-envelope',
        'rol': false,
        'link': this.routes.createWallet,
        'show': true,
        'submenu': {}
      },
      'dashboard': {
        'type': 'dropdown',
        'name': 'dashboard',
        'class': 'active',
        'icon': 'fa fa-home',
        'rol': false,
        'link': '/dashboard',
        'show': false,
        'submenu': {
          'dashboard': {
            'type': 'default',
            'name': 'dashboard',
            'class': 'active',
            'icon': 'fa fa-home',
            'rol': true,
            'link': '/dashboard',
            'show': true,
            'submenu': {}
          }
        }
      },
      'login': {
        'type': 'default',
        'name': 'login',
        'class': 'active',
        'icon': 'fa fa-home',
        'rol': false,
        'link': this.routes.login,
        'show': true,
        'submenu': {}
      },
      'signout': {
        'type': 'default',
        'name': 'signout',
        'class': '',
        'icon': 'fa fa-tachometer',
        'rol': true,
        'link': '/login',
        'show': true,
        'submenu': {}
      }
    };

    /**
     * Observable state of the login
     *
     * @memberof HeaderComponent
     */
    this.isLogged$ = this._loginService.getIsLogged();
    this.isLogged$.subscribe(
      response => {
        this.showMenu = response;
      }
    );
  }

  /**
   *
   *
   * @param {String} [param]
   * @memberof HeaderComponent
   */
  logout(param?: String) {
    // this._dataBridgeService.clearTrans();/
    this._loginService.setLogged(false);
    this.route.navigate([`/${param}`]);
  }


}
