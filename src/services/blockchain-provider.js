import { crypto } from 'js-xpx-chain-library'
import {
  Account,
  BlockHttp,
  ChainHttp,
  MosaicHttp,
  AccountHttp,
  NamespaceHttp,
  TransactionHttp,
  SimpleWallet,
  Password,
  DiagnosticHttp,
  MetadataHttp,
  NetworkType,
  Address,
  PublicAccount
} from 'tsjs-xpx-chain-sdk'

import { GeneralService } from './general'

class BlockchainProvider {
  constructor (node, protocol, typeNetwork) {
    this.url = this.buildURL(node, protocol)
    this.typeNetwork = NetworkType[typeNetwork]
    this.accountHttp = new AccountHttp(this.url)
    this.blockHttp = new BlockHttp(this.url)
    this.chainHttp = new ChainHttp(this.url)
    this.diagnosticHttp = new DiagnosticHttp(this.url)
    this.metadataHttp = new MetadataHttp(this.url)
    this.mosaicHttp = new MosaicHttp(this.url)
    this.namespaceHttp = new NamespaceHttp(this.url)
    this.transactionHttp = new TransactionHttp(this.url)
    this.generalService = new GeneralService()
  }

  /**
   *
   *
   * @param {*} node
   * @param {*} protocol
   * @returns
   * @memberof BlockchainProvider
   */
  buildURL (node, protocol) {
    let url = null
    switch (protocol) {
      case 'http':
        url = `${protocol}://${node}:3000`
        break
      case 'https':
        url = `${protocol}://${node}:443`
        break
    }

    return url
  }

  /**
   *
   *
   * @param {*} walletName
   * @param {*} password
   * @param {*} [network=this.typeNetwork]
   * @returns
   * @memberof BlockchainProvider
   */
  createSimpleWallet (name, password, network = this.typeNetwork) {
    return SimpleWallet.create(name, this.createPassword(password), network)
  }

  /**
   *
   *
   * @param {*} nameWallet
   * @param {*} password
   * @param {*} privateKey
   * @param {*} network
   * @returns
   * @memberof BlockchainProvider
   */
  createSimpleWalletFromPrivateKey (name, password, privateKey, network = this.typeNetwork) {
    const pass = this.createPassword(password)
    return SimpleWallet.createFromPrivateKey(name, pass, privateKey, network)
  }

  /**
   *
   *
   * @param {*} value
   * @returns
   * @memberof BlockchainProvider
   */
  createPassword (password) {
    return new Password(password)
  }

  /**
   *
   *
   * @param {*} publicKey
   * @param {*} network
   * @returns
   * @memberof BlockchainProvider
   */
  createPublicAccount (publicKey, network) {
    return PublicAccount.createFromPublicKey(publicKey, network)
  }

  /**
   *
   *
   * @param {*} address
   * @returns
   * @memberof BlockchainProvider
   */
  createFromRawAddress (address) {
    return Address.createFromRawAddress(address)
  }

  /**
   *
   *
   * @param {*} privateKey
   * @param {*} network
   * @param {*} address
   * @returns
   * @memberof BlockchainProvider
   */
  checkAddress (privateKey, network, address) {
    return (privateKey && privateKey !== '') ? Account.createFromPrivateKey(privateKey, network).address.plain() === address : null
  }

  /**
   *
   *
   * @param {*} common
   * @param {*} account
   * @param {*} [network=this.typeNetwork]
   * @returns
   * @memberof BlockchainProvider
   */
  decrypt (common, account, network) {
    try {
      if (account && account.encrypted !== '' && common) {
        if (!crypto.passwordToPrivatekey(common, account, account.algo)) {
          return { status: false, msg: 'Invalid password' }
        }

        if (common.isHW) {
          return { status: false, msg: 'Invalid password' }
        }

        if (!this.isValidPrivateKey(common.privateKey) || !this.checkAddress(common.privateKey, network, account.address)) {
          return { status: false, msg: 'Invalid password' }
        }

        return { status: true, msg: '' }
      } else {
        return { status: false, msg: 'You do not have a valid account selected' }
      }
    } catch (error) {
      return { status: false, msg: 'You do not have a valid account selected.' }
    }
  }

  /**
   *
   *
   * @param {*} privateKey
   * @returns
   * @memberof BlockchainProvider
   */
  isValidPrivateKey (privateKey) {
    if (privateKey && (privateKey.length !== 64 && privateKey.length !== 66)) {
      // console.error('Private key length must be 64 or 66 characters !')
      return false
    } else if (privateKey && !this.generalService.isHexadecimal(privateKey)) {
      // console.error('Private key must be hexadecimal only !')
      return false
    } else {
      // console.error('fine !')
      return true
    }
  }

  /**
   *
   *
   * @param {*} privateKey
   * @param {*} network
   * @returns
   * @memberof BlockchainProvider
   */
  getAccountFromPrivateKey (privateKey, network) {
    return Account.createFromPrivateKey(privateKey, network)
  }

  /**
   *
   *
   * @param {*} privateKey
   * @returns
   * @memberof BlockchainProvider
   */
  getPrefixAndPrivateKey (privateKey) {
    let pref = null
    let newPrivateKey = privateKey
    if (newPrivateKey && newPrivateKey.length > 64) {
      pref = newPrivateKey.slice(0, -64)
      newPrivateKey = newPrivateKey.slice(2)
    }

    return {
      pref: pref,
      pvk: newPrivateKey
    }
  }

  /**
   *
   *
   * @returns
   * @memberof BlockchainProvider
   */
  getNetworkTypes () {
    return {
      testnet: {
        text: 'Public Test',
        value: NetworkType.TEST_NET
      },
      mainnet: {
        text: 'Main Net',
        value: NetworkType.MAIN_NET
      }
    }
  }
}

export { BlockchainProvider }
