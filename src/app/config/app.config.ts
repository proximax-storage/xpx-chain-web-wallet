import { InjectionToken } from '@angular/core';

export const APP_CONFIG = new InjectionToken('app.config');
export const AppConfig: Config = {
  routes: {
    home: 'home',
    login: 'login',
    dashboard: 'dashboard',
    createWallet: 'create-wallet',
    importWallet: 'import-wallet',
    transactions:'transactions-get',
    notFound: 'not-found'
  }
};

export const NameRoute = {
  [AppConfig.routes.home]: 'Home',
  [AppConfig.routes.login]: 'Login',
  [AppConfig.routes.dashboard]: 'Dashboard',
  [AppConfig.routes.createWallet]: 'Create wallet',
  [AppConfig.routes.importWallet]: 'Import wallet',
  [AppConfig.routes.transactions]: 'Transactions get',
  [AppConfig.routes.notFound]: '404 not found'
}

export interface Config {
  routes: {
    home: string;
    login: string;
    dashboard: string;
    createWallet: string;
    importWallet: string;
    transactions:string;
    notFound: string;
  };
}
