import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { SelectivePreloadingService } from './selective-preloading.service';

const appRoutes: Routes = [
    {
        path: '',
        loadChildren: './login/login.module#LoginModule',
        data: { preload: true }
    },
    {
        path: '',
        loadChildren: './home/home.module#HomeModule',
        data: { preload: false }
    },
    
    {
        path: '',
        loadChildren: './wallet/wallet.module#WalletModule',
        data: { preload: false }
    },
    {
        path: '',
        loadChildren: './dashboard/dashboard.module#DashboardModule',
        data: { preload: false }
    }
];
export const appRoutingProviders: any[] = [];
export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes, {
    enableTracing: false,
    useHash: true,
    preloadingStrategy: SelectivePreloadingService
});
