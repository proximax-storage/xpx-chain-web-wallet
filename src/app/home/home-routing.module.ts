import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './views/home/home.component';
import { AppConfig } from '../config/app.config';
import { NotLoggedGuard } from "../shared";

const routes: Routes = [
  {
    path: `${AppConfig.routes.home}`,
    component: HomeComponent,
    canActivate: [NotLoggedGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
