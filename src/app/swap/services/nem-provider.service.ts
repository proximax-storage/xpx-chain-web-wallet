import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { Observable, Subscription } from 'rxjs';
import * as js_joda_1 from 'js-joda';
import { timeout, first } from 'rxjs/operators';
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
  MultisigTransaction,
  PublicAccount,
  Transaction
} from "nem-library";

import { WalletService, AccountsInfoNis1Interface, CosignatoryOf } from '../../wallet/services/wallet.service';
import { TransactionsService } from '../../transactions/services/transactions.service';
import { AppConfig } from '../../config/app.config';
import { environment } from '../../../environments/environment';
import { SharedService } from '../../shared/services/shared.service';


@Injectable({
  providedIn: 'root'
})
export class NemProviderService {

  accountHttp: AccountHttp;
  assetHttp: AssetHttp;
  nodes: ServerConfig[];
  transactionHttp: TransactionHttp;

  constructor(
    private http: HttpClient,
    private sharedService: SharedService,
    private transactionService: TransactionsService,
    private walletService: WalletService
  ) {
    NEMLibrary.bootstrap(environment.nis1.networkType);
    this.nodes = environment.nis1.nodes;
    this.accountHttp = new AccountHttp(this.nodes);
    this.transactionHttp = new TransactionHttp(this.nodes);
    this.assetHttp = new AssetHttp(this.nodes);
  }
  /**
   *
   *
   * @param {Account} account
   * @param {string} name
   * @memberof NemProviderService
   */
  async getAccountInfoNis1(account: Account, name: string) {
    try {
      let nis1AccountsInfo: AccountsInfoNis1Interface;
      let cosignatoryOf: CosignatoryOf[] = [];
      let accountsMultisigInfo = [];
      const addressOwnedSwap = this.createAddressToString(account.address['value']);
      const accountInfoOwnedSwap = await this.getAccountInfo(addressOwnedSwap).pipe(first()).pipe((timeout(10000))).toPromise();
      // INFO ACCOUNTS MULTISIG
      if (accountInfoOwnedSwap['meta']['cosignatoryOf'].length > 0) {
        cosignatoryOf = accountInfoOwnedSwap['meta']['cosignatoryOf'];
        for (let multisig of cosignatoryOf) {
          try {
            const addressMultisig = this.createAddressToString(multisig.address);
            const ownedMosaic = await this.getOwnedMosaics(addressMultisig).pipe(first()).pipe((timeout(10000))).toPromise();
            const xpxFound = ownedMosaic.find(el => el.assetId.namespaceId === 'prx' && el.assetId.name === 'xpx');
            if (xpxFound) {
              multisig.balance = await this.validateBalanceAccounts(xpxFound, addressMultisig);
              accountsMultisigInfo.push(multisig);
            }
          } catch (error) {
            cosignatoryOf = [];
            accountsMultisigInfo = [];
          }
        }
      }

      // SEARCH INFO OWNED SWAP
      try {
        const ownedMosaic = await this.getOwnedMosaics(addressOwnedSwap).pipe(first()).pipe((timeout(10000))).toPromise();
        const xpxFound = ownedMosaic.find(el => el.assetId.namespaceId === 'prx' && el.assetId.name === 'xpx');
        if (xpxFound) {
          const balance = await this.validateBalanceAccounts(xpxFound, addressOwnedSwap);
          nis1AccountsInfo = this.buildAccountInfoNIS1(account, accountsMultisigInfo, balance, cosignatoryOf, false, name, xpxFound);
          this.walletService.setNis1AccountsFound$(nis1AccountsInfo);
        } else if (cosignatoryOf.length > 0) {
          nis1AccountsInfo = this.buildAccountInfoNIS1(account, accountsMultisigInfo, null, cosignatoryOf, false, name, null);
          this.walletService.setNis1AccountsFound$(nis1AccountsInfo);
        } else {
          this.walletService.setNis1AccountsFound$(null);
        }
      } catch (error) {
        // Valida si es cosignatario
        if (cosignatoryOf.length > 0) {
          nis1AccountsInfo = this.buildAccountInfoNIS1(account, accountsMultisigInfo, null, cosignatoryOf, false, name, null);
          this.walletService.setNis1AccountsFound$(nis1AccountsInfo);
        } else {
          this.walletService.setNis1AccountsFound$(null);
        }
      }
    } catch (error) {
      this.walletService.setNis1AccountsFound$(null);
    }
  }

  /**
   *
   *
   * @param {AssetTransferable} xpxFound
   * @param {Address} addressMultisig
   * @returns
   * @memberof NemProviderService
   */
  async validateBalanceAccounts(xpxFound: AssetTransferable, addressMultisig: Address) {
    console.log('addressMultisig ---> ', addressMultisig);
    const quantityFillZeros = this.transactionService.addZeros(xpxFound.properties.divisibility, xpxFound.quantity);
    const realQuantity: any = this.amountFormatter(quantityFillZeros, xpxFound, xpxFound.properties.divisibility);
    const transactions = await this.getUnconfirmedTransaction(addressMultisig);
    console.log('transactions multisig ----> ', transactions);
    if (transactions.length > 0) {
      let relativeAmount = realQuantity;
      for (const item of transactions) {
        if (item.type === 257 && item['signer']['address']['value'] === addressMultisig['value']) {
          if (item['_assets'].length > 0) {
            const existMosaic = item['_assets'].find(mosaic => mosaic.assetId.namespaceId === 'prx' && mosaic.assetId.name === 'xpx');
            if (existMosaic) {
              const quantity = parseFloat(this.amountFormatter(existMosaic.quantity, xpxFound, xpxFound.properties.divisibility));
              const quantitywhitoutFormat = relativeAmount.split(',').join('');
              const quantityFormat = this.amountFormatter(parseInt((quantitywhitoutFormat - quantity).toString().split('.').join('')), xpxFound, xpxFound.properties.divisibility);
              relativeAmount = quantityFormat;
            }
          }
        }
      }

      return relativeAmount;
    } else {
      return realQuantity;
    }
  }

