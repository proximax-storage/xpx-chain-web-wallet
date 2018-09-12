import { Component, OnInit } from '@angular/core';
import { SimpleWallet, Password, NetworkType } from 'nem2-sdk';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
// export interface Food {
//   value: string;
//   viewValue: string;
// }


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  myStyle: object = {};
  myParams: object = {};
  width = 100;
  height = 100;
  selectedValue: string;
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.createForm();
    this.initParticle();
    console.log('creando  wallet:', this.createSimpleWallet('jeffersson', '11192875'));
  }


  createForm() {
    this.loginForm = this.fb.group({
      userName: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(30)]],
      password: ['', [Validators.required]]
    });
  }

  /**
    * Create Simple Wallet    Crear billetera simple
    * @param walletName wallet idenitifier for app
    * @param password wallet's password
    * @param selected network
    * @return Promise with wallet created
    */
  createSimpleWallet(walletName: string, password: string): SimpleWallet {
    return SimpleWallet.create(walletName, new Password(password), NetworkType.TEST_NET);
  }

  getError(param, name) {
    if (this.loginForm.get(param).getError('required')) {
      return `Este campo es requerido`;
    } else if (this.loginForm.get('userName').getError('minlength')) {
      return `Este campo debe contener minímo ${this.loginForm.get('userName').getError('minlength').requiredLength} carácteres`;
    } else if (this.loginForm.get('userName').getError('maxlength')) {
      return `Este campo debe contener máximo ${this.loginForm.get('userName').getError('maxlength').requiredLength} carácteres`;
    }
  }

  initParticle() {
    this.myStyle = {
      'overflow': 'hidden',
      'position': 'absolute',
      'width': '100%',
      'height': '100%',
      'z-index': -1,
      'top': 0,
      'left': 0,
      'right': 0,
      'bottom': 0,
    };
    this.myParams = {
      particles: {
         number: {
          value: 180
        },
        color: {
          value: '#209084'
        },
        shape: {
          type: 'circle'
        }
      }
    };
  }
}
