import { InjectionToken } from '@angular/core';
export const APP_CONFIG = new InjectionToken('app.config');
export const AppConfig: Config = {
  routes: {
    account: 'details-account',
    addressBook: 'address-book',
    apostille: 'apostille',
    audiApostille: 'audit-apostille',
    auth: 'auth',
    aliasAddressToNamespace: 'alias-address-to-namespace',
    createMosaic: 'create-mosaic',
    createMultisignature: 'create-multisignature-contract',
    createNamespace: 'create-namespace',
    createPoll: 'create-poll',
    createTransfer: 'create-transfer',
    createWallet: 'create-wallet',
    createAccount: 'create-account',
    dashboard: 'dashboard',
    viewAllAccount: 'view-all-account',
    editMultisignatureContract: 'edit-multisignature-contract',
    explorer: 'explorer',
    service: 'services',
    storage: 'storage',
    uploadFile: 'upload-file',
    myFile: 'my-file',
    home: 'home',
    importWallet: 'import-wallet',
    LinkingNamespaceMosaic: 'alias-namespace-to-mosaic',
    linkTheNamespaceToAnAddress: 'alias-namespace-to-an-address',
    MosaicSupplyChange: 'mosaic-supply-change',
    polls: 'polls',
    renewNamespace: 'renew-namespace',
    renovateNamespace: 'renovate-namespace',
    selectNode: 'select-node',
    selectTypeCreationWallet: 'select-type-creation-wallet',
    signMultiSigTransactions: 'sign-multisignature-transactions',
    walletCreated: 'wallet-created',
  }
};

export const NameRoute = {};

export interface Config {
  routes: {
    account: string;
    addressBook: string;
    apostille: string;
    audiApostille: string;
    auth: string;
    aliasAddressToNamespace: string;
    createMosaic: string;
    createMultisignature: string;
    createNamespace: string;
    createPoll: string;
    createTransfer: string;
    createWallet: string;
    createAccount: string;
    dashboard: string;
    viewAllAccount: string;
    editMultisignatureContract: string;
    explorer: string;
    service: string;
    storage: string;
    uploadFile: string;
    myFile: string;
    home: string;
    importWallet: string;
    LinkingNamespaceMosaic: string;
    linkTheNamespaceToAnAddress: string;
    MosaicSupplyChange: string;
    polls: string;
    renewNamespace: string;
    renovateNamespace: string;
    selectNode: string;
    selectTypeCreationWallet: string;
    signMultiSigTransactions: string;
    walletCreated: string;
  };
}
