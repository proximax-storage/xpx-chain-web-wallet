import { Component, OnInit } from '@angular/core';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { WalletService, SharedService } from "../../../shared";

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {

  @BlockUI() blockUI: NgBlockUI;
  showPassword: boolean = true;
  showPanelPrivateKey = false;
  mosaic = 'XPX';
  titleAccountInformation = 'Account information';
  titlePrivateKey = 'Private key';
  descriptionPrivateKey = `Your private key holds all the power of your account.
  It is a priority to make sure it is stored safely somewhere offline.`;
  descriptionBackupWallet = `It is very important that you have backups of your wallets to log in with or your ${this.mosaic} will be lost.`;
  address = this.walletService.address.pretty();
  privateKey = '';
  publicKey = '';
  password = '';

  constructor(
    private walletService: WalletService,
    private sharedService: SharedService
  ) {
  }

  ngOnInit() {
    this.publicKey = this.walletService.publicAccount.publicKey;
  }

  copyMessage(message: string) {
    this.sharedService.showSuccess('', `${message} copied`);
  }

  decryptWallet() {
    if (this.password !== '') {
      const common = { password: this.password };
      if (this.walletService.decrypt(common)) {
        console.log(common);
        this.privateKey = common['privateKey'].toUpperCase();
        this.password = '';
        this.showPassword = false;
        return;
      }
      this.password = '';
      this.privateKey = '';
      return;
    }else {
      this.sharedService.showError('', 'Please, enter a password');
    }
  }

  hidePrivateKey() {
    this.privateKey = '';
    this.showPassword = true;
  }
}
