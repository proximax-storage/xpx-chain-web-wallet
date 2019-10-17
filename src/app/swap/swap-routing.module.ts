import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppConfig } from '../config/app.config';
import { Nis1AccountsListComponent } from './views/nis1-accounts-list/nis1-accounts-list.component';
import { Nis1CosignerAccountsComponent } from './views/nis1-cosigner-accounts/nis1-cosigner-accounts.component';
import { Nis1TransferAssetsComponent } from './views/nis1-transfer-assets/nis1-transfer-assets.component';
import { Nis1AccountFoundComponent } from './views/nis1-account-found/nis1-account-found.component';


const routes: Routes = [
  {
    path: AppConfig.routes.swapAccountNis1Found,
    component: Nis1AccountFoundComponent,
    data: {
      meta: {
        title: 'swapAccountNis1Found.title',
        description: 'swapAccountNis1Found.text',
        override: true,
      },
    }
  }, {
    path: AppConfig.routes.swapListCosignerNis1,
    component: Nis1CosignerAccountsComponent,
    data: {
      meta: {
        title: 'swapListCosignerNis1.title',
        description: 'swapListCosignerNis1.text',
        override: true,
      },
    }
  }, {
    path: `${AppConfig.routes.swapTransferAssets}/:account/:type`,
    component: Nis1TransferAssetsComponent,
    data: {
      meta: {
        title: 'swapTransferAssets.title',
        description: 'swapTransferAssets.text',
        override: true,
      },
    }
  }, {
    path: AppConfig.routes.swapAccountListNis1,
    component: Nis1AccountsListComponent,
    data: {
      meta: {
        title: 'swapAccountListNis1.title',
        description: 'swapAccountListNis1.text',
        override: true,
      }
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SwapRoutingModule { }
