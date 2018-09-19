import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppConfig } from "../config/app.config";
import { CreateWalletComponent } from "../wallet/views/create-wallet/create-wallet.component";

const routes: Routes = [
  {
    path: `${AppConfig.routes.createWallet}`,
    component: CreateWalletComponent
    //canActivate: [NotLoggedGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WalletRoutingModule { }
