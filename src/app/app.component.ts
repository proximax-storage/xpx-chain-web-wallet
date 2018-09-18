import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `<particles [params]="myParams" [style]="myStyle" [width]="width" [height]="height"></particles>
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
