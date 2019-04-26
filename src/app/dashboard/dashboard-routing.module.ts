import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AppConfig } from '../config/app.config';
import { LoggedGuard } from '../shared/guard/logged.guard';
import { DashboardComponent } from './views/dashboard/dashboard.component';


const routes: Routes = [
  // {
  //   path: `${AppConfig.routes.dashboard}`,
  //   component: DashboardComponent2,
  //   canActivate: [LoggedGuard]
  // },
  {
    path: `${AppConfig.routes.dashboard}`,
    component: DashboardComponent,
    canActivate: [LoggedGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule {

}
