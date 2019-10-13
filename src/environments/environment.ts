import { ServerConfig, NetworkTypes } from 'nem-library';
import { NetworkType } from 'tsjs-xpx-chain-sdk';
import { ChronoUnit } from 'js-joda';
// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  itemBooksAddress: 'sw-books-testnet-01',
  version: '0.3.16',
  cacheVersion: '5',
  nameKeyBlockStorage: `sw-blocks`,
  nameKeyNodeSelected: `sw-selected-node-testnet-01`,
  nameKeyWalletStorage: `sw-testnet-01`,
  nameKeyNodeStorage: `sw-nodes-testnet-01`,
  nameKeyNamespaces: `sw-namespaces-testnet-01`,
  nameKeyMosaicStorage: `sw-mosaics-testnet-01`,
  nameKeyVersion: 'sw-version-testnet-01',
  nameKeyWalletTransactionsNis: 'sw-transactions-nis-01',
  protocol: `https`,
  protocolWs: `wss`,
  nodeExplorer: 'https://bctestnetexplorer.xpxsirius.io/#/result/hash',
  mosaicXpxInfo: {
    name: 'prx.xpx',
    coin: 'XPX',
    id: '13bfc518e40549d7',
    mosaicIdUint64: [3825551831, 331334936],
    namespaceIdUint64: [2434186742, 3220914849],
    namespaceId: 'bffb42a19116bdf6',
    divisibility: 6
  },
  deadlineTransfer: {
    deadline: 1439,
    chronoUnit: ChronoUnit.MINUTES
  },
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
    public_key: 'F3B8194C36CC55500DCB8CD3734DFA07FE8B649219BE315C8DFAE1DAC59F3595',
    address_public_test: 'VBH4NR-KUNINP-7HW6ZB-OECMIN-X3BCB4-ZDXKDM-KIWG'
  },
  mosaicRentalFeeSink: {
    public_key: '640A0DA89F6F57E43C526520AD05C59E185D19ADC95788D8611EBAEC94DEBBA1',
    address_public_test: 'VD6AXC-3QBCFT-SLKHT6-2UPGTN-V5Z63I-YZKJI3-YGMD'
  },
  pollsContent: {
    private_key: '687452458B69602A4E43E7C86AB038C2178794BD5FB816C1792A319015DB7190',
    public_key: '0000000000000000000000000000000000000000000000000000000000000000',
    address_public_test: 'VBPCBA-VFP7OG-REVIGD-TGRIKJ-PXSM4E-K446VF-SMFJ'
  },
  attestation: {
    private_key: '27FB7BB25E3D978F4D3F166879B7F8C16881B3ACDCC2C4B1FC51F45B2912D35E',
    address_public_test: 'VDYN53-XXEGKK-3XHQYE-K6ZBMN-JPXN57-ZBHXA3-AW55'
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
  /*typeNetwork: {
    value: NetworkType.MAIN_NET,
    label: 'MAIN NET'
  }*/
  typeNetwork: {
    value: NetworkType.TEST_NET,
    label: 'PUBLIC TEST'
  }
};
/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
