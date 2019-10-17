import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';

//CORE - ROUTING
import { SwapRoutingModule } from './swap-routing.module';
import { CoreModule } from '../core/core.module';

// COMPONENTS
import { Nis1CosignerAccountsComponent } from './views/nis1-cosigner-accounts/nis1-cosigner-accounts.component';
import { WalletNis1FoundComponent } from './views/wallet-nis1-found/wallet-nis1-found.component';
import { Nis1AccountsListComponent } from './views/nis1-accounts-list/nis1-accounts-list.component';


@NgModule({
  declarations: [
    Nis1CosignerAccountsComponent,
    WalletNis1FoundComponent,
    Nis1AccountsListComponent
  ],
  imports: [
    CoreModule,
    SwapRoutingModule
  ],
  schemas: [ NO_ERRORS_SCHEMA ]
})
export class SwapModule { }
