

<p align="center">
  <a href="https://www.proximax.io/">
    <img src="https://www.proximax.io/user/themes/proximaxvrs1/images/logo.png" alt="Logo" width=280 height=60>
  </a>
  <h3 align="center">ProximaX Sirius Wallet</h3>
</p>
  <p>
    The ProximaX Sirius Wallet is one of the official applications of ProximaX, offering total security for the storage, sending and receiving of your assets. With ProximaX Sirius Wallet you can make use of mosaics, namespace, notarization of documents, voting, transaction explorer, contact directory as well as create and import your encrypted account. <br> It is available for Windows operating systems, Mac OS, Linux and a generic version.
</p>


## Table of contents

- [Installation](https://github.com/proximax-storage/xpx-chain-web-wallet/blob/master/README.md)
- [Directory Layout](#directory-layout)


## Directory Layout

Before you start, take a moment to see how the project structure looks like:

```
.
├── /dist/                           # The folder for compiled output
├── /node_modules/                   # 3rd-party libraries and utilities
├── /src/                            # The source code of the application
│   ├── /app/                        # The core source code
│   │   ├── /accounts/               # Account Module 
│   │   ├── /apostille/              # Apostille Module
│   │   ├── /auth/                   # Auth Module
│   │   ├── /config/                 # Configuration file for route variables
│   │   ├── /core/                   # Container for storing components and other essential services
│   │   ├── /dashboard/              # Dashboard Module
│   │   ├── /home/                   # Home Module
│   │   ├── /mosaics/                # Mosaics Module
│   │   ├── /multi-sign/             # Multi-sign Module
│   │   ├── /namespace/              # Namespace Module
│   │   ├── /servicesModule/         # Contains address-book, explorer, nodes, notifications, service-box, wallet (export and delete) modules
│   │   ├── /shared/                 # The folder contains layouts, guards and generic services
│   │   ├── /storage/                # Storage Module
│   │   ├── /swap/                   # Swap Module
 ```


 ```
