import { Component, OnInit } from '@angular/core';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { WalletService, SharedService } from "../../../shared";
import { FormGroup, Validators, FormControl } from '@angular/forms';

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
  descriptionPrivateKey = `Make sure you store your private key in a safe place.
  Access to your digital assets cannot be recovered without it.`;
  descriptionBackupWallet = `It is very important that you have backups of your wallets to log in with or your ${this.mosaic} will be lost.`;
  address = this.walletService.address.pretty();
  privateKey = '';
  publicKey = this.walletService.publicAccount.publicKey;
  walletName = this.walletService.current.name;
  validatingForm: FormGroup;

  constructor(
    private walletService: WalletService,
    private sharedService: SharedService
  ) {
  }

  ngOnInit() {
    this.publicKey = this.walletService.publicAccount.publicKey;
    this.validatingForm = new FormGroup({
      password: new FormControl('', Validators.required)
    });
  }

  copyMessage(message: string) {
    this.sharedService.showSuccess('', `${message} copied`);
  }

  decryptWallet() {
    if (this.validatingForm.get('password').value !== '') {
      const common = { password: this.validatingForm.get('password').value };
      if (this.walletService.decrypt(common)) {
        // console.log(common);
        this.privateKey = common['privateKey'].toUpperCase();
        this.validatingForm.get('password').patchValue('')
        this.showPassword = false;
        return;
      }
      this.validatingForm.get('password').patchValue('');
      this.privateKey = '';
      return;
    } else {
      this.sharedService.showError('', 'Please, enter a password');
    }
  }

  get input() { return this.validatingForm.get('password'); }

  hidePrivateKey() {
    this.privateKey = '';
    this.showPassword = true;
  }
}
