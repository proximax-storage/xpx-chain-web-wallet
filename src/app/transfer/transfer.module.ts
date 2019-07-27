import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TransferRoutingModule } from './transfer-routing.module';
import { CreateTransferComponent } from './views/create-transfer/create-transfer.component';

@NgModule({
  declarations: [CreateTransferComponent],
  imports: [
    CommonModule,
    TransferRoutingModule
  ]
})
export class TransferModule { }
