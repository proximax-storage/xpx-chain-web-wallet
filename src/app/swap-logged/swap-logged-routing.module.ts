import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppConfig } from '../config/app.config';
import { Nis1AccountsListComponent } from '../swap/views/nis1-accounts-list/nis1-accounts-list.component';
import { Nis1TransferAssetsComponent } from '../swap/views/nis1-transfer-assets/nis1-transfer-assets.component';

const routes: Routes = [{
  path: AppConfig.routes.swapAccountList,
  component: Nis1AccountsListComponent,
  data: {
    meta: {
      title: 'swapAccountNis1Found.title',
      description: 'swapAccountNis1Found.text',
      override: true,
    },
  }
}, {
  path: `${AppConfig.routes.swapTransferAssetsLogged}/:account/:type/:moreAccounts`,
  component: Nis1TransferAssetsComponent,
  data: {
    meta: {
      title: 'swapTransferAssetsLogged.title',
      description: 'swapTransferAssetsLogged.text',
      override: true,
    },
  }
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SwapLoggedRoutingModule { }
