import { NgModule } from '@angular/core';

import { WalletRoutingModule } from './wallet-routing.module';
import { CreateWalletComponent } from './views/create-wallet/create-wallet.component';
import { ImportWalletComponent } from './views/import-wallet/import-wallet.component';
import { CoreModule } from '../core/core.module';
import { WalletCreatedComponent } from './views/wallet-created/wallet-created.component';
import { SelectionWalletCreationTypeComponent } from './views/selection-wallet-creation-type/selection-wallet-creation-type.component';
import { DeleteWalletComponent } from './views/delete-wallet/delete-wallet.component';
import { ViewAllWalletsComponent } from './views/view-all-wallets/view-all-wallets.component';
import { DeleteWalletConfirmComponent } from './views/delete-wallet-confirm/delete-wallet-confirm.component';



@NgModule({
  declarations: [
    CreateWalletComponent,
    ImportWalletComponent,
    WalletCreatedComponent,
    SelectionWalletCreationTypeComponent,
    DeleteWalletComponent,
    ViewAllWalletsComponent,
    DeleteWalletConfirmComponent
  ],
  imports: [
    CoreModule,
    WalletRoutingModule
  ]
})
export class WalletModule { }
