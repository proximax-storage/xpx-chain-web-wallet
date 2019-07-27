import { InjectionToken } from '@angular/core';
export const APP_CONFIG = new InjectionToken('app.config');
export const AppConfig: Config = {
  routes: {
    auth: 'auth',
    createWallet: 'create-wallet',
    dashboard: 'dashboard',
    home: 'home',
    importWallet: 'import-wallet'
  }
};

export const NameRoute = {
  [AppConfig.routes.auth]: 'Authorization',
  [AppConfig.routes.auth]: 'Create wallet',
  [AppConfig.routes.dashboard]: 'Dashboard',
  [AppConfig.routes.home]: 'Home',
  [AppConfig.routes.importWallet]: 'Import wallet'
};

export interface Config {
  routes: {
    auth: string;
    createWallet: string;
    dashboard: string;
    home: string;
    importWallet: string;
  };
}
