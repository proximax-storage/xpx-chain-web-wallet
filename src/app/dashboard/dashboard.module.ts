import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../core/core.module';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './views/dashboard/dashboard.component';

@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    DashboardRoutingModule
  ],
  declarations: [DashboardComponent]
})
export class DashboardModule { }
