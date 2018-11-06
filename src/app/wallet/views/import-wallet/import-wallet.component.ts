import { Component, OnInit, ElementRef, Renderer2 } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { map } from "rxjs/operators";
import { Observable } from "rxjs";
import { Account, NetworkType, SimpleWallet, Password, EncryptedPrivateKey, PublicAccount, AccountHttp } from 'nem2-sdk';
import { AppConfig } from "../../../config/app.config";
import { AccountsInterface, WalletAccountInterface, SharedService, WalletService } from "../../../shared";
import { NemProvider } from '../../../shared/services/nem.provider';


@Component({
  selector: 'app-import-wallet',
  templateUrl: './import-wallet.component.html',
  styleUrls: ['./import-wallet.component.scss']
})
export class ImportWalletComponent implements OnInit {

  importWalletForm: FormGroup;
  walletIsCreated = false;
  pvk: string;
  address: string;
  typeNetwork = [
    {
      'value': NetworkType.TEST_NET,
      'label': 'TEST NET'
    },{
      'value': NetworkType.MIJIN_TEST,
      'label': 'MIJIN TEST'
    }
  ];

  constructor(
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private route: Router,
    private _el: ElementRef,
    private _r: Renderer2,
    private sharedService: SharedService,
    private _walletService: WalletService,
    private _nemProvider: NemProvider
  ) {
  }

  ngOnInit() {
    this.importForm();
  }

  /**
   * today 26
   * 9E8A529894129F737C40560DCAE25E99C91C18F55E2417C1188398DB0D3D09BD  private key
   *
   * Create a reactive form
   * 0F3CC33190A49ABB32E7172E348EA927F975F8829107AAA3D6349BB10797D4F6 (pvk with money)
   *
   *
   * catapult wss://staging.mocd.gov.ae/catapult/
   * 8E3639F5437B83C13C567E3C2C847966AC25D6E12B38632DF38DCD5403C64368
   * SBHMRE-3QM3GP-BNDG2O-BDQ6AE-WGDPZI-MO2SGJ-O77I
   *
   *
   * @memberof ImportWalletComponent
   */
  importForm() {
    this.importWalletForm = this.fb.group({
      walletname: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(30)]],
      network: [NetworkType.TEST_NET, [Validators.required]],
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
      const nameWallet = this.importWalletForm.get('walletname').value;
      const password = this._nemProvider.createPassword(this.importWalletForm.controls.passwords.get('password').value);
      const privateKey = this.importWalletForm.get('privateKey').value;
      const network = this.importWalletForm.get('network').value;
      const wallet = this._nemProvider.createAccountFromPrivateKey(nameWallet, password, privateKey, network);
      const walletsStorage = this._walletService.getWalletStorage();
      //verify if name wallet isset
      const myWallet = walletsStorage.find(function (element) {
        return element.name === nameWallet;
      });

      //Wallet does not exist
      if (myWallet === undefined) {
        const accounts = this._walletService.buildAccount(wallet.encryptedPrivateKey.encryptedKey, wallet.encryptedPrivateKey.iv, wallet.address['address'], wallet.network);
        this._walletService.setAccountWalletStorage(nameWallet, accounts);
        this.address = wallet.address.pretty();
        this.sharedService.showSuccess('Congratulations!', 'Your wallet has been created successfully');
        this.pvk = this._nemProvider.decryptPrivateKey(password, accounts.encrypted, accounts.iv).toUpperCase();
        this.walletIsCreated = true;
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
    this.importWalletForm.get('network').setValue(NetworkType.TEST_NET);
    return;
  }
}

