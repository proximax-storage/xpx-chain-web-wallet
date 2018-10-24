import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {LoggedGuard} from "../..";
import {ApostillaComponent} from "./views/apostilla/apostilla.component";
import {DashboardServiceComponent} from './views/dashboard-service/dashboard-service.component'
import {AppConfig} from "../../../config/app.config";
const routes: Routes = [
  {
    path:"",
    redirectTo:`${AppConfig.routes.service}`,
    pathMatch:"full"
  },

  {
    path: `${AppConfig.routes.apostille}`,
    component: ApostillaComponent,
    canActivate: [LoggedGuard]
  },
  {
    path: `${AppConfig.routes.service}`,
    component: DashboardServiceComponent,
    canActivate: [LoggedGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ServiceRoutingModule { }
