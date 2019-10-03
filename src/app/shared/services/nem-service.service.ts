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
  PlainMessage,
  AssetId,
  TransactionHttp,
  AccountInfoWithMetaData,
  MultisigTransaction,
  PublicAccount,
  Transaction
} from "nem-library";
import { Observable } from 'rxjs';
import { timeout, first } from 'rxjs/operators';
import { WalletService } from 'src/app/wallet/services/wallet.service';
import { TransactionsService } from 'src/app/transactions/services/transactions.service';
import { AppConfig } from 'src/app/config/app.config';
import { HttpClient } from '@angular/common/http';
import * as js_joda_1 from 'js-joda';
@Injectable({
  providedIn: 'root'
})
export class NemServiceService {
  wallets: SimpleWallet[];
  accountHttp: AccountHttp;
  assetHttp: AssetHttp;
  transactionHttp: TransactionHttp;
  accountHt: AccountHttp;
  assetHt: AssetHttp;
  transactionHt: TransactionHttp;
  nodes: ServerConfig[];

  /**
   * Start the connection to the NEM nodes
   * @param walletService
   * @param transactionService
   */
  constructor(
    private walletService: WalletService,
    private transactionService: TransactionsService,
    private http: HttpClient
  ) {
    NEMLibrary.bootstrap(environment.nis1.networkType);
    this.nodes = environment.nis1.nodes;
    this.accountHttp = new AccountHttp(this.nodes);
    this.transactionHttp = new TransactionHttp(this.nodes);
    this.assetHttp = new AssetHttp(this.nodes);
  }

  /**
   * Formatter Amount
   * @param {number} amount
   * @param {AssetId} mosaic
   * @param manualDivisibility
   * @returns amountFormatter
   * @memberof NemServiceService
   */
  amountFormatter(amountParam: number, mosaic: AssetTransferable, manualDivisibility = 0) {
    const divisibility = (manualDivisibility === 0) ? manualDivisibility : mosaic.properties.divisibility;
    const amountDivisibility = Number(
      amountParam / Math.pow(10, divisibility)
    );

    const amountFormatter = amountDivisibility.toLocaleString("en-us", {
      minimumFractionDigits: divisibility
    });
    return amountFormatter;
  }
  
