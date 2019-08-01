import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ServicesModuleRoutingModule } from './services-module-routing.module';
import { CreateAccountComponent } from './views/account/create-account/create-account.component';
import { ServicesBoxComponent } from './views/services-box/services-box.component';
import { DetailAccountComponent } from './views/account/detail-account/detail-account.component';
import { CoreModule } from '../core/core.module';

@NgModule({
  declarations: [CreateAccountComponent, ServicesBoxComponent, DetailAccountComponent],
  imports: [
    CommonModule,
    CoreModule,
    ServicesModuleRoutingModule
  ]
})
export class ServicesModule { }
