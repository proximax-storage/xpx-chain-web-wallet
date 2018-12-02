import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { WalletService } from '../../shared/services/wallet.service';
import { AppConfig } from '../../config/app.config';
import { DataBridgeService } from "../../shared/services/data-bridge.service";
import { TransactionsService } from "../../transactions/service/transactions.service";

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  logged: boolean;
  isLoggedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(this.logged);
  isLogged$: Observable<boolean> = this.isLoggedSubject.asObservable();
  constructor(
    private _walletService: WalletService,
    private route: Router,
    private _dataBridgeService:DataBridgeService,
    private transactionsService: TransactionsService
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
    this.transactionsService.destroyAllTransactions();
    this._dataBridgeService.connectnWs();
    this.route.navigate([`/${AppConfig.routes.dashboard}`]);
    this.setLogged(true);
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




}
