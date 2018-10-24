import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../core/core.module';
import { TransactionsRoutingModule } from './transactions-routing.module';


@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    TransactionsRoutingModule
  ]
})
export class TransactionsModule { }
