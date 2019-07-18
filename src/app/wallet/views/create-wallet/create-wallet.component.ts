import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { NetworkType } from 'tsjs-xpx-chain-sdk';
import { SharedService, WalletService } from "../../../shared";
import { ProximaxProvider } from '../../../shared/services/proximax.provider';


@Component({
  selector: 'app-create-wallet',
  templateUrl: './create-wallet.component.html',
  styleUrls: ['./create-wallet.component.css']

})
export class CreateWalletComponent implements OnInit {

  nameModule = 'Create Wallet';
  descriptionModule = '';

  createWalletForm: FormGroup;
  walletIsCreated = false;
  privateKey: string;
  address: string;
  publicKey: string;
  typeNetwork = [
    {
      'value': NetworkType.TEST_NET,
      'label': 'TEST NET'
    },
  ];
  walletName: string;

  constructor(
    private fb: FormBuilder,
    private sharedService: SharedService,
    private walletService: WalletService,
    private proximaxProvider: ProximaxProvider
  ) {
  }

  ngOnInit() {
    this.createForm();
  }

  /**
   * Create a reactive form
   *
   * @memberof CreateWalletComponent
   */
  createForm() {
    this.createWalletForm = this.fb.group({
      walletname: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(30)
        ]
      ],
      network: [
        NetworkType.TEST_NET,
        [Validators.required]
      ],
      passwords: this.fb.group({
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(30)
          ]
        ],
        confirm_password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(30)
          ]
        ],
      }, {
          validator: this.sharedService.passwordConfirming
        }),
    });
  }

  /**
   * Create a simple wallet
   *
   * @memberof CreateWalletComponent
   */
  createSimpleWallet() {
    if (this.createWalletForm.valid) {
      const name = this.createWalletForm.get('walletname').value;
      const walletsStorage = this.walletService.getWalletStorage();

      //verify if name wallet isset
      const myWallet = walletsStorage.find(
        (element: { name: any; }) => {
          return element.name === name;
        }
      );

      //Wallet does not exist
      if (myWallet === undefined) {
        const network = this.createWalletForm.get('network').value;
        const password = this.proximaxProvider.createPassword(this.createWalletForm.controls.passwords.get('password').value);
        const wallet = this.proximaxProvider.createAccountSimple(name, password, network);
        const accounts = this.walletService.buildAccount(wallet.encryptedPrivateKey.encryptedKey, wallet.encryptedPrivateKey.iv, wallet.address['address'], wallet.network);
        this.walletName = name;
        this.walletService.setAccountWalletStorage(name, accounts);
        this.address = wallet.address.pretty();
        this.sharedService.showSuccess('', 'Your wallet has been successfully created');
        this.privateKey = this.proximaxProvider.decryptPrivateKey(password, accounts.encrypted, accounts.iv).toUpperCase();
        this.publicKey = this.proximaxProvider.getPublicAccountFromPrivateKey(this.privateKey, network).publicKey;
        this.walletIsCreated = true;
        this.nameModule = 'Congratulations!';
        this.descriptionModule = 'Your wallet has been successfully created';
      } else {
        //Error of repeated Wallet
        this.clearForm('walletname');
        this.sharedService.showError('', 'This name is already in use, try another name');
      }
    } else if (this.createWalletForm.controls.passwords.get('password').valid &&
      this.createWalletForm.controls.passwords.get('confirm_password').valid &&
      this.createWalletForm.controls.passwords.getError('noMatch')) {
      this.sharedService.showError('', `Password doesn't match`);
      this.clearForm('password', 'passwords');
      this.clearForm('confirm_password', 'passwords');
    }
  }

  /**
   * Function that gets errors from a form
   *
   * @param {*} param
   * @param {*} name
   * @returns
   * @memberof CreateWalletComponent
   */
  getError(control: any, formControl?: any) {
    if (formControl === undefined) {
      if (this.createWalletForm.get(control).getError('required')) {
        return `This field is required`;
      } else if (this.createWalletForm.get(control).getError('minlength')) {
        return `This field must contain minimum ${this.createWalletForm.get(control).getError('minlength').requiredLength} characters`;
      } else if (this.createWalletForm.get(control).getError('maxlength')) {
        return `This field must contain maximum ${this.createWalletForm.get(control).getError('maxlength').requiredLength} characters`;
      }
    } else {
      if (this.createWalletForm.controls[formControl].get(control).getError('required')) {
        return `This field is required`;
      } else if (this.createWalletForm.controls[formControl].get(control).getError('minlength')) {
        return `This field must contain minimum ${this.createWalletForm.controls[formControl].get(control).getError('minlength').requiredLength} characters`;
      } else if (this.createWalletForm.controls[formControl].get(control).getError('maxlength')) {
        return `This field must contain maximum ${this.createWalletForm.controls[formControl].get(control).getError('maxlength').requiredLength} characters`;
      } else if (this.createWalletForm.controls[formControl].getError('noMatch')) {
        return `Password doesn't match`;
      }
    }
  }

  /**
   * Clear form
   *
   * @memberof CreateWalletComponent
   */
  clearForm(custom?: any, formControl?: any) {
    if (custom !== undefined) {
      if (formControl !== undefined) {
        this.createWalletForm.controls[formControl].get(custom).reset();
        return;
      }
      this.createWalletForm.get(custom).reset();
      return;
    }
    this.createWalletForm.reset();
    this.createWalletForm.get('network').setValue(NetworkType.TEST_NET);
    return;
  }
}
