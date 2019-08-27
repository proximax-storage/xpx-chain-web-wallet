import { InjectionToken } from '@angular/core';
export const APP_CONFIG = new InjectionToken('app.config');
export const AppConfig: Config = {
  routes: {
    account: 'details-account',
    accountCreated: 'account-created',
    addressBook: 'address-book',
    addContacts: 'add-contacts',
    apostille: 'apostille',
    audiApostille: 'audit-apostille',
    auth: 'auth',
    convertToAccountMultisign: 'convert-account-multisign',
    aliasAddressToNamespace: 'alias-address-to-namespace',
    createMosaic: 'create-mosaic',
    createNamespace: 'create-namespace',
    createPoll: 'create-poll',
    createTransfer: 'create-transfer',
    createWallet: 'create-wallet',
    createAccount: 'create-account',
    dashboard: 'dashboard',
    editAccountMultisign: 'edit-account-multisign',
    explorer: 'explorer',
    extendNamespace: 'extend-namespace',
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
    addContacts: string;
    apostille: string;
    audiApostille: string;
    auth: string;
    convertToAccountMultisign: string;
    aliasAddressToNamespace: string;
    createMosaic: string;
    createNamespace: string;
    createPoll: string;
    createTransfer: string;
    createWallet: string;
    createAccount: string;
    dashboard: string;
    editAccountMultisign: string;
    explorer: string;
    extendNamespace: string;
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
