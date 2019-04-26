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
  NamespaceInfo,
  RegisterNamespaceTransaction,
  MosaicDefinitionTransaction,
  MosaicProperties,
  MosaicSupplyChangeTransaction,
  MosaicSupplyType,
  NamespaceService,
  MosaicView
} from 'proximax-nem2-sdk';

import { crypto } from 'proximax-nem2-library';
import { environment } from '../../../environments/environment';
import { commonInterface, walletInterface } from '../interfaces/shared.interfaces';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NemProvider {

  infoMosaic: MosaicInfo;
  mosaicXpx = {
    mosaic: "prx:xpx",
    mosaicId: "d423931bd268d1f4"
  };

  transactionHttp: TransactionHttp;
  websocketIsOpen = false;
  connectionWs: Listener;
  accountHttp: AccountHttp;
  mosaicHttp: MosaicHttp;
  namespaceHttp: NamespaceHttp;
  mosaicService: MosaicService;
  namespaceService: NamespaceService;
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
    this.namespaceService = new NamespaceService(this.namespaceHttp);
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
   * get
   *
   * @param {string} privateKey
   * @param {*} net
   * @returns {Account}
   * @memberof NemProvider
   */
  getAccountFromPrivateKey(privateKey: string, net: NetworkType): Account {
    return Account.createFromPrivateKey(privateKey, net)
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
      [new Mosaic(new MosaicId(this.mosaicXpx.mosaic), UInt64.fromUint(Number(amount)))],
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
  decryptPrivateKey(password: Password, encryptedKey: string, iv: string): string {
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

  getMosaics(mosaicIsd: MosaicId[]): Observable<MosaicInfo[]> {
    return this.mosaicHttp.getMosaics(mosaicIsd);
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
   *Get balance mosaics in form of MosaicAmountViews for a given account address
   *
   * @param {Address} address
   * @returns {Observable<MosaicAmountView[]>}
   * @memberof NemProvider
   */
  getBalance2(mosaicId: MosaicId): Observable<MosaicInfo> {
    return this.mosaicHttp.getMosaic(mosaicId);
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
    return this.accountHttp.transactions(publicAccount, new QueryParams(queryParams.pageSize, queryParams.id));
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
  getUnconfirmedTransactionsFromAnAccount(publicAccount: PublicAccount, queryParams?: QueryParams): Observable<Transaction[]> {
    return this.accountHttp.unconfirmedTransactions(publicAccount, queryParams);
  }

  /**
   * Return getTransaction from id or hash
   * @param param
   */
  getTransactionInformation(hash: string, node = ''): Observable<Transaction> {
    const transaction: TransactionHttp = (node === '') ? this.transactionHttp : new TransactionHttp(environment.protocol + '://' + `${node}`);
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

  /**
   * Get namespace id
   *
   * @param {any} id
   * @returns
   * @memberof NemProvider
   */
  getNamespaceId(id: string | number[]): NamespaceId {
    return new NamespaceId(id);
  }

  getMosaicId(id: string | number[]): MosaicId {
    return new MosaicId(id);
  }

  sendTransaction(network: NetworkType, address: string, message?: string, amount: number = 0): TransferTransaction {
    console.log(address, message)
    return TransferTransaction.create(
      Deadline.create(23),
      Address.createFromRawAddress(address),
      [new Mosaic(new MosaicId(this.mosaicXpx.mosaic), UInt64.fromUint(Number(amount)))],
      PlainMessage.create(message),
      network,
    );

  }

  announce(signedTransaction: SignedTransaction): Observable<TransactionAnnounceResponse> {
    return this.transactionHttp.announce(signedTransaction);
  }

  getNamespace(namespace: string): Observable<NamespaceInfo> {

    return this.namespaceHttp.getNamespace(new NamespaceId(namespace))
  }


  /**
   * GET INFO MOSAICS, RETURN PROMISE
   *
   * @param {MosaicId[]} mosaicsId
   * @returns
   * @memberof NemProvider
   */
  getMosaicViewPromise(mosaicsId: MosaicId[]): Promise<MosaicView[]> {
    return this.mosaicService.mosaicsView(mosaicsId).toPromise();
    /*const promise = await new Promise(async (resolve, reject) => {
      //if (this.infoMosaic === undefined) {
      console.warn("********** GET INFO MOSAICS TO PROMISE **********");
      const mosaicsView = await this.mosaicService.mosaicsView(mosaicsId).toPromise();
      // this.setInfoMosaic(this.infoMosaic);
      // console.log("Ya va a responder...", this.infoMosaic);
      resolve(mosaicsView);
      //} else {
      //console.log("Información de mosaico en caché", this.infoMosaic);
      //reject(null);
      // if (this.infoMosaic.mosaicId === mosaicId) {
      //   resolve(this.infoMosaic);
      // } else {
      //   this.infoMosaic = await this.nemProvider.getMosaic(mosaicId).toPromise();
      //   this.setInfoMosaic(this.infoMosaic);
      //   resolve(this.infoMosaic);
      // }
      //}
    });

    console.log("***RESPUESTA CONSULTA DE MOSAICOS****", promise);
    return await promise;*/
  }


  async getNamespaceViewPromise(namespaceId: NamespaceId[]) {
    const promise = await new Promise(async (resolve, reject) => {
      console.warn("********** GET NAMESPACE TO PROMISE **********", namespaceId);
      const namespace = await this.namespaceHttp.getNamespacesName(namespaceId).toPromise();
      resolve(namespace);
    });

    console.log("***RESPUESTA CONSULTA DE MOSAICOS****", promise);
    return await promise;
  }


  async getInfoMosaicFromNamespacePromise(namespaceId: NamespaceId, queryParams?: QueryParams) {
    const promise = await new Promise(async (resolve, reject) => {
      if (this.infoMosaic === undefined) {
        // console.warn("********** INFO MOSAIC ES UNDEFINED **********");
        const mosaicInfo = await this.mosaicHttp.getMosaicsFromNamespace(namespaceId).toPromise();
        // console.log("RESPONDIO MOSAIC INFO");
        // this.setInfoMosaic(this.infoMosaic);
        // console.log("Ya va a responder...", this.infoMosaic);
        resolve(mosaicInfo);
      } else {
        // console.log("Información de mosaico en caché", this.infoMosaic);
        reject(null);
        // if (this.infoMosaic.mosaicId === mosaicId) {
        //   resolve(this.infoMosaic);
        // } else {
        //   this.infoMosaic = await this.nemProvider.getMosaic(mosaicId).toPromise();
        //   this.setInfoMosaic(this.infoMosaic);
        //   resolve(this.infoMosaic);
        // }
      }
    });
    return await promise;
  }

  mosaicSupplyChangeTransaction(mosaicId: string, supply: number, mosaicSupplyType: number, network: NetworkType): MosaicSupplyChangeTransaction {
    return MosaicSupplyChangeTransaction.create(
      Deadline.create(),
      new MosaicId(mosaicId),
      mosaicSupplyType,
      UInt64.fromUint(supply),
      network);

  }


  registerRootNamespaceTransaction(name: string, network: NetworkType, duration: number = 100): RegisterNamespaceTransaction {
    // Crear namespace transaction
    console.log('duration;', duration)
    return RegisterNamespaceTransaction.createRootNamespace(
      Deadline.create(23),
      name,
      UInt64.fromUint(duration),
      network);

  }



  registersubNamespaceTransaction(rootNamespace: string, subnamespaceName: string, network: NetworkType): RegisterNamespaceTransaction {
    // Crear namespace transaction
    return RegisterNamespaceTransaction.createSubNamespace(
      Deadline.create(23),
      subnamespaceName,
      rootNamespace,
      network);

  }
  /**
   *
   *
   * @param {string} mosaicName
   * @param {string} rootnamespaceName
   * @param {boolean} supplyMutable
   * @param {boolean} transferable
   * @param {boolean} levyMutable
   * @param {number} divisibility
   * @param {number} duration
   * @returns
   * @memberof NemProvider
   */
  buildRegisterMosaicTransaction(mosaicName: string, rootnamespaceName: string, supplyMutable: boolean, transferable: boolean, levyMutable: boolean, divisibility: number, duration: number, network: NetworkType) {
    return MosaicDefinitionTransaction.create(
      Deadline.create(),
      mosaicName,
      rootnamespaceName,
      MosaicProperties.create({
        supplyMutable: supplyMutable,
        transferable: transferable,
        levyMutable: levyMutable,
        divisibility: divisibility,
        duration: UInt64.fromUint(duration)
      }),
      network);
  }



  // **********************************************************************

  /**
     * Get account info from address
     *
     * @param {Address} address
     * @returns {Observable<AccountInfo>}
     * @memberof NemProvider
     */
  getAccountInfo(address: Address): Observable<AccountInfo> {
    return this.accountHttp.getAccountInfo(address)
  }
}
