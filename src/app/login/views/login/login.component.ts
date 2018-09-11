import { Component, OnInit } from '@angular/core';

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
}
