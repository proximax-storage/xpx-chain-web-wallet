import { Protocol } from 'xpx2-ts-js-sdk';

// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: true,
  nameKeyWalletStorage: `proximax-web-wallet`,
  nameKeyNodeStorage: `proximax-web-wallet-nodes`,
  protocol: `http`,
  protocolWs: `ws`,
  nodeDefault: 'bctestnet1.xpxsirius.io:3000',
  blockchainConnection: {
    host:'bctestnet1.xpxsirius.io',
    port: 3000,
    protocol: Protocol.HTTP,
    useSecureMessage: true
  },
  storageConnection: {
    host: 'ipfs1-dev.xpxsirius.io',
    port: 5001,
    options: {}
  }
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
