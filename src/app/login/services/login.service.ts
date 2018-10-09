import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { WalletService } from '../../shared/services/wallet.service';
import { AppConfig } from '../../config/app.config';
import { ApiService } from "../../shared/services/api.services";
import { Address } from "nem2-sdk/dist";

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  logged: boolean;
  isLoggedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(this.logged);
  isLogged$: Observable<boolean> = this.isLoggedSubject.asObservable();
  constructor(
    private _walletService: WalletService,
    private _apiService: ApiService,
    private route: Router
  ) { this.setLogged(false); }

  /**
   * Structuring the information of the wallet for selection
   *
   * @param {*} wallets
   * @returns
   * @memberof LoginService
   */
  walletsOption(wallets: Array<any> = []) {
    wallets = (wallets == null) ? [] : wallets
    const retorno = [{ 'value': '', 'label': 'Select wallet' }];
    wallets.forEach((item, index) => {
      retorno.push({ value: item, label: item.name });

    });
    return retorno;
  }

  /**
   * Method to login
   *
   * @param {*} common
   * @param {*} wallet
   * @returns
   * @memberof LoginService
   */
  login(common, wallet) {
    if (!this._walletService.login(common, wallet)) { return false; }
    this.route.navigate([`/${AppConfig.routes.dashboard}`]);
    this.setLogged(true);

    //Get transactions confirmed
    const ws = this._apiService.getConnectionWs();
    this.getTransactionConfirmed(ws, 'SBILTA-367K2L-X2FEXG-5TFWAS-7GEFYA-GY7QLF-BYKC');
    return true;
  }


  /**
   * Allow to load the component in the routing
   *
   * @param {*} params
   * @memberof LoginService
   */
  setLogged(params) {
    this.logged = params;
    this.isLoggedSubject.next(this.logged);
  }

  /**
   *Set value to log in and log out
   *
   * @returns
   * @memberof LoginService
   */
  getIsLogged() {
    return this.isLogged$;
  }

  getAllTransaction() {
    
  }

  getTransactionConfirmed(ws, address) {
    ws.open().then(() => {
      ws
        .confirmed(Address.createFromRawAddress(address))
        .subscribe(transaction => console.log('transaction confirmed ', transaction), err => console.error(err));
    });
  }

  getTransactionUnConfirmed(ws, address) {
    ws.open().then(() => {
      ws
        .unconfirmedAdded(Address.createFromRawAddress(address))
        .subscribe(transaction => console.log('transaction getTransactionUnConfirmed ', transaction), err => console.error(err));
    });
  }
}
