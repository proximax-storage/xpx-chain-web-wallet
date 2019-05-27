import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../../environments/environment';
import { AppConfig } from '../../../config/app.config';
import { NgSelectConfig } from '@ng-select/ng-select';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})

export class AuthComponent implements OnInit {

  link = AppConfig.routes;
  selectedValue: string;
  loginForm: FormGroup;
  wallets: Array<any>;
  nameModule = 'Wallet Login';
  descriptionModule = 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Odio obcaecati eveniet cum, dignissimos fugit consequatur tempore, blanditiis quas dolor tempora officiis, fuga numquam minima molestias veritatis velit voluptas error incidunt.';
  simpleItems = [true, 'Two', 3];
  selectedSimpleItem = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private config: NgSelectConfig
  ) {
    this.config.notFoundText = 'Custom not found';
    this.simpleItems = [true, 'Two', 3];
  }


  ngOnInit() {
    let walletLocal = JSON.parse(localStorage.getItem(environment.nameKeyWalletStorage));
    this.wallets = this.authService.walletsOption(walletLocal);
    this.createForm();
  }

  createForm() {
    this.loginForm = this.fb.group({
      wallet: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
      common: this.fb.group({ // <-- the child FormGroup
        password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(30)]]
      })
    });
  }

  /**
  * Clean form
  *
  * @param {(string | (string | number)[])} [custom]
  * @param {(string | number)} [formControl]
  * @returns
  * @memberof TransferComponent
  */
  cleanForm(
    custom?: string | (string | number)[],
    formControl?: string | number
  ) {
    if (custom !== undefined) {
      if (formControl !== undefined) {
        this.loginForm.controls[formControl].get(custom).reset();
        return;
      }
      this.loginForm.get(custom).reset();
      return;
    }
    this.loginForm.reset();
    return;
  }


  getError(param: string | (string | number)[], name: string = '') {
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

  onSubmit() {
    this.loginForm.markAsDirty();
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.get('common').value, this.loginForm.get('wallet').value);
      this.loginForm.get('wallet').reset();
      this.loginForm.get('common').reset();
    }
  }
}
