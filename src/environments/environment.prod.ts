import { ServerConfig, NetworkTypes } from 'nem-library';
import { NetworkType } from 'tsjs-xpx-chain-sdk';
import { ChronoUnit } from 'js-joda';
// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: true,
  itemBooksAddress: 'sw-books-testnet',
  version: '0.4.0',
  cacheVersion: '03',
  nameKeyBlockStorage: `sw-blocks`,
  nameKeyNodeSelected: `sw-selected-node-testnet`,
  nameKeyWalletStorage: `sw-testnet`,
  nameKeyNodeStorage: `sw-nodes-testnet`,
  nameKeyNamespaces: `sw-namespaces-testnet`,
  nameKeyMosaicStorage: `sw-mosaics-testnet`,
  nameKeyVersion: 'sw-version-testnet',
  nameKeyWalletTransactionsNis: 'sw-transactions-nis',
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
  timeOutTransactionNis1: 10000,
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
    public_key: '945215E9D664D60E5A4FD54982C09B1F79D421EA0436FA307112A0DF74C89622',
    address_public_test: 'VBPCBA-VFP7OG-REVIGD-TGRIKJ-PXSM4E-K446VF-SMFJ'
  },
  attestation: {
    address_public_test: 'VDYN53-XXEGKK-3XHQYE-K6ZBMN-JPXN57-ZBHXA3-AW55'
  },
  nis1: {
    url: 'https://bctestnetswap.xpxsirius.io:7890',
    urlExplorer: 'http://testnet-explorer.nemtool.com/#/s_tx?hash=',
    networkType: NetworkTypes.TEST_NET,
    burnAddress : 'TBF4LAZUEJMBIOC6J24D6ZGGXE5W775TX555CTTN',
    nodes: [
      { protocol: "https", domain: "bctestnetswap.xpxsirius.io", port: 7890 } as ServerConfig
    ],
  },
  swapAccount: {
    addressAccountMultisig: 'VAWOEOWTABXR7O3ZAK2XNA5GIBNE6PZIXDAFDWBU',
    addressAccountSimple: 'VCWLIYQPQAJSYWMWL5BHUCA3VOWVOXZ3WTNJPTUJ'
  },
  typeNetwork: {
    value: NetworkType.TEST_NET,
    label: 'PUBLIC TEST'
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
