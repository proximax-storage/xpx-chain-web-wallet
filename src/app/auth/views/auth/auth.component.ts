import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {

  authForm: FormGroup;
  title = 'Sign in to your Wallet';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) { }

  ngOnInit(){
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
}
