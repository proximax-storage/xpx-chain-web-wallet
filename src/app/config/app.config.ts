import { InjectionToken } from '@angular/core';
export const APP_CONFIG = new InjectionToken('app.config');
export const AppConfig: Config = {
  routes: {
    home: 'home',
    login: 'login',
    dashboard: 'dashboard',
    createWallet: 'create-wallet',
    importWallet: 'import-wallet',
    audiApostille:'audit-apostille',
    apostille:'apostille',
    transactions:'transactions-get',
    transferTransaction:'transfer',
    addNode: 'add-node',
    selectNode: 'select-node',
    explorer: 'explorer',
    createPoll:'create-poll',
    polls:'polls',
    service:'dashboard-service',
    services:'services',
    notFound: 'not-found'
  }
};

export const NameRoute = {
  [AppConfig.routes.home]: 'Home',
  [AppConfig.routes.login]: 'Login',
  [AppConfig.routes.dashboard]: 'Dashboard',
  [AppConfig.routes.createWallet]: 'Create wallet',
  [AppConfig.routes.importWallet]: 'Import wallet',
  [AppConfig.routes.audiApostille]: 'Apostille Audit',
  [AppConfig.routes.apostille]: 'Apostille create',
  [AppConfig.routes.transactions]: 'Transactions get',
  [AppConfig.routes.transferTransaction]: 'Transfer',
  [AppConfig.routes.addNode]: 'Add node',
  [AppConfig.routes.selectNode]: 'Select node',
  [AppConfig.routes.explorer]: 'Explorer',
  [AppConfig.routes.createPoll]: 'Create a Poll',
  [AppConfig.routes.polls]: 'Vote and See Polls',
  [AppConfig.routes.services]: 'Services',
  [AppConfig.routes.service]: ' Dashboard service',
  [AppConfig.routes.notFound]: '404 not found'
}

export interface Config {
  routes: {
    home: string;
    login: string;
    dashboard: string;
    createWallet: string;
    importWallet: string;
    audiApostille:string;
    apostille: string;
    transactions:string;
    transferTransaction: string;
    addNode: string;
    selectNode:string;
    explorer: string;
    createPoll:string;
    polls:string;
    service:string;
    services: string;
    notFound: string;
  };
}
