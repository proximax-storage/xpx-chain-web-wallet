import { Component, OnInit } from '@angular/core';
import { AppConfig } from '../../../../config/app.config';
import { WalletService } from '../../../../wallet/services/wallet.service';
import { ProximaxProvider } from '../../../../shared/services/proximax.provider';
import { SharedService } from '../../../../shared/services/shared.service';

@Component({
  selector: 'app-account-created',
  templateUrl: './account-created.component.html',
  styleUrls: ['./account-created.component.css']
})
export class AccountCreatedComponent implements OnInit {

  address: any;
  algo: any;
  componentName = 'New account created';
  information = 'Make sure store your private key in a safe place. Access to your digital assets cannot be recovered without it.';
  moduleName = 'Accounts';
  routes = {
    backToService: `/${AppConfig.routes.viewAllAccount}`,
  };

  name: any;
  privateKey: any;
  publicKey: any;
  router: any;
  viewPrivateKey = false;
  viewPublicKey = false;

  constructor(
    private walletService: WalletService,
    private proximaxProvider: ProximaxProvider,
    private sharedService: SharedService
  ) { }

  ngOnInit() {
    this.algo = this.walletService.accountWalletCreated;
    if (this.algo !== null) {
      this.name = this.algo.data.name;
      this.address = this.algo.wallet.address.pretty();
      this.privateKey = this.proximaxProvider.decryptPrivateKey(this.algo.data.algo, this.algo.dataAccount.encrypted, this.algo.dataAccount.iv).toUpperCase();
      this.publicKey = this.proximaxProvider.getPublicAccountFromPrivateKey(this.privateKey, this.algo.data.network).publicKey;
      this.viewPublicKey = this.algo.data.fromPrivateKey;
      this.algo = null;
      this.walletService.accountWalletCreated = null;
    }else {
      this.router.navigate([`/${AppConfig.routes.home}`]);
    }
  }

  /**
   *
   *
   * @param {string} message
   * @memberof AccountCreatedComponent
   */
  copyMessage(message: string) {
    this.sharedService.showSuccess('', `${message} copied`);
  }

}
