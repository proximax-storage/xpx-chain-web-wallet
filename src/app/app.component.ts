import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `<!-- <particles [params]="myParams" [style]="myStyle" [width]="width" [height]="height"></particles> -->
              <app-header></app-header>
              <router-outlet></router-outlet>
            `
})
export class AppComponent {
  title = 'app';

  myStyle: object = {};
  myParams: object = {};
  width = 100;
  height = 100;

  constructor () {
    this.initParticle();
  }

  initParticle() {
    this.myStyle = {
      // 'overflow': 'hidden',
      'position': 'absolute',
      'top': '0',
      'width': '100%',
      'height': '100%'
      // 'z-index': -1,
      // 'margin-top': 0,
      // 'left': 0,
      // 'right': 0,
      // 'bottom': 0,
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
