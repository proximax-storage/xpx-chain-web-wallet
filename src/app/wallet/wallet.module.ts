import { NgModule } from '@angular/core';

import { WalletRoutingModule } from './wallet-routing.module';
import { CreateWalletComponent } from './views/create-wallet/create-wallet.component';
import { ImportWalletComponent } from './views/import-wallet/import-wallet.component';
import { CoreModule } from '../core/core.module';

@NgModule({
  declarations: [CreateWalletComponent, ImportWalletComponent],
  imports: [
    CoreModule,
    WalletRoutingModule
  ]
})
export class WalletModule { }
