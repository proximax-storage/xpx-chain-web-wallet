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

    this.wallets = JSON.parse(localStorage.getItem('proxi-wallets'));
  }
  ngOnInit() {
   // this.createForm();
  }

  createForm() {
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
}
