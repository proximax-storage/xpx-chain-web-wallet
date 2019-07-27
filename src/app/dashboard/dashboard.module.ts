import { NgModule } from '@angular/core';

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
  ]
})
export class DashboardModule { }
