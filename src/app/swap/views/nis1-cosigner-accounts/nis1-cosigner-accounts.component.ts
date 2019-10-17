import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WalletService, AccountsInfoNis1Interface } from '../../../wallet/services/wallet.service';
import { AppConfig } from '../../../config/app.config';
import { SharedService } from '../../../shared/services/shared.service';

@Component({
  selector: 'app-nis1-cosigner-accounts',
  templateUrl: './nis1-cosigner-accounts.component.html',
  styleUrls: ['./nis1-cosigner-accounts.component.css']
})
export class Nis1CosignerAccountsComponent implements OnInit {

  mainAccount: AccountsInfoNis1Interface;
  routeGoBack = '';


  constructor(
    private router: Router,
    private sharedService: SharedService,
    private walletService: WalletService
  ) { }

  ngOnInit() {
    this.mainAccount = this.walletService.getSelectedNis1Account();
    this.routeGoBack = `/${AppConfig.routes.home}`;
    console.log('mainAccount --> ', this.mainAccount);
    if (!this.mainAccount) {
      this.router.navigate([this.routeGoBack]);
    }
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
}
