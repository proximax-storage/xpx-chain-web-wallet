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
  walletSelect: any;
  selectedValue: string;
  loginForm: FormGroup;
  wallets: Array<any>;
  constructor(
    private fb: FormBuilder,
    private _loginService: LoginService
  ) { }

  /**
   *
   *
   * @memberof LoginComponent
   */
  ngOnInit() {
    let walletLocal = [];
    walletLocal = JSON.parse(localStorage.getItem('proxi-wallets'));
    this.wallets = this._loginService.walletsOption(walletLocal);
    this.createForm();
  }

  /**
   *Create login form
   *
   * @memberof LoginComponent
   */
  private createForm() {
    this.loginForm = this.fb.group({
      wallet: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(30)]],
      common: this.fb.group({ // <-- the child FormGroup
        password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(30)]]
      })
    });
  }

  /**
   *Get form error
   *
   * @param {*} param
   * @param {*} name
   * @returns
   * @memberof LoginComponent
   */
  getError(param, name = '') {
    if (this.loginForm.get(param).getError('required')) {
      return `This field is required`;
    } else if (this.loginForm.get(param).getError('minlength')) {
      return `This field must contain minimum ${this.loginForm.get(param).getError('minlength').requiredLength} characters`;
    } else if (this.loginForm.get(param).getError('maxlength')) {
      return `This field must contain maximum ${this.loginForm.get(param).getError('maxlength').requiredLength} characters`;
    }
  }

  /**
   *Get form errors
   *
   * @param {*} param
   * @param {*} name
   * @returns
   * @memberof LoginComponent
   */
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
   *Change of selection option
   *
   * @param {*} walletSelect
   * @memberof LoginComponent
   */
  private optionSelected(walletSelect: any) {
    this.walletSelect = walletSelect.value;
  }

  /**
   *I send data of the form to the logueo service
   *
   * @memberof LoginComponent
   */
  private onSubmit() {
    this.loginForm.markAsDirty();
    if (this.loginForm.valid) {
      this._loginService.login(this.loginForm.get('common').value, this.walletSelect);
      this.loginForm.reset();
    }
  }
}
