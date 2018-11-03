import { Component } from '@angular/core';
import { BlockInfo, Listener, Address, AccountHttp } from "nem2-sdk/dist";
import { environment } from "../environments/environment";
import { ApiService } from "./shared/services/api.services";
import { NodeService } from "./servicesModule/services/node.service";


@Component({
  selector: 'app-root',
  template: `<block-ui>
                <app-header></app-header>
                <router-outlet></router-outlet>
              </block-ui>`
})
export class AppComponent {

  myStyle: object = {};
  myParams: object = {};
  width = 100;
  height = 100;

  constructor(
    private apiService: ApiService,
    private nodeService: NodeService
  ) {
    const nodeSelected = this.nodeService.initNode();
    console.log('NODE SELECTED::: ', nodeSelected);
  }

  /**
   * Start the particles in the background.
   * (you must add the particle selector in the hmtl)
   * <particles [params]="myParams" [style]="myStyle" [width]="width" [height]="height"></particles>
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
        number: { value: 50 },
        color: { value: '#ffffff' },
        shape: { type: 'circle' }
      }
    };
  }
}
