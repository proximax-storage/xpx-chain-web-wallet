import { Injectable, OnInit } from "@angular/core";
import { Observable } from "rxjs";
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
} from "nem-library";
import { HttpClient } from '@angular/common/http';
import { SharedService } from './shared.service';
@Injectable({
  providedIn: 'root'
})
export class NemServiceService {
  wallets: SimpleWallet[];
  accountHttp: AccountHttp;
  assetHttp: AssetHttp;
  transactionHttp: TransactionHttp;
  nodes: ServerConfig[];

  constructor(
    private sharedService: SharedService
  ) {
    NEMLibrary.bootstrap(environment.nis1.networkType);
    this.nodes = environment.nis1.nodes;
    this.accountHttp = new AccountHttp(this.nodes);
    this.transactionHttp = new TransactionHttp(this.nodes);
    this.assetHttp = new AssetHttp(this.nodes);
    // this.accountHttp = new AccountHttp();
    // this.assetHttp = new AssetHttp();
    // this.transactionHttp = new TransactionHttp();
  }

  /**
   * Create Wallet from private key
   * @param walletName wallet idenitifier for app
   * @param password wallet's password
   * @param privateKey account privateKey
   * @param selected network
   * @return Promise with wallet created
   */
  createPrivateKeyWallet(walletName: string, password: string, privateKey: string): SimpleWallet {
    return SimpleWallet.createWithPrivateKey(
      walletName,
      new Password(password),
      privateKey
    );
  }

  getOwnedMosaics(address: Address): Promise<AssetTransferable[]> {
    let accountOwnedMosaics = new AccountOwnedAssetService(this.accountHttp, this.assetHttp);
    return accountOwnedMosaics.fromAddress(address).toPromise();
  }

  createAccountPrivateKey(privateKey: string) {
    return Account.createWithPrivateKey(privateKey);
  }

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
  
  anounceTransaction(transferTransaction: TransferTransaction, cosignerAccount: Account) {
    const signedTransaction = cosignerAccount.signTransaction(transferTransaction);
    console.log('\n\n\n\nValue signedTransaction:\n', signedTransaction, '\n\n\n\nEnd value\n\n');
  
    return this.transactionHttp.announceTransaction(signedTransaction).toPromise();
  }
}
