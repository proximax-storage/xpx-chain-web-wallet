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
        // console.log('--------cosignerAccountsInfo-----------', cosignatoryOf)
        for (let multisig of cosignatoryOf) {
          try {
            const addressMultisig = this.createAddressToString(multisig.address);
            const ownedMosaic = await this.getOwnedMosaics(addressMultisig).pipe(first()).pipe((timeout(10000))).toPromise();
            // console.log('-----------ownedMosaic multisig-----------', ownedMosaic);
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
        // console.log('accountsMultisigInfo --->', accountsMultisigInfo);
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

}


