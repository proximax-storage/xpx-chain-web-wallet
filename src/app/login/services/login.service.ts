import { Injectable } from '@angular/core';
import { WalletService } from '../../shared/services/wallet.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(
    private _walletService: WalletService
  ) { }
  /**
   *
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
    if (!this._walletService.login(common, wallet)) {
      console.error('no me logueo');
      return false;
    }
    console.log(' me logueo');
    // this._DataBridgeService.connect();
    // this.router.navigate(['/dashboard']);
    // this.setLogged(true);
    return true;
  }

}
