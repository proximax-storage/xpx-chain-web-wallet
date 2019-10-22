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
import { CreatePollComponent } from './views/voting/create-poll/create-poll.component';
import { PollsComponent } from './views/voting/polls/polls.component';
import { ResultPollComponent } from './views/voting/result-poll/result-poll.component';
import { CreateApostilleComponent } from './views/apostille/create-apostille/create-apostille.component';
import { AuditApostilleComponent } from './views/apostille/audit-apostille/audit-apostille.component';
import { VoteInPollComponent } from './views/voting/vote-in-poll/vote-in-poll.component';
import { HighchartsChartComponent } from './views/voting/vote-in-poll/highcharts-chart.component';
import { AccountNis1FoundComponent } from './views/account/account-nis1-found/account-nis1-found.component';
import { AccountNis1TransferXpxComponent } from './views/account/account-nis1-transfer-xpx/account-nis1-transfer-xpx.component';
import { TransferXpxNis1Component } from './views/swap/transfer-xpx-nis1/transfer-xpx-nis1.component';
import { AccountDeleteComponent } from './views/account/account-delete/account-delete/account-delete.component';
import { AccountDeleteConfirmComponent } from './views/account/account-delete-confirm/account-delete-confirm.component';
import { ExportWalletComponent } from './views/wallet/export-wallet/export-wallet.component';
import { BlockchainComponent } from './views/nodes/blockchain/blockchain.component';
import { DeleteWalletComponent } from './views/wallet/delete-wallet/delete-wallet.component';
import { Nis1AccountsConsignerComponent } from './views/swap/nis1-accounts-consigner/nis1-accounts-consigner.component';

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
    CreatePollComponent,
    PollsComponent,
    ResultPollComponent,
    CreateApostilleComponent,
    AuditApostilleComponent,
    VoteInPollComponent,
    HighchartsChartComponent,
    AccountNis1FoundComponent,
    AccountNis1TransferXpxComponent,
    TransferXpxNis1Component,
    AccountDeleteComponent,
    AccountDeleteConfirmComponent,
    ExportWalletComponent,
    BlockchainComponent,
    ExportWalletComponent,
    DeleteWalletComponent,
    Nis1AccountsConsignerComponent,
  ],
  schemas: [ NO_ERRORS_SCHEMA ],
  imports: [
    CoreModule,
    ServicesModuleRoutingModule
  ], exports: [
    CreateMultiSignatureComponent
  ]
})
export class ServicesModule { }
