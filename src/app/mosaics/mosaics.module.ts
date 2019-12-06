import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';

import { MosaicsRoutingModule } from './mosaics-routing.module';
import { CreateMosaicComponent } from './views/create-mosaic/create-mosaic.component';
import { MosaicsSupplyChangeComponent } from './views/mosaics-supply-change/mosaics-supply-change.component';
import { AliasMosaicsToNamespaceComponent } from './views/alias-mosaics-to-namespace/alias-mosaics-to-namespace.component';
import { CoreModule } from '../core/core.module';

@NgModule({
  declarations: [
    CreateMosaicComponent,
    MosaicsSupplyChangeComponent,
    AliasMosaicsToNamespaceComponent,
  ],
  schemas: [NO_ERRORS_SCHEMA],
  imports: [
    CoreModule,
    MosaicsRoutingModule
  ]
})
export class MosaicsModule { }
