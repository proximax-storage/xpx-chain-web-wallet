import { InjectionToken } from '@angular/core';
export const APP_CONFIG = new InjectionToken('app.config');
export const AppConfig: Config = {
  routes: {
    accountNis1Found: 'account-nis1-found',
    accountList: 'account-list',
    account: 'details-account',
    accountCreated: 'account-created',
    addressBook: 'address-book',
    addContacts: 'add-contacts',
    apostille: 'attestation',
    audiApostille: 'audit-attestation',
    auth: 'auth',
    aliasAddressToNamespace: 'alias-address-to-namespace',
    createAccount: 'create-account',
    createApostille: 'create-attestation',
    convertToAccountMultisign: 'convert-account-multisign',
    createMosaic: 'create-mosaic',
    createNamespace: 'create-namespace',
    createPoll: 'create-poll',
    createTransfer: 'create-transfer',
    createWallet: 'create-wallet',
    dashboard: 'dashboard',
    deleteAccount:'delete-account',
    deleteWallet:'delete-wallet',
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
    partial: 'partial',
    polls: 'polls',
    renewNamespace: 'renew-namespace',
    renovateNamespace: 'renovate-namespace',
    swapTransactions: 'swap-transactions',
    selectNode: 'select-node',
    selectTypeCreationWallet: 'select-type-creation-wallet',
    selectTypeCreationAccount: 'select-type-creation-account',
    signMultiSigTransactions: 'sign-multisignature-transactions',
    viewAllAccount: 'view-all-account',
    viewAllWallets:'view-all-wallets',
    voteInPoll: 'vote-poll',
    walletCreated: 'wallet-created',
    nis1AccountList: 'nis1-account-list',
    walletNis1Found: 'wallet-nis1-found',
    nis1AccountsConsigner: 'nis1-accounts-consigner',
    transferXpx: 'transfer-xpx',
    accountNis1TransferXpx: 'account-nis1-transfer-xpx',
    transferXpxNis1: 'transfer-xpx-nis1',
    walletNis1AccountConsigner: 'wallet-nis1-account-consigner'
  }
};

export const NameRoute = {};

export interface Config {
  routes: {
    account: string;
    accountCreated: string;
    accountList: string;
    accountNis1Found: string;
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
    createApostille: string;
    dashboard: string;
    deleteAccount:string;
    deleteWallet: string;
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
    partial: string;
    polls: string;
    renewNamespace: string;
    renovateNamespace: string;
    swapTransactions: string;
    selectNode: string;
    selectTypeCreationWallet: string;
    selectTypeCreationAccount: string;
    signMultiSigTransactions: string;
    viewAllAccount: string;
    viewAllWallets: string;
    voteInPoll: string;
    walletCreated: string;
    nis1AccountList: string;
    walletNis1Found: string;
    nis1AccountsConsigner: string;
    transferXpx: string;
    accountNis1TransferXpx: string;
    transferXpxNis1: string;
    walletNis1AccountConsigner: string;
  };
}
