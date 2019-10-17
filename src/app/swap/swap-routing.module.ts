import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppConfig } from '../config/app.config';
import { WalletNis1FoundComponent } from './views/wallet-nis1-found/wallet-nis1-found.component';
import { Nis1AccountsListComponent } from './views/nis1-accounts-list/nis1-accounts-list.component';
import { Nis1CosignerAccountsComponent } from './views/nis1-cosigner-accounts/nis1-cosigner-accounts.component';


const routes: Routes = [
  {
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
    path: AppConfig.routes.swapWalletNis1Found,
    component: WalletNis1FoundComponent,
    data: {
      meta: {
        title: 'swapWalletNis1Found.title',
        description: 'swapWalletNis1Found.text',
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
