# Xpx Wallet Concept Paper

The XPX Wallet is one of the official applications of ProximaX, offering total security for the storage, sending and
receiving of your assets. With the XPX Wallet you can make use of mosaics, namespace, notarization of documents, voting,
transaction explorer, contact directory as well as create and import your encrypted account.

It is available for Windows operating systems, Mac OS, Linux and a generic version.

# Account Service

This service consists of a pair of keys (public and private key) associated with a mutable state stored in the Sirius
blockchain platform of ProximaX.

An account can represent a deposit of tokens, as in most known blockchains. However, it could also represent a single
object that must be unique and updatable: a package to send, the writing of a house or a document to be notarized.

Remember to keep your private key in a safe place without an Internet connection. The private key can not be recovered.


<h5>Create Account:</h5>
To create an account you must click on the "create" button located in "home" or in the Auth module.
    <h6>Functionality:</h6>
    <blockquote>
        <ul>
            <li>Choose the type of network</li>
            <li>Enter the name of the wallet</li>
            <li> Enter your password, then confirm the password.</li>
        </ul>
    </blockquote>
    <b> NOTE: </b>
    Once your account is created, a screen will appear indicating your address and your private key.


<h5>Import Account:</h5>
To import an account click on the "Import" button located in "Home" or in the Auth module.
    <h6>Functionality:</h6>
    <blockquote>
        <ul>
            <li>Choose the type of network</li>
            <li>Enter a valid private key</li>
            <li>Enter the name of the wallet</li>
            <li>Enter your password, then confirm the password.</li>
        </ul>
    </blockquote>
    <b> NOTE: </b>
    Once your account is imported, a screen will appear indicating your address and private key.



<h5>Export Account:</h5>
To export an account, must log in to your wallet and go to the menu: ACCOUNT
    <h6>Functionality:</h6>
    <blockquote>
        <ul>
            <li>Authenticate on your wallet</li>
            <li>Enter your account password</li>
        </ul>
    </blockquote>


# Transfer Transaction Service
Transfer transactions are used to send mosaics between two accounts. They can hold a messages of length 1023 characters.

<b> NOTE: </b>
It is possible to send mosaics to any valid address even if the address has not previously participated in any
transaction. If nobody owns the private key of the recipient's account, the funds are most likely lost forever.

<h5>Make a transfer transaction:</h5>
To make a transfer transaction, you must log in to your wallet and go to the menu: TRANSACTIONS → TRANSFER.
    <h6>Functionality:</h6>
    <blockquote>
        <ul>
            <li>Select or write a mosaic</li>
            <li>Select or enter a container</li>
            <li>Enter quantity (not mandatory)</li>
            <li>Write a message (not mandatory)</li>
            <li>Enter your account password</li>
        </ul>
    </blockquote>


# Transaction Explorer Service
A transaction generally represents a unit of work within a database system. In the case of blockchain, that is when an
action signed by an account changes its state.

Transactions accepted by the network are stored permanently on blocks.

With our transaction browser you can search all types of transactions confirmed by the network.

It has 3 types of searches:

    Address
    Public key
    Transaction hash


<h5>Perform a search in the transaction browser:</h5>
To perform a search in the transaction browser, you must log in to your wallet and go to the menu: SERVICES → EXPLORER.
    <h6>Functionality:</h6>
    <blockquote>
        <ul>
            <li>Select type of searches</li>
            <li>Enter keyword</li>
        </ul>
    </blockquote>





# Namespace & Subnamespace Service

<h5>NAMESPACE:</h5>

Namespaces allow you to create an on-chain unique place for your business and your assets on the SIRIUS blockchain.

A namespace starts with a name that you choose, similar to an internet domain name. If one account creates a namespace,
that will appear as unique in the SIRIUS ecosystem.

An account can link to a registered name (namespace or subnamespace) with an account or a mosaic identifier.


<h5>SUBNAMESPACE:</h5>

On the internet, a domain can have a sub-domain. In SIRIUS, namespaces can have subnamespaces.

