import { Component, OnInit } from '@angular/core';
import { NetworkType } from 'tsjs-xpx-chain-sdk';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { SharedService, ConfigurationForm } from '../../../shared/services/shared.service';
import { WalletService } from '../../services/wallet.service';
import { NamespacesService } from '../../../servicesModule/services/namespaces.service';
import { ProximaxProvider } from '../../../shared/services/proximax.provider';
import { AppConfig } from '../../../config/app.config';
import { ServicesModuleService } from '../../../servicesModule/services/services-module.service';
import { NemServiceService } from 'src/app/shared/services/nem-service.service';


@Component({
  selector: 'app-import-wallet',
  templateUrl: './import-wallet.component.html',
  styleUrls: ['./import-wallet.component.css']
})
export class ImportWalletComponent implements OnInit {

  importWalletForm: FormGroup;
  configurationForm: ConfigurationForm = {};
  description = 'Restore your existing ProximaX Sirius Wallet, import a private key from another service, or create a new wallet right now!';
  errorMatchPassword: string;
  errorWalletExist: string;
  isValid: boolean = false;
  title = 'Create Wallet';
  typeNetwork = [{
    value: NetworkType.TEST_NET,
    label: 'TEST NET'
  }];
  nis1Account = null;
  spinnerVisibility = false;
  saveNis1: boolean = false;
  foundXpx: boolean = false;

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
  }

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
        NetworkType.TEST_NET, [Validators.required]
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
    this.importWalletForm.get('network').setValue(NetworkType.TEST_NET);
    return;
  }

  async importSimpleWallet() {
    if (this.importWalletForm.valid && this.isValid) {
      //verify if name wallet isset
      const existWallet = this.walletService.getWalletStorage().find(
        (element: any) => {
          return element.name === this.importWalletForm.get('nameWallet').value;
        }
      );

      //Wallet does not exist
      if (existWallet === undefined) {
        const nameWallet = this.importWalletForm.get('nameWallet').value;
        const network = this.importWalletForm.get('network').value;
        const privateKey = this.importWalletForm.get('privateKey').value;
        const password = this.proximaxProvider.createPassword(this.importWalletForm.controls.passwords.get('password').value);
        const wallet = this.proximaxProvider.createAccountFromPrivateKey(nameWallet, password, privateKey, network);
        // const nis1Wallet = this.nemProvider.createPrivateKeyWallet(nameWallet, this.importWalletForm.controls.passwords.get('password').value, privateKey);

        if (this.saveNis1) {
          const nis1Wallet = this.nemProvider.createPrivateKeyWallet(nameWallet, this.importWalletForm.controls.passwords.get('password').value, privateKey);
          this.nis1Account = nis1Wallet;
          console.log('\n\n\n\nValue of nis1', nis1Wallet, '\n\n\n\nEnd value\n\n');
          const mosaicNis1 = await this.nemProvider.getOwnedMosaics(nis1Wallet.address);
          console.log('\n\n\n\nValue of mosaics', mosaicNis1, '\n\n\n\nEnd value\n\n');
          if (mosaicNis1.length > 0) {
            for (const el of mosaicNis1) {
              if (el.assetId.namespaceId === 'prx' && el.assetId.name === 'xpx') {
                this.foundXpx = true;
                this.walletService.accountInfoNis1 = el;
                console.log('\n\n\n\nValue of mosaicXPX', this.nis1Account, '\n\n\n\nEnd value\n\n');
              }
            }
          }
        }
          
        console.log('this a wallet', wallet);
        console.log('this a nis1Wallet', this.nis1Account);

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
            wallet.
              encryptedPrivateKey.encryptedKey,
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
        if (this.foundXpx) {
          this.router.navigate([`/${AppConfig.routes.accountNis1Found}/${privateKey}`]);
        } else {
          this.router.navigate([`/${AppConfig.routes.walletCreated}`]);
        }
      } else {
        //Error of repeated Wallet
        this.clearForm('nameWallet');
        this.sharedService.showError('', 'This name is already in use, try another name');
      }
    }
  }

  switchSaveNis1() {
    this.saveNis1 = !this.saveNis1
    console.log(this.saveNis1);    
  }  

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