  /**
   *
   *
   * @param {PlainMessage} message
   * @param {AssetId} assetId
   * @param {number} quantity
   * @returns
   * @memberof NemProviderService
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
   *
   *
   * @param {(TransferTransaction | MultisigTransaction)} transaction
   * @param {Account} cosignerAccount
   * @returns
   * @memberof NemProviderService
   */
  anounceTransaction(transaction: TransferTransaction | MultisigTransaction, cosignerAccount: Account) {
    const signedTransaction = cosignerAccount.signTransaction(transaction);
    return this.http.post(`${environment.nis1.url}/transaction/announce`, signedTransaction);
  }

  /**
   *
   *
   * @param {number} amountParam
   * @param {AssetTransferable} mosaic
   * @param {number} [manualDivisibility=0]
   * @returns
   * @memberof NemProviderService
   */
  amountFormatter(amountParam: number, mosaic: AssetTransferable, manualDivisibility: number = 0) {
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
   *
   *
   * @param {Account} account
   * @param {string} name
   * @param {CosignatoryOf[]} cosignersAccounts
   * @param {any[]} accountsMultisigInfo
   * @param {AssetTransferable} mosaic
   * @returns
   * @memberof NemProviderService
   */
  buildAccountInfoNIS1(
    account: Account,
    accountsMultisigInfo: any[],
    balance: any,
    cosignersAccounts: CosignatoryOf[],
    isMultiSign: boolean,
    name: string,
    xpxFound: AssetTransferable
  ) {
    return {
      nameAccount: name,
      address: account.address,
      publicKey: account.publicKey,
      cosignerOf: (cosignersAccounts.length > 0) ? true : false,
      cosignerAccounts: cosignersAccounts,
      multisigAccountsInfo: accountsMultisigInfo,
      mosaic: xpxFound,
      isMultiSig: isMultiSign,
      balance: balance
    };
  }

  /**
   *
   *
   * @param {string} address
   * @returns {Address}
   * @memberof NemProviderService
   */
  createAddressToString(address: string): Address {
    return new Address(address);
  }

  /**
   *
   *
   * @param {string} privateKey
   * @returns {Account}
   * @memberof NemProviderService
   */
  createAccountPrivateKey(privateKey: string): Account {
    return Account.createWithPrivateKey(privateKey);
  }

  /**
   *
   *
   * @param {number} [deadline=2]
   * @param {*} [chronoUnit=js_joda_1.ChronoUnit.HOURS]
   * @returns {TimeWindow}
   * @memberof NemProviderService
   */
  createWithDeadline(deadline: number = 2, chronoUnit: any = js_joda_1.ChronoUnit.HOURS): TimeWindow {
    const currentTimeStamp = (new Date()).getTime() - 600000;
    const timeStampDateTime = js_joda_1.LocalDateTime.ofInstant(js_joda_1.Instant.ofEpochMilli(currentTimeStamp), js_joda_1.ZoneId.SYSTEM);
    const deadlineDateTime = timeStampDateTime.plus(deadline, chronoUnit);
    if (deadline <= 0) {
      throw new Error("deadline should be greater than 0");
    } else if (timeStampDateTime.plus(24, js_joda_1.ChronoUnit.HOURS).compareTo(deadlineDateTime) != 1) {
      throw new Error("deadline should be less than 24 hours");
    }
    return new TimeWindow(timeStampDateTime, deadlineDateTime);
  }

  /**
   *
   *
   * @param {Address} address
   * @returns
   * @memberof NemProviderService
   */
  getAccountInfo(address: Address) {
    return this.http.get(`${environment.nis1.url}/account/get?address=${address.plain()}`);
  }

  /**
   *
   *
   * @param {Address} address
   * @returns {Observable<AssetTransferable[]>}
   * @memberof NemProviderService
   */
  getOwnedMosaics(address: Address): Observable<AssetTransferable[]> {
    const accountOwnedMosaics = new AccountOwnedAssetService(this.accountHttp, this.assetHttp);
    return accountOwnedMosaics.fromAddress(address);
  }

  /**
   *
   *
   * @param {Address} address
   * @returns {Promise<Transaction[]>}
   * @memberof NemProviderService
   */
  getUnconfirmedTransaction(address: Address): Promise<Transaction[]> {
    return this.accountHttp.unconfirmedTransactions(address).toPromise();
  }

  /**
   *
   *
   * @param {number} errorCode
   * @memberof NemProviderService
   */
  showMessageError(errorCode: number) {
    switch (errorCode) {
      case 521:
      case 535:
      case 542:
      case 551:
      case 565:
      case 582:
      case 591:
      case 610:
      case 622:
      case 672:
      case 711:
        this.sharedService.showError('Error', 'Some data is invalid');
        break;

      case 501:
      case 635:
      case 641:
      case 685:
      case 691:
        this.sharedService.showError('Error', 'Service not available');
        break;

      case 655:
      case 666:
        this.sharedService.showError('Error', 'insufficient XPX Balance');
        break;

      case 511:
        this.sharedService.showError('Error', 'Daily limit exceeded (5 swaps)');
        break;

      case 705:
        this.sharedService.showError('Error', 'Invalid Url');
        break;

      default:
        if (error.error.message) {
          this.sharedService.showError('Error', error.error.message.toString().split('_').join(' '));
        } else {
          this.sharedService.showError('Error', 'Error! try again later');
        }
        break;
    }
  }
}


