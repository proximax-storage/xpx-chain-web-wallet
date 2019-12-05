import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { ServicesModuleRoutingModule } from './services-module-routing.module';
import { CreateAccountComponent } from './views/account/create-account/create-account.component';
import { ServicesBoxComponent } from './views/services-box/services-box.component';
import { DetailAccountComponent } from './views/account/detail-account/detail-account.component';
import { CoreModule } from '../core/core.module';
import { ExplorerComponent } from './views/explorer/explorer.component';
import { CreateNamespaceComponent } from './views/namespace/create-namespace/create-namespace.component';
import { ListContactsComponent } from './views/address-book/list-contacts/list-contacts.component';
import { ExtendDurationNamespaceComponent } from './views/namespace/extend-duration-namespace/extend-duration-namespace.component';
import { CreateMosaicComponent } from './views/mosaic/create-mosaic/create-mosaic.component';
import { AliasAddressToNamespaceComponent } from './views/account/alias-address-to-namespace/alias-address-to-namespace.component';
import { MosaicsSupplyChangeComponent } from './views/mosaic/mosaics-supply-change/mosaics-supply-change.component';
import { AliasMosaicsToNamespaceComponent } from './views/mosaic/alias-mosaics-to-namespace/alias-mosaics-to-namespace.component';
import { UploadFileComponent } from './views/storage/upload-file/upload-file.component';
import { MyFileComponent } from './views/storage/my-file/my-file.component';
import { ViewAllAccountsComponent } from './views/account/view-all-accounts/view-all-accounts.component';
import { AccountCreatedComponent } from './views/account/account-created/account-created.component';
import { SelectionAccountTypeComponent } from './views/account/selection-account-creation-type/selection-account-creation-type.component';
import { AddContactsComponent } from './views/address-book/add-contacts/add-contacts.component';
import { CreateApostilleComponent } from './views/apostille/create-apostille/create-apostille.component';
import { AuditApostilleComponent } from './views/apostille/audit-apostille/audit-apostille.component';
import { AccountDeleteComponent } from './views/account/account-delete/account-delete/account-delete.component';
import { AccountDeleteConfirmComponent } from './views/account/account-delete-confirm/account-delete-confirm.component';
import { ExportWalletComponent } from './views/wallet/export-wallet/export-wallet.component';
import { BlockchainComponent } from './views/nodes/blockchain/blockchain.component';
import { DeleteWalletComponent } from './views/wallet/delete-wallet/delete-wallet.component';
import { NotificationComponent } from './views/notification/notification.component';

@NgModule({
  declarations: [
    CreateAccountComponent,
    ServicesBoxComponent,
    DetailAccountComponent,
    ExplorerComponent,
    CreateNamespaceComponent,
    ListContactsComponent,
    ExtendDurationNamespaceComponent,
    CreateMosaicComponent,
    AliasAddressToNamespaceComponent,
    MosaicsSupplyChangeComponent,
    AliasMosaicsToNamespaceComponent,
    UploadFileComponent,
    MyFileComponent,
    ViewAllAccountsComponent,
    AccountCreatedComponent,
    SelectionAccountTypeComponent,
    AddContactsComponent,
    CreateApostilleComponent,
    AuditApostilleComponent,
    AccountDeleteComponent,
    AccountDeleteConfirmComponent,
    ExportWalletComponent,
    BlockchainComponent,
    ExportWalletComponent,
    DeleteWalletComponent,
    NotificationComponent
  ],
  schemas: [NO_ERRORS_SCHEMA],
  imports: [
    CoreModule,
    ServicesModuleRoutingModule
  ]
})
export class ServicesModule { }
