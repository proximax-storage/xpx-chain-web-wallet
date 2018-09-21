import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './views/login/login.component';
import { AppConfig } from '../config/app.config';
import { NotLoggedGuard } from '../shared/guard/not-logged.guard';

const routes: Routes = [

  {   path: `${AppConfig.routes.login}`,
      component: LoginComponent,
      canActivate: [NotLoggedGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoginRoutingModule { }
