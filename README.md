
<p align="center">
  <a href="https://www.proximax.io/">
    <img src="https://www.proximax.io/user/themes/proximaxvrs1/images/logo.png" alt="Logo" width=280 height=60>
  </a>
  <h3 align="center">ProximaX Sirius Wallet</h3>
</p>
  <p>
    The ProximaX Sirius Wallet is one of the official applications of ProximaX, offering total security for the storage, sending and receiving of your assets. With ProximaX Sirius Wallet you can make use of mosaics, namespace, notarization of documents, voting, transaction explorer, contact directory as well as create and import your encrypted account. <br> It is available for Windows operating systems, Mac OS, Linux and a generic version.
</p>
<p align="center">
    <a href="https://t.me/proximaxhelpdesk">Report bug</a>
  </p>



## Table of contents

- [Requirements](#requirements)
- [Quick start development](#quick-start-development)
- [Build to production](#Build-to-production)


## Requirements
 ```bash
Angular CLI: 8.0.6
Angular: 8.0.3
Node: 10.16.3
Npm: 6.13.4
 ```


## Quick start development

 ```bash
git clone https://github.com/proximax-storage/xpx-chain-web-wallet.git
cd xpx-chain-web-wallet
 npm i
 npm start or ng serve
 ```
**WARNING**

> To execute the `ng serve` command, you must make other settings. Navigate to the following directories: 
<br> <br> `node_modules> @angular-devkit> build-angular> src> angular-cli-files> models> webpack-configs> browser.js` 
<br> <br>  You must change `node: false` to` node: {crypto: true, stream: true, fs: 'empty', net: 'empty', tls: 'empty'} `.

## Build to production
For build to production (Minified and optimized)
 ```bash
ng build --aot --prod --build-optimizer=true --vendor-chunk=true
 ```