  /**
   * Method to anounce transaction
   * @param {TransferTransaction | MultisigTransaction} transferTransaction data of transfer transaction
   * @param {Account} cosignerAccount account of consigner
   * @memberof NemServiceService
   * @returns Observable
   */
  anounceTransaction(transaction: TransferTransaction | MultisigTransaction, cosignerAccount: Account) {
    const signedTransaction = cosignerAccount.signTransaction(transaction);
    return this.http.post(`${environment.nis1.url}/transaction/announce`, signedTransaction);
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
   * Method to format Address
   * @param {string} address address account
   * @memberof NemServiceService
   * @returns Address
   */
  createAddressToString(address: string): Address {
    return new Address(address);
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
   * Method to create public account
   * @param {string} publicKey
   * @memberof NemServiceService
   * @returns PublicAccount
   */
  createPublicAccount(publicKey: string): PublicAccount {
    return PublicAccount.createWithPublicKey(publicKey);
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
    return TransferTransaction.createWithAssets(
      this.createWithDeadline(),
      new Address(environment.nis1.address),
      [resultAssets],
      message
    );
  }

  /**
   * Method to anounce transaction
   * @param transaction data of transfer transaction
   * @param publicAccounMulti account of consigner
   * @param cosignerAccount account of consigner
   * @memberof NemServiceService
   * @returns Observable
   */
  async createTransactionMultisign(transaction: TransferTransaction, publicAccounMulti: PublicAccount) {
    return MultisigTransaction.create(
      this.createWithDeadline(),
      transaction,
      publicAccounMulti
    );
  }

  /**
   * Method to calculate the deadline
   * @param deadline
   * @param chronoUnit
   * @memberof NemServiceService
   * @returns TimeWindow
   */
  createWithDeadline(deadline = 2, chronoUnit = js_joda_1.ChronoUnit.HOURS): TimeWindow {
    const currentTimeStamp = (new Date()).getTime() - 600000;
    const timeStampDateTime = js_joda_1.LocalDateTime.ofInstant(js_joda_1.Instant.ofEpochMilli(currentTimeStamp), js_joda_1.ZoneId.SYSTEM);
    const deadlineDateTime = timeStampDateTime.plus(deadline, chronoUnit);
    if (deadline <= 0) {
      throw new Error("deadline should be greater than 0");
    }
    else if (timeStampDateTime.plus(24, js_joda_1.ChronoUnit.HOURS).compareTo(deadlineDateTime) != 1) {
      throw new Error("deadline should be less than 24 hours");
    }
    return new TimeWindow(timeStampDateTime, deadlineDateTime);
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
   * Method to get Account Info Address
   * @param address account address
   * @memberof NemServiceService
   */
  getAccountsInfo(accounts: any) {
    for (const element of accounts) {
      if (element.nis1Account !== null) {
        const address = this.createAddressToString(element.nis1Account.address.value);
        this.getAccountInfo(address).pipe(first()).pipe((timeout(15000))).subscribe(
          next => {
            let consignerOf: boolean = false;
            let consignerAccountsInfo: any = [];

            if (next.cosignatoryOf.length > 0) {
              consignerOf = true;
              consignerAccountsInfo = next.cosignatoryOf;
            }
            const accountNis1 = {
              nameAccount: element.name,
              address: address,
              publicKey: element.nis1Account.publicKey,
              consignerOf: consignerOf,
              consignerAccounts: consignerAccountsInfo
            }

            this.walletService.setNis1AccounsWallet(accountNis1);
          },
          error => {
            const accountNis1 = {
              nameAccount: element.name,
              address: address,
              publicKey: element.nis1Account.publicKey,
              consignerOf: false,
              consignerAccounts: []
            }

            this.walletService.setNis1AccounsWallet(accountNis1);
          }
        );
      }
    }
  }

  /**
   * Method to get Account Info Address
   * @param address account address
   * @memberof NemServiceService
   */
  getAccountsInfoAccountNew(account: any, name: string) {
    const address = this.createAddressToString(account.address.value);
    this.getAccountInfo(address).pipe(first()).pipe((timeout(10000))).subscribe(
      next => {
        let consignerOf: boolean = false;
        let consignerAccountsInfo: any = [];

        if (next.cosignatoryOf.length > 0) {
          consignerOf = true;
          consignerAccountsInfo = next.cosignatoryOf;
        }

        this.getOwnedMosaics(address).pipe(first()).pipe((timeout(10000))).subscribe(
          async next => {
            for (const el of next) {
              if (el.assetId.namespaceId === 'prx' && el.assetId.name === 'xpx') {
                let realQuantity = null;
                realQuantity = this.transactionService.addZeros(el.properties.divisibility, el.quantity);
                realQuantity = this.amountFormatter(realQuantity, el, el.properties.divisibility);
                const transactions = await this.getUnconfirmedTransaction(account.address);
                let balance = 0;
                if (transactions.length > 0) {
                  let relativeAmount = realQuantity;
                  for (const item of transactions) {
                    if (item.type === 257 && item['signer']['address']['value'] === address['value']) {
                      for (const mosaic of item['_assets']) {
                        if (mosaic.assetId.namespaceId === 'prx' && mosaic.assetId.name === 'xpx') {
                          const quantity = parseFloat(this.amountFormatter(mosaic.quantity, el, el.properties.divisibility));
                          const quantitywhitoutFormat = relativeAmount.split(',').join('');
                          const quantityFormat = this.amountFormatter(parseInt((quantitywhitoutFormat - quantity).toString().split('.').join('')), el, el.properties.divisibility);
                          relativeAmount = quantityFormat;
                        }
                      }
                    }
                  }
                  balance = relativeAmount;
                } else {
                  balance = realQuantity;
                }
                const accountNis1 = {
                  nameAccount: name,
                  address: account.address,
                  publicKey: account.publicKey,
                  consignerOf: consignerOf,
                  consignerAccounts: consignerAccountsInfo,
                  mosaic: el,
                  multiSign: false,
                  balance: balance,
                  route: `/${AppConfig.routes.viewAllAccount}`
                }
                this.walletService.setNis1AccounsWallet(accountNis1);
              }
            }
          },
          error => {
            const accountNis1 = {
              nameAccount: name,
              address: account.address,
              publicKey: account.publicKey,
              consignerOf: consignerOf,
              consignerAccounts: consignerAccountsInfo,
              mosaic: null,
              multiSign: false,
              balance: '0.000000',
              route: `/${AppConfig.routes.viewAllAccount}`
            }
            this.walletService.setNis1AccounsWallet(accountNis1);
          }
        )
      },
      error => {
        const accountNis1 = {
          nameAccount: name,
          address: account.address,
          publicKey: account.publicKey,
          consignerOf: false,
          consignerAccounts: [],
          mosaic: null,
          multiSign: false,
          balance: '0.000000',
          route: `/${AppConfig.routes.viewAllAccount}`
        }

        this.walletService.setNis1AccounsWallet(accountNis1);
      }
    )
  }

  /**
   * Method to search mosaics of address
   * @param {Address} address address of the mosaics sought
   * @memberof NemServiceService
   * @returns Observable<AssetTransferable[]>
   */
  getOwnedMosaics(address: Address): Observable<AssetTransferable[]> {
    let accountOwnedMosaics = new AccountOwnedAssetService(this.accountHttp, this.assetHttp);
    return accountOwnedMosaics.fromAddress(address);
  }

  /**
   * Method to get Unconfirmed transactions of an account
   * @param address
   * @memberof NemServiceService
   * @returns Observable<Transaction[]>
   */
  getUnconfirmedTransaction(address: Address): Promise<Transaction[]> {
    return this.accountHttp.unconfirmedTransactions(address).toPromise();
  }
}
