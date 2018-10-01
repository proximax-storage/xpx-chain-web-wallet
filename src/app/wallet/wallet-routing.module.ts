import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppConfig } from "../config/app.config";
import { CreateWalletComponent } from "../wallet/views/create-wallet/create-wallet.component";
import { ImportWalletComponent } from "../wallet/views/import-wallet/import-wallet.component";

const routes: Routes = [
  {
    path: `${AppConfig.routes.createWallet}`,
    component: CreateWalletComponent,
    //canActivate: [NotLoggedGuard]
  },
  {
    path: `${AppConfig.routes.importWallet}`,
    component: ImportWalletComponent,
    //canActivate: [NotLoggedGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WalletRoutingModule { }
