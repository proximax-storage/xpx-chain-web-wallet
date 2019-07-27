import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppConfig } from '../config/app.config';
import { HomeComponent } from './views/home/home.component';

const routes: Routes = [
  {
    path: AppConfig.routes.home,
    component: HomeComponent,
    data: {
      meta: {
        title: 'home.title',
        description: 'home.text',
        override: true,
      },
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
