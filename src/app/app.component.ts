import { Component } from '@angular/core';
import { NodeService } from './servicesModule/services/node.service';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-root',
  template: `<router-outlet></router-outlet>`
})

export class AppComponent {
  title = 'Sirius Wallet';

  constructor(private nodeService: NodeService) {
    const version = localStorage.getItem(environment.nameKeyVersion);
    if (version) {
      if (version !== environment.version) {
        localStorage.setItem(environment.nameKeyVersion, environment.version);
        this.nodeService.setArrayNode([]);
        this.nodeService.setSelectedNodeStorage('');
        this.nodeService.initNode();
      }else {
        this.nodeService.initNode();
      }
    } else {
      localStorage.setItem(environment.nameKeyVersion, environment.version);
      this.nodeService.initNode();
    }

  }
}
