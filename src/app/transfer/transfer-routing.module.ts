import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppConfig } from '../config/app.config';
import { CreateTransferComponent } from './views/create-transfer/create-transfer.component';

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
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TransferRoutingModule { }
