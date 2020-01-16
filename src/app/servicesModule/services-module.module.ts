import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { ServicesModuleRoutingModule } from './services-module-routing.module';
import { ServicesBoxComponent } from './views/services-box/services-box.component';
import { CoreModule } from '../core/core.module';
import { ExplorerComponent } from './views/explorer/explorer.component';
import { ListContactsComponent } from './views/address-book/list-contacts/list-contacts.component';
import { AddContactsComponent } from './views/address-book/add-contacts/add-contacts.component';
import { ExportWalletComponent } from './views/wallet/export-wallet/export-wallet.component';
import { BlockchainComponent } from './views/nodes/blockchain/blockchain.component';
import { DeleteWalletComponent } from './views/wallet/delete-wallet/delete-wallet.component';
import { NotificationComponent } from './views/notification/notification.component';
import { CreateGiftComponent } from './views/gift/create-gift/create-gift.component';

@NgModule({
  declarations: [
    ServicesBoxComponent,
    ExplorerComponent,
    ListContactsComponent,
    AddContactsComponent,
    ExportWalletComponent,
    BlockchainComponent,
    ExportWalletComponent,
    DeleteWalletComponent,
    NotificationComponent,
    CreateGiftComponent
  ],
  schemas: [NO_ERRORS_SCHEMA],
  imports: [
    CoreModule,
    ServicesModuleRoutingModule
  ]
})
export class ServicesModule { }
