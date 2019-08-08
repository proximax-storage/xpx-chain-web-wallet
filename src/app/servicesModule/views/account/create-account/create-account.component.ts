import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { NetworkType } from 'tsjs-xpx-chain-sdk';
import { Router, ActivatedRoute } from '@angular/router';
import { WalletService } from '../../../../wallet/services/wallet.service';
import { environment } from '../../../../../environments/environment';
import { ProximaxProvider } from '../../../../shared/services/proximax.provider';
import { AppConfig } from '../../../../config/app.config';
import { ConfigurationForm, SharedService } from '../../../../shared/services/shared.service';

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.css']
})
export class CreateAccountComponent implements OnInit {


  formCreateAccount: FormGroup;
  componentName = 'Create account';
  configurationForm: ConfigurationForm = {}
  currentWallet = [];
  errorWalletExist: string;
  isValid = false;
  moduleName = 'Accounts';
  othersAccounts = [];
  routes = {
    back: `/${AppConfig.routes.selectTypeCreationAccount}`,
    backToService: `/${AppConfig.routes.service}`
  };

  constructor(
    private activateRoute: ActivatedRoute,
    private walletService: WalletService,
    private proximaxProvider: ProximaxProvider,
    private fb: FormBuilder,
    private sharedService: SharedService,
    private router: Router
  ) {}

  ngOnInit() {
    let param = this.activateRoute.snapshot.paramMap.get('id');
    console.log('----type----', param);
    this.configurationForm = this.sharedService.configurationForm;
    const walletsStorage = JSON.parse(localStorage.getItem(environment.nameKeyWalletStorage));
    this.othersAccounts = walletsStorage.filter(elm => elm.name !== this.walletService.current.name);
    this.createForm(param);
    this.createAccount();
  }

  /**
   *
   *
   * @memberof CreateAccountComponent
   */
  createForm(param: string) {
    this.formCreateAccount = this.fb.group({
      nameWallet: ['', [
        Validators.required,
        Validators.minLength(this.configurationForm.nameWallet.minLength),
        Validators.maxLength(this.configurationForm.nameWallet.maxLength)
      ]],
      privateKey: ['', [
        Validators.minLength(this.configurationForm.privateKey.minLength),
        Validators.maxLength(this.configurationForm.privateKey.maxLength),
        Validators.pattern('^(0x|0X)?[a-fA-F0-9]+$')
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(this.configurationForm.passwordWallet.minLength),
        Validators.maxLength(this.configurationForm.passwordWallet.maxLength)
      ]]
    });

    if (param === '0') {
      console.log('es cero...');
      this.formCreateAccount.get('nameWallet').setValidators([Validators.required]);
    }
  }

  /**
   *
   *
   * @memberof CreateAccountComponent
   */
  createAccount() {
    if (this.formCreateAccount.valid && this.isValid) {
      const nameAccount = this.formCreateAccount.get('nameWallet').value;
      if (Object.keys(this.walletService.current.accounts).find(elm => this.walletService.current.accounts[elm].name !== nameAccount)) {
        const network = NetworkType.TEST_NET;
        const password = this.proximaxProvider.createPassword(this.formCreateAccount.get('password').value);
        const newAccount = this.proximaxProvider.createAccountSimple(nameAccount, password, network);
        const accountBuilded = this.walletService.buildAccount(
          newAccount.encryptedPrivateKey.encryptedKey,
          newAccount.encryptedPrivateKey.iv,
          newAccount.address['address'],
          newAccount.network,
          nameAccount,
          false
        );

        this.clearForm();
        this.walletService.saveDataWalletCreated({
          name: nameAccount,
          algo: password,
          network: newAccount.network
        }, accountBuilded, newAccount);
        this.walletService.saveAccountStorage(nameAccount, accountBuilded);
        this.router.navigate([`/${AppConfig.routes.accountCreated}`]);
      }
    }
  }


  /**
   *
   *
   * @param {string} [nameInput='']
   * @param {string} [nameControl='']
   * @returns
   * @memberof CreateAccountComponent
   */
  clearForm(nameInput: string = '', nameControl: string = '') {
    if (nameInput !== '') {
      if (nameControl !== '') {
        this.formCreateAccount.controls[nameControl].get(nameInput).reset();
        return;
      }

      this.formCreateAccount.get(nameInput).reset();
      return;
    }

    this.formCreateAccount.reset();
    return;
  }

  /**
   *
   *
   * @param {string} [nameInput='']
   * @param {string} [nameControl='']
   * @param {string} [nameValidation='']
   * @returns
   * @memberof CreateAccountComponent
   */
  validateInput(nameInput: string = '', nameControl: string = '', nameValidation: string = '') {
    let validation: AbstractControl = null;
    if (nameInput !== '' && nameControl !== '') {
      validation = this.formCreateAccount.controls[nameControl].get(nameInput);
    } else if (nameInput === '' && nameControl !== '' && nameValidation !== '') {
      validation = this.formCreateAccount.controls[nameControl].getError(nameValidation);
    } else if (nameInput !== '') {
      validation = this.formCreateAccount.get(nameInput);
    }
    return validation;
  }

  /**
   *
   *
   * @returns
   * @memberof CreateAccountComponent
   */
  validateNameAccount() {
    if (this.formCreateAccount.get('nameWallet').valid) {
      const nameAccount = this.formCreateAccount.get('nameWallet').value;
      const existWallet = Object.keys(this.walletService.current.accounts).find(elm => this.walletService.current.accounts[elm].name === nameAccount);
      if (existWallet !== undefined) {
        this.isValid = false;
        this.errorWalletExist = '-invalid';
        return true;
      } else {
        this.isValid = true;
        this.errorWalletExist = '';
        return false;
      }
    }
  }

}
