import { Component } from '@angular/core';
import { NodeService } from './servicesModule/services/node.service';
import { environment } from '../environments/environment';
import { MosaicService } from './servicesModule/services/mosaic.service';
import { NamespacesService } from './servicesModule/services/namespaces.service';
import { SharedService } from './shared/services/shared.service';

@Component({
  selector: 'app-root',
  template: `<router-outlet></router-outlet>`
})

export class AppComponent {
  title = 'Sirius Wallet';

  constructor(
    private nodeService: NodeService,
    private mosaicsService: MosaicService,
    private namespaceService: NamespacesService,
    private sharedService: SharedService
  ) {
    const version = localStorage.getItem(environment.nameKeyVersion);
    if (version) {
      if (version !== environment.cacheVersion) {
        this.restart();
      } else {
        this.nodeService.initNode();
      }
    } else {
      this.restart();
    }

    const img = this.sharedService.walletCreatedCertified();
  }

  /**
   *
   *
   * @memberof AppComponent
   */
  restart(){
    localStorage.setItem(environment.nameKeyVersion, environment.cacheVersion);
    this.namespaceService.resetNamespaceStorage();
    this.mosaicsService.resetMosaicsStorage();
    this.nodeService.setArrayNode([]);
    this.nodeService.setSelectedNodeStorage('');
    this.nodeService.initNode();
  }
}
