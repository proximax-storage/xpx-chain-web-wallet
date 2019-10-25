import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { first } from 'rxjs/operators';

import { SharedService } from '../../../shared/services/shared.service';
import { WalletService, AccountsInterface } from '../../../wallet/services/wallet.service';
import { AppConfig } from '../../../config/app.config';
import { NemProviderService } from '../../services/nem-provider.service';
import { HeaderServicesInterface } from '../../../servicesModule/services/services-module.service';

@Component({
  selector: 'app-nis1-accounts-list',
  templateUrl: './nis1-accounts-list.component.html',
  styleUrls: ['./nis1-accounts-list.component.css']
})
export class Nis1AccountsListComponent implements OnInit {

  accountsNis1: AccountsInterface[];
  indexSelected = 0;
  paramsHeader: HeaderServicesInterface = {
    moduleName: 'Mainnet Swap',
    componentName: 'Accounts List'
  };
  searchItem = [];
  subscription: Subscription[] = [];

  constructor(
    private nemProvider: NemProviderService,
    private router: Router,
    private sharedService: SharedService,
    private walletService: WalletService
  ) { }


  ngOnInit() {
    this.walletService.setAccountInfoNis1(null);
    const allAccounts = this.walletService.currentWallet.accounts;
    this.accountsNis1 = allAccounts.filter(x => x.nis1Account !== null && x.nis1Account !== undefined);
    this.accountsNis1.forEach(element => {
      if (typeof (element.nis1Account.address) === 'string') {
        const account = this.nemProvider.createAddressToString(element.nis1Account.address);
        element.nis1Account.address = account.pretty();
      }else{
        const account = this.nemProvider.createAddressToString(element.nis1Account.address['value']);
        element.nis1Account.address = account.pretty();
      }
    });
  }


  /**
   *
   *
   * @param {*} account
   * @returns
   * @memberof Nis1AccountsListComponent
   */
  accountSelected(account: any) {
    if (account.balance === null || account.balance === '0.000000') {
      return this.sharedService.showWarning('', 'The selected account has no balance');
    }

    account.route = `/${AppConfig.routes.nis1AccountList}`;
    this.walletService.setNis1AccountSelected(account);
    this.router.navigate([`/${AppConfig.routes.accountNis1TransferXpx}`]);
  }


  /**
   *
   *
   * @param {string} quantity
   * @returns
   * @memberof Nis1AccountsListComponent
   */
  getQuantity(quantity: string) {
    return this.sharedService.amountFormat(quantity);
  }

  /**
   *
   *
   * @param {string} address
   * @param {string} type
   * @memberof Nis1AccountsListComponent
   */
  selectAccount(publicKey: string, nameAccount: string) {
    console.log('publicKey ---> ', publicKey);
    console.log('nameAccount ---> ', nameAccount);
    this.subscribeAccountFound();
    const publicAccount = this.nemProvider.createPublicAccount(publicKey);
    this.nemProvider.getAccountInfoNis1(publicAccount, nameAccount);
  }

  /**
   *
   *
   * @memberof Nis1AccountsListComponent
   */
  subscribeAccountFound(){
    this.subscription.push(this.nemProvider.getNis1AccountsFound$().pipe(first()).subscribe(accountFound => {
      console.log(accountFound);
      if (accountFound) {
        this.nemProvider.setSelectedNis1Account(accountFound);
        if (accountFound.cosignerAccounts.length > 0) {
          console.log('REDIRECCIONA A LISTAR LAS CUENTA DE COSIGNATARIOS');
          this.indexSelected = 0;
          // this.routeContinue = `/${AppConfig.routes.swapListCosignerNis1}`;
          this.router.navigate([`/${AppConfig.routes.swapListCosigners}`]);
        } else {
          console.log('PROCEDE A TRANSFERIR DE UNA VEZ');
          this.indexSelected = 0;
          this.router.navigate([`/${AppConfig.routes.swapTransferAssetsLogged}/${accountFound.address.pretty()}/1/0`]);
        }
      }else {
        this.indexSelected = 0;
      }
    }));
  }
}
