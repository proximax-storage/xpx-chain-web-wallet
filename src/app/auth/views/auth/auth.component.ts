import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})

export class AuthComponent implements OnInit {
  walletSelect: any;
  selectedValue: string;
  loginForm: FormGroup;
  wallets: Array<any>;
  nameModule = 'Wallet Login';
  descriptionModule = 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Odio obcaecati eveniet cum, dignissimos fugit consequatur tempore, blanditiis quas dolor tempora officiis, fuga numquam minima molestias veritatis velit voluptas error incidunt.';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {

  }


  ngOnInit() {
    let walletLocal = JSON.parse(localStorage.getItem(environment.nameKeyWalletStorage));
    this.wallets = this.authService.walletsOption(walletLocal);
    this.createForm();
  }

  private createForm() {
    this.loginForm = this.fb.group({
      wallet: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
      common: this.fb.group({ // <-- the child FormGroup
        password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(30)]]
      })
    });
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


  optionSelected(walletSelect: any) {
    this.walletSelect = walletSelect.value;
  }

  onSubmit() {
    this.loginForm.markAsDirty();
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.get('common').value, this.walletSelect);
      this.loginForm.get('common').reset();
    }
  }
}
