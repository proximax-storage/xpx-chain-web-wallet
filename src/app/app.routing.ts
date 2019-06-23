import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { SelectivePreloadingService } from './selective-preloading.service';
import { AppConfig } from "./config/app.config";

const appRoutes: Routes = [
  {
    path: '',
    redirectTo: `/${AppConfig.routes.home}`,
    pathMatch: 'full'
  },
  {
    path: '',
    loadChildren: './home/home.module#HomeModule',
    data: { preload: true }
  },
  {
    path: '',
    loadChildren: './auth/auth.module#AuthModule',
    data: { preload: true }
  }, {
    path: '',
    loadChildren: './wallet/wallet.module#WalletModule'

  }, {
    path: '',
    loadChildren: './dashboard/dashboard.module#DashboardModule'
  }, {
    path: '',
    loadChildren: './transactions/transactions.module#TransactionsModule'
  }, {
    path: '',
    loadChildren: './servicesModule/services.module#ServicesModule'
  }
];
export const appRoutingProviders: any[] = [];
export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes, {
  enableTracing: false,
  useHash: true,
  preloadingStrategy: SelectivePreloadingService
});
