import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateTransferComponent } from './views/create-transfer/create-transfer.component';
import { CoreModule } from '../core/core.module';
import { TransactionRoutingModule } from './transaction-routing.module';
import { PartialComponent } from './views/partial/partial.component';
import { SwapTransactionsComponent } from './views/swap-transactions/swap-transactions.component';

@NgModule({
  declarations: [CreateTransferComponent, PartialComponent, SwapTransactionsComponent],
  imports: [
    CoreModule,
    TransactionRoutingModule,
    CommonModule
  ],
  schemas: [NO_ERRORS_SCHEMA]
})
export class TransactionsModule { }
