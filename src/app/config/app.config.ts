import { InjectionToken } from '@angular/core';

export const APP_CONFIG = new InjectionToken('app.config');
export const AppConfig: Config = {
  routes: {
    home: 'home',
    login: 'login',
    dashboard: 'dashboard',
    createWallet: 'create-wallet',
    importWallet: 'import-wallet',
    notFound: 'not-found'
  }
};

export interface Config {
  routes: {
    home: string;
    login: string;
    dashboard: string;
    createWallet: string;
    importWallet: string;
    notFound: string;
  };
}
