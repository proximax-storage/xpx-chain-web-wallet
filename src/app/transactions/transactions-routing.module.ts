import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppConfig } from '../config/app.config';
import { LoggedGuard } from '../shared/guard/logged.guard';
import { NotLoggedGuard } from '../shared/guard/not-logged.guard';
import { TransactionsComponent } from './views/transactions/transactions.component';
import { TransferComponent } from "./views/transfer/transfer.component";

const routes: Routes = [
  {
    path: `${AppConfig.routes.transactions}`,
    component: TransactionsComponent,
    canActivate: [LoggedGuard]
  },
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
