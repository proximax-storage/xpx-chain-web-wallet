import { InjectionToken } from '@angular/core';
export const APP_CONFIG = new InjectionToken('app.config');
export const AppConfig: Config = {
  routes: {
    accountList: 'account-list',
    account: 'details-account',
    accountCreated: 'account-created',
    addressBook: 'address-book',
    addContacts: 'add-contacts',
    apostille: 'attestation',
    audiApostille: 'audit-attestation',
    auth: 'auth',
    aliasAddressToNamespace: 'alias-address-to-namespace',
    blockchain: 'nodes',
    createAccount: 'create-account',
    createApostille: 'create-attestation',
    createGift :'create-gift',
    convertToAccountMultisign: 'convert-account-multisign',
    createMosaic: 'create-mosaic',
    createNamespace: 'create-namespace',
    createPoll: 'create-poll',
    createTransfer: 'create-transfer',
    createWallet: 'create-wallet',
    dashboard: 'dashboard',
    deleteAccount:'delete-account',
    deleteAccountConfirm:'delete-account-confirm',
    deleteWallet:'delete-wallet',
    deleteWalletConfirm:'delete-wallet-confirm',
    editAccountMultisign: 'edit-account-multisign',
    explorer: 'explorer',
    extendMosaics: 'extend-mosaics',
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
    notification: 'notifications',
    partial: 'partial',
    polls: 'polls',
    renewNamespace: 'renew-namespace',
    renovateNamespace: 'renovate-namespace',
    redeemGiftCard:'redeem-gift-card',
    swapAccountFound: 'swap-account-found',
    swapAccountNis1Found: 'swap-account-nis1-found',
    swapTransactions: 'swap-transactions',
    swapListCosigners: 'swap-list-cosigners',
    swapListCosignerNis1: 'swap-list-cosigner-nis1',
    swapTransferAssets: 'swap-transfer-assets',
    swapTransferAssetsLogged: 'swap-transfer-assets-nis1',
    swapAccountListNis1: 'swap-account-list-nis1',
    swapAccountList: 'swap-account-list',
    swapListAccountsNis1: 'swap-list-accounts-nis1',



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
    walletNis1AccountConsigner: 'wallet-nis1-account-consigner',
    exportWallet: 'export-wallet',
  }
};

export const NameRoute = {};

export interface Config {
  routes: {
    account: string;
    accountCreated: string;
    accountList: string;
    addressBook: string;
    addContacts: string;
    apostille: string;
    audiApostille: string;
    auth: string;
    blockchain: string,
    convertToAccountMultisign: string;
    aliasAddressToNamespace: string;
    createMosaic: string;
    createNamespace: string;
    createPoll: string;
    createTransfer: string;
    createWallet: string;
    createAccount: string;
    createApostille: string;
    createGift: string
    dashboard: string;
    deleteAccount:string;
    deleteAccountConfirm:string;
    deleteWallet: string;
    deleteWalletConfirm:string;
    editAccountMultisign: string;
    explorer: string;
    extendMosaics: string;
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
    notification: string;
    partial: string;
    polls: string;
    renewNamespace: string;
    renovateNamespace: string;
    redeemGiftCard:string;
    swapAccountFound: string;
    swapAccountNis1Found: string;
    swapTransactions: string;
    swapListCosignerNis1: string;
    swapListCosigners: string;
    swapListAccountsNis1: string;
    swapTransferAssets: string;
    swapTransferAssetsLogged: string;
    swapAccountListNis1: string;
    swapAccountList: string;


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
    exportWallet: string;

  };
}
