import { NgModule } from '@angular/core';
import { CoreModule } from "../core/core.module";
import { WalletRoutingModule } from './wallet-routing.module';
import { CreateWalletComponent } from './views/create-wallet/create-wallet.component';

const declarations = [
  CreateWalletComponent
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
    declarations
  ]
})
export class WalletModule { }
