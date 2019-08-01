import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ServicesModuleRoutingModule } from './services-module-routing.module';
import { CreateAccountComponent } from './views/account/create-account/create-account.component';
import { ServicesBoxComponent } from './views/services-box/services-box.component';
import { ExplorerComponent } from './views/explorer/explorer.component';

@NgModule({
  declarations: [CreateAccountComponent, ServicesBoxComponent, ExplorerComponent],
  imports: [
    CommonModule,
    ServicesModuleRoutingModule
  ]
})
export class ServicesModule { }
