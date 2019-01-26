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
  }
}
