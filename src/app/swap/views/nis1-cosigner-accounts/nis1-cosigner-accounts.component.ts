import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppConfig } from '../../../config/app.config';
import { SharedService } from '../../../shared/services/shared.service';
import { NemProviderService, AccountsInfoNis1Interface } from '../../services/nem-provider.service';
import { WalletService } from '../../../wallet/services/wallet.service';

@Component({
  selector: 'app-nis1-cosigner-accounts',
  templateUrl: './nis1-cosigner-accounts.component.html',
  styleUrls: ['./nis1-cosigner-accounts.component.css']
})
export class Nis1CosignerAccountsComponent implements OnInit {

  mainAccount: AccountsInfoNis1Interface;
  nameBtnGoBack = '';
  nameBtnContinue = '';
  logged: boolean;
  objectKeys = Object.keys;
  routeContinue = '';
  routeGoBack = '';


  constructor(
    private router: Router,
    private nemProvider: NemProviderService,
    private sharedService: SharedService,
    private walletService: WalletService
  ) { }

  ngOnInit() {
    if (this.walletService.getCurrentWallet()) {
      this.nameBtnGoBack = 'Back to Service';
      this.nameBtnContinue = 'Back';
      this.logged = true;
      this.routeContinue = `/${AppConfig.routes.swapAccountList}`;
      this.routeGoBack = `/${AppConfig.routes.service}`;
    } else {
      this.nameBtnGoBack = 'Home';
      this.nameBtnContinue = 'Home';
      this.logged = true;
      this.routeContinue = `/${AppConfig.routes.home}`;
      this.routeGoBack = `/${AppConfig.routes.home}`;
    }

    this.mainAccount = Object.assign({}, this.nemProvider.getSelectedNis1Account());
    if (!this.mainAccount || Object.keys(this.mainAccount).length === 0) {
      this.router.navigate([this.routeGoBack]);
    } else if (this.mainAccount.multisigAccountsInfo.length > 0) {
      this.mainAccount.multisigAccountsInfo.forEach(element => {
        if (typeof (element.address) === 'string') {
          element.address = this.nemProvider.createAddressToString(element.address).pretty()
        } else if (element.address && element.address['value']) {
          element.address = this.nemProvider.createAddressToString(element.address['value']).pretty();
        } else {
          this.router.navigate([this.routeGoBack]);
        }
      });
    }
  }

  /**
   *
   *
   * @param {string} address
   * @returns
   * @memberof Nis1CosignerAccountsComponent
   */
  formatAddress(address: string) {
    // console.log('formatAddress ---> ', address);
    return this.nemProvider.createAddressToString(address).pretty();
  }


  /**
   *
   *
   * @param {string} quantity
   * @returns
   * @memberof Nis1CosignerAccountsComponent
   */
  getQuantity(quantity: string) {
    return this.sharedService.amountFormat(quantity);
  }

  /**
   *
   *
   * @param {string} address
   * @memberof Nis1CosignerAccountsComponent
   */
  selectAccount(address: string, type: string) {
    this.router.navigate([`/${AppConfig.routes.swapTransferAssets}/${address}/${type}/1`]);
  }
}
