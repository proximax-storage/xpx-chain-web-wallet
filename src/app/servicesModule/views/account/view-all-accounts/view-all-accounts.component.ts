import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { WalletService } from '../../../../wallet/services/wallet.service';
import { AppConfig } from '../../../../config/app.config';

@Component({
  selector: 'app-view-all-accounts',
  templateUrl: './view-all-accounts.component.html',
  styleUrls: ['./view-all-accounts.component.css']
})
export class ViewAllAccountsComponent implements OnInit {

  componentName = 'View all';
  currentAccount = [];
  moduleName = 'Accounts';
  objectKeys = Object.keys;
  routes = {
    backToService: `/${AppConfig.routes.service}`,
    createNewAccount: `/${AppConfig.routes.createAccount}`
  };

  constructor(
    private walletService: WalletService
  ) {
    let walletsStorage = JSON.parse(localStorage.getItem(environment.nameKeyWalletStorage));
    this.currentAccount = this.walletService.current;// walletsStorage.find(elm => elm.name === this.walletService.current.name);
  }

  ngOnInit() {
  }

}
