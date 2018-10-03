import { Component, OnInit, ElementRef, Renderer2 } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { map } from "rxjs/operators";
import { Observable } from "rxjs";
import { Account, SimpleWallet, Password, EncryptedPrivateKey } from 'nem2-sdk';
import { AppConfig } from "../../../config/app.config";
import { AccountsInterface, WalletAccountInterface, SharedService, WalletService } from "../../../shared";


@Component({
  selector: 'app-import-wallet',
  templateUrl: './import-wallet.component.html',
  styleUrls: ['./import-wallet.component.scss']
})
export class ImportWalletComponent implements OnInit {
 
  importWalletForm: FormGroup;
  viewCreatedWallet = 1;
  pvk: string;
  address: string;

  constructor(
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private route: Router,
    private _el: ElementRef,
    private _r: Renderer2,
    private sharedService: SharedService,
    private walletService: WalletService
  ) {
  }

  ngOnInit() {
    this.importForm();
  }

  /**
   * Create a reactive form
   * 58079783e6de85d7d229e0327f4124b943deb4ac1b0d62f0ba217647d74d6ce7
   * TAZK43B6I3RLJDYSTT3IGXZLLBFBP2FBVEKTUTVG
   * @memberof ImportWalletComponent
   */
  importForm() {
    this.importWalletForm = this.fb.group({
      walletname: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(30)]],
      passwords: this.fb.group({
        password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(30)]],
        confirm_password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(30)]],
      }, { validator: this.sharedService.passwordConfirming }),
      privateKey: ['', [Validators.required, Validators.minLength(64), Validators.maxLength(64), Validators.pattern('^(0x|0X)?[a-fA-F0-9]+$')]],
    });
  }

  /**
   * Import a simple wallet
   * 
   * @memberof ImportWalletComponent
   */
  importSimpleWallet() {
    if (this.importWalletForm.valid) {
      if (localStorage.getItem('proxi-wallets') === undefined || localStorage.getItem('proxi-wallets') === null) {
        localStorage.setItem('proxi-wallets', JSON.stringify([]));
      }

      const nameWallet = this.importWalletForm.get('walletname').value;
      const password = new Password(this.importWalletForm.controls.passwords.get('password').value);
      const privateKey = this.importWalletForm.get('privateKey').value;
      const importSimpleWallet = SimpleWallet.createFromPrivateKey(nameWallet, password, privateKey, this.network);
      const walletsStorage = JSON.parse(localStorage.getItem('proxi-wallets'));
      const myWallet = walletsStorage.find(function (element) {
        return element.name === nameWallet;
      });

      //Wallet does not exist
      if (myWallet === undefined) {
        const accounts: AccountsInterface = {
          'brain': true,
          'algo': 'pass:bip32',
          'encrypted': importSimpleWallet.encryptedPrivateKey.encryptedKey,
          'iv': importSimpleWallet.encryptedPrivateKey.iv,
          'address': importSimpleWallet.address['address'],
          'label': 'Primary',
          'network': importSimpleWallet.network
        }

        const wallet: WalletAccountInterface = {
          name: nameWallet,
          accounts: {
            '0': accounts
          }
        }
        walletsStorage.push(wallet);
        localStorage.setItem('proxi-wallets', JSON.stringify(walletsStorage));
        this.address = importSimpleWallet.address['address'];
        this.sharedService.showSuccess('Congratulations!', 'Your wallet has been created successfully');
        this.pvk = this.walletService.decryptPrivateKey(password, importSimpleWallet.encryptedPrivateKey.encryptedKey, importSimpleWallet.encryptedPrivateKey.iv);
        this.viewCreatedWallet = 2;
      } else {
        //Error of repeated Wallet
        this.cleanForm('walletname');
        this.sharedService.showError('Attention!', 'This name is already in use, try another name');
      }
    } else if (this.importWalletForm.controls.passwords.get('password').valid &&
      this.importWalletForm.controls.passwords.get('confirm_password').valid &&
      this.importWalletForm.controls.passwords.getError('noMatch')) {
      this.sharedService.showError('Attention!', `Password doesn't match`);
      this.cleanForm('password', 'passwords');
      this.cleanForm('confirm_password', 'passwords');
    }

  }

  /**
   * Function that gets errors from a form
   *
   * @param {*} param
   * @param {*} name
   * @returns
   * @memberof ImportWalletComponent
   */
  getError(control, formControl?) {
    if (formControl === undefined) {
      if (this.importWalletForm.get(control).getError('required')) {
        return `This field is required`;
      } else if (this.importWalletForm.get(control).getError('minlength')) {
        return `This field must contain minimum ${this.importWalletForm.get(control).getError('minlength').requiredLength} characters`;
      } else if (this.importWalletForm.get(control).getError('maxlength')) {
        return `This field must contain maximum ${this.importWalletForm.get(control).getError('maxlength').requiredLength} characters`;
      } else if (this.importWalletForm.get(control).getError('pattern')) {
        return `This field content characters not permited`;
      }
    } else {
      if (this.importWalletForm.controls[formControl].get(control).getError('required')) {
        return `This field is required`;
      } else if (this.importWalletForm.controls[formControl].get(control).getError('minlength')) {
        return `This field must contain minimum ${this.importWalletForm.controls[formControl].get(control).getError('minlength').requiredLength} characters`;
      } else if (this.importWalletForm.controls[formControl].get(control).getError('maxlength')) {
        return `This field must contain maximum ${this.importWalletForm.controls[formControl].get(control).getError('maxlength').requiredLength} characters`;
      } else if (this.importWalletForm.controls[formControl].getError('noMatch')) {
        return `Password doesn't match`;
      } else if (this.importWalletForm.controls[formControl].getError('pattern')) {
        return `This field content characters not permited`;
      }
    }
  }

  /**
   * Clean form
   * 
   * @memberof ImportWalletComponent
   */
  cleanForm(custom?, formControl?) {
    if (custom !== undefined) {
      if (formControl !== undefined) {
        this.importWalletForm.controls[formControl].get(custom).reset();
        return;
      }
      this.importWalletForm.get(custom).reset();
      return;
    }
    this.importWalletForm.reset();
    return;
  }
}

