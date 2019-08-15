// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: true,
  version: '0.2.1+21',
  nameKeyNodeSelected: `sw-nodes-selected`,
  nameKeyNamespaces: `sw-namespaces`,
  nameKeyWalletStorage: `sw-04`,
  nameKeyNodeStorage: `sw-nodes`,
  protocol: `http`,
  protocolWs: `ws`,
  nodeDefault: 'bctestnet1-cow.xpxsirius.io:3000',
  mosaicXpxInfo: {
    name: 'prx.xpx',
    coin: 'XPX',
    id: '0dc67fbe1cad29e3',
    divisibility: 6
  },
  blockchainConnection: {
    host: 'bctestnet1-cow.xpxsirius.io',
    port: 3000,
    protocol: 'http',
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
  }
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
