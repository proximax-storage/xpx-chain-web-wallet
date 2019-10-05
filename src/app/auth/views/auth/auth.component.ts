import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../../environments/environment';
import { ConfigurationForm, SharedService } from '../../../shared/services/shared.service';
@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {

  @Input() eventNumber: number;
  authForm: FormGroup;
  configurationForm: ConfigurationForm = {};
  title = 'Sign in to your Wallet';
  wallets: Array<any>;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private sharedService: SharedService
  ) { }

  ngOnInit() {
    this.configurationForm = this.sharedService.configurationForm;
    this.createForm();
  }

  /**
   *
   *
   * @param {SimpleChanges} changes
   * @memberof AuthComponent
   */
  ngOnChanges(changes: SimpleChanges){
    if(this.authForm) {
      this.clearForm();
    }
    this.wallets = this.authService.walletsOption(JSON.parse(localStorage.getItem(environment.nameKeyWalletStorage)));
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
      wallet: ['', [
        Validators.required,
        Validators.minLength(this.configurationForm.nameWallet.minLength),
        Validators.maxLength(this.configurationForm.nameWallet.maxLength)
      ]],
      common: this.fb.group({
        password: ['',
          [
            Validators.required,
            Validators.minLength(this.configurationForm.passwordWallet.minLength),
            Validators.maxLength(this.configurationForm.passwordWallet.maxLength)
          ]]
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
