import { Component, OnInit } from '@angular/core';
import { NetworkType } from 'tsjs-xpx-chain-sdk';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { SharedService, ConfigurationForm } from '../../../shared/services/shared.service';
import { WalletService } from '../../services/wallet.service';
import { ProximaxProvider } from '../../../shared/services/proximax.provider';
import { AppConfig } from '../../../config/app.config';
import { ServicesModuleService } from '../../../servicesModule/services/services-module.service';
import { NemServiceService } from '../../../shared/services/nem-service.service';
import { environment } from '../../../../environments/environment';


@Component({
  selector: 'app-import-wallet',
  templateUrl: './import-wallet.component.html',
  styleUrls: ['./import-wallet.component.css']
})
export class ImportWalletComponent implements OnInit {

  importWalletForm: FormGroup;
  configurationForm: ConfigurationForm = {};
  description = 'Restore your existing ProximaX Sirius Wallet, import a private key from another service or create a new wallet right now!';
  errorMatchPassword: string;
  errorWalletExist: string;
  isValid: boolean = false;
  passwordMain = 'password'
  passwordConfirm = 'password'
  title = 'Create Wallet';
  typeNetwork = [{
    value: environment.typeNetwork.value,
    label: environment.typeNetwork.label
  }];
  nis1Account = null;
  saveNis1: boolean = false;
  foundXpx: boolean = false;
  spinnerButton: boolean = false;

  constructor(
    private fb: FormBuilder,
    private sharedService: SharedService,
    private walletService: WalletService,
    private proximaxProvider: ProximaxProvider,
    private router: Router,
    private serviceModuleService: ServicesModuleService,
    private nemProvider: NemServiceService
  ) { }

  ngOnInit() {
    this.configurationForm = this.sharedService.configurationForm;
    this.createFormImportWallet();
    this.walletService.setNis1AccounsWallet(null);
    this.walletService.setNis1AccountsWallet$([]);
    this.walletService.setAccountInfoNis1(null);
    this.walletService.setNis1AccountSelected(null);
    this.walletService.setAccountSelectedWalletNis1(null);
  }

  /**
 *
 *
 * @memberof ImportWalletComponent
 */
  async importSimpleWallet() {
    if (this.importWalletForm.valid && this.isValid) {
      // Check if name wallet exist
      let walletName = this.importWalletForm.get('nameWallet').value;
      walletName = (walletName.includes(' ') === true) ? walletName.split(' ').join('_') : walletName;
      const existWallet = this.walletService.getWalletStorage().find((element: any) => element.name === walletName);
      if (existWallet === undefined) {
        const nameWallet = walletName;
        const network = this.importWalletForm.get('network').value;
        const privateKey = this.importWalletForm.get('privateKey').value;
        const password = this.proximaxProvider.createPassword(this.importWalletForm.controls.passwords.get('password').value);
        const wallet = this.proximaxProvider.createAccountFromPrivateKey(nameWallet, password, privateKey, network);
        if (this.saveNis1) {
          this.walletService.clearNis1AccounsWallet();
          this.spinnerButton = true;
          const nis1Wallet = this.nemProvider.createAccountPrivateKey(this.importWalletForm.get('privateKey').value);
          this.nis1Account = {
            address: nis1Wallet.address,
            publicKey: nis1Wallet.publicKey
          };
          // const accountInfo = await this.nemProvider.getAccountInfo(nis1Wallet.address).toPromise();
          // console.log('this is a nis1 wallet ---------->', nis1Wallet);
          this.saveAccount(wallet, nameWallet, password);
          this.nemProvider.getAccountsInfoAccountNew(nis1Wallet, nameWallet);
        } else {
          this.saveAccount(wallet, nameWallet, password);
        }
      } else {
        this.clearForm('nameWallet');
        this.sharedService.showError('', 'This name is already in use, try another name');
      }
    }
  }

  /**
   *
   *
   * @param {*} inputType
   * @param {boolean} [main=true]
   * @memberof ImportWalletComponent
   */
  changeInputType(inputType, main = true) {
    let newType = this.sharedService.changeInputType(inputType)
    if (main === true) {
      this.passwordMain = newType;
    } else if (main === false) {
      this.passwordConfirm = newType;
    }
  }

