import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subscription, Subject } from 'rxjs';
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
  PublicAccount,
  AssetId,
  TransactionHttp,
  MultisigTransaction,
  Transaction
} from 'nem-library';
import { PublicAccount as PublicAccountTsjs, Message } from 'tsjs-xpx-chain-sdk';

import { WalletService, AccountsInterface } from '../../wallet/services/wallet.service';
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
  nis1AccountSelected: AccountsInfoNis1Interface = null;
  nis1AccountsFoundSubject: Subject<AccountsInfoNis1Interface> = new Subject<AccountsInfoNis1Interface>(); // RJ
  nis1AccountsFound$: Observable<AccountsInfoNis1Interface> = this.nis1AccountsFoundSubject.asObservable(); // RJ
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
   * @param {PlainMessage} message
   * @param {AssetId} assetId
   * @param {number} quantity
   * @returns
   * @memberof NemProviderService
   */
  async createTransaction(message: PlainMessage, assetId: AssetId, quantity: number) {
    // console.log('my quantity to send -->', quantity);
    const resultAssets: any = await this.assetHttp.getAssetTransferableWithAbsoluteAmount(assetId, quantity).toPromise();
    console.log('RESULT ASSETS', resultAssets);
    const part = quantity.toString().split('.');
    const d = resultAssets.properties.divisibility;
    const cant = (part.length === 1) ? d : d - part[1].length;
    for (let index = 0; index < cant; index++) {
      if (part.length === 1) {
        part[0] += 0;
      } else {
        part[1] += 0;
      }
    }

    resultAssets['quantity'] = Number(part.join(''));
    // resultAssets['quantity'] = quantity * 1000000;
    console.log('\n QUANTITY FORMATTER TO SEND -->', resultAssets['quantity']);
    return TransferTransaction.createWithAssets(
      this.createWithDeadline(),
      new Address(environment.nis1.burnAddress),
      [resultAssets],
      message
    );
  }



  /**
   *
   *
   * @param {Account} account
   * @param {string} name
   * @memberof NemProviderService
   */
  async getAccountInfoNis1(publicAccount: PublicAccount, name: string) {
    try {
      const allowedMosaics = environment.swapAllowedMosaics;
      let cosignatoryOf: CosignatoryOf[] = [];
      let accountsMultisigInfo = [];
      const addressOwnedSwap = this.createAddressToString(publicAccount.address.pretty());
      const accountInfoOwnedSwap = await this.getAccountInfo(addressOwnedSwap).pipe(first()).pipe((timeout(environment.timeOutTransactionNis1))).toPromise();
      // console.log('accountInfoOwnedSwap', accountInfoOwnedSwap);
      if (accountInfoOwnedSwap['meta']['cosignatories'].length === 0) {
        let nis1AccountsInfo: AccountsInfoNis1Interface;
        // INFO ACCOUNTS MULTISIG
        if (accountInfoOwnedSwap['meta']['cosignatoryOf'].length > 0) {
          cosignatoryOf = accountInfoOwnedSwap['meta']['cosignatoryOf'];
          for (const multisig of cosignatoryOf) {
            try {
              const addressMultisig = this.createAddressToString(multisig.address);
              const ownedMosaic = await this.getOwnedMosaics(addressMultisig).pipe(first()).pipe((timeout(environment.timeOutTransactionNis1))).toPromise();
              // const xpxFound = ownedMosaic.find(el => el.assetId.namespaceId === 'prx' && el.assetId.name === 'xpx');
              const mosaicsFound = ownedMosaic.filter(e => allowedMosaics.find(d => d.namespaceId === e.assetId.namespaceId && d.name === e.assetId.name));
              if (mosaicsFound) {
                const balances = [];
                const unconfirmedTxn = await this.getUnconfirmedTransaction(addressOwnedSwap);
                for (const element of mosaicsFound) {
                  const amount = await this.validateBalanceAccounts(element, addressOwnedSwap, unconfirmedTxn);
                  // tslint:disable-next-line: radix
                  if (parseInt(amount) > 0) {
                    balances.push({ assetId: element.assetId, amount });
                  }
                }
                console.log('balances --->', balances);
                multisig.balances = balances;
                multisig.mosaics = mosaicsFound;
                // multisig.balance = await this.validateBalanceAccounts(xpxFound, addressMultisig, element.properties.divisibility);
                // multisig.balance = await this.validateBalanceAccounts(xpxFound, addressMultisig);
                // multisig.mosaic = xpxFound;
                accountsMultisigInfo.push(multisig);
              }
            } catch (error) {
              cosignatoryOf = [];
              accountsMultisigInfo = [];
            }
          }
        }

        try {
          // SEARCH INFO OWNED SWAP
          const ownedMosaic = await this.getOwnedMosaics(addressOwnedSwap).pipe(first()).pipe((timeout(environment.timeOutTransactionNis1))).toPromise();
          const mosaicsFound = ownedMosaic.filter(e => allowedMosaics.find(d => d.namespaceId === e.assetId.namespaceId && d.name === e.assetId.name));
          if (mosaicsFound) {
            console.log('MOSAICS FOUND ---->', mosaicsFound);
            const balances = [];
            const unconfirmedTxn = await this.getUnconfirmedTransaction(addressOwnedSwap);
            for (const element of mosaicsFound) {
              const amount = await this.validateBalanceAccounts(element, addressOwnedSwap, unconfirmedTxn);
              console.log('#####my amount is --->', amount);
              // tslint:disable-next-line: radix
              if (parseInt(amount) > 0) {
                balances.push({ assetId: element.assetId, amount });
              }
            }
            console.log('balances --->', balances);
            nis1AccountsInfo = this.buildAccountInfoNIS1(publicAccount, accountsMultisigInfo, balances, cosignatoryOf, false, name, mosaicsFound);
            console.log('nis1AccountsInfo --->', nis1AccountsInfo);
            this.setNis1AccountsFound$(nis1AccountsInfo);
          } else if (cosignatoryOf.length > 0) {
            // console.log('cosignatoryOf zero');
            nis1AccountsInfo = this.buildAccountInfoNIS1(publicAccount, accountsMultisigInfo, null, cosignatoryOf, false, name, null);
            this.setNis1AccountsFound$(nis1AccountsInfo);
          } else {
            // console.log('The account has no balance to swap.');
            this.sharedService.showWarning('', 'The account has no balance to swap.');
            this.setNis1AccountsFound$(null);
          }
        } catch (error) {
          // console.log(error);
          this.sharedService.showWarning('', 'It was not possible to connect to the server, try later');
          this.setNis1AccountsFound$(null);
        }
      } else {
        this.sharedService.showWarning('', 'Swap does not support this account type');
        this.setNis1AccountsFound$(null);
        if (!this.walletService.currentWallet) {
          this.removeParamNis1WalletCreated(name);
        }
      }
    } catch (error) {
      // console.log(error);
      this.sharedService.showWarning('', 'It was not possible to connect to the server, try later.');
      this.setNis1AccountsFound$(null);
    }
  }

  /**
   *
   *
   * @param {TransferTransaction} transaction
   * @param {PublicAccount} publicAccountMultisig
   * @returns
   * @memberof NemProviderService
   */
  async createTransactionMultisign(transaction: TransferTransaction, publicAccountMultisig: PublicAccount) {
    return MultisigTransaction.create(
      this.createWithDeadline(),
      transaction,
      publicAccountMultisig
    );
  }

  /**
   *
   *
   * @param {AssetTransferable} xpxFound
   * @param {Address} addressSigner
   * @returns
   * @memberof NemProviderService
   */
  async validateBalanceAccounts(assetsFound: AssetTransferable, addressSigner: Address, unconfirmedTxn: Transaction[]) {
    console.log('\n\n ================ AssetsFound ================= ', assetsFound.assetId.name, '\n\n');
    const quantityFillZeros = this.transactionService.addZeros(assetsFound.properties.divisibility, assetsFound.quantity);
    let realQuantity: any = this.amountFormatter(quantityFillZeros, assetsFound, assetsFound.properties.divisibility);
    // const unconfirmedTxn = await this.getUnconfirmedTransaction(addressSigner);
    // console.log('Address  ---> ', addressSigner);
    if (unconfirmedTxn.length > 0) {
      console.log('realQuantity ---->', realQuantity);
      for (const item of unconfirmedTxn) {
        // console.log('transaction unconfirmed -->', item);
        // console.log('transaction unconfirmed --->', item['otherTransaction']['_assets']);
        let mosaicUnconfirmedTxn = null;
        if (item.type === 257 && item['signer']['address']['value'] === addressSigner['value'] && item['_assets'].length > 0) {
          mosaicUnconfirmedTxn = item['_assets'].find((e: AssetTransferable) => environment.swapAllowedMosaics.find(d =>
            d.namespaceId === e.assetId.namespaceId &&
            d.name === e.assetId.name &&
            assetsFound.assetId.namespaceId === e.assetId.namespaceId &&
            assetsFound.assetId.name === e.assetId.name
          ));
        } else if (item.type === 4100 && item['otherTransaction']['type'] === 257 && item['signer']['address']['value'] === addressSigner['value']) {
          mosaicUnconfirmedTxn = item['otherTransaction']['_assets'].find((e: AssetTransferable) => environment.swapAllowedMosaics.find(d =>
            d.namespaceId === e.assetId.namespaceId &&
            d.name === e.assetId.name &&
            assetsFound.assetId.namespaceId === e.assetId.namespaceId &&
            assetsFound.assetId.name === e.assetId.name
          ));
        }

        if (mosaicUnconfirmedTxn) {
          console.log('mosaic have unconfirmed txn -->', mosaicUnconfirmedTxn);
          const a = this.amountFormatter(mosaicUnconfirmedTxn.quantity, assetsFound, assetsFound.properties.divisibility);
          const unconfirmedFormatter = parseFloat(a.split(',').join(''));
          console.log('\n unconfirmedFormatter --->', unconfirmedFormatter);
          const quantityWhitoutFormat = realQuantity.split(',').join('');
          console.log('\nquantityWhitoutFormat --->', quantityWhitoutFormat);
          const residue = this.transactionService.subtractAmount(parseFloat(quantityWhitoutFormat), unconfirmedFormatter, assetsFound.properties.divisibility);
          console.log('\nresidue --->', residue, '\n');
          // tslint:disable-next-line: radix
          const quantityFormat = this.amountFormatter(parseInt((residue).toString().split('.').join('')), assetsFound, assetsFound.properties.divisibility);
          console.log('quantityFormat --->', quantityFormat);
          realQuantity = quantityFormat;
        }
      }

      return realQuantity;
    } else {
      return realQuantity;
    }
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
    // console.log('transaction', transaction);
    const signedTransaction = cosignerAccount.signTransaction(transaction);
    return this.http.post(`${environment.nis1.url}/transaction/announce`, signedTransaction).pipe(first()).pipe((timeout(environment.timeOutTransactionNis1)));
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
    console.log('amountParam', amountParam);
    const divisibility = (manualDivisibility === 0) ? manualDivisibility : mosaic.properties.divisibility;
    console.log('divisibility', divisibility);
    const amountDivisibility = Number(amountParam / Math.pow(10, divisibility));
    console.log('amountDivisibility', amountDivisibility);
    const amountFormatter = amountDivisibility.toLocaleString('en-us', { minimumFractionDigits: divisibility });
    console.log('amountFormatter', amountFormatter);
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
    publicAccount: PublicAccount,
    accountsMultisigInfo: any[],
    balances: any[],
    cosignersAccounts: CosignatoryOf[],
    isMultiSign: boolean,
    name: string,
    mosaics: AssetTransferable[]
  ): AccountsInfoNis1Interface {
    return {
      nameAccount: name,
      address: publicAccount.address,
      publicKey: publicAccount.publicKey,
      cosignerOf: (cosignersAccounts.length > 0) ? true : false,
      cosignerAccounts: cosignersAccounts,
      multisigAccountsInfo: accountsMultisigInfo,
      mosaics,
      isMultiSig: isMultiSign,
      balances
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
      throw new Error('deadline should be greater than 0');
    } else if (timeStampDateTime.plus(24, js_joda_1.ChronoUnit.HOURS).compareTo(deadlineDateTime) !== 1) {
      throw new Error('deadline should be less than 24 hours');
    }
    return new TimeWindow(timeStampDateTime, deadlineDateTime);
  }

  /**
   *
   *
   * @param {string} publicKey
   * @returns {PublicAccount}
   * @memberof NemProviderService
   */
  createPublicAccount(publicKey: string): PublicAccount {
    return PublicAccount.createWithPublicKey(publicKey);
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
    // console.log(accountOwnedMosaics);
    return accountOwnedMosaics.fromAddress(address);
  }

  /**
   *
   *
   * @param {*} network
   * @returns
   * @memberof NemProviderService
   */
  getNetworkType(network: string) {
    let networkData = null;
    if (typeof network === 'string') {
      switch (network) {
        case 'MAIN_NET':
          networkData = 104;
          break;
        case 'TEST_NET':
          networkData = -104;
          break;
        case 'MIJIN':
          networkData = 96;
          break;
      }
    } else if (typeof network === 'number') {
      switch (network) {
        case 104:
          networkData = 'MAIN_NET';
          break;
        case -104:
          networkData = 'TEST_NET';
          break;
        case 96:
          networkData = 'MIJIN';
          break;
      }
    }

    return networkData;
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
   * @returns {CurrentWalletTransNis[]}
   * @memberof NemProviderService
   */
  getWalletTransNisStorage(): WalletTransactionsNis1Interface[] {
    let walletsStorage = JSON.parse(localStorage.getItem(environment.nameKeyWalletTransactionsNis));
    if (walletsStorage === undefined || walletsStorage === null) {
      localStorage.setItem(environment.nameKeyWalletTransactionsNis, JSON.stringify([]));
      walletsStorage = JSON.parse(localStorage.getItem(environment.nameKeyWalletTransactionsNis));
    }
    return walletsStorage;
  }

  /**
   *
   *
   * @returns {Observable<AccountsInfoNis1Interface>}
   * @memberof NemProviderService
   */
  getNis1AccountsFound$(): Observable<AccountsInfoNis1Interface> {
    return this.nis1AccountsFound$;
  }

  /**
   * RJ
   *
   * @returns
   * @memberof WalletService
   */
  getSelectedNis1Account(): AccountsInfoNis1Interface {
    return this.nis1AccountSelected;
  }


  /**
   *
   *
   * @param {Transaction} transaction
   * @returns
   * @memberof NemProviderService
   */
  getTimeStampTimeWindow(transaction: Transaction) {
    const year = transaction.timeWindow.timeStamp['_date']['_year'];
    const month = transaction.timeWindow.timeStamp['_date']['_month'];
    const day = transaction.timeWindow.timeStamp['_date']['_day'];
    const hour = transaction.timeWindow.timeStamp['_time']['_hour'];
    const minutes = transaction.timeWindow.timeStamp['_time']['_minute'];
    const seconds = transaction.timeWindow.timeStamp['_time']['_second'];
    return `${year}-${month}-${day} ${hour}:${minutes}:${seconds}`;
  }

  /**
   *
   *
   * @param {*} str1
   * @returns
   * @memberof NemProviderService
   */
  hexToAscii(str1: string) {
    const hex = str1.toString();
    let str = '';
    for (let n = 0; n < hex.length; n += 2) {
      str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
    }
    return str;
  }

  /**
   *
   *
   * @param {string} nameWallet
   * @memberof NemProviderService
   */
  removeParamNis1WalletCreated(nameWallet: string) {
    const wallet = this.walletService.getWalletStorage();
    const otherWallets = wallet.filter(w => w.name !== nameWallet);
    const currentWallet = wallet.find(w => w.name === nameWallet);
    currentWallet.accounts[0].nis1Account = null;
    otherWallets.push(currentWallet);
    this.walletService.saveWallet(otherWallets);
  }

  /**
   *
   *
   * @param {*} account
   * @memberof NemProviderService
   */
  saveAccountWalletTransNisStorage(transactionNis1: WalletTransactionsNis1Interface) {
    const othersWallet = this.getWalletTransNisStorage().filter((element: WalletTransactionsNis1Interface) => {
      const currentWallet = this.walletService.getCurrentWallet();
      const walletName = (currentWallet) ? currentWallet.name : this.walletService.accountWalletCreated.wallet.name;
      return element.name !== walletName;
    });

    othersWallet.push(transactionNis1);
    localStorage.setItem(environment.nameKeyWalletTransactionsNis, JSON.stringify(othersWallet));
  }


  /**
   *
   *
   * @param {AccountsInfoNis1Interface} account
   * @memberof NemProviderService
   */
  setSelectedNis1Account(account: AccountsInfoNis1Interface) {
    this.nis1AccountSelected = account;
  }


  /**
   *
   *
   * @param {*} accounts
   * @memberof WalletService
   */
  setNis1AccountsFound$(accounts: AccountsInfoNis1Interface) {
    this.nis1AccountsFoundSubject.next(accounts);
  }

  /**
   *
   *
   * @param {number} errorCode
   * @memberof NemProviderService
   */
  validateCodeMsgError(errorCode: number, errorMessage: string) {
    switch (errorCode) {
      case 521:
      case 535:
      case 542:
      case 551:
      case 565:
      case 582:
      case 610:
      case 622:
      case 672:
      case 711:
        this.sharedService.showError('', 'Some data is invalid');
        break;

      case 591:
        this.sharedService.showError('', 'Invalid Timestamp');
        break;

      case 501:
      case 635:
      case 641:
      case 685:
      case 691:
        this.sharedService.showError('', 'Service not available');
        break;

      case 655:
      case 666:
        this.sharedService.showError('', 'Insufficient XPX Balance');
        break;

      case 511:
        this.sharedService.showError('', 'Daily limit exceeded (5 swaps)');
        break;

      case 705:
        this.sharedService.showError('', 'Invalid Url');
        break;

      case 722:
      case 822:
        this.sharedService.showError('', 'Account not allowed');
        break;

      case 541:
        this.sharedService.showError('', 'Account not allowed');
        break;

      default:
        if (errorMessage) {
          this.sharedService.showError('', errorMessage.toString().split('_').join(' '));
        } else {
          this.sharedService.showError('', 'Error! try again later');
        }
        break;
    }
  }

  /**
   *
   *
   * @memberof NemProviderService
   */
  validaTransactionsSwap() {
    const walletNis1 = this.getWalletTransNisStorage().find(el => el.name === this.walletService.getCurrentWallet().name);
    // console.log(walletNis1);
    if (walletNis1 !== undefined && walletNis1 !== null) {
      if (walletNis1.transactions.length > 0) {
        const newWalletTransactions = walletNis1.transactions.filter((element, i) => {
          const dateSwap = new Date(element.nis1Timestamp);
          const milliseconds = 1000 * 60 * 60 * 24 * 3;
          const finalDate = new Date(dateSwap.getTime() + milliseconds);
          if (new Date() < finalDate) {
            return element;
          }
        });

        const transactionWalletNis1: WalletTransactionsNis1Interface = {
          name: this.walletService.getCurrentWallet().name,
          transactions: newWalletTransactions
        };

        this.saveAccountWalletTransNisStorage(transactionWalletNis1);
      }
    }

    const wallet = this.walletService.getWalletTransNisStorage().find(el => el.name === this.walletService.getCurrentWallet().name);
    if (wallet !== undefined && wallet !== null) {
      this.walletService.setSwapTransactions$(wallet.transactions);
    } else {
      this.walletService.setSwapTransactions$([]);
    }
  }
}


export interface AccountsInfoNis1Interface {
  nameAccount: string;
  accountCosignatory?: PublicAccountTsjs;
  address: Address;
  publicKey: string;
  cosignerOf: boolean;
  cosignerAccounts: CosignatoryOf[];
  multisigAccountsInfo: any[];
  mosaics: AssetTransferable[];
  isMultiSig: boolean;
  balances: any[];
}

export interface CosignatoryOf {
  address: string;
  mosaics: AssetTransferable[];
  balances: any[];
  harvestedBlocks: number;
  importance: number;
  label: any;
  multisigInfo: {
    cosignatoriesCount: number;
    minCosignatories: number;
  };
  publicKey: string;
  vestedBalance: number;
}

export interface TransactionsNis1Interface {
  siriusAddres: string;
  nis1Timestamp: string;
  nis1PublicKey: string;
  nis1TransactionHash: string;
}

export interface WalletTransactionsNis1Interface {
  name: string;
  transactions: TransactionsNis1Interface[];
}
