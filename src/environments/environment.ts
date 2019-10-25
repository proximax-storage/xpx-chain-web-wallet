import { ServerConfig, NetworkTypes } from 'nem-library';
import { NetworkType } from 'tsjs-xpx-chain-sdk';
import { ChronoUnit } from 'js-joda';
// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  itemBooksAddress: 'sw-books-mainnet',
  version: '0.4.1',
  cacheVersion: '4-MAINNET',
  nameKeyBlockStorage: `sw-blocks`,
  nameKeyNodeSelected: `sw-selected-node-mainnet`,
  nameKeyWalletStorage: `sw-mainnet`,
  nameKeyNodeStorage: `sw-nodes-mainnet`,
  nameKeyNamespaces: `sw-namespaces-mainnet`,
  nameKeyMosaicStorage: `sw-mosaics-mainnet`,
  nameKeyVersion: 'sw-version-mainnet',
  nameKeyWalletTransactionsNis: 'sw-transactions-nis-mainnet',
  protocol: `https`,
  protocolWs: `wss`,
  nodeExplorer: 'https://explorer.xpxsirius.io/#/result/hash',
  mosaicXpxInfo: {
    name: 'prx.xpx',
    coin: 'XPX',
    id: '402b2f579faebc59',
    mosaicIdUint64: [2679028825, 1076571991],
    namespaceIdUint64: [2434186742, 3220914849],
    namespaceId: 'bffb42a19116bdf6',
    divisibility: 6
  },
  deadlineTransfer: {
    deadline: 1439,
    chronoUnit: ChronoUnit.MINUTES
  },
  timeOutTransactionNis1: 10000,
  blockchainConnection: {
    host: 'arcturus.xpxsirius.io',
    port: 443,
    protocol: 'https',
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
    public_key: '9FF38184F03950C09FFFF4A90C171E4C3C566985EEACA486A59CC8B607C10BF6',
    address_public_test: 'XA7KWF-N5CMLV-G7W3OH-Z5CV3G-3VYH3N-5EQQTK-OVJH'
  },
  mosaicRentalFeeSink: {
    public_key: '94A9BB9660037E622C8F626E061DB1557CBBED0338402E82E796168E80EF9765',
    address_public_test: 'XC5ZZN-SYLOXO-EQIAAF-N6B5S6-QAQSFF-5TEVC4-XLTV'
  },
  pollsContent: {
    public_key: '36C25BCB8E6DCCF4B885BAD8963A30C4DBC6A1D70CE342D3656B23A610E60BB0',
    address_public_test: 'XBO3L3-K5AQTX-DXO6Z6-W6KAPO-RI4XHN-65J5VG-HOQU'
  },
  attestation: {
    address_public_test: 'XCGWQ72PDEWCPXMSZOSL4KIOWFRLJU6YGYTOK632'
  },
  nis1: {
    url: 'https://swap.brimstone.xpxsirius.io:7890',
    urlExplorer: 'http://explorer.nemtool.com/#/s_tx?hash=',
    networkType: NetworkTypes.MAIN_NET,
    burnAddress : 'ND7WVWPWNTJR75CYC3D73LSVP7WIL7BL77QNT7NZ',
    nodes: [{
      protocol: "https",
      domain: "swap.brimstone.xpxsirius.io",
      port: 7890
    } as ServerConfig],
  },
  swapAccount: {
    addressAccountMultisig: 'XDKK47EMX4Q2NVU6TIN4RS22SZZ47UEFJ454L4NV',
    addressAccountSimple: 'XDHQTCJLDDSNOVXPGRE25YNHXV27EAKAEUGJKRLK'
  },
  typeNetwork: {
    value: NetworkType.MAIN_NET,
    label: 'MAIN NET'
  },
  coingecko:{
    url: 'https://api.coingecko.com/api/v3/coins/',
  }
};
/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
