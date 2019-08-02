import { InjectionToken } from '@angular/core';
export const APP_CONFIG = new InjectionToken('app.config');
export const AppConfig: Config = {
  routes: {
    account: 'details-account',
    addressBook: 'address-book',
    apostille: 'apostille',
    audiApostille: 'audit-apostille',
    auth: 'auth',
    createMosaic: 'create-mosaic',
    createMultisignature: 'create-multisignature-contract',
    createNamespace: 'create-namespace',
    createPoll: 'create-poll',
    createTransfer: 'create-transfer',
    createWallet: 'create-wallet',
    dashboard: 'dashboard',
    editMultisignatureContract: 'edit-multisignature-contract',
    explorer: 'explorer',
    service: 'services',
    storage: 'storage',
    home: 'home',
    importWallet: 'import-wallet',
    LinkingNamespaceMosaic: 'alias-namespace-to-mosaic',
    linkTheNamespaceToAnAddress: 'alias-namespace-to-an-address',
    MosaicSupplyChange: 'mosaic-supply-change',
    polls: 'polls',
    renewNamespace: 'renew-namespace',
    renovateNamespace: 'renovate-namespace',
    selectNode: 'select-node',
    signMultiSigTransactions: 'sign-multisignature-transactions',
    walletCreated: 'wallet-created',
    aliasAddressToNamespace: 'alias-address-to-namespace'





  }
};

export const NameRoute = {
  [AppConfig.routes.account]: 'Details Account',
  [AppConfig.routes.addressBook]: 'Address Book',
  [AppConfig.routes.apostille]: 'Apostille create',
  [AppConfig.routes.audiApostille]: 'Apostille Audit',
  [AppConfig.routes.auth]: 'Authorization',
  [AppConfig.routes.createMosaic]: 'Create Mosaic',
  [AppConfig.routes.createMultisignature]: 'Convert an account to multisig',
  [AppConfig.routes.createNamespace]: 'Create namespace & sub-namespace',
  [AppConfig.routes.createPoll]: 'Create a Poll',
  [AppConfig.routes.createTransfer]: 'Create Transfer',
  [AppConfig.routes.createWallet]: 'Create wallet',
  [AppConfig.routes.dashboard]: 'Dashboard',
  [AppConfig.routes.editMultisignatureContract]: 'Edit multisignature contract',
  [AppConfig.routes.explorer]: 'Explorer Transaction',
  [AppConfig.routes.service]: 'Dashboard service',
  [AppConfig.routes.storage]: 'Storage',
  [AppConfig.routes.home]: 'Home',
  [AppConfig.routes.importWallet]: 'Import wallet',
  [AppConfig.routes.linkTheNamespaceToAnAddress]: 'Link the namespace to an address',
  [AppConfig.routes.MosaicSupplyChange]: 'Mosaic supply change',
  [AppConfig.routes.polls]: 'Vote and See Polls',
  [AppConfig.routes.renewNamespace]: 'Renew Namespace',
  [AppConfig.routes.renovateNamespace]: 'Renovate Namespace',
  [AppConfig.routes.selectNode]: 'Select node',
  [AppConfig.routes.signMultiSigTransactions]: 'Sign multisignature transactions',
  [AppConfig.routes.walletCreated]: 'Wallet Created',
  [AppConfig.routes.aliasAddressToNamespace]: 'Alias Address to Namespace',




};

export interface Config {
  routes: {
    account: string;
    addressBook: string;
    apostille: string;
    audiApostille: string;
    auth: string;
    createMosaic: string;
    createMultisignature: string;
    createNamespace: string;
    createPoll: string;
    createTransfer: string;
    createWallet: string;
    dashboard: string;
    editMultisignatureContract: string;
    explorer: string;
    service: string;
    storage: string;
    home: string;
    importWallet: string;
    LinkingNamespaceMosaic: string;
    linkTheNamespaceToAnAddress: string;
    MosaicSupplyChange: string;
    polls: string;
    renewNamespace: string;
    renovateNamespace: string;
    selectNode: string;
    signMultiSigTransactions: string;
    walletCreated: string;
    aliasAddressToNamespace: string;








  };
}
