# Xpx Wallet Concept Paper

The XPX Wallet is one of the official applications of ProximaX, offering total security for the storage, sending and receiving of your assets. With the XPX Wallet you can make use of mosaics, namespace, notarization of documents, voting, transaction explorer, contact directory as well as create and import your encrypted account.

It is available for Windows operating systems, Mac OS, Linux and a generic version.

# Account Service

This service consists of a pair of keys (public and private key) associated with a mutable state stored in the Sirius blockchain platform of ProximaX.

An account can represent a deposit of tokens, as in most known blockchains. However, it could also represent a single object that must be unique and updatable: a package to send, the writing of a house or a document to be notarized.

Remember to keep your private key in a safe place without an Internet connection. The private key can not be recovered.


  # Create Account:
  To create an account you must click on the "create" button located in "home" or in the Auth module.

  Functionality:

    Choose the type of network
    Enter the name of the wallet
    Enter your password, then confirm the password.

  NOTE:
    Once your account is created, a screen will appear indicating your address and your private key.


# Import Account:
To import an account click on the "Import" button located in "Home" or in the Auth module.

Functionality:

    Choose the type of network
    Enter a valid private key
    Enter the name of the wallet
    Enter your password, then confirm the password.

NOTE:

Once your account is imported, a screen will appear indicating your address and private key.



Export Account:

To export an account, must log in to your wallet and go to the menu: ACCOUNT

Functionality:

    Authenticate on your wallet
    Enter your account password


Transfer Transaction Service


Transfer transactions are used to send mosaics between two accounts. They can hold a messages of length 1023 characters.

NOTE:

It is possible to send mosaics to any valid address even if the address has not previously participated in any transaction. If nobody owns the private key of the recipient's account, the funds are most likely lost forever.
Make a transfer transaction:

To make a transfer transaction, you must log in to your wallet and go to the menu: TRANSACTIONS → TRANSFER.

Functionality:

    Select or write a mosaic
    Select or enter a container
    Enter quantity (not mandatory)
    Write a message (not mandatory)
    Enter your account password


Transaction Explorer Service


A transaction generally represents a unit of work within a database system. In the case of blockchain, that is when an action signed by an account changes its state.

Transactions accepted by the network are stored permanently on blocks.

With our transaction browser you can search all types of transactions confirmed by the network.

It has 3 types of searches:

    Address

    Public key

    Transaction hash


Perform a search in the transaction browser:

To perform a search in the transaction browser, you must log in to your wallet and go to the menu: SERVICES → EXPLORER.

Functionality:

    Select type of searches
    Enter keyword


Namespace & Subnamespace Service
NAMESPACE:

Namespaces allow you to create an on-chain unique place for your business and your assets on the SIRIUS blockchain.

A namespace starts with a name that you choose, similar to an internet domain name. If one account creates a namespace, that will appear as unique in the SIRIUS ecosystem.

An account can link to a registered name (namespace or subnamespace) with an account or a mosaic identifier.


SUBNAMESPACE:

On the internet, a domain can have a sub-domain. In SIRIUS, namespaces can have subnamespaces.

You can create multiple subnamespaces with the same name in different namespaces. For example, you can create the subnamespaces foo.bar and foo2.bar.

Namespaces can have up to 3 levels, a namespace and its two levels of subnamespace domains.
Register a namespace:

Choose a name of preference. To register a namespace you must log in to your wallet and go to the menu: SERVICES → BOX NAMESPACE & SUBNAMESPACE → CREATE NAMESPACE.

Functionality:

    Enter a namespace name

    Select root namespace

    Enter the duration of namespaces

    Enter your account password.


Renovate a namespace:

Choose a name of preference. To register a namespace you must log in to your wallet and go to the menu: SERVICES → BOX NAMESPACE & SUBNAMESPACE → RENOVATE NAMESPACE.

NOTE:

Only root namespaces need to be renewed. All sub-namepsaces will be renewed automatically upon renewal of the root namespace.

The namespace contracts are leases and last according to the amount of the block you rent. by default they are 100 (A new block completes every 15 seconds on average. You will have to renew your namespace before it expires).

If not renewed in time, all sub-namespaces and mosaics created under it will be lost.

Functionality:

    Select a namespace

    Enter new duration of namespaces

    Enter your account password.


Register a subnamespace:

Once you have a registered root namespace, you can create up to 3 levels of subnamespaces.

Subnamespaces do not have a renting duration. They have the same one as their parent namespace.

It is possible to create multiple subnamespace spaces with the same name in different namespace (example: foo.bar and foo2.bar).

To register a namespace you must log in to your wallet and go to the menu: SERVICES → BOX NAMESPACE & SUBNAMESPACE → CREATE.

Functionality:

    Enter a subnamespace name

    Select the parent namespace

    Enter your account password.


Linking to namespace to a mosaic:

To link a namespace to a tile, you must log in to your wallet and go to the menu:  SERVICES → BOX NAMESPACE & SUBNAMESPACE → LINKING TO NAMESPACE TO A MOSAIC.

Prerequisities:

    Have a registered namespace.

    Having registered a mosaic.

    Have an account with cat.currency

Functionality:

    Select or filter a namespace

    Select or filter a mosaic

    Enter your account password.


Linking to namespace to an address:

To link a namespace to an account you must log in to your wallet and go to the menu: SERVICES → BOX NAMESPACE & SUBNAMESPACE → LINKING TO NAMESPACE TO AN ADDRESS.

Prerequisities:

    Have registered a namespaces.

    Have an account with cat.currency

Functionality:

    Select or filter a namespace

    Enter your address.

    Enter your account password


Mosaic Service


The mosaics are part of what makes the Intelligent Asset System unique and flexible. They are fixed assets in the chain of SIRIUS blocks that can represent a set of multiple identical things that do not change.

A mosaic could be a token, but it could also be a collection of more specialized assets, such as reward points, stocks, signatures, status indicators, votes or even other currencies.
Create a mosaic:

Mosaics can be used to represent any asset in the block chain, such as objects, tickets, coupons, stock representation, and even your cryptocurrency. To register a tile you must log in to your wallet and go to the menu: SERVICES → MOSAICS → CREATE MOSAIC.

Functionality:

    Enter duration

    Enter divisibility

    Enter supply

    Select: Transferable, Supply Mutable, Levy Mutable (these data are optional)

    Enter password of your account.

Mosaic Supply Change:

Alter the supply of a mosaic. Para registrar un namespace debe iniciar sesión en su wallet y dirigirse al menú: SERVICES → MOSAICS → MOSAIC SUPPLY CHANGE.

Functionality:

    Select mosaic

    Select supply type

    Enter supply

    Enter password of your account





