import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './views/dashboard/dashboard.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { CoreModule } from '../core/core.module';
import { BoxDataSignerHashComponent } from './components/box-data-signer-hash/box-data-signer-hash.component';


@NgModule({
  declarations: [
    DashboardComponent,
    BoxDataSignerHashComponent
  ],
  imports: [
    CoreModule,
    DashboardRoutingModule,
    InfiniteScrollModule
  ],
  schemas: [NO_ERRORS_SCHEMA]
})
export class DashboardModule { }
