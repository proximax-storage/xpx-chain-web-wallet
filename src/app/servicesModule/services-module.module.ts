import { NgModule } from '@angular/core';

import { ServicesModuleRoutingModule } from './services-module-routing.module';
import { CreateAccountComponent } from './views/account/create-account/create-account.component';
import { ServicesBoxComponent } from './views/services-box/services-box.component';
import { DetailAccountComponent } from './views/account/detail-account/detail-account.component';
import { CoreModule } from '../core/core.module';
import { ExplorerComponent } from './views/explorer/explorer.component';
import { CreateNamespaceComponent } from './views/namespace/create-namespace/create-namespace.component';
import { AddressBookComponent } from './views/address-book/address-book.component';
import { RenewNamespaceComponent } from './views/namespace/renew-namespace/renew-namespace.component';

@NgModule({
  declarations: [
    CreateAccountComponent,
    ServicesBoxComponent,
    DetailAccountComponent,
    ExplorerComponent,
    CreateNamespaceComponent,
    AddressBookComponent,
    RenewNamespaceComponent
  ],
  imports: [
    CoreModule,
    ServicesModuleRoutingModule
  ]
})
export class ServicesModule { }
