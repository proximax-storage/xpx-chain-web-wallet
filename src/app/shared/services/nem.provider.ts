import { Injectable } from '@angular/core';
import {
  Listener,
  Password,
  SimpleWallet,
  Account,
  Address,
  AccountHttp,
  MosaicHttp,
  NamespaceHttp,
  MosaicService,
  MosaicAmountView,
  Transaction,
  PublicAccount,
  QueryParams,
  AccountInfo,
  NetworkType,
  TransactionHttp
} from 'nem2-sdk';

import { crypto } from 'nem2-library';
import { environment } from '../../../environments/environment';
import { commonInterface, walletInterface } from '..';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class NemProvider {
  transactionHttp: TransactionHttp;
  websocketIsOpen = false;
  connectionWs: Listener;
  accountHttp: AccountHttp;
  mosaicHttp: MosaicHttp;
  namespaceHttp: NamespaceHttp;
  mosaicService: MosaicService
  constructor() {
    this.transactionHttp = new TransactionHttp(environment.apiUrl);
    this.accountHttp = new AccountHttp(environment.apiUrl);
    this.mosaicHttp = new MosaicHttp(environment.apiUrl);
    this.namespaceHttp = new NamespaceHttp(environment.apiUrl);
    this.mosaicService = new MosaicService(this.accountHttp, this.mosaicHttp, this.namespaceHttp);
  }

  openConnectionWs() {
    this.websocketIsOpen = true;
    const listener = new Listener(environment.socket, WebSocket);
    return listener;
  }

  getConnectionWs() {
    if (!this.websocketIsOpen) {
      this.connectionWs = this.openConnectionWs();
      return this.connectionWs;
    }
    return this.connectionWs;
  }

  /**
   * Create account simple
   *
   * @param {string} user
   * @param {Password} password
   * @param {number} network
   * @returns {SimpleWallet}
   * @memberof NemProvider
   */
  createAccountSimple(user: string, password: Password, network: number): SimpleWallet {
    return SimpleWallet.create(user, password, network);
  }

  /**
   * Create account simple
   *
   * @param {string} nameWallet
   * @param {Password} password
   * @param {string} privateKey
   * @param {number} network
   * @returns {SimpleWallet}
   * @memberof NemProvider
   */
  createAccountFromPrivateKey(nameWallet: string, password: Password, privateKey: string, network: number): SimpleWallet {
    return SimpleWallet.createFromPrivateKey(nameWallet, password, privateKey, network);
  }

  /**
   * Check if Address it is correct
   * @param privateKey privateKey
   * @param address address
   * @return checkAddress
   */
  checkAddress(privateKey: string, net: NetworkType, address: string): boolean {
    return (Account.createFromPrivateKey(privateKey, net).address.plain() === address) ? true : false;
  }

  /**
   * get
   *
   * @param {string} privateKey
   * @param {*} net
   * @returns {PublicAccount}
   * @memberof NemProvider
   */
  getPublicAccountFromPrivateKey(privateKey: string, net: NetworkType): PublicAccount {
    return Account.createFromPrivateKey(privateKey, net).publicAccount
  }

  /**
   * Create a password with at least 8 characters
   *
   * @param {string} value
   * @returns {Password}
   * @memberof NemProvider
   */
  createPassword(value: string): Password {
    const password = new Password(value);
    return password;
  }

  /**
 * createPublicAccount
 * @param publicKey
 * @param network
 * @returns {PublicAccount}
 */
  createPublicAccount(publicKey, network): PublicAccount {
    return PublicAccount.createFromPublicKey(publicKey, network);
  }

  /**
   * Create an Address from a given raw address.
   *
   * @param {*} address
   * @returns {Address}
   * @memberof NemProvider
   */
  createFromRawAddress(address: string): Address {

    return Address.createFromRawAddress(address);
  }

  /**
   * Decrypt and return private key
   * @param password
   * @param encryptedKey
   * @param iv
   */
  decryptPrivateKey(password: Password, encryptedKey: string, iv): string {
    const common: commonInterface = {
      password: password.value,
      privateKey: ''
    };

    const wallet: walletInterface = {
      encrypted: encryptedKey,
      iv: iv,
    };

    crypto.passwordToPrivatekey(common, wallet, 'pass:bip32');
    return common.privateKey;
  }

  /**
   *Gets an AccountInfo for an account.
   *
   * @param {Address} address
   * @returns {Observable<AccountInfo>}
   * @memberof NemProvider
   */
  getAccountInfo(address: Address): Observable<AccountInfo> {

    return this.accountHttp.getAccountInfo(address)
  }

  /**
   *Get balance mosaics in form of MosaicAmountViews for a given account address
   *
   * @param {Address} address
   * @returns {Observable<MosaicAmountView[]>}
   * @memberof NemProvider
   */
  getBalance(address: Address): Observable<MosaicAmountView[]> {
    return this.mosaicService.mosaicsAmountViewFromAddress(address);
  }

  /**
   *Gets an array of confirmed transactions for which an account is signer or receiver.
   *
   * @param {*} publicKey
   * @param {NetworkType} network
   * @param {QueryParams} [queryParams]
   * @returns {Observable<Transaction[]>}
   * @memberof NemProvider
   */
  getAllTransactionsFromAnAccount(publicAccount, queryParams?): Observable<Transaction[]> {
    console.log("cuenta publica nem", publicAccount)
    return this.accountHttp.transactions(publicAccount, new QueryParams(queryParams));

  }

  /**
   *Gets the array of transactions for which an account is the sender or receiver and which have not yet been included in a block.
   *
   * @param {*} publicKey
   * @param {NetworkType} network
   * @param {QueryParams} [queryParams]
   * @returns {Observable<Transaction[]>}
   * @memberof NemProvider
   */
  getUnconfirmedTransactionsFromAnAccount(publicAccount, queryParams?): Observable<Transaction[]> {
    return this.accountHttp.unconfirmedTransactions(publicAccount, queryParams);
  }



  /**
   * Return getTransaction from id or hash
   * @param param
   */
  getTransactionInformation(hash, node = ''): Observable<Transaction> {
    const transaction: TransactionHttp = (node === '') ? this.transactionHttp : new TransactionHttp(`http://${node}:3000`);
    return transaction.getTransaction(hash);
  }



  /**
   * Gnenerate account simple
   *
   * @param {*} network
   * @returns {Account}
   * @memberof NemProvider
   */
  generateNewAccount(network): Account {
    return Account.generateNewAccount(network);
    // account.address.pretty()
    // account.privateKey
  }
}
