import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {

  authForm: FormGroup;
  title = 'Sign in to your Wallet';
  wallets: Array<any>;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) { }

  ngOnInit(){
    this.wallets = this.authService.walletsOption(JSON.parse(localStorage.getItem(environment.nameKeyWalletStorage)));
    this.createForm();
  }

  /**
   *
   *
   * @memberof AuthComponent
   */
  auth() {
    this.authForm.markAsDirty();
    if (this.authForm.valid) {
      this.authService.login(this.authForm.get('common').value, this.authForm.get('wallet').value);
      this.authForm.get('wallet').reset();
      this.authForm.get('common').reset();
    }
  }

  /**
   *
   *
   * @memberof AuthComponent
   */
  createForm() {
    this.authForm = this.fb.group({
      wallet: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
      common: this.fb.group({
        password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(30)]]
      })
    });
  }

  /**
   *
   * @param nameInput
   * @param nameControl
   */
  clearForm(nameInput: string = '', nameControl: string = '') {
    if (nameInput !== '') {
      if (nameControl !== '') {
        this.authForm.controls[nameControl].get(nameInput).reset();
        return;
      }

      this.authForm.get(nameInput).reset();
      return;
    }

    this.authForm.reset();
    return;
  }

  /**
   *
   *
   * @param {string} [nameInput='']
   * @param {string} [nameControl='']
   * @param {string} [nameValidation='']
   * @returns
   * @memberof AuthComponent
   */
  validateInput(nameInput: string = '', nameControl: string = '', nameValidation: string = '') {
    let validation: AbstractControl = null;
    if (nameInput !== '' && nameControl !== '') {
      validation = this.authForm.controls[nameControl].get(nameInput);
    } else if (nameInput === '' && nameControl !== '' && nameValidation !== '') {
      validation = this.authForm.controls[nameControl].getError(nameValidation);
    } else if (nameInput !== '') {
      validation = this.authForm.get(nameInput);
    }
    return validation;
  }
}
