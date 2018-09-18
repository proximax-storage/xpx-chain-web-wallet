import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';

const appRoutes: Routes = [
    {
        path: '',
        loadChildren: './home/home.module#HomeModule'
    },
    {
        path: '',
        loadChildren: './login/login.module#LoginModule'
    },
    {
        path: '',
        loadChildren: './wallet/wallet.module#WalletModule'
    }
];
export const appRoutingProviders: any[] = [];
export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes, {
    enableTracing: false,
    useHash: true,
    preloadingStrategy: PreloadAllModules
});
