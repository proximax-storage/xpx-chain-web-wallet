import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TransferRoutingModule } from './transfer-routing.module';
import { CoreModule } from '../core/core.module';
import { CreateTransferComponent } from './views/create-transfer/create-transfer.component';

@NgModule({
  declarations: [CreateTransferComponent],
  imports: [
    CoreModule,
    CommonModule,
    TransferRoutingModule
  ],
  schemas: [NO_ERRORS_SCHEMA]
})
export class TransferModule { }
