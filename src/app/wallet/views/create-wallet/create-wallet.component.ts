import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { NetworkType } from 'tsjs-xpx-catapult-sdk';
import { SharedService, WalletService } from "../../../shared";
import { ProximaxProvider } from '../../../shared/services/proximax.provider';


@Component({
  selector: 'app-create-wallet',
  templateUrl: './create-wallet.component.html',
  styleUrls: ['./create-wallet.component.css']

})
export class CreateWalletComponent implements OnInit {

  nameModule = 'Create Wallet';
  descriptionModule = 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Odio obcaecati eveniet cum, dignissimos fugit consequatur tempore, blanditiis quas dolor tempora officiis, fuga numquam minima molestias veritatis velit voluptas error incidunt.';

  createWalletForm: FormGroup;
  walletIsCreated = false;
  privateKey: string;
  address: string;
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
    private _walletService: WalletService,
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
      walletname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
      network: [NetworkType.TEST_NET, [Validators.required]],
      passwords: this.fb.group({
        password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(30)]],
        confirm_password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(30)]],
      }, { validator: this.sharedService.passwordConfirming }),
    });
  }

  /**
   * Create a simple wallet
   * by: roimerj_vzla
   *
   * @memberof CreateWalletComponent
   */
  createSimpleWallet() {
    if (this.createWalletForm.valid) {
      const network = this.createWalletForm.get('network').value;
      const user = this.createWalletForm.get('walletname').value;
      const password = this.proximaxProvider.createPassword(this.createWalletForm.controls.passwords.get('password').value);
      const wallet = this.proximaxProvider.createAccountSimple(user, password, network);
      const account = wallet.open(password);
      const publicKey = account.publicKey.toString();
      const walletsStorage = this._walletService.getWalletStorage();
      const myWallet = walletsStorage.find(function (element: { name: any; }) {
        //verify if name wallet isset
        return element.name === user;
      });

      //Wallet does not exist
      if (myWallet === undefined) {
        const accounts = this._walletService.buildAccount(wallet.encryptedPrivateKey.encryptedKey, wallet.encryptedPrivateKey.iv, wallet.address['address'], wallet.network);
        this.walletName = user;
        this._walletService.setAccountWalletStorage(user, accounts);
        this.address = wallet.address.pretty();
        this.sharedService.showSuccess('Congratulations!', 'Your wallet has been created successfully');
        this.privateKey = this.proximaxProvider.decryptPrivateKey(password, accounts.encrypted, accounts.iv).toUpperCase();
        this.walletIsCreated = true;
        this.nameModule = 'Congratulations!';
        this.descriptionModule = 'Your wallet has been created successfully';
      } else {
        //Error of repeated Wallet
        this.cleanForm('walletname');
        this.sharedService.showError('Attention!', 'This name is already in use, try another name');
      }
    } else if (this.createWalletForm.controls.passwords.get('password').valid &&
      this.createWalletForm.controls.passwords.get('confirm_password').valid &&
      this.createWalletForm.controls.passwords.getError('noMatch')) {
      this.sharedService.showError('Attention!', `Password doesn't match`);
      this.cleanForm('password', 'passwords');
      this.cleanForm('confirm_password', 'passwords');
    }
  }

  /**
   * Function that gets errors from a form
   * by: roimerj_vzla
   *
   * @param {*} param
   * @param {*} name
   * @returns
   * @memberof CreateWalletComponent
   */
  getError(control, formControl?) {
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
   * Clean form
   *
   * @memberof CreateWalletComponent
   */
  cleanForm(custom?, formControl?) {
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
