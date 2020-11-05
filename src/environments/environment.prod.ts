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
      viewChildrenParam: true,
      files: true,
      uploadFiles: true,
      sendShare: false,
      classNameParam: ''
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
  nodeExplorer: 'http://45.77.104.17/#/result/hash',
  mosaicXpxInfo: {
    name: 'prx.xpx',
    coin: 'XPX',
    id: '4165347496069e2a',
    mosaicIdUint64: [2517016106, 1097151604],
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
    host: '45.77.104.17',
    port: 3000,
    protocol: 'http',
    useSecureMessage: false
  },
  storageConnection: {
    host: '45.32.103.21',
    port: 80,
    options: {
      protocol: 'http'
    }
  },
  namespaceRentalFeeSink: {
    public_key: '6F4416CA9AE06AF4DDDE4A30132C55B47740C0262568BEE99D59CF3A92BD04D1',
    address_public_test: 'WAKM6I-RABAPP-N4ONV7-WV37ID-PZLRSJ-3HDZT2-ZC6E'
  },
  mosaicRentalFeeSink: {
    public_key: 'BBE28FA114AD72618A864D0D8156A2CBC495B9E4B57385E09485A4B2ECB1FC7A',
    address_public_test: 'WCQW2A-RIT6S2-KVLVKJ-ZZOSPW-7GOTHG-TX3RHH-3BYY'
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