  /**
   *
   *
   * @memberof ImportWalletComponent
   */
  createFormImportWallet() {
    this.importWalletForm = this.fb.group({
      nameWallet: ['', [
        Validators.required,
        Validators.minLength(this.configurationForm.nameWallet.minLength),
        Validators.maxLength(this.configurationForm.nameWallet.maxLength)
      ]],
      privateKey: ['', [
        Validators.required,
        Validators.minLength(this.configurationForm.privateKey.minLength),
        Validators.maxLength(this.configurationForm.privateKey.maxLength),
        Validators.pattern('^(0x|0X)?[a-fA-F0-9]+$')
      ]],
      network: [
        this.typeNetwork[0].value, [Validators.required]
      ],
      passwords: this.fb.group(
        {
          password: [
            '', [
              Validators.required,
              Validators.minLength(this.configurationForm.passwordWallet.minLength),
              Validators.maxLength(this.configurationForm.passwordWallet.maxLength)
            ]
          ],
          confirm_password: [
            '',
            [
              Validators.required,
              Validators.minLength(this.configurationForm.passwordWallet.minLength),
              Validators.maxLength(this.configurationForm.passwordWallet.maxLength)
            ]
          ],
        }, {
        validator: this.sharedService.equalsPassword
      }),
    });
  }

  /**
   *
   *
   * @param {string} [nameInput='']
   * @param {string} [nameControl='']
   * @returns
   * @memberof ImportWalletComponent
   */
  clearForm(nameInput: string = '', nameControl: string = '') {
    if (nameInput !== '') {
      if (nameControl !== '') {
        this.importWalletForm.controls[nameControl].get(nameInput).reset();
        return;
      }

      this.importWalletForm.get(nameInput).reset();
      return;
    }

    this.importWalletForm.reset();
    this.importWalletForm.get('network').setValue(environment.typeNetwork.value);
    return;
  }

  /**
   *
   *
   * @param {*} wallet
   * @param {string} nameWallet
   * @param {*} password
   * @memberof ImportWalletComponent
   */
  saveAccount(wallet: any, nameWallet: string, password: any) {
    const accountBuilded = this.walletService.buildAccount({
      address: wallet.address['address'],
      byDefault: true,
      encrypted: wallet.encryptedPrivateKey.encryptedKey,
      firstAccount: true,
      iv: wallet.encryptedPrivateKey.iv,
      network: wallet.network,
      nameAccount: 'Primary',
      publicAccount: this.proximaxProvider.getPublicAccountFromPrivateKey(this.proximaxProvider.decryptPrivateKey(
        password,
        wallet.encryptedPrivateKey.encryptedKey,
        wallet.encryptedPrivateKey.iv
      ).toUpperCase(), wallet.network),
      isMultisign: null,
      nis1Account: this.nis1Account
    });

    this.clearForm();
    this.walletService.saveDataWalletCreated({
      name: nameWallet,
      algo: password,
      network: wallet.network
    }, accountBuilded, wallet);

    this.serviceModuleService.saveContacts({
      name: accountBuilded.name,
      address: accountBuilded.address,
      walletContact: true,
      nameItem: nameWallet
    });

    this.walletService.saveWalletStorage(nameWallet, accountBuilded);
    this.walletService.setAccountSelectedWalletNis1(accountBuilded);
    this.router.navigate([`/${AppConfig.routes.walletCreated}`]);
  }

  /**
   *
   *
   * @memberof ImportWalletComponent
   */
  switchSaveNis1() {
    this.saveNis1 = !this.saveNis1
  }

  /**
   *
   *
   * @param {string} [nameInput='']
   * @param {string} [nameControl='']
   * @param {string} [nameValidation='']
   * @returns
   * @memberof ImportWalletComponent
   */
  validateInput(nameInput: string = '', nameControl: string = '', nameValidation: string = '') {
    let validation: AbstractControl = null;
    if (nameInput !== '' && nameControl !== '') {
      validation = this.importWalletForm.controls[nameControl].get(nameInput);
    } else if (nameInput === '' && nameControl !== '' && nameValidation !== '') {
      validation = this.importWalletForm.controls[nameControl].getError(nameValidation);
    } else if (nameInput !== '') {
      validation = this.importWalletForm.get(nameInput);
    }
    return validation;
  }

  /**
   *
   *
   * @returns
   * @memberof ImportWalletComponent
   */
  validateMatchPassword() {
    if (this.validateInput('password', 'passwords').valid &&
      this.validateInput('confirm_password', 'passwords').valid &&
      this.validateInput('', 'passwords', 'noMatch') &&
      (this.validateInput('password', 'passwords').dirty || this.validateInput('password', 'passwords').touched) &&
      (this.validateInput('password', 'passwords').dirty || this.validateInput('password', 'passwords').touched)) {
      this.errorMatchPassword = '-invalid';
      return true;
    }

    this.errorMatchPassword = '';
    return false;
  }

  /**
   *
   *
   * @returns
   * @memberof ImportWalletComponent
   */
  validateNameWallet() {
    if (this.importWalletForm.get('nameWallet').valid) {
      const existWallet = this.walletService.getWalletStorage().find(
        (element: any) => {
          return element.name === this.importWalletForm.get('nameWallet').value;
        }
      );

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
