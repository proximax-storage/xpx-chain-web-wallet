import { Injectable } from "@angular/core";
import { environment } from 'src/environments/environment';
import {
  NEMLibrary,
  AccountHttp,
  Password,
  SimpleWallet,
  Address,
  AccountOwnedAssetService,
  AssetHttp,
  AssetTransferable,
  ServerConfig,
  Account,
  TransferTransaction,
  TimeWindow,
  XEM,
  PlainMessage,
  AssetId,
  TransactionHttp,
  AccountInfoWithMetaData,
} from "nem-library";
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class NemServiceService {
  wallets: SimpleWallet[];
  accountHttp: AccountHttp;
  assetHttp: AssetHttp;
  transactionHttp: TransactionHttp;
  nodes: ServerConfig[];

  constructor() {
    NEMLibrary.bootstrap(environment.nis1.networkType);
    this.nodes = environment.nis1.nodes;
    this.accountHttp = new AccountHttp(this.nodes);
    this.transactionHttp = new TransactionHttp(this.nodes);
    this.assetHttp = new AssetHttp(this.nodes);

    console.log(this.accountHttp);
    console.log(this.transactionHttp);
    console.log(this.assetHttp);
  }

  /**
   * Create Wallet from private key
   * @param walletName wallet idenitifier for app
   * @param password wallet's password
   * @param privateKey account privateKey
   * @param selected network
   * @memberof NemServiceService
   * @return Promise with wallet created
   */
  createPrivateKeyWallet(walletName: string, password: string, privateKey: string): SimpleWallet {
    return SimpleWallet.createWithPrivateKey(
      walletName,
      new Password(password),
      privateKey
    );
  }

  /**
   * Method to get Account Info Address
   * @param address account address
   * @memberof NemServiceService
   * @return Observable<AccountInfoWithMetaData>
   */
  getAccountInfo(address: Address): Observable<AccountInfoWithMetaData> {
    return this.accountHttp.getFromAddress(address);
  }

  /**
   * Method to search mosaics of address
   * @param {Address} address address of the mosaics sought
   * @memberof NemServiceService
   * @returns Observable<AssetTransferable[]>
   */
  getOwnedMosaics(address: Address): Observable<AssetTransferable[]> {
    let accountOwnedMosaics = new AccountOwnedAssetService(this.accountHttp, this.assetHttp);
    return accountOwnedMosaics.fromAddress(address).pipe(timeout(3000));
  }

  /**
   * Method to create an account from privatekey
   * @param {string} privateKey account privateKey
   * @memberof NemServiceService
   * @returns Account
   */
  createAccountPrivateKey(privateKey: string): Account {
    return Account.createWithPrivateKey(privateKey);
  }

  /**
   * Method to create transaction
   * @param {PlainMessage} message Transfer transaction message
   * @param {AssetId} assetId Mosaics transferable
   * @param {number} quantity quantity of mosaics to transfer
   * @memberof NemServiceService
   * @returns TransferTransaction
   */
  async createTransaction(message: PlainMessage, assetId: AssetId, quantity: number) {
    const resultAssets = await this.assetHttp.getAssetTransferableWithRelativeAmount(assetId, quantity).toPromise();
    console.log('\n\n\n\nValue resultAssets:\n', resultAssets, '\n\n\n\nEnd value\n\n');
    return TransferTransaction.createWithAssets(
      TimeWindow.createWithDeadline(),
      new Address(environment.nis1.address),
      [resultAssets],
      message
    );
  }

  /**
   * Method to anounce transaction
   * @param transferTransaction data of transfer transaction
   * @param cosignerAccount account of consigner
   * @memberof NemServiceService
   * @returns Observable
   */
  anounceTransaction(transferTransaction: TransferTransaction, cosignerAccount: Account) {
    const signedTransaction = cosignerAccount.signTransaction(transferTransaction);
    console.log('\n\n\n\nValue signedTransaction:\n', signedTransaction, '\n\n\n\nEnd value\n\n');
    return this.transactionHttp.announceTransaction(signedTransaction).toPromise();
  }

  /**
   * Method to format Address
   * @param {string} address address account
   * @memberof NemServiceService
   * @returns Address
   */
  createAddressToString(address: string): Address {
    return new Address(address);
  }
}
