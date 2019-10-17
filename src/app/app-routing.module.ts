import { NgModule, ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppConfig } from './config/app.config';
import { WrapperAuthComponent } from './shared/layouts/wrappers/wrapper-auth/wrapper-auth.component';
import { SelectivePreloadingService } from './selective-preloading.service';
import { NotLoggedGuard } from './shared/guard/not-logged.guard';
import { LoggedGuard } from './shared/guard/logged.guard';
import { WrapperMainComponent } from './shared/layouts/wrappers/wrapper-main/wrapper-main.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: `/${AppConfig.routes.home}`,
    canActivate: [NotLoggedGuard],
    pathMatch: 'full'
  }, {
    path: ``,
    component: WrapperAuthComponent,
    canActivate: [NotLoggedGuard],
    children: [{
      path: '',
      loadChildren: './home/home.module#HomeModule'
    }, {
      path: '',
      loadChildren: './wallet/wallet.module#WalletModule'
    },{
      path: '',
      loadChildren: './swap/swap.module#SwapModule'
    }]
  }, {
    path: ``,
    component: WrapperMainComponent,
    canActivate: [LoggedGuard],
    children: [{
      path: '',
      loadChildren: './dashboard/dashboard.module#DashboardModule'
    }, {
      path: '',
      loadChildren: './transactions/transactions.module#TransactionsModule'
    }, {
      path: '',
      loadChildren: './servicesModule/services-module.module#ServicesModule'
    }]
  }, {
    path: '**',
    redirectTo: `/${AppConfig.routes.home}`
  },
];

/*@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }*/
export const appRoutingProviders: any[] = [];
export const routing: ModuleWithProviders = RouterModule.forRoot(routes, {
  enableTracing: false,
  useHash: true,
  preloadingStrategy: SelectivePreloadingService
});
