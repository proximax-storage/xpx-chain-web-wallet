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
  TransactionHttp,
  TransferTransaction,
  Deadline,
  PlainMessage,
  SignedTransaction,
  TransactionAnnounceResponse,
  Mosaic,
  MosaicId,
  UInt64,
  TransactionStatusError,
  TransactionStatus,
  MosaicInfo,
  NamespaceId,
  NamespaceInfo
} from 'proximax-nem2-sdk';

import { crypto } from 'proximax-nem2-library';
import { environment } from '../../../environments/environment';
import { commonInterface, walletInterface } from '..';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NemProvider {

  mosaic = 'prx:xpx';
  transactionHttp: TransactionHttp;
  websocketIsOpen = false;
  connectionWs: Listener;
  accountHttp: AccountHttp;
  mosaicHttp: MosaicHttp;
  namespaceHttp: NamespaceHttp;
  mosaicService: MosaicService;
  transactionStatusError: TransactionStatusError
  url: any;

  constructor() {
  }

  initInstances(url: string) {
    console.log('Execute node instances....');
    this.url = `${environment.protocol}://${url}`;
    this.accountHttp = new AccountHttp(this.url);
    this.mosaicHttp = new MosaicHttp(this.url);
    this.namespaceHttp = new NamespaceHttp(this.url);
    this.mosaicService = new MosaicService(this.accountHttp, this.mosaicHttp, this.namespaceHttp);
    this.transactionHttp = new TransactionHttp(this.url);
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
  createPublicAccount(publicKey: string, network: NetworkType): PublicAccount {
    return PublicAccount.createFromPublicKey(publicKey, network);
  }

  /**
   * Create transaction
   *
   * @param recipientAddress
   * @param message
   * @param network
   */
  createTransaction(recipient: string, amount: any, message: string, network: NetworkType) {
    const recipientAddress = this.createFromRawAddress(recipient);
    return TransferTransaction.create(
      Deadline.create(5),
      recipientAddress,
      [new Mosaic(new MosaicId(this.mosaic), UInt64.fromUint(Number(amount)))],
      PlainMessage.create(message),
      network
    );
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
   *
   *
   * @param {any} amount
   * @param {any} divisibility
   * @returns
   * @memberof NemProvider
   */
  formatterAmount(amount: number, divisibility: number) {
    const amountDivisibility = Number(amount / Math.pow(10, divisibility));
    return (amountDivisibility).toLocaleString('en-us', { minimumFractionDigits: divisibility });
  }

  /**
   * Get mosaic
   *
   * @param {any} mosaicId
   * @returns
   * @memberof NemProvider
   */
  getMosaic(mosaicId: MosaicId): Observable<MosaicInfo> {
    return this.mosaicHttp.getMosaic(mosaicId);
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
  getAllTransactionsFromAccount(publicAccount: PublicAccount, queryParams?: QueryParams): Observable<Transaction[]> {
    return this.accountHttp.transactions(publicAccount, new QueryParams(queryParams.pageSize,queryParams.id));
  }

  /**
   * Gets a transaction for a transactionId
   *
   * @param {string} transactionId
   * @returns {Observable<Transaction>}
   * @memberof NemProvider
   */
  getTransaction(transactionId: string): Observable<Transaction> {

    return this.transactionHttp.getTransaction(transactionId)
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
  getTransactionInformation(hash: string, node = ''): Observable<Transaction> {
    const transaction: TransactionHttp = (node === '') ? this.transactionHttp : new TransactionHttp(environment.protocol + '://'+ `${node}`);
    return transaction.getTransaction(hash);
  }

  /**
   *Gets a transaction status for a transaction hash
   *
   * @param {string} hash
   * @returns {Observable<TransactionStatus>}
   * @memberof NemProvider
   */
  getTransactionStatusError(hash: string): Observable<TransactionStatus> {
    return this.transactionHttp.getTransactionStatus(hash);
  }

  /**
   * Gnenerate account simple
   *
   * @param {*} network
   * @returns {Account}
   * @memberof NemProvider
   */
  generateNewAccount(network: NetworkType): Account {
    return Account.generateNewAccount(network);
    // account.address.pretty()
    // account.privateKey
  }

  sendTransaction(network: NetworkType, address: string, message?: string, amount: number = 0): TransferTransaction {
    console.log(address, message)
    return TransferTransaction.create(
      Deadline.create(23),
      Address.createFromRawAddress(address),
      [new Mosaic(new MosaicId(this.mosaic), UInt64.fromUint(Number(amount)))],
      PlainMessage.create(message),
      network,
    );

  }

  announce(signedTransaction: SignedTransaction): Observable<TransactionAnnounceResponse> {
    return this.transactionHttp.announce(signedTransaction);
  }

  getNamespace(namespace:NamespaceId): Observable<NamespaceInfo>{
    return this.namespaceHttp.getNamespace(namespace)
  }
}
