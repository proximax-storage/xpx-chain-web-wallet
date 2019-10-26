import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppConfig } from '../config/app.config';
import { CreateWalletComponent } from './views/create-wallet/create-wallet.component';
import { ImportWalletComponent } from './views/import-wallet/import-wallet.component';
import { WalletCreatedComponent } from './views/wallet-created/wallet-created.component';
import { SelectionWalletCreationTypeComponent } from './views/selection-wallet-creation-type/selection-wallet-creation-type.component';
import { DeleteWalletComponent } from './views/delete-wallet/delete-wallet.component';
import { ViewAllWalletsComponent } from './views/view-all-wallets/view-all-wallets.component';
import { DeleteWalletConfirmComponent } from './views/delete-wallet-confirm/delete-wallet-confirm.component';

const routes: Routes = [
  {
    path: AppConfig.routes.createWallet,
    component: CreateWalletComponent,
    data: {
      meta: {
        title: 'createWallet.title',
        description: 'createWallet.text',
        override: true,
      },
    }
  },
  {
    path: `${AppConfig.routes.deleteWallet}/:name`,
    component: DeleteWalletComponent,
    data: {
      meta: {
        title: 'deleteWallet.title',
        description: 'deleteWallet.text',
        override: true,
      },
    }
  },
  {
    path: `${AppConfig.routes.deleteWalletConfirm}/:name`,
    component: DeleteWalletConfirmComponent,
    data: {
      meta: {
        title: 'deleteWalletConfirm.title',
        description: 'deleteWalletConfirm.text',
        override: true,
      },
    }
  },
  {
    path: AppConfig.routes.importWallet,
    component: ImportWalletComponent,
    data: {
      meta: {
        title: 'importWallet.title',
        description: 'importWallet.text',
        override: true,
      },
    }
  },
  {
    path: AppConfig.routes.viewAllWallets,
    component: ViewAllWalletsComponent,
    data: {
      meta: {
        title: 'viewAllWallets.title',
        description: 'viewAllWallets.text',
        override: true,
      },
    }
  },
  {
    path: AppConfig.routes.walletCreated,
    component: WalletCreatedComponent,
    data: {
      meta: {
        title: 'walletCreated.title',
        description: 'walletCreated.text',
        override: true,
      },
    }
  },
  {
    path: AppConfig.routes.selectTypeCreationWallet,
    component: SelectionWalletCreationTypeComponent,
    data: {
      meta: {
        title: 'selectTypeCreationWallet.title',
        description: 'selectTypeCreationWallet.text',
        override: true,
      },
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WalletRoutingModule { }
