import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from '../../../shared/services/shared.service';
import { WalletService } from '../../../wallet/services/wallet.service';
import { AppConfig } from '../../../config/app.config';
import { NemProviderService } from '../../services/nem-provider.service';

@Component({
  selector: 'app-nis1-accounts-list',
  templateUrl: './nis1-accounts-list.component.html',
  styleUrls: ['./nis1-accounts-list.component.css']
})
export class Nis1AccountsListComponent implements OnInit {

  accountsNis1: any;
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
    const accountsNis1 = allAccounts.filter(x => x.nis1Account !== null && x.nis1Account !== undefined);
    this.accountsNis1 = accountsNis1.map(x => x.nis1Account.address = this.nemProvider.createAddressToString(x.nis1Account.address.value));
    this.searchItem.push(false);
    console.log('----this.accountsNis1---', this.accountsNis1);
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

}
