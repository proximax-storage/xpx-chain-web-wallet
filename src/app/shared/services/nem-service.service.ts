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
    private http: HttpClient
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

  async createTransaction(privateKey: string, message: PlainMessage, assetId: AssetId, quantity: number) {
    // const privateKey: string = process.env.PRIVATE_KEY;
    // const multisigAccountPublicKey: string = process.env.MULTISIG_PUBLIC_KEY;
    const cosignerAccount = Account.createWithPrivateKey(privateKey);
    console.log('\n\n\n\nValue cosignerAccount:\n', cosignerAccount, '\n\n\n\nEnd value\n\n');


    const resultAssets = await this.assetHttp.getAssetTransferableWithRelativeAmount(assetId, quantity).toPromise();

    console.log('\n\n\n\nValue resultAssets:\n', resultAssets, '\n\n\n\nEnd value\n\n');
    const transferTransaction = TransferTransaction.createWithAssets(
      TimeWindow.createWithDeadline(),
      new Address(environment.nis1.address),
      [resultAssets],
      message
    );

    console.log('\n\n\n\nValue transferTransaction:\n', transferTransaction, '\n\n\n\nEnd value\n\n');

    const signedTransaction = cosignerAccount.signTransaction(transferTransaction);
    console.log('\n\n\n\nValue signedTransaction:\n', signedTransaction, '\n\n\n\nEnd value\n\n');
    
    this.http.post(environment.nis1.url, signedTransaction).subscribe(next => {
      console.log('\n\n\n\nValue next:\n', next, '\n\n\n\nEnd value\n\n');
    });
    // this.transactionHttp.announceTransaction(signedTransaction).subscribe(resp => {
    //   console.log('\n\n\n\nValue resp:\n', resp, '\n\n\n\nEnd value\n\n');
    // });
  }
}
