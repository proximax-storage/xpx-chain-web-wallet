import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Account, NetworkType, SimpleWallet, Password } from 'nem2-sdk';

@Component({
  selector: 'app-create-wallet',
  templateUrl: './create-wallet.component.html',
  styleUrls: ['./create-wallet.component.css']
})
export class CreateWalletComponent implements OnInit {

  createWalletForm: FormGroup;

  constructor(
    private fb: FormBuilder,
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

  createSimpleWallet() {
    if (this.createWalletForm.valid) {
      if (localStorage.getItem('proxi-wallets') === undefined || localStorage.getItem('proxi-wallets') === null) {
        localStorage.setItem('proxi-wallets', JSON.stringify([]));
      }

      const user = this.createWalletForm.get('userName').value;
      const password = new Password(this.createWalletForm.get('password').value);
      const simpleWallet = SimpleWallet.create(user, password, NetworkType.TEST_NET);
      const walletsStorage = JSON.parse(localStorage.getItem('proxi-wallets'));
      console.log(walletsStorage);

      //if wallet exist
      const myVal = walletsStorage.find(function(element){
        return element.name === user;
      });

      if (myVal === undefined) {
        walletsStorage.push({
          name: user,
          accounts: {
            '0': {
              'brain': true,
              'algo': 'pass:bip32',
              'encrypted': simpleWallet.encryptedPrivateKey.encryptedKey,
              'iv': simpleWallet.encryptedPrivateKey.iv,
              'address': simpleWallet.address['address'],
              'label': 'Primary',
              'network': simpleWallet.network
            }
          }
        });
        localStorage.setItem('proxi-wallets', JSON.stringify(walletsStorage));
      }else{
        this.createWalletForm.patchValue({userName: ''});
        //this.createWalletForm.setErrors();
        console.log('usuario repetido...');
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

  cleanForm () {
    this.createWalletForm.patchValue({userName: '', password: ''});
  }

}

export interface WalletInterface {
  name: string,
  accounts: object;
}

export interface AccountsInterface {
  '0': {
    brain: boolean,
    algo: string,
    encrypted: string,
    iv: string,
    address: string,
    label: string,
    network: number,
    child: string
  }
}