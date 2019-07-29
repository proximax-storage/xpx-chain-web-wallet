import { NgModule } from '@angular/core';

import { WalletRoutingModule } from './wallet-routing.module';
import { CreateWalletComponent } from './views/create-wallet/create-wallet.component';
import { ImportWalletComponent } from './views/import-wallet/import-wallet.component';
import { CoreModule } from '../core/core.module';
import { WalletCreatedComponent } from './views/wallet-created/wallet-created.component';

@NgModule({
  declarations: [CreateWalletComponent, ImportWalletComponent, WalletCreatedComponent],
  imports: [
    CoreModule,
    WalletRoutingModule
  ]
})
export class WalletModule { }
