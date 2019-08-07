import { NgModule } from '@angular/core';

import { WalletRoutingModule } from './wallet-routing.module';
import { CreateWalletComponent } from './views/create-wallet/create-wallet.component';
import { ImportWalletComponent } from './views/import-wallet/import-wallet.component';
import { CoreModule } from '../core/core.module';
import { WalletCreatedComponent } from './views/wallet-created/wallet-created.component';
import { SelectionWalletCreationTypeComponent } from './views/selection-wallet-creation-type/selection-wallet-creation-type.component';

@NgModule({
  declarations: [CreateWalletComponent, ImportWalletComponent, WalletCreatedComponent, SelectionWalletCreationTypeComponent],
  imports: [
    CoreModule,
    WalletRoutingModule
  ]
})
export class WalletModule { }
