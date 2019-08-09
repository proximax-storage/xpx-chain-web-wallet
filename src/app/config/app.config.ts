import { InjectionToken } from '@angular/core';
export const APP_CONFIG = new InjectionToken('app.config');
export const AppConfig: Config = {
  routes: {
    account: 'details-account',
    accountCreated: 'account-created',
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
    editMultisignatureContract: 'edit-multisignature-contract',
    explorer: 'explorer',
    service: 'services',
    storage: 'storage',
    uploadFile: 'upload-file',
    myFile: 'my-file',
    home: 'home',
    importAccount: 'import-account',
    importWallet: 'import-wallet',
    LinkingNamespaceMosaic: 'alias-namespace-to-mosaic',
    linkTheNamespaceToAnAddress: 'alias-namespace-to-an-address',
    MosaicSupplyChange: 'mosaic-supply-change',
    MultiSign: 'multi-signatures',
    polls: 'polls',
    renewNamespace: 'renew-namespace',
    renovateNamespace: 'renovate-namespace',
    selectNode: 'select-node',
    selectTypeCreationWallet: 'select-type-creation-wallet',
    selectTypeCreationAccount: 'select-type-creation-account',
    signMultiSigTransactions: 'sign-multisignature-transactions',
    viewAllAccount: 'view-all-account',
    walletCreated: 'wallet-created',
  }
};

export const NameRoute = {};

export interface Config {
  routes: {
    account: string;
    accountCreated: string;
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
    editMultisignatureContract: string;
    explorer: string;
    service: string;
    storage: string;
    uploadFile: string;
    myFile: string;
    home: string;
    importWallet: string;
    importAccount: string;
    LinkingNamespaceMosaic: string;
    linkTheNamespaceToAnAddress: string;
    MosaicSupplyChange: string;
    MultiSign: string;
    polls: string;
    renewNamespace: string;
    renovateNamespace: string;
    selectNode: string;
    selectTypeCreationWallet: string;
    selectTypeCreationAccount: string;
    signMultiSigTransactions: string;
    viewAllAccount: string;
    walletCreated: string;
  };
}
