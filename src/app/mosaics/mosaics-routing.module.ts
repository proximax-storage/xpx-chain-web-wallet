import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppConfig } from '../config/app.config';
import { CreateMosaicComponent } from './views/create-mosaic/create-mosaic.component';
import { MosaicsSupplyChangeComponent } from './views/mosaics-supply-change/mosaics-supply-change.component';
import { AliasMosaicsToNamespaceComponent } from './views/alias-mosaics-to-namespace/alias-mosaics-to-namespace.component';

const routes: Routes = [{
  path: AppConfig.routes.createMosaic,
  component: CreateMosaicComponent,
  data: {
    meta: {
      title: 'createMosaic.title',
      description: 'createMosaic.text',
      override: true,
    }
  }
}, {
  path: AppConfig.routes.MosaicSupplyChange,
  component: MosaicsSupplyChangeComponent,
  data: {
    meta: {
      title: 'mosaicsSupplyChange.title',
      description: 'mosaicsSupplyChange.text',
      override: true,
    }
  }
}, {
  path: AppConfig.routes.LinkingNamespaceMosaic,
  component: AliasMosaicsToNamespaceComponent,
  data: {
    meta: {
      title: 'aliasMosaicsToNamespace.title',
      description: 'aliasMosaicsToNamespace.text',
      override: true,
    }
  }
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MosaicsRoutingModule { }
