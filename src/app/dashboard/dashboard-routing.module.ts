import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './views/dashboard/dashboard.component';
import { AppConfig } from '../config/app.config';

const routes: Routes = [
  {
    path: AppConfig.routes.dashboard,
    component: DashboardComponent,
    data: {
      meta: {
        title: 'dashboard.title',
        description: 'dashboard.text',
        override: true,
      },
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
