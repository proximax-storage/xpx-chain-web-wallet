// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  socket: 'wss://192.168.10.38:3000', //company
  apiUrl: 'http://192.168.10.38:3000', //company
  nodeDefault: 'staging.mocd.gov.ae/catapult'
  // socket: 'ws://190.216.224.11:3000', //house
  // apiUrl: 'http://catapult.isarq.com:3000/' //house
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
