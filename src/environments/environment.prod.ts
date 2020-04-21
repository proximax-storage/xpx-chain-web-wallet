import { ServerConfig, NetworkTypes } from 'nem-library';
import { NetworkType } from 'tsjs-xpx-chain-sdk';
import { ChronoUnit } from 'js-joda';
// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: true,
  routeNodesJson: 'testnet',
  itemBooksAddress: 'sw-books-testnet',
  version: '0.4.17',
  cacheVersion: '05',
  nameKeyBlockStorage: `sw-blocks`,
  nameKeyNodeSelected: `sw-selected-node-testnet`,
  nameKeyWalletStorage: `sw-testnet`,
  nameKeyNodeStorage: `sw-nodes-testnet`,
  nameKeyNamespaces: `sw-namespaces-testnet`,
  nameKeyMosaicStorage: `sw-mosaics-testnet`,
  nameKeyVersion: 'sw-version-testnet',
  nameKeyWalletTransactionsNis: 'sw-transactions-nis',
  activeModulesBox: {
    voting: {
      viewChildrenParam: false,
      createPoll: false,
      vote: false,
      viewResult: false,
      classNameParam: 'disable-module'
    },
    storage: {
      viewChildrenParam: false,
      files: false,
      uploadFiles: false,
      sendShare: false,
      classNameParam: 'disable-module'
    },
    notarization: {
      viewChildrenParam: false,
      attest: false,
      audit: false,
      classNameParam: 'disable-module'
    },
  },
  protocol: `http`,
  protocolWs: `ws`,
  nodeExplorer: 'http://demo-explorer.edlx.io/#/result/hash',
  mosaicXpxInfo: {
    name: 'prx.xpx',
    coin: 'XPX',
    id: '7933B82E31F53311',
    mosaicIdUint64: [3825551831, 331334936],
    namespaceIdUint64: [2434186742, 3220914849],
    namespaceId: 'bffb42a19116bdf6',
    divisibility: 6
  },
  deadlineTransfer: {
    deadline: 1439,
    chronoUnit: ChronoUnit.MINUTES
  },
  timeOutTransactionNis1: 20000,
  blockchainConnection: {
    host: '3.0.175.230',
    port: 3000,
    protocol: 'http',
    useSecureMessage: false
  },
  storageConnection: {
    host: 'ipfs1-dev.xpxsirius.io',
    port: 443,
    options: {
      protocol: 'https'
    }
  },
  namespaceRentalFeeSink: {
    public_key: '984AD9C41FD0728202B994E50DAFE1635D95B78BB0939B6F076606CCE05ADB2B',
    address_public_test: 'VBQUQ6-WKGJE7-DYELEB-SBGN6C-5FMDMF-HTMCJ5-TJ43'
  },
  mosaicRentalFeeSink: {
    public_key: '97D888229129F7AE0DCC361A92963FC869F5AE508B714C72CA7B81E9C4AEBCA6',
    address_public_test: 'VCLJME-KF2PGW-N52XFB-ABROWV-ZC2VNZ-PIB35H-C4LJ'
  },
  pollsContent: {
    public_key: '',
    address_public_test: ''
  },
  attestation: {
    address_public_test: ''
  },
  nis1: {
    url: '',
    urlExplorer: '',
    networkType: NetworkTypes.TEST_NET,
    burnAddress: '',
    nodes: [
      { protocol: 'http', domain: '', port: 7890 } as ServerConfig
    ],
  },
  swapAccount: {
    addressAccountMultisig: '',
    addressAccountSimple: ''
  },
  swapAllowedMosaics: [
  ],
  typeNetwork: {
    value: NetworkType.PRIVATE_TEST,
    label: 'PRIVATE TEST'
  },
  coingecko: {
    url: '',
  },
  blockHeightMax: {
    heightMax: 172800
  },
  lockFundDuration: 11520,
  delayBetweenLockFundABT: 20000
};
/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
