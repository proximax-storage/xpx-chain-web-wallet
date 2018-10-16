import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { SelectivePreloadingService } from './selective-preloading.service';
import { AppConfig } from "./config/app.config";

const appRoutes: Routes = [
    {
        path: '',
        loadChildren: './login/login.module#LoginModule',
        data: { preload: true }
    },{
        path: '',
        loadChildren: './wallet/wallet.module#WalletModule'
  
    },{
        path: '',
        loadChildren: './dashboard/dashboard.module#DashboardModule'
    }
];
export const appRoutingProviders: any[] = [];
export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes, {
    enableTracing: false,
    useHash: true,
    preloadingStrategy: SelectivePreloadingService
});
