import { Component, OnInit } from '@angular/core';

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
  constructor() { }

  ngOnInit() {
    this.myStyle = {
      'overflow': 'hidden',
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
          value: 100,
        },
        color: {
          value: '#3f51b5'
        },
        shape: {
          type: 'circle',
        },
      }
    };
  }
}
