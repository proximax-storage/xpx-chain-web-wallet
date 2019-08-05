import { Component, OnInit } from '@angular/core';
import { WalletService } from "../../../../wallet/services/wallet.service";
import { SharedService, ConfigurationForm } from "../../../../shared/services/shared.service"
import { FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-detail-account',
  templateUrl: './detail-account.component.html',
  styleUrls: ['./detail-account.component.css']
})
export class DetailAccountComponent implements OnInit {

  configurationForm: ConfigurationForm;
  showPassword: boolean = true;
  accountValid: boolean = false;
  subscribeAccount;
  // mosaic = 'XPX';
  // titleAccountInformation = 'Account information';
  titleAddress = 'Address:';
  titlePrivateKey = 'Private Key:';
  titlePublickey = 'Public Key:';
  descriptionPrivateKey = `Make sure you store your private key in a safe place.   
  Access to your digital assets cannot be recovered without it.`;
  // descriptionBackupWallet = `It is very important that you have backups of your wallets to log in with or your ${this.mosaic} will be lost.`;
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
    this.configurationForm = this.sharedService.configurationForm;
    this.publicKey = this.walletService.publicAccount.publicKey;
    this.validatingForm = new FormGroup({
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(this.configurationForm.passwordWallet.minLength),
        Validators.maxLength(this.configurationForm.passwordWallet.maxLength)
      ])
    });

    this.subscribeAccount = this.walletService.getAccountInfoAsync().subscribe(
      async accountInfo => {
        this.accountValid = (accountInfo !== null && accountInfo !== undefined);
      }
    );
  }

  ngOnDestroy(): void {
    this.subscribeAccount.unsubscribe();
  }

  copyMessage(message: string) {
    this.sharedService.showSuccess('', `${message} copied`);
  }

  decryptWallet() {
    if (this.validatingForm.get('password').value !== '') {
      const common = { password: this.validatingForm.get('password').value };
      if (this.walletService.decrypt(common)) {
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

   /**
   *
   *
   * @param {string} [nameInput='']
   * @param {string} [nameControl='']
   * @param {string} [nameValidation='']
   * @returns
   * @memberof AuthComponent
   */
  validateInput(nameInput: string = '', nameControl: string = '', nameValidation: string = '') {
    let validation: AbstractControl = null;
    if (nameInput !== '' && nameControl !== '') {
      validation = this.validatingForm.controls[nameControl].get(nameInput);
    } else if (nameInput === '' && nameControl !== '' && nameValidation !== '') {
      validation = this.validatingForm.controls[nameControl].getError(nameValidation);
    } else if (nameInput !== '') {
      validation = this.validatingForm.get(nameInput);
    }
    return validation;
  }
}
