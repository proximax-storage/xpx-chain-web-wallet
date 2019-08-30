import { NgModule } from '@angular/core';

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
import { MultiSignatureContractComponent } from './views/multi-sign/multi-signature-contract/multi-signature-contract.component';
import { CreateMultiSignatureComponent } from './views/multi-sign/components/create-multi-signature/create-multi-signature.component';
import { ViewAllAccountsComponent } from './views/account/view-all-accounts/view-all-accounts.component';
import { AccountCreatedComponent } from './views/account/account-created/account-created.component';
import { SelectionAccountTypeComponent } from './views/account/selection-account-creation-type/selection-account-creation-type.component';
import { AddContactsComponent } from './views/address-book/add-contacts/add-contacts.component';
import { ConvertAccountMultisignComponent } from './views/multi-sign/convert-account-multisign/convert-account-multisign.component';
import { EditAccountMultisignComponent } from './views/multi-sign/edit-account-multisign/edit-account-multisign.component';
import { AccountsListComponent } from './views/swap/accounts-list/accounts-list.component';
import { Nis1AccountsListComponent } from './views/swap/nis1-accounts-list/nis1-accounts-list.component';
import { HeaderComponent } from './components/header/header.component';

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
    MultiSignatureContractComponent,
    CreateMultiSignatureComponent,
    ViewAllAccountsComponent,
    AccountCreatedComponent,
    SelectionAccountTypeComponent,
    AddContactsComponent,
    ConvertAccountMultisignComponent,
    EditAccountMultisignComponent,
    AccountsListComponent,
    Nis1AccountsListComponent,
    HeaderComponent
  ],
  imports: [
    CoreModule,
    ServicesModuleRoutingModule
  ], exports: [
    CreateMultiSignatureComponent
  ]
})
export class ServicesModule { }
