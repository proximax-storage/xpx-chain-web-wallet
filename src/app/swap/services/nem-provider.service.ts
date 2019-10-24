import { Injectable } from "@angular/core";
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
} from "nem-library";
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
    const resultAssets = await this.assetHttp.getAssetTransferableWithRelativeAmount(assetId, quantity).toPromise();
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
      let cosignatoryOf: CosignatoryOf[] = [];
      let accountsMultisigInfo = [];
      const addressOwnedSwap = this.createAddressToString(publicAccount.address.pretty());
      const accountInfoOwnedSwap = await this.getAccountInfo(addressOwnedSwap).pipe(first()).pipe((timeout(environment.timeOutTransactionNis1))).toPromise();
      if (accountInfoOwnedSwap['meta']['cosignatories'].length === 0) {
        let nis1AccountsInfo: AccountsInfoNis1Interface;
        // INFO ACCOUNTS MULTISIG
        if (accountInfoOwnedSwap['meta']['cosignatoryOf'].length > 0) {
          cosignatoryOf = accountInfoOwnedSwap['meta']['cosignatoryOf'];
          for (let multisig of cosignatoryOf) {
            try {
              const addressMultisig = this.createAddressToString(multisig.address);
              const ownedMosaic = await this.getOwnedMosaics(addressMultisig).pipe(first()).pipe((timeout(environment.timeOutTransactionNis1))).toPromise();
              const xpxFound = ownedMosaic.find(el => el.assetId.namespaceId === 'prx' && el.assetId.name === 'xpx');
              if (xpxFound) {
                multisig.balance = await this.validateBalanceAccounts(xpxFound, addressMultisig);
                console.log('multisig.balance', multisig.balance)
                multisig.mosaic = xpxFound;
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
          const xpxFound = ownedMosaic.find(el => el.assetId.namespaceId === 'prx' && el.assetId.name === 'xpx');
          if (xpxFound) {
            const balance = await this.validateBalanceAccounts(xpxFound, addressOwnedSwap);
            nis1AccountsInfo = this.buildAccountInfoNIS1(publicAccount, accountsMultisigInfo, balance, cosignatoryOf, false, name, xpxFound);
            this.setNis1AccountsFound$(nis1AccountsInfo);
          } else if (cosignatoryOf.length > 0) {
            nis1AccountsInfo = this.buildAccountInfoNIS1(publicAccount, accountsMultisigInfo, null, cosignatoryOf, false, name, null);
            this.setNis1AccountsFound$(nis1AccountsInfo);
          } else {
            this.setNis1AccountsFound$(null);
          }
        } catch (error) {
          // Valida si es cosignatario
          if (cosignatoryOf.length > 0) {
            nis1AccountsInfo = this.buildAccountInfoNIS1(publicAccount, accountsMultisigInfo, null, cosignatoryOf, false, name, null);
            this.setNis1AccountsFound$(nis1AccountsInfo);
          } else {
            this.setNis1AccountsFound$(null);
          }
        }
      } else {
        this.sharedService.showWarning('', 'Swap does not support this account type');
        this.setNis1AccountsFound$(null);
        if (!this.walletService.currentWallet) {
          this.removeParamNis1WalletCreated(name);
        }
      }
    } catch (error) {
      this.sharedService.showWarning('', 'It was not possible to connect to the server, try later');
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
  async validateBalanceAccounts(xpxFound: AssetTransferable, addressSigner: Address) {
    console.log('xpxFound --> ', xpxFound);
    const quantityFillZeros = this.transactionService.addZeros(6, xpxFound.quantity);
    let realQuantity: any = this.amountFormatter(quantityFillZeros, xpxFound, 6);
    const unconfirmedTxn = await this.getUnconfirmedTransaction(addressSigner);
    console.log('Address  ---> ', addressSigner);
    if (unconfirmedTxn.length > 0) {
      //let quantity = realQuantity;
      console.log('realQuantity', realQuantity);
      for (const item of unconfirmedTxn) {
        console.log('transaction unconfirmed -->', item);
        let existMosaic = null;
        if (item.type === 257 && item['signer']['address']['value'] === addressSigner['value'] && item['_assets'].length > 0) {
          existMosaic = item['_assets'].find((mosaic) => mosaic.assetId.namespaceId === 'prx' && mosaic.assetId.name === 'xpx');
        } else if (item.type === 4100 && item['otherTransaction']['type'] === 257 && item['otherTransaction']['signer']['address']['value'] === addressSigner['value']) {
          existMosaic = item['otherTransaction']['_assets'].find((mosaic) => mosaic.assetId.namespaceId === 'prx' && mosaic.assetId.name === 'xpx');
        }

        console.log('existMosaic -->', existMosaic);
        if (existMosaic) {
          const unconfirmedFormatter = parseFloat(this.amountFormatter(existMosaic.quantity, xpxFound, 6));
          console.log('unconfirmedFormatter --->', unconfirmedFormatter);
          const quantityWhitoutFormat = realQuantity.split(',').join('');
          console.log('quantityWhitoutFormat --->', quantityWhitoutFormat);
          const residue = this.transactionService.subtractAmount(parseFloat(quantityWhitoutFormat), unconfirmedFormatter);
          console.log('residue --->', residue);
          const quantityFormat = this.amountFormatter(parseInt((residue).toString().split('.').join('')), xpxFound, 6);
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
    const divisibility = (manualDivisibility === 0) ? manualDivisibility : mosaic.properties.divisibility;
    const amountDivisibility = Number(amountParam / Math.pow(10, divisibility));
    const amountFormatter = amountDivisibility.toLocaleString("en-us", { minimumFractionDigits: divisibility });
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
    balance: any,
    cosignersAccounts: CosignatoryOf[],
    isMultiSign: boolean,
    name: string,
    xpxFound: AssetTransferable
  ) {
    return {
      nameAccount: name,
      address: publicAccount.address,
      publicKey: publicAccount.publicKey,
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
  * RJ
  *
  * @param {*} accounts
  * @memberof WalletService
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
    var hex = str1.toString();
    var str = '';
    for (var n = 0; n < hex.length; n += 2) {
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
    const otherWallets = wallet.filter(wallet => wallet.name !== nameWallet);
    let currentWallet = wallet.find(wallet => wallet.name === nameWallet);
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
      const walletName = (currentWallet) ? currentWallet.name : this.walletService.accountWalletCreated.wallet.name
      return element.name !== walletName;
    });

    othersWallet.push(transactionNis1);
    localStorage.setItem(environment.nameKeyWalletTransactionsNis, JSON.stringify(othersWallet));
  }


  /**
   *
   *
   * @param {AccountsInterface[]} accounts
   * @param {*} common
   * @memberof NemProviderService
   */
  /*searchUnconfirmedSwap(accounts: AccountsInterface[], common: any) {
    const nis1Accounts = accounts.filter(account => account.nis1Account !== null && account.encrypted !== '');
    nis1Accounts.forEach(element => {
      console.log('common --->', common);
      console.log('Account SIRIUS --->', element);
      const decrypt = Object.assign({}, common);
      const isDecrypted = this.walletService.decrypt(decrypt, element);
      if (isDecrypted) {
        console.log('decrypt --->', decrypt);
        const accountNis1 = this.createAccountPrivateKey(decrypt.privateKey);
        console.log(accountNis1);
        this.getUnconfirmedTransaction(accountNis1.address).then((transactions: Transaction[]) => {
          console.log('UNCONFIRMED TRANSACTION ----> ', transactions);
          console.log(transactions[0].toDTO());

          console.log(transactions[0].getTransactionInfo());
          /*const swapTransaction = [];
          transactions.forEach(transaction => {
            const isSigner = transaction.signer.address.plain() === accountNis1.address.plain();
            if (isSigner &&
              transaction.type === 4100 &&
              transaction['otherTransaction'].type === 257 &&
              transaction['otherTransaction'].recipient.value === environment.nis1.burnAddress &&
              transaction['otherTransaction'].message.payload !== '' &&
              transaction['otherTransaction']['_assets'][0].assetId.name === 'xpx' &&
              transaction['otherTransaction']['_assets'][0].assetId.namespaceId === 'prx' &&
              transaction['otherTransaction']['_xem']['quantity'] === 1000000
            ) {
              console.log('SI, YO FIRME ESA TRANSACCIÓN MULTIFIRMA');
              console.log(transaction);
              swapTransaction.push({
                nis1PublicKey: transaction['otherTransaction'].signer.publicKey,
                nis1Timestamp: this.getTimeStampTimeWindow(transaction),
                nis1TransactionHash: transaction['hashData'].data,
                siriusAddres: this.hexToAscii(transaction['otherTransaction'].message.payload)
              });
            } else if (
              isSigner &&
              transaction.type === 257 &&
              transaction['recipient'].value === environment.nis1.burnAddress &&
              transaction['message'].payload !== '' &&
              transaction['_assets'][0].assetId.name === 'xpx' &&
              transaction['_assets'][0].assetId.namespaceId === 'prx'
            ) {
              //['signer']['address']['value']
              console.log('SI, YO FIRME ESA TRANSACCIÓN SIMPLE');
              console.log(transaction);
              swapTransaction.push({
                nis1PublicKey: transaction.signer.publicKey,
                nis1Timestamp: this.getTimeStampTimeWindow(transaction),
                nis1TransactionHash: transaction['hashData'].data,
                siriusAddres: this.hexToAscii(transaction['message'].payload)
              });
            }
          });

          console.log('swapTransaction', swapTransaction);*
        });
      }
    });
  }*/

  /**
  *
  *
  * @param {AccountsInfoNis1Interface} account
  * @memberof WalletService
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
      case 591:
      case 610:
      case 622:
      case 672:
      case 711:
        this.sharedService.showError('', 'Some data is invalid');
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

        // console.log('=======> ', newWalletTransactions);
        const transactionWalletNis1: WalletTransactionsNis1Interface = {
          name: this.walletService.getCurrentWallet().name,
          transactions: newWalletTransactions
        };

        this.saveAccountWalletTransNisStorage(transactionWalletNis1);
      }
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
  mosaic: AssetTransferable;
  isMultiSig: boolean;
  balance: any;
}

export interface CosignatoryOf {
  address: string;
  mosaic: AssetTransferable;
  balance: number;
  harvestedBlocks: number;
  importance: number;
  label: any;
  multisigInfo: {
    cosignatoriesCount: number;
    minCosignatories: number;
  },
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
  transactions: TransactionsNis1Interface[],
}
