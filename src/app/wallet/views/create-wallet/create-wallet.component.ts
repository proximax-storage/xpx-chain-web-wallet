import { Component, OnInit } from '@angular/core';
import { NetworkType } from 'tsjs-xpx-chain-sdk';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { SharedService, ConfigurationForm } from '../../../shared/services/shared.service';
import { WalletService } from '../../services/wallet.service';
import { ProximaxProvider } from '../../../shared/services/proximax.provider';
import { AppConfig } from '../../../config/app.config';
import { ServicesModuleService } from '../../../servicesModule/services/services-module.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-create-wallet',
  templateUrl: './create-wallet.component.html',
  styleUrls: ['./create-wallet.component.css']
})
export class CreateWalletComponent implements OnInit {

  createWalletForm: FormGroup;
  configurationForm: ConfigurationForm = {};
  description = '';
  errorMatchPassword: string;
  errorWalletExist: string;
  isValid: boolean = false;
  newName: string = '';
  passwordMain = 'password'
  passwordConfirm = 'password'
  title = 'Create Wallet';
  typeNetwork = [{
    value: environment.typeNetwork.value,
    label: environment.typeNetwork.label
  }];


  constructor(
    private fb: FormBuilder,
    private sharedService: SharedService,
    private walletService: WalletService,
    private proximaxProvider: ProximaxProvider,
    private router: Router,
    private serviceModuleService: ServicesModuleService
  ) { }

  ngOnInit() {
    this.walletService.accountWalletCreated = null;
    this.configurationForm = this.sharedService.configurationForm;
    this.createForm();
    this.walletService.setNis1AccountsWallet$([]);
    this.walletService.setAccountInfoNis1(null);
    this.walletService.setNis1AccountSelected(null);
    this.walletService.setAccountSelectedWalletNis1(null);
  }

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
   * @memberof CreateWalletComponent
   */
  createForm() {
    this.createWalletForm = this.fb.group({
      nameWallet: ['', [
        Validators.required,
        Validators.minLength(this.configurationForm.nameWallet.minLength),
        Validators.maxLength(this.configurationForm.nameWallet.maxLength)
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
   * @memberof CreateWalletComponent
   */
  createSimpleWallet() {
    if (this.createWalletForm.valid && this.isValid) {
      //verify if name wallet isset
      const existWallet = this.walletService.getWalletStorage().find(
        (element: any) => {
          let walletName = this.createWalletForm.get('nameWallet').value
          walletName = (walletName.includes(' ') === true) ? walletName.split(' ').join('_') : walletName
          return element.name === walletName;
        }
      );

      //Wallet does not exist
      if (existWallet === undefined) {
        let walletName = this.createWalletForm.get('nameWallet').value
        walletName = (walletName.includes(' ') === true) ? walletName.split(' ').join('_') : walletName
        const nameWallet = walletName;
        const network = this.createWalletForm.get('network').value;
        const password = this.proximaxProvider.createPassword(this.createWalletForm.controls.passwords.get('password').value);
        const wallet = this.proximaxProvider.createAccountSimple(nameWallet, password, network);

        // Account Builded
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
          nis1Account: null
        });

        this.walletService.setAccountInfoNis1(accountBuilded);


        this.clearForm();
        this.walletService.saveDataWalletCreated(
          {
            name: nameWallet,
            algo: password,
            network: wallet.network
          },
          accountBuilded,
          wallet
        );

        this.serviceModuleService.saveContacts({
          name: accountBuilded.name,
          address: accountBuilded.address,
          walletContact: true,
          nameItem: nameWallet
        });

        this.walletService.saveWalletStorage(nameWallet, accountBuilded);
        this.router.navigate([`/${AppConfig.routes.walletCreated}`]);
      } else {
        //Error of repeated Wallet
        this.clearForm('nameWallet');
        this.sharedService.showError('', 'This name is already in use, try another name');
      }
    }
  }


  /**
   *
   *
   * @param {string} oldName
   * @param {string} newName
   * @memberof CreateWalletComponent
   */
  changeNameAccount(oldName: string, newName: string) {
    this.walletService.changeName(oldName, newName);
  }

  /**
   *
   *
   * @param {string} [nameInput='']
   * @param {string} [nameControl='']
   * @returns
   * @memberof CreateWalletComponent
   */
  clearForm(nameInput: string = '', nameControl: string = '') {
    if (nameInput !== '') {
      if (nameControl !== '') {
        this.createWalletForm.controls[nameControl].get(nameInput).reset();
        return;
      }

      this.createWalletForm.get(nameInput).reset();
      return;
    }

    this.createWalletForm.reset();
    this.createWalletForm.get('network').setValue(environment.typeNetwork.value);
    return;
  }

  /**
   *
   *
   * @param {string} nameInput
   * @param {string} [nameControl='']
   * @returns
   * @memberof CreateWalletComponent
   */
  validateInput(nameInput: string = '', nameControl: string = '', nameValidation: string = '') {
    let validation: AbstractControl = null;
    if (nameInput !== '' && nameControl !== '') {
      validation = this.createWalletForm.controls[nameControl].get(nameInput);
    } else if (nameInput === '' && nameControl !== '' && nameValidation !== '') {
      validation = this.createWalletForm.controls[nameControl].getError(nameValidation);
    } else if (nameInput !== '') {
      validation = this.createWalletForm.get(nameInput);
    }
    return validation;
  }

  /**
   *
   *
   * @returns
   * @memberof CreateWalletComponent
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
   * @memberof CreateWalletComponent
   */
  validateNameWallet() {
    if (this.createWalletForm.get('nameWallet').valid) {
      const existWallet = this.walletService.getWalletStorage().find(
        (element: any) => {
          return element.name === this.createWalletForm.get('nameWallet').value;
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
