import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { WalletService } from '../../shared/services/wallet.service';
import { AppConfig } from '../../config/app.config';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  logged: boolean;
  isLoggedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(this.logged);
  isLogged$: Observable<boolean> = this.isLoggedSubject.asObservable();

  constructor(
    private _walletService: WalletService,
    private route: Router
  ) { }

  /**
   *mapeo de wallet para mostrar en select simple
   *
   * @param {*} wallets
   * @param {string} [compare='']
   * @returns
   * @memberof LoginService
   */
  public getwalletSelect(wallets: any, compare: string = '') {
    const retorno = [];
    wallets.forEach((item, index) => {
      if (item.name === compare) { retorno.push(item); }

    });
    return retorno;
  }
  /**
   * Método para loguear usuario
   *
   * @param {*} common
   * @param {*} wallet
   * @returns
   * @memberof LoginService
   */

  public login(common, wallet) {
    if (!this._walletService.login(common, wallet)) { return false; }
    // this._DataBridgeService.connect();
    this.route.navigate([`/${AppConfig.routes.dashboard}`]);
    this.setLogged(true);
    return true;
  }


  /**
   *permitir cargar el componente en el enrutamiento
   *
   * @param {*} params
   * @memberof LoginService
   */
  public setLogged(params) {
    this.logged = params;
    this.isLoggedSubject.next(this.logged);
  }

  /**
   *establecer valor para logueo y deslogueo
   *
   * @returns
   * @memberof LoginService
   */
  public getIsLogged() {
    return this.isLogged$;
  }

}
