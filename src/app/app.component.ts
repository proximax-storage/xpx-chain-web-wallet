import { Component } from '@angular/core';
import { NodeService } from "./servicesModule/services/node.service";

@Component({
  selector: 'app-root',
  template: `<block-ui>
                <app-header></app-header>
                <router-outlet></router-outlet>
              </block-ui>`
})
export class AppComponent {

  constructor(
    private nodeService: NodeService
  ) {
    this.nodeService.initNode();


    const jsonData = [{
      namespace: {
        type: 0,
        name: "ven",
        id: {
          higher: 3337888808,
          lower: 2663965548
        },
        mosaics: [{
          name: "d423931bd268d1f4",
          id: {
            0: 3530084852,
            1: 3559101211
          }
        }]
      }
    }];

    console.log(jsonData);
  }



}
