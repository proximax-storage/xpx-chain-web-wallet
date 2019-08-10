import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { WalletService } from "../../../../wallet/services/wallet.service";
import { SharedService, ConfigurationForm } from "../../../../shared/services/shared.service"
import { AppConfig } from '../../../../config/app.config';
import { ActivatedRoute } from '@angular/router';
import { ProximaxProvider } from 'src/app/shared/services/proximax.provider';

@Component({
  selector: 'app-detail-account',
  templateUrl: './detail-account.component.html',
  styleUrls: ['./detail-account.component.css']
})
export class DetailAccountComponent implements OnInit {

  accountValid: boolean = false;
  configurationForm: ConfigurationForm;
  editNameAccount = false;
  newNameAccount: string = '';
  showPassword: boolean = true;
  subscribeAccount;
  routes = {
    backToService: `/${AppConfig.routes.service}`,
    viewAllAccounts: `/${AppConfig.routes.viewAllAccount}`
  }
  // mosaic = 'XPX';
  // titleAccountInformation = 'Account information';
  titleAddress = 'Address:';
  titlePrivateKey = 'Private Key:';
  titlePublickey = 'Public Key:';
  descriptionPrivateKey = `Make sure you store your private key in a safe place.
  Access to your digital assets cannot be recovered without it.`;
  // descriptionBackupWallet = `It is very important that you have backups of your wallets to log in with or your ${this.mosaic} will be lost.`;
  address = '';
  privateKey = '';
  publicKey = '';
  accountName = '';
  validatingForm: FormGroup;
  currenAccount = null;

  constructor(
    private activateRoute: ActivatedRoute,
    private proximaxProvider: ProximaxProvider,
    private sharedService: SharedService,
    private walletService: WalletService
  ) {
  }

  ngOnInit() {
    let param = this.activateRoute.snapshot.paramMap.get('name');
    if (param) {
      this.currenAccount = this.walletService.filterAccount(param);
    } else {
      this.currenAccount = this.walletService.filterAccount('', true);
    }
    this.buildData();
    this.configurationForm = this.sharedService.configurationForm;
    this.createForm();
    this.subscribeAccount = this.walletService.getAccountInfoAsync().subscribe(
      async accountInfo => {
        this.accountValid = (
          accountInfo !== null &&
          accountInfo !== undefined &&
          accountInfo.publicKey !== "0000000000000000000000000000000000000000000000000000000000000000"
        );
      }
    );
  }

  ngOnDestroy(): void {
    this.subscribeAccount.unsubscribe();
  }

  /**
   *
   *
   * @memberof DetailAccountComponent
   */
  buildData() {
    this.accountName = this.currenAccount.name;
    this.address = this.proximaxProvider.createFromRawAddress(this.currenAccount.address).pretty();
    this.publicKey = this.currenAccount.publicAccount.publicKey;
  }

  copyMessage(message: string) {
    this.sharedService.showSuccess('', `${message} copied`);
  }

  createForm() {
    this.validatingForm = new FormGroup({
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(this.configurationForm.passwordWallet.minLength),
        Validators.maxLength(this.configurationForm.passwordWallet.maxLength)
      ])
    });
  }

  /**
   *
   *
   * @memberof DetailAccountComponent
   */
  changeNameAccount() {
    if (this.newNameAccount !== '') {
      if (!this.walletService.validateNameAccount(this.newNameAccount)) {
        this.walletService.changeName(this.accountName, this.newNameAccount);
        this.editNameAccount = !this.editNameAccount;
        this.currenAccount = this.walletService.filterAccount(this.newNameAccount);
        this.newNameAccount = '';
        this.buildData();
        this.sharedService.showSuccess('', 'Your account name has been updated');
      } else {
        this.sharedService.showWarning('', 'This name is already in use');
      }
    }
  }

  /**
   *
   *
   * @returns
   * @memberof DetailAccountComponent
   */
  decryptWallet() {
    if (this.validatingForm.get('password').value !== '') {
      const common = { password: this.validatingForm.get('password').value };
      console.log(common);
      console.log(this.currenAccount);
      if (this.walletService.decrypt(common, this.currenAccount)) {
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

  /**
   *
   *
   * @memberof DetailAccountComponent
   */
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
