import { ServerConfig, NetworkTypes } from 'nem-library';
import { NetworkType } from 'tsjs-xpx-chain-sdk';
import { ChronoUnit } from 'js-joda';
// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: true,
  itemBooksAddress: 'sw-books-mainnet',
  version: '0.3.27 (MainNet - Demo)',
  cacheVersion: '9-MAINNET',
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
  /*mosaicXpxInfo: {
    name: 'prx.xpx',
    coin: 'XPX',
    id: '3c0f3de5298ced2d',
    mosaicIdUint64: [697101613, 1007631845],
    namespaceIdUint64: [2434186742, 3220914849],
    namespaceId: 'bffb42a19116bdf6',
    divisibility: 6
  },*/
  /*mosaicXpxInfo: {
    name: 'prx.xpx',
    coin: 'XPX',
    id: '1a804316c87d5cda',
    mosaicIdUint64: [3363658970, 444613398],
    namespaceIdUint64: [2434186742, 3220914849],
    namespaceId: 'bffb42a19116bdf6',
    divisibility: 6
  },*/
  blockchainConnection: {
    host: 'bctestnet1.brimstone.xpxsirius.io',
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
    public_key: '9FF38184F03950C09FFFF4A90C171E4C3C566985EEACA486A59CC8B607C10BF6',
    address_public_test: 'XA7KWF-N5CMLV-G7W3OH-Z5CV3G-3VYH3N-5EQQTK-OVJH'
  },
  pollsContent: {
    public_key: '36C25BCB8E6DCCF4B885BAD8963A30C4DBC6A1D70CE342D3656B23A610E60BB0',
    address_public_test: 'XBO3L3-K5AQTX-DXO6Z6-W6KAPO-RI4XHN-65J5VG-HOQU'
  },
  attestation: {
    address_public_test: 'XCGWQ72PDEWCPXMSZOSL4KIOWFRLJU6YGYTOK632'
  },
  nis1: {
    // url: 'http://95.216.73.245:7890',
    // urlExplorer: 'http://testnet-explorer.nemtool.com/#/unconfirmedtxlist',
    // networkType: NetworkTypes.TEST_NET,
    // address: 'TBF4LAZUEJMBIOC6J24D6ZGGXE5W775TX555CTTN',
    // nodes: [
    //   { protocol: "http", domain: "95.216.73.245", port: 7890 } as ServerConfig
    // ]
    /*url: 'https://bctestnetswap.xpxsirius.io',
    urlExplorer: 'http://testnet-explorer.nemtool.com/#/unconfirmedtxlist',
    networkType: NetworkTypes.TEST_NET,
    address: 'TBF4LAZUEJMBIOC6J24D6ZGGXE5W775TX555CTTN',
    nodes: [
      { protocol: "https", domain: "bctestnetswap.xpxsirius.io", port: 443 } as ServerConfig
    ],*/
    url: 'http://18.231.166.212:7890',
    urlExplorer: 'http://testnet-explorer.nemtool.com/#/unconfirmedtxlist',
    networkType: NetworkTypes.TEST_NET,
    address: 'TBF4LAZUEJMBIOC6J24D6ZGGXE5W775TX555CTTN',
    nodes: [
      { protocol: "http", domain: "18.231.166.212", port: 7890 } as ServerConfig
    ],
  },
  swapAccount: {
    addressAccountMultisig: 'VAWOEOWTABXR7O3ZAK2XNA5GIBNE6PZIXDAFDWBU',
    addressAccountSimple: 'VC3I3FSQ354JT2QNS2XJ2J3OROCOBIRK6JB3BCBH'
  },
  typeNetwork: {
    value: NetworkType.MAIN_NET,
    label: 'MAIN NET'
  }
  /*typeNetwork: {
    value: NetworkType.TEST_NET,
    label: 'PUBLIC TEST'
  }*/
};