You can create multiple subnamespaces with the same name in different namespaces. For example, you can create the
subnamespaces foo.bar and foo2.bar.

Namespaces can have up to 3 levels, a namespace and its two levels of subnamespace domains.
Register a namespace:

Choose a name of preference. To register a namespace you must log in to your wallet and go to the menu: <b>SERVICES → BOX NAMESPACE & SUBNAMESPACE → CREATE NAMESPACE.</b>
  <h6>Functionality:</h6>
  <blockquote>
      <ul>
          <li>Enter a namespace name</li>
          <li>Select root namespace</li>
          <li>Enter the duration of namespaces</li>
          <li>Enter your account password.</li>
      </ul>
  </blockquote>

Renovate a namespace:

Choose a name of preference. To register a namespace you must log in to your wallet and go to the menu: SERVICES → BOX
NAMESPACE & SUBNAMESPACE → RENOVATE NAMESPACE.

<b> NOTE: </b>

Only root namespaces need to be renewed. All sub-namepsaces will be renewed automatically upon renewal of the root
namespace.

The namespace contracts are leases and last according to the amount of the block you rent. by default they are 100 (A
new block completes every 15 seconds on average. You will have to renew your namespace before it expires).

If not renewed in time, all sub-namespaces and mosaics created under it will be lost.

<h6>Functionality:</h6>

Select a namespace

Enter new duration of namespaces

Enter your account password.


Register a subnamespace:

Once you have a registered root namespace, you can create up to 3 levels of subnamespaces.

Subnamespaces do not have a renting duration. They have the same one as their parent namespace.

It is possible to create multiple subnamespace spaces with the same name in different namespace (example: foo.bar and
foo2.bar).

To register a namespace you must log in to your wallet and go to the menu: SERVICES → BOX NAMESPACE & SUBNAMESPACE →
CREATE.

<h6>Functionality:</h6>

Enter a subnamespace name

Select the parent namespace

Enter your account password.


Linking to namespace to a mosaic:

To link a namespace to a tile, you must log in to your wallet and go to the menu: SERVICES → BOX NAMESPACE &
SUBNAMESPACE → LINKING TO NAMESPACE TO A MOSAIC.

Prerequisities:

Have a registered namespace.

Having registered a mosaic.

Have an account with cat.currency

<h6>Functionality:</h6>

Select or filter a namespace

Select or filter a mosaic

Enter your account password.


Linking to namespace to an address:

To link a namespace to an account you must log in to your wallet and go to the menu: SERVICES → BOX NAMESPACE &
SUBNAMESPACE → LINKING TO NAMESPACE TO AN ADDRESS.

Prerequisities:

Have registered a namespaces.

Have an account with cat.currency

<h6>Functionality:</h6>

Select or filter a namespace

Enter your address.

Enter your account password


Mosaic Service


The mosaics are part of what makes the Intelligent Asset System unique and flexible. They are fixed assets in the chain
of SIRIUS blocks that can represent a set of multiple identical things that do not change.

A mosaic could be a token, but it could also be a collection of more specialized assets, such as reward points, stocks,
signatures, status indicators, votes or even other currencies.
Create a mosaic:

Mosaics can be used to represent any asset in the block chain, such as objects, tickets, coupons, stock representation,
and even your cryptocurrency. To register a tile you must log in to your wallet and go to the menu: SERVICES → MOSAICS →
CREATE MOSAIC.

<h6>Functionality:</h6>

Enter duration

Enter divisibility

Enter supply

Select: Transferable, Supply Mutable, Levy Mutable (these data are optional)

Enter password of your account.

Mosaic Supply Change:

Alter the supply of a mosaic. Para registrar un namespace debe iniciar sesión en su wallet y dirigirse al menú: SERVICES
→ MOSAICS → MOSAIC SUPPLY CHANGE.

<h6>Functionality:</h6>

Select mosaic

Select supply type

Enter supply

Enter password of your account
