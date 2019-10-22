import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppConfig } from '../config/app.config';
import { Nis1AccountsListComponent } from '../swap/views/nis1-accounts-list/nis1-accounts-list.component';

const routes: Routes = [{
  path: AppConfig.routes.swapAccountList,
  component: Nis1AccountsListComponent,
  data: {
    meta: {
      title: 'swapAccountNis1Found.title',
      description: 'swapAccountNis1Found.text',
      override: true,
    },
  }
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SwapLoggedRoutingModule { }
