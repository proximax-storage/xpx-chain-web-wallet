import { Component, OnInit } from '@angular/core';
import { SimpleWallet, Password, NetworkType, Account } from 'nem2-sdk';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { LoginService } from '../../services/login.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  selectedValue: string;
  loginForm: FormGroup;
  wallets: object;
  walletSelect: object;

  constructor(
    private fb: FormBuilder,
    private _loginService: LoginService
  ) {

    // this.wallets = JSON.parse(localStorage.getItem('ngStorage-wallets'));
    this.wallets = [{
      'name': 'manalo',
      'accounts': {
        '0': {
          'brain': true,
          'algo': 'pass:bip32',
          'encrypted': 'ad0113fb86b81b010b4ccaeecd49cec8eafad4f553f5922739afb2d09e7929f5735c56d6a4677338be4d297d026b3c5e',
          'iv': 'b0e5c7385cb4bda1e9910f4072da5815',
          'address': 'TAYEUPMGP726SLD3MW4YUKWV45XSRIJIABLVGEJL',
          'label': 'Primary',
          'network': 152,
          'child': '5cc76cd720f4aa28082a9ef1b1386d00e7a3551b38541c15367ece7d553b3a93'
        }
      }
    }];
  }
  ngOnInit() {

    // TAYEUPMGP726SLD3MW4YUKWV45XSRIJIABLVGEJL
    // FA7A7049F45A943BFC8AFF8F6C9C89E20F39F8EF31B8227607698EDB659C2DDC

    // fa7a7049f45a943bfc8aff8f6c9c89e20f39f8ef31b8227607698edb659c2ddc

    const h = 'fa7a7049f45a943bfc8aff8f6c9c89e20f39f8ef31b8227607698edb659c2ddc';
    console.log(NetworkType.TEST_NET);
    console.log('generando wallet :::::::::::::::::::::::');
    console.log('creanndo cuenta nueva :  TAYEUPMGP726SLD3MW4YUKWV45XSRIJIABLVGEJL');

    console.log('generando nueva cuenta  private key:', Account.createFromPrivateKey(h, NetworkType.TEST_NET));

    // console.log('ho:', crypto);
    this.createForm();
  }

  createForm() {
    // this.loginForm = this.fb.group({
    //   wallet: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(30)]],
    //   password: ['', [Validators.required, Validators.minLength(3)]]
    // });

    this.loginForm = this.fb.group({
      wallet: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(30)]],
      common: this.fb.group({ // <-- the child FormGroup
        password: ['', [Validators.required, Validators.minLength(3)]]
      })
    });
  }

  getError(param, name) {
    if (this.loginForm.get(param).getError('required')) {
      return `This field is required`;
    } else if (this.loginForm.get(param).getError('minlength')) {
      return `This field must contain minimum ${this.loginForm.get(param).getError('minlength').requiredLength} characters`;
    } else if (this.loginForm.get(param).getError('maxlength')) {
      return `This field must contain maximum ${this.loginForm.get(param).getError('maxlength').requiredLength} characters`;
    }
  }
  
  getErrorGroup(param, name) {
    if (this.loginForm.get(param).get(name).getError('required')) {
      return `This field is required`;
    } else if (this.loginForm.get(param).get(name).getError('minlength')) {
      return `This field must contain minimum ${this.loginForm.get(param).get(name).getError('minlength').requiredLength} characters`;
    } else if (this.loginForm.get(param).get(name).getError('maxlength')) {
      return `This field must contain maximum ${this.loginForm.get(param).get(name).getError('maxlength').requiredLength} characters`;
    }
  }

  /**
   *
   *
   * @param {*} walletSelect
   * @memberof LoginComponent
   */
  onChange(walletSelect) {
    this.walletSelect = this._loginService.getwalletSelect(this.wallets, walletSelect);
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this._loginService.login(this.loginForm.get('common').value, this.walletSelect[0]);
      this.loginForm.reset();
    }
  }



  // /**
  //   * Create Simple Wallet    Crear billetera simple
  //   * @param walletName wallet idenitifier for app
  //   * @param password wallet's password
  //   * @param selected network
  //   * @return Promise with wallet created
  //   */
  // createSimpleWallet(walletName: string, password: string): SimpleWallet {
  //   return SimpleWallet.create(walletName, new Password(password), NetworkType.TEST_NET);
  // }
}
