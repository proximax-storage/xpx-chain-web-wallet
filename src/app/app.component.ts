import { Component } from '@angular/core';
import { NodeService } from './servicesModule/services/node.service';

@Component({
  selector: 'app-root',
  template: `<router-outlet></router-outlet>`
})

export class AppComponent {
  title = 'Sirius Wallet';

  constructor(private nodeService: NodeService) {
    this.nodeService.initNode();
  }
}
