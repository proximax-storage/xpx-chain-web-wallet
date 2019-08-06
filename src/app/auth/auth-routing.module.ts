import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthComponent } from './views/auth/auth.component';
import { AppConfig } from '../config/app.config';

const routes: Routes = [{
  path: AppConfig.routes.auth,
  component: AuthComponent,
  data: {
    meta: {
      title: 'auth.title',
      description: 'auth.text',
      override: true,
    },
  },
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
