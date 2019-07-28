import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './views/dashboard/dashboard.component';
import { CoreModule } from '../core/core.module';

@NgModule({
  declarations: [
    DashboardComponent
  ],
  imports: [
    CoreModule,
    DashboardRoutingModule
  ],
  schemas: [NO_ERRORS_SCHEMA]
})
export class DashboardModule { }
