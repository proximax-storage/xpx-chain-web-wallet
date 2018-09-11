import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './views/home/home.component';
import { AppConfig } from '../config/app.config';

const routes: Routes = [
  {
    path: `${AppConfig.routes.home}`,
    component: HomeComponent
  },
  {
    path: '',
    redirectTo: `/${AppConfig.routes.home}`,
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
