import {NgModule, NO_ERRORS_SCHEMA} from '@angular/core';
import { CommonModule } from '@angular/common';

import { ServiceRoutingModule } from './service-routing.module';
import { ApostillaComponent } from './views/apostilla/apostilla.component';
import { DashboardServiceComponent } from './views/dashboard-service/dashboard-service.component';
import {CoreModule} from "../../../core/core.module";


@NgModule({
  imports: [
    CommonModule,
    ServiceRoutingModule,
    CoreModule
  ],
  declarations: [ApostillaComponent, DashboardServiceComponent],
  schemas: [NO_ERRORS_SCHEMA]
})
export class ServiceModule { }
