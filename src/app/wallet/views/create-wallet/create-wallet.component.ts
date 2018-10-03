import { Component, OnInit, ElementRef, Renderer2 } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { map } from "rxjs/operators";
import { Observable } from "rxjs";
import { Account, NetworkType, SimpleWallet, Password, EncryptedPrivateKey } from 'nem2-sdk';
import { AppConfig } from "../../../config/app.config";
import { AccountsInterface, WalletAccountInterface, SharedService, WalletService } from "../../../shared";


@Component({
  selector: 'app-create-wallet',
  templateUrl: './create-wallet.component.html',
  styleUrls: ['./create-wallet.component.css']

})
export class CreateWalletComponent implements OnInit {

  createWalletForm: FormGroup;
  network$: Observable<string>;
  network: number;
  observables: Array<string> = [];
  red: number;
  pvk: string;
  address: string;
  viewCreatedWallet = 1;

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
    this.createForm();
    this.network$ = this.walletService.getNetworkObservable();
    this.observables['network'] = this.network$.subscribe(
      next => {
        this.network = NetworkType[next];
      }
    );
  }

  /**
   * Create a reactive form
   *
   * @memberof CreateWalletComponent
   */
  createForm() {
    this.createWalletForm = this.fb.group({
      walletname: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(30)]],
      passwords: this.fb.group({
        password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(30)]],
        confirm_password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(30)]],
      }, { validator: this.sharedService.passwordConfirming }),
    });
  }

  /**
   * Create a simple wallet
   * 
   * @memberof CreateWalletComponent
   */
  createSimpleWallet() {
    if (this.createWalletForm.valid) {
      if (localStorage.getItem('proxi-wallets') === undefined || localStorage.getItem('proxi-wallets') === null) {
        localStorage.setItem('proxi-wallets', JSON.stringify([]));
      }

      const user = this.createWalletForm.get('walletname').value;
      const password = new Password(this.createWalletForm.controls.passwords.get('password').value);
      const simpleWallet = SimpleWallet.create(user, password,this.network);
      const walletsStorage = JSON.parse(localStorage.getItem('proxi-wallets'));
      const myWallet = walletsStorage.find(function (element) {
        return element.name === user;
      });

      //Wallet does not exist
      if (myWallet === undefined) {
        const accounts: AccountsInterface = {
          'brain': true,
          'algo': 'pass:bip32',
          'encrypted': simpleWallet.encryptedPrivateKey.encryptedKey,
          'iv': simpleWallet.encryptedPrivateKey.iv,
          'address': simpleWallet.address['address'],
          'label': 'Primary',
          'network': simpleWallet.network
        }

        const wallet: WalletAccountInterface = {
          name: user,
          accounts: {
            '0': accounts
          }
        }
        walletsStorage.push(wallet);
        localStorage.setItem('proxi-wallets', JSON.stringify(walletsStorage));
        this.address = simpleWallet.address['address'];
        this.sharedService.showSuccess('Congratulations!', 'Your wallet has been created successfully');
        this.pvk = this.walletService.decryptPrivateKey(password, simpleWallet.encryptedPrivateKey.encryptedKey, simpleWallet.encryptedPrivateKey.iv);
        this.viewCreatedWallet = 2;
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
    return;
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.observables['network'].unsubscribe();
  }
}

