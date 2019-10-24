import { Component, OnInit } from '@angular/core';
import { HeaderServicesInterface } from 'src/app/servicesModule/services/services-module.service';
import { AppConfig } from 'src/app/config/app.config';
import { ActivatedRoute, Router } from '@angular/router';
import { WalletService } from 'src/app/wallet/services/wallet.service';

@Component({
  selector: 'app-account-nis1-found',
  templateUrl: './account-nis1-found.component.html',
  styleUrls: ['./account-nis1-found.component.css']
})
export class AccountNis1FoundComponent implements OnInit {

  paramsHeader: HeaderServicesInterface = {
    moduleName: 'Accounts',
    componentName: 'IMPORT ACCOUNT'
  };
  privateKey: string;
  goAllAccounts: string = `/${AppConfig.routes.viewAllAccount}`;

  constructor(
    private router: Router,
    private walletService: WalletService
  ) {}

  ngOnInit() {
  }

  goToRoute() {
    const nis1Info = this.walletService.getNis1AccountsWallet();
    if (nis1Info[0].consignerOf) {
      this.walletService.setAccountInfoNis1(nis1Info[0]);
      this.router.navigate([`/${AppConfig.routes.nis1AccountsConsigner}`]);
    } else {
      this.walletService.setNis1AccountSelected(nis1Info[0]);
      this.router.navigate([`/${AppConfig.routes.accountNis1TransferXpx}`]);
    }
  }

  goToBack() {
    this.walletService.setNis1AccounsWallet(null);
    this.walletService.setNis1AccountsWallet$([]);
    this.walletService.setAccountInfoNis1(null);
    this.walletService.setAccountSelectedWalletNis1(null);
    // this.walletService.setAccountMosaicsNis1(null);
    // this.walletService.setAccountInfoConsignerNis1(null);
    this.router.navigate([this.goAllAccounts]);
  }

}
