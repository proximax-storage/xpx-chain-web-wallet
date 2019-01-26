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
    account:'account',
    explorerFile:'explorer-file',
    addressBook:'address-book',
    notFound: 'not-found',
    storage: 'storage',
    createMosaic: 'create-mosaic',
    editMosaic: 'edit-mosaic'
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
  [AppConfig.routes.explorer]: 'Explorer Transaction',
  [AppConfig.routes.explorerFile]: 'Explorer File',
  [AppConfig.routes.createPoll]: 'Create a Poll',
  [AppConfig.routes.polls]: 'Vote and See Polls',
  [AppConfig.routes.services]: 'Services',
  [AppConfig.routes.account]: 'Account',
  [AppConfig.routes.service]: ' Dashboard service',
  [AppConfig.routes.addressBook]: 'Address Book',
  [AppConfig.routes.notFound]: '404 not found',
  [AppConfig.routes.storage]: 'storage',
  [AppConfig.routes.createMosaic]: 'Create Mosaic',
  [AppConfig.routes.editMosaic]: 'Edit Mosaic'
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
    account: string;
    explorerFile: string;
    addressBook: string;
    createMosaic: string;
    editMosaic: string;
    notFound: string;
    storage:string;
  };
}
