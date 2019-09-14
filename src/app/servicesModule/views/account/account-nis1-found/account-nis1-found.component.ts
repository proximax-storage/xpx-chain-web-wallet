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
    private activateRoute: ActivatedRoute,
    private router: Router,
    private walletService: WalletService
  ) {}

  ngOnInit() {
  }

  goToRoute() {
    const isConsigner = this.walletService.getAccountInfoNis1();
    console.log('------------> account consigner?', isConsigner);
    

    if (isConsigner.consignerOf) {
      this.router.navigate([`/${AppConfig.routes.accountNis1TransferXpx}`]);      
    } else {
      this.router.navigate([`/${AppConfig.routes.accountNis1TransferXpx}`]);
    }
  }

  goToBack() {
    this.walletService.setAccountInfoNis1(null);
    this.walletService.setAccountMosaicsNis1(null);
    this.walletService.setAccountInfoConsignerNis1(null);
    this.router.navigate([this.goAllAccounts]);
  }

}
