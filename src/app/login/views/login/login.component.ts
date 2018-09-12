import { Component, OnInit } from '@angular/core';
import { SimpleWallet, Password, NetworkType } from 'nem2-sdk';
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
  // foods: Food[];



  constructor() { }

  ngOnInit() {

    console.log('creando  wallet:', this.createSimpleWallet('jeffersson', '11192875'));
    // this.foods = [
    //   { value: 'steak-0', viewValue: 'Steak' },
    //   { value: 'pizza-1', viewValue: 'Pizza' },
    //   { value: 'tacos-2', viewValue: 'Tacos' }
    // ];
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
      'background-color': '#221a1a'
    };
    this.myParams = {
      particles: {
        number: {
          value: 100,
        },
        color: {
          value: '#ffffff'
        },

        shape: {
          type: 'circle',
          stroke: {
            width: 0,
            color: '#ffffff'
          },
          image: {
            src: 'img/github.svg',
            width: 100,
            height: 100
          }
        },
        line_linked: {
          enable: true,
          distance: 150,
          color: '#ffffff',
          opacity: 0.4,
          width: 1
        },
      }
    };


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
}
