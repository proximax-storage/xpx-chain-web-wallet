import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { NgSelectConfig } from '@ng-select/ng-select';

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
    private authService: AuthService,
    private config: NgSelectConfig
  ) { }

  ngOnInit(){
    this.createForm();
  }

  createForm() {
    this.authForm = this.fb.group({
      wallet: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
      common: this.fb.group({ // <-- the child FormGroup
        password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(30)]]
      })
    });
  }

  auth() {

  }

}
