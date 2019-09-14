import { Component, OnInit } from '@angular/core';
import { AppConfig } from '../../../../config/app.config';
import { WalletService, AccountsInterface } from 'src/app/wallet/services/wallet.service';
import { HeaderServicesInterface } from 'src/app/servicesModule/services/services-module.service';
import { Router } from '@angular/router';
import { NemServiceService } from 'src/app/shared/services/nem-service.service';

@Component({
  selector: 'app-nis1-accounts-list',
  templateUrl: './nis1-accounts-list.component.html',
  styleUrls: ['./nis1-accounts-list.component.css']
})
export class Nis1AccountsListComponent implements OnInit {

  paramsHeader: HeaderServicesInterface = {
    moduleName: 'Mainnet Swap',
    componentName: 'TRANSFER ASSETS'
  };
  acountsNis1: AccountsInterface[];
  goBack: string = `/${AppConfig.routes.service}`;
  goList: string = `/${AppConfig.routes.accountNis1TransferXpx}`;

  constructor(
    private walletService: WalletService,
    private router: Router,
    private nemProvider: NemServiceService
  ) { }

  ngOnInit() {
    console.log('Test de acount ----> ', this.walletService.currentWallet.accounts);
    this.acountsNis1 = this.walletService.currentWallet.accounts;
  }

  accountSelected(account: AccountsInterface) {
    // this.walletService.accountInfoNis1 = account;
    console.log('antes ------>', account);
    const address = this.nemProvider.createAddressToString(account.nis1Account.address.value);
    account.nis1Account.address = address

    console.log('despues ------>',account);

    
    this.walletService.setAccountInfoNis1(account);
    this.router.navigate([`/${AppConfig.routes.accountNis1TransferXpx}`]);
  }

}
