import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../core/core.module';
import { TransactionsRoutingModule } from './transactions-routing.module';
import { TransactionsComponent } from './views/transactions/transactions.component';

@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    TransactionsRoutingModule
  ],
  declarations: [TransactionsComponent]
})
export class TransactionsModule { }
