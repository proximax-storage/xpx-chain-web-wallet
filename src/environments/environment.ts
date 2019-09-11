import { ServerConfig, NetworkTypes } from 'nem-library';

// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  itemBooksAddress: 'sw-books',
  version: '0.2.6.12',
  nameKeyNodeSelected: `sw-selected-node`,
  nameKeyMosaicNamespaceLinked: `sw-m-n-linked`,
  nameKeyWalletStorage: `sw-04`,
  nameKeyNodeStorage: `sw-nodes-01`,
  nameKeyNamespaces: `sw-namespaces-01`,
  nameKeyMosaicStorage: `sw-mosaics-01`,
  protocol: `https`,
  protocolWs: `wss`,
  nodeDefault: 'bctestnet1-cow.xpxsirius.io:443',
  nodeExplorer: 'https://bctestnetexplorer.xpxsirius.io/#/result/hash',
  mosaicXpxInfo: {
    name: 'prx.xpx',
    coin: 'XPX',
    id: '0dc67fbe1cad29e3',
    divisibility: 6
  },
  blockchainConnection: {
    host: 'bctestnet1-cow.xpxsirius.io',
    port: 443,
    protocol: 'https',
    useSecureMessage: false
  },
  storageConnection: {
    host: 'ipfs1-dev.xpxsirius.io',
    port: 5001,
    options: {
      protocol: 'http'
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
    private_key: '52681268C37552C6F88EA063EBDDAB0B4A88032DD93CF6696C5A57B00A24FD12',
    public_key: 'B5575AE4511694DCD0F7A8D0FAC1B327C1743334523075617EACE4997468D09E',
    address_public_test: 'VBBLJ4-PD73RT-PXBTJY-ZQX426-NU7ETW-O3AZ65-YMVM'
  },
  nis1: {
    url: 'http://18.231.166.212:7890',
    networkType: NetworkTypes.TEST_NET,
    address: 'TBF4LAZUEJMBIOC6J24D6ZGGXE5W775TX555CTTN',
    nodes: [
      { protocol: "http", domain: "18.231.166.212", port: 7890 } as ServerConfig
    ],
  }
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
