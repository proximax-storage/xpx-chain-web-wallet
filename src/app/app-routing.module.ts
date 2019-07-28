import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppConfig } from './config/app.config';
import { WrapperAuthComponent } from './shared/layouts/wrapper/wrapper-auth/wrapper-auth.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: `/${AppConfig.routes.home}`,
    pathMatch: 'full'
  },
  {
    path: ``,
    component: WrapperAuthComponent,
    children: [{
      path: '',
      loadChildren: './auth/auth.module#AuthModule'
    }, {
      path: '',
      loadChildren: './wallet/wallet.module#WalletModule'
    }, {
      path: '',
      loadChildren: './home/home.module#HomeModule'
    }, {
      path: '',
      loadChildren: './dashboard/dashboard.module#DashboardModule'
    }]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
