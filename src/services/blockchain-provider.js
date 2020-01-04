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
  Address
} from 'tsjs-xpx-chain-sdk'

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
  }

  saluda () {
    console.log('hola')
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
    return (Account.createFromPrivateKey(privateKey, network).address.plain() === address)
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
          return { status: true, msg: '' }
        }

        if (!this.isValidPrivateKey(common.privateKey) || !this.checkAddress(common.privateKey, network, account.address)) {
          return { status: false, msg: 'Invalid password' }
        }

        return { status: true, msg: '' }
      } else {
        return { status: false, msg: 'You do not have a valid account selected' }
      }
    } catch (error) {
      console.log(error)
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
    if (privateKey.length !== 64 && privateKey.length !== 66) {
      // console.error('Private key length must be 64 or 66 characters !');
      return false
    } else if (!this.isHexadecimal(privateKey)) {
      // console.error('Private key must be hexadecimal only !');
      return false
    } else {
      return true
    }
  }

  /**
   *
   *
   * @param {*} str
   * @returns
   * @memberof BlockchainProvider
   */
  isHexadecimal (str) {
    return str.match('^(0x|0X)?[a-fA-F0-9]+$') !== null
  }

  /**
   *
   *
   * @returns
   * @memberof BlockchainProvider
   */
  getNetworkTypes () {
    return [
      {
        text: 'Public Test',
        value: NetworkType.TEST_NET
      },
      {
        text: 'Main Net',
        value: NetworkType.MAIN_NET
      }
    ]
  }

  /**
   *
   *
   * @param {*} privateKey
   * @param {*} network
   * @returns
   * @memberof BlockchainProvider
   */
  getPublicAccountFromPrivateKey (privateKey, network) {
    return Account.createFromPrivateKey(privateKey, network)
  }
}

export { BlockchainProvider }
