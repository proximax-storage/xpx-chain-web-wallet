import { Component, OnInit } from '@angular/core';
import { NetworkType } from 'tsjs-xpx-chain-sdk';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { SharedService, ConfigurationForm } from '../../../shared/services/shared.service';
import { WalletService } from '../../services/wallet.service';
import { ProximaxProvider } from '../../../shared/services/proximax.provider';
import { AppConfig } from 'src/app/config/app.config';

@Component({
  selector: 'app-create-wallet',
  templateUrl: './create-wallet.component.html',
  styleUrls: ['./create-wallet.component.css']
})
export class CreateWalletComponent implements OnInit {

  createWalletForm: FormGroup;
  configurationForm: ConfigurationForm = {};
  description = 'This wallet makes it easy to access your crypto and interact with blockchain. ProximaX does not have access to your funds.';
  errorMatchPassword: string;
  errorWalletExist: string;
  isValid: boolean = false;
  title = 'Create Wallet';
  typeNetwork = [{
    value: NetworkType.TEST_NET,
    label: 'TEST NET'
  }];

  constructor(
    private fb: FormBuilder,
    private sharedService: SharedService,
    private walletService: WalletService,
    private proximaxProvider: ProximaxProvider,
    private router: Router
  ) { }

  ngOnInit() {
    this.configurationForm = this.sharedService.configurationForm;
    this.createForm();
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
          return element.name === this.createWalletForm.get('nameWallet').value;
        }
      );

      //Wallet does not exist
      if (existWallet === undefined) {
        const nameWallet = this.createWalletForm.get('nameWallet').value;
        const network = this.createWalletForm.get('network').value;
        const password = this.proximaxProvider.createPassword(this.createWalletForm.controls.passwords.get('password').value);
        const wallet = this.proximaxProvider.createAccountSimple(nameWallet, password, network);
        const dataAccount = this.walletService.buildAccount(
          wallet.encryptedPrivateKey.encryptedKey,
          wallet.encryptedPrivateKey.iv,
          wallet.address['address'],
          wallet.network,
          nameWallet
        );


        this.clearForm();
        this.walletService.saveDataWalletCreated({
          name: nameWallet,
          algo: password,
          network: wallet.network
        }, dataAccount, wallet);
        this.walletService.saveWalletStorage(nameWallet, dataAccount);
        this.router.navigate([`/${AppConfig.routes.walletCreated}`]);
        // this.sharedService.showSuccess('', 'Your wallet has been successfully created');
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
    this.createWalletForm.get('network').setValue(NetworkType.TEST_NET);
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
