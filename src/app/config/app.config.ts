import { InjectionToken } from '@angular/core';
export const APP_CONFIG = new InjectionToken('app.config');
export const AppConfig: Config = {
  routes: {
    auth: 'auth',
    createWallet: 'create-wallet',
    dashboard: 'dashboard',
    home: 'home',
    importWallet: 'import-wallet',
    selectNode: 'select-node',
    walletCreated: 'wallet-created'
  }
};

export const NameRoute = {
  [AppConfig.routes.auth]: 'Authorization',
  [AppConfig.routes.createWallet]: 'Create wallet',
  [AppConfig.routes.dashboard]: 'Dashboard',
  [AppConfig.routes.home]: 'Home',
  [AppConfig.routes.importWallet]: 'Import wallet',
  [AppConfig.routes.selectNode]: 'Select node',
  [AppConfig.routes.walletCreated]: 'Wallet Created'
};

export interface Config {
  routes: {
    auth: string;
    createWallet: string;
    dashboard: string;
    home: string;
    importWallet: string;
    selectNode: string;
    walletCreated: string;
  };
}
