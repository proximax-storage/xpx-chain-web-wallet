import { NgModule } from '@angular/core';

import { AccountsRoutingModule } from './accounts-routing.module';
import { AliasAddressToNamespaceComponent } from './views/alias-address-to-namespace/alias-address-to-namespace.component';
import { ViewAllAccountsComponent } from './views/view-all-accounts/view-all-accounts.component';
import { AccountCreatedComponent } from './views/account-created/account-created.component';
import { SelectionAccountTypeComponent } from './views/selection-account-creation-type/selection-account-creation-type.component';
import { AccountDeleteComponent } from './views/account-delete/account-delete/account-delete.component';
import { AccountDeleteConfirmComponent } from './views/account-delete-confirm/account-delete-confirm.component';
import { CoreModule } from '../core/core.module';
import { CreateAccountComponent } from './views/create-account/create-account.component';
import { DetailAccountComponent } from './views/detail-account/detail-account.component';

@NgModule({
  declarations: [
    CreateAccountComponent,
    DetailAccountComponent,
    AliasAddressToNamespaceComponent,
    ViewAllAccountsComponent,
    AccountCreatedComponent,
    SelectionAccountTypeComponent,
    AccountDeleteComponent,
    AccountDeleteConfirmComponent,
  ],
  imports: [
    CoreModule,
    AccountsRoutingModule
  ]
})
export class AccountsModule { }
