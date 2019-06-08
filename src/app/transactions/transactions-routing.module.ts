import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppConfig } from '../config/app.config';
import { LoggedGuard } from '../shared/guard/logged.guard';
import { TransferComponent } from "./views/transfer/transfer.component";

const routes: Routes = [
  {
    path: `${AppConfig.routes.transferTransaction}`,
    component: TransferComponent,
    canActivate: [LoggedGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TransactionsRoutingModule { }
