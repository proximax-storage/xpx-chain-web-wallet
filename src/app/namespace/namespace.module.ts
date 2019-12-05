import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';

import { NamespaceRoutingModule } from './namespace-routing.module';
import { CoreModule } from '../core/core.module';
import { CreateNamespaceComponent } from './views/create-namespace/create-namespace.component';
import { ExtendDurationNamespaceComponent } from './views/extend-duration-namespace/extend-duration-namespace.component';

@NgModule({
  declarations: [
    CreateNamespaceComponent,
    ExtendDurationNamespaceComponent
  ],
  schemas: [NO_ERRORS_SCHEMA],
  imports: [
    CoreModule,
    NamespaceRoutingModule
  ]
})
export class NamespaceModule { }
