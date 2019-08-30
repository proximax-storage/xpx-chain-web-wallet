// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: true,
  itemBooksAddress: 'sw-books',
  version: '0.2.6+3',
  nameKeyNodeSelected: `sw-selected-node`,
  nameKeyMosaicNamespaceLinked: `sw-m-n-linked`,
  nameKeyWalletStorage: `sw-04`,
  nameKeyNodeStorage: `sw-nodes-01`,
  nameKeyNamespaces: `sw-namespaces-01`,
  nameKeyMosaicStorage: `sw-mosaics-01`,
  protocol: `https`,
  protocolWs: `wss`,
  nodeDefault: 'bctestnet1-cow.xpxsirius.io:443',
  mosaicXpxInfo: {
    name: 'prx.xpx',
    coin: 'XPX',
    id: '0dc67fbe1cad29e3',
    divisibility: 6
  },
  blockchainConnection: {
    host: 'bctestnet1-cow.xpxsirius.io',
    port: 443,
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
  },
  pollsContent: {
    private_key: 'DF60E433D16FE168C5ABF00BA09C0F441CF482A3674270B6450DD261E35100DF',
    public_key: '62CFD0909A282494466F324E05F83D17FD363E9F027897BE6063742745DE8B82',
    address_public_test: 'VAKYW5-55DSDQ-TGMNZA-ULW6ZA-5WCMBB-QTW5XN-PHGK'
  }
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
