import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { Account, NetworkType, SimpleWallet, Password } from 'nem2-sdk';
import { AppConfig } from "../../../config/app.config";
import { SharedService } from "../../../shared/services/shared.service";

@Component({
  selector: 'app-create-wallet',
  templateUrl: './create-wallet.component.html',
  styleUrls: ['./create-wallet.component.css']
})
export class CreateWalletComponent implements OnInit {

  createWalletForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private route: Router,
    private sharedService: SharedService
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
      userName: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(30)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(30)]]
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

      const user = this.createWalletForm.get('userName').value;
      const password = new Password(this.createWalletForm.get('password').value);
      const simpleWallet = SimpleWallet.create(user, password, NetworkType.TEST_NET);
      const walletsStorage = JSON.parse(localStorage.getItem('proxi-wallets'));
      const myWallet = walletsStorage.find(function(element){
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

        const wallet: WalletInterface = {
          name: user,
          accounts: {
            '0': accounts
          }
        }


        walletsStorage.push(wallet);
        localStorage.setItem('proxi-wallets', JSON.stringify(walletsStorage));
        this.sharedService.showToastr('1', 'Congratulations!', 'Your wallet has been created successfully');
        this.route.navigate([`/${AppConfig.routes.login}`]);
      }else{
        //Repeated Wallet
        this.createWalletForm.patchValue({userName: ''});
        this.sharedService.showToastr('3', 'Attention!', 'This name is already in use, try another name');
      }
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
  getError(param, name) {
    if (this.createWalletForm.get(param).getError('required')) {
      return `This field is required`;
    } else if (this.createWalletForm.get(param).getError('minlength')) {
      return `This field must contain minimum ${this.createWalletForm.get(param).getError('minlength').requiredLength} characters`;
    } else if (this.createWalletForm.get(param).getError('maxlength')) {
      return `This field must contain maximum ${this.createWalletForm.get(param).getError('maxlength').requiredLength} characters`;
    }
  }

  /**
   * Clean form
   * 
   * @memberof CreateWalletComponent
   */
  cleanForm () {
    this.createWalletForm.patchValue({userName: '', password: ''});
  }

}

export interface WalletInterface {
  name: string,
  accounts: object;
}

export interface AccountsInterface {
    brain: boolean;
    algo: string;
    encrypted: string;
    iv: string;
    address: string;
    label: string;
    network: number;
}