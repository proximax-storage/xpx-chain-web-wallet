import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';

import { ApostilleRoutingModule } from './apostille-routing.module';
import { CoreModule } from '../core/core.module';
import { CreateApostilleComponent } from './views/create-apostille/create-apostille.component';
import { AuditApostilleComponent } from './views/audit-apostille/audit-apostille.component';

@NgModule({
  declarations: [
    CreateApostilleComponent,
    AuditApostilleComponent,
  ],
  schemas: [NO_ERRORS_SCHEMA],
  imports: [
    CoreModule,
    ApostilleRoutingModule
  ]
})
export class ApostilleModule { }
