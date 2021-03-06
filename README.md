
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
- [Build to production](#build-to-production)

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
```
├── /node_modules/                  
│   ├── /@angular-devkit/  
│   │   ├── /build-angular/
│   │   │   ├── /src/
│   │   │   │   ├── /angular-cli-files/
│   │   │   │   │   ├── /models/
│   │   │   │   │   │   ├── /webpack-configs/
└── ──  ──  ──  ──  ──  ── ── /browser.js
```	


>You must change <br>
`node: false` to <br>
`node: {crypto: true, stream: true, fs: 'empty', net: 'empty', tls: 'empty'}`.

## Build to production

For build to production (Minified and optimized).

<b>Generic version TestNet</b>

```bash
npm run build:optimizer-testnet
```

<b>Generic version MainNet</b>

```bash
npm run build:optimizer-mainnet
```

<br>

**WARNING**
> Before compiling for other platforms, you must compile the generic version.

   <br>
  
  <b>Electron Version</b>
 ```bash
npm run electron-build
 ```
 <br>
 
<b>Windows version</b>
 ```bash
npm run package-win
 ```
  <br>
  
 <b>Linux version</b>
 ```bash
npm run package-linux
 ```
  <br>
  
  <b>Mac OS version</b> (It can only be compiled from Mac Os)
 ```bash
npm run package-mac
 ```
