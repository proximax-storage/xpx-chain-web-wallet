import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppConfig } from '../config/app.config';
import { CreateTransferComponent } from './views/create-transfer/create-transfer.component';
import { PartialComponent } from './views/partial/partial.component';
import { SwapTransactionsComponent } from './views/swap-transactions/swap-transactions.component';

const routes: Routes = [
  {
    path: AppConfig.routes.createTransfer,
    component: CreateTransferComponent,
    data: {
      meta: {
        title: 'createTransfer.title',
        description: 'createTransfer.text',
        override: true,
      },
    }
  },
  {
    path: AppConfig.routes.partial,
    component: PartialComponent,
    data: {
      meta: {
        title: 'partial.title',
        description: 'partial.text',
        override: true,
      },
    }
  },
  {
    path: AppConfig.routes.swapTransactions,
    component: SwapTransactionsComponent,
    data: {
      meta: {
        title: 'swapTransactions.title',
        description: 'swapTransactions.text',
        override: true,
      },
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TransactionRoutingModule { }
