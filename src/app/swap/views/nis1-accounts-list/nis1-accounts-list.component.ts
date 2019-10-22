import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
      if (typeof (element.address) === 'string') {
        element.nis1Account.address = this.nemProvider.createAddressToString(element.nis1Account.address.value).pretty();
      }else{
        element.nis1Account.address = this.nemProvider.createAddressToString(element.nis1Account.address['value']).pretty();
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
  selectAccount(address: string, type: string) {
    console.log('Address ---> ', address);
    console.log('type ---> ', type);
    // this.router.navigate([`/${AppConfig.routes.swapTransferAssets}/${address}/${type}/1`]);
  }

}
