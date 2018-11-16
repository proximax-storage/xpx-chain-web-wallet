import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CoreModule } from "../core/core.module";
import { WalletRoutingModule } from './wallet-routing.module';
import { CreateWalletComponent } from './views/create-wallet/create-wallet.component';
import { WalletCreatedComponent } from './components/wallet-created/wallet-created.component';
import { ImportWalletComponent } from './views/import-wallet/import-wallet.component';

const declarations = [
  CreateWalletComponent,
  WalletCreatedComponent
]

const imports = [
  CoreModule,
  WalletRoutingModule
]

@NgModule({
  imports: [
    imports
  ],
  declarations: [
    declarations,
    ImportWalletComponent
  ],
  schemas: [NO_ERRORS_SCHEMA] 
})
export class WalletModule { }
