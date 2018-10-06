import { Component } from '@angular/core';
import { Listener, BlockInfo } from "nem2-sdk/dist";

@Component({
  selector: 'app-root',
  template: `<!-- <particles [params]="myParams" [style]="myStyle" [width]="width" [height]="height"></particles> -->
              <app-header></app-header>
              <router-outlet></router-outlet>`
})
export class AppComponent {

  title = 'app';
  myStyle: object = {};
  myParams: object = {};
  width = 100;
  height = 100;

  constructor() {
  }

  /**
   * 
   * 
   * @memberof AppComponent
   */
  initParticle() {
    this.myStyle = {
      'position': 'absolute',
      'top': '0',
      'width': '100%',
      'height': '100%'
    };
    this.myParams = {
      particles: {
        number: {
          value: 50
        },
        color: {
          value: '#ffffff'
        },
        shape: {
          type: 'circle'
        }
      }
    };
  }
}
