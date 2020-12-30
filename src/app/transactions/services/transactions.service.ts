import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import {
  UInt64,
  Deadline,
  NetworkType,
  TransactionHttp,
  Account,
  Mosaic,
  MosaicId,
  MosaicInfo,
  TransactionType,
  Transaction,
  AccountInfo,
  PublicAccount,
  Address,
  AggregateTransaction,
  SignedTransaction,
  TransactionStatus
} from 'tsjs-xpx-chain-sdk';
import { ProximaxProvider } from '../../shared/services/proximax.provider';
import { NodeService } from '../../servicesModule/services/node.service';
import { environment } from '../../../environments/environment';
import { MosaicService } from '../../servicesModule/services/mosaic.service';
import { NamespacesService } from '../../servicesModule/services/namespaces.service';
import {
  WalletService,
  AccountsInfoInterface,
  AccountsInterface
} from '../../wallet/services/wallet.service';

export interface TransferInterface {
  common: { password?: any; privateKey?: any };
  recipient: string;
  message: any;
  network: NetworkType;
  mosaic: any;
}

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {
  private balance: BehaviorSubject<any> = new BehaviorSubject<any>('0.000000');
  private balance$: Observable<any> = this.balance.asObservable();

  // Confirmed
  private _confirmedTransactionsSubject = new BehaviorSubject<TransactionsInterface[]>([]);
  private _confirmedTransactions$: Observable<TransactionsInterface[]> = this._confirmedTransactionsSubject.asObservable();
  // Unconfirmed
  private unconfirmedTransactionsSubject = new BehaviorSubject<TransactionsInterface[]>([]);
  private unconfirmedTransactions$: Observable<TransactionsInterface[]> = this.unconfirmedTransactionsSubject.asObservable();
  // Aggregate Transactions
  private _aggregateTransactionsSubject: BehaviorSubject<TransactionsInterface[]> = new BehaviorSubject<TransactionsInterface[]>([]);
  private _aggregateTransactions$: Observable<TransactionsInterface[]> = this._aggregateTransactionsSubject.asObservable();
  // Notifications
  private notificationsSubject: BehaviorSubject<any> = new BehaviorSubject<any>(false);
  private notifications$: Observable<any> = this.notificationsSubject.asObservable();

  arraTypeTransaction = {
    transfer: {
      id: TransactionType.TRANSFER,
      name: 'Transfer'
    },
    registerNameSpace: {
      id: TransactionType.REGISTER_NAMESPACE,
      name: 'Register Namespace'
    },
    mosaicDefinition: {
      id: TransactionType.MOSAIC_DEFINITION,
      name: 'Mosaic Definition'
    },
    mosaicSupplyChange: {
      id: TransactionType.MOSAIC_SUPPLY_CHANGE,
      name: 'Mosaic Supply Change'
    },
    modifyMultisigAccount: {
      id: TransactionType.MODIFY_MULTISIG_ACCOUNT,
      name: 'Modify Multisig Account'
    },
    aggregateComplete: {
      id: TransactionType.AGGREGATE_COMPLETE,
      name: 'Aggregate Complete'
    },
    aggregateBonded: {
      id: TransactionType.AGGREGATE_BONDED,
      name: 'Aggregate Bonded'
    },
    mosaicAlias: {
      id: TransactionType.MOSAIC_ALIAS,
      name: 'Mosaic Alias'
    },
    addressAlias: {
      id: TransactionType.ADDRESS_ALIAS,
      name: 'Address Alias'
    },
    lock: {
      id: TransactionType.LOCK,
      name: 'LockFund'
    }
    /*secretLock: {
       id: TransactionType.SECRET_LOCK,
       name: "Secret lock"
     },*/
    /* secretProof: {
       id: TransactionType.SECRET_PROOF,
       name: "Secret proof"
     }*/
  };

  namespaceRentalFeeSink = environment.namespaceRentalFeeSink;
  mosaicRentalFeeSink = environment.mosaicRentalFeeSink;
  generationHash = '';
  transactionsReady = [];
  viewParcial: boolean;
  lengthParcial: any;

  constructor(
    private proximaxProvider: ProximaxProvider,
    public nodeService: NodeService,
    private walletService: WalletService,
    private mosaicServices: MosaicService,
    private namespaceService: NamespacesService
  ) {
    this.monitorNewAccounts();
  }

  /**
   * Method to add leading zeros
   *
   * @param cant Quantity of zeros to add
   * @param amount Amount to add zeros
   */
  addZeros(cant: any, amount = 0) {
    let decimal: any;
    let realAmount: any;
    if (amount === 0) {
      decimal = this.addDecimals(cant);
      realAmount = `0${decimal}`;
    } else {
      const arrAmount = amount.toString().replace(/,/g, '').split('.');
      if (arrAmount.length < 2) {
        decimal = this.addDecimals(cant);
      } else {
        const arrDecimals = arrAmount[1].split('');
        decimal = this.addDecimals(cant - arrDecimals.length, arrAmount[1]);
      }
      realAmount = `${arrAmount[0]}${decimal}`;
    }
    return realAmount;
  }

  /**
   * Method to add leading zeros
   *
   * @param cant Quantity of zeros to add
   * @param amount Amount to add zeros
   */
  addDecimals(cant: any, amount = '0') {
    const x = '0';
    if (amount === '0') {
      for (let index = 0; index < cant - 1; index++) {
        amount += x;
      }
    } else {
      for (let index = 0; index < cant; index++) {
        amount += x;
      }
    }
    return amount;
  }

  /**
   *
   *
   * @param {number} quantity
   * @memberof TransactionsService
   */
  addMissingZero(quantity: number) {
    const part = quantity.toString().split('.');
    const cant = (part.length === 1) ? 6 : 6 - part[1].length;
    for (let index = 0; index < cant; index++) {
      if (part.length === 1) {
        part[0] += 0;
      } else {
        part[1] += 0;
      }
    }

    return Number(part.join(''));
  }

  /**
   *
   *
   * @param {Address} [address=null]
   * @returns
   * @memberof TransactionsService
   */
  async getAccountInfo(address: Address): Promise<AccountInfo> {
    try {
      const accountInfo = await this.proximaxProvider.getAccountInfo(address).toPromise();
      if (accountInfo !== null && accountInfo !== undefined) {
        // Search mosaics
        this.mosaicServices.searchInfoMosaics(
          accountInfo.mosaics.map(next => next.id)
        );
      }
      return accountInfo;
    } catch (error) {
      return null;
    }
  }

  /**
   *
   * @param publicsAccounts
   */
  async searchAggregateBonded(publicsAccounts: PublicAccount[]) {
    // console.log('\n=== SEARCH AGGREGATE BONDED ===', publicsAccounts, '\n');
    const aggregateTransactions = [];
    for (const publicAccount of publicsAccounts) {
      const aggregateTransaction = await this.proximaxProvider.getAggregateBondedTransactions(publicAccount).toPromise();
      aggregateTransaction.forEach((a: AggregateTransaction) => {
        const existTransction = aggregateTransactions.find(
          x => x.data.transactionInfo.hash === a.transactionInfo.hash
        );
        if (!existTransction) {
          const data = this.getStructureDashboard(a);
          aggregateTransactions.push(data);
        }
      });
    }

    // console.log('=== RESULT AGGREGATE BONDED TRANSACTIONS ===', aggregateTransactions);
    this.setTransactionsAggregateBonded$(aggregateTransactions);
  }

  /**
   * Formatter Amount
   *
   * @param {UInt64} amount
   * @param {MosaicId} mosaicId
   * @param {MosaicInfo[]} mosaics
   * @returns
   * @memberof TransactionsService
   */
  amountFormatter(amountParam: UInt64 | number, mosaic: MosaicInfo, manualDivisibility = null) {
    let amountFormatter = '';
    if (mosaic !== null && mosaic !== undefined) {
      const divisibility = (manualDivisibility === '' || manualDivisibility === null) ? mosaic['properties'].divisibility : manualDivisibility;
      const amount = typeof amountParam === 'number' ? amountParam : amountParam.compact();
      const amountDivisibility = Number(amount / Math.pow(10, divisibility));
      amountFormatter = amountDivisibility.toLocaleString('en-us', {
        minimumFractionDigits: divisibility
      });
    } else if (manualDivisibility !== null) {
      const divisibility = manualDivisibility;
      const amount = typeof amountParam === 'number' ? amountParam : amountParam.compact();
      const amountDivisibility = Number(amount / Math.pow(10, divisibility));
      amountFormatter = amountDivisibility.toLocaleString('en-us', {
        minimumFractionDigits: divisibility
      });
    }
    return amountFormatter;
  }

  /**
   * Formatter Amount
   *
   * @param {UInt64} amount
   * @param {MosaicId} mosaicId
   * @param {MosaicInfo[]} mosaics
   * @returns
   * @memberof TransactionsService
   */
  amountFormatterSimple(amount: number, d = 6) {
    const amountDivisibility = Number(amount) / Math.pow(10, d);
    return amountDivisibility.toLocaleString('en-us', {
      minimumFractionDigits: d
    });
  }

  /**
   *
   * @param params
   */
  buildTransferTransaction(params: TransferInterface, generationHash: string) {
    const recipientAddress = this.proximaxProvider.createFromRawAddress(params.recipient);
    const mosaics = params.mosaic;
    const allMosaics = [];
    mosaics.forEach(element => {
      allMosaics.push(
        new Mosaic(
          new MosaicId(element.id),
          UInt64.fromUint(Number(element.amount))
        )
      );
    });

    const transferTransaction = this.proximaxProvider.buildTransferTransaction(
      params.network,
      recipientAddress,
      params.message,
      0,
      allMosaics
    );

    // console.log(this.generationHash);
    const account = Account.createFromPrivateKey(
      params.common.privateKey,
      params.network
    );
    const signedTransaction = account.sign(
      transferTransaction,
      generationHash
    );
    const transactionHttp = this.buildTransactionHttp();
    return {
      signedTransaction,
      transactionHttp,
      transferTransaction
    };
  }

  /**
   *
   * @param signedTransaction
   */
  buildHashLockTransaction(signedTransaction: SignedTransaction, signer: Account, generationHash: string): SignedTransaction {

    const hashLockTransaction = this.proximaxProvider.buildHashLockTransaction(
      new Mosaic(new MosaicId(environment.mosaicXpxInfo.id), UInt64.fromUint(Number(10000000))),
      UInt64.fromUint(environment.lockFundDuration),
      signedTransaction,
      this.walletService.currentAccount.network
    )

    // console.log('\n hashLockTransaction --> ', hashLockTransaction);
    return signer.sign(hashLockTransaction, generationHash);
  }

  /**
   *
   * @param signer
   * @param transaction
   */
  buildAggregateTransaction(
    cosignatoryAccount: Account,
    arrayTx: { tx: Transaction, signer: PublicAccount }[],
    generationHash: string,
    otherCosigners: Account[] = [],
  ): SignedTransaction {
    const innerTxn = [];
    arrayTx.forEach(element => {
      innerTxn.push(element.tx.toAggregate(element.signer));
    });

    const bondedCreated = this.proximaxProvider.buildAggregateBonded(
      innerTxn,
      this.walletService.currentAccount.network
    );

    if (otherCosigners.length > 0) {
      return cosignatoryAccount.signTransactionWithCosignatories(bondedCreated, otherCosigners, generationHash);
    }

    // console.log('\n bondedCreated --> ', bondedCreated);
    return cosignatoryAccount.sign(bondedCreated, generationHash);
  }

  /**
   *
   */
  buildTransactionHttp(protocol = environment.protocol, node = this.nodeService.getNodeSelected()) {
    return new TransactionHttp(protocol + '://' + `${node}`);
  }

  /**
   * Calculate duration based in blocks
   *
   * @param {UInt64} duration
   * @returns
   * @memberof TransactionsService
   */
  calculateDuration(duration: UInt64) {
    const durationCompact = duration.compact();
    let seconds = durationCompact * 15;
    const days = Math.floor(seconds / (3600 * 24));
    seconds -= days * 3600 * 24;
    const hrs = Math.floor(seconds / 3600);
    seconds -= hrs * 3600;
    const mnts = Math.floor(seconds / 60);
    seconds -= mnts * 60;
    const response = days + ' days, ' + hrs + ' Hrs, ' + mnts + ' Minutes, ' + seconds + ' Seconds';
    return response;
  }

  /**
   * Calculate duration based in days
   *
   * @param {number} duration
   * @returns
   * @memberof TransactionsService
   */
  calculateDurationforDay(duration: number) {
    return duration * 5760;
  }


  /**
   *
   *
   * @param {Deadline} deadline
   * @returns
   * @memberof TransactionsService
   */
  dateFormat(deadline: Deadline) {
    return new Date(
      deadline.value.toString() + Deadline.timestampNemesisBlock * 1000
    ).toLocaleString();
    // toUTCString();
  }

  /**
   *
   *
   * @param {UInt64} date
   * @returns
   * @memberof TransactionsService
   */
  dateFormatUTC(date: UInt64) {
    return new Date(date.compact() + 1459468800 * 1000).toLocaleString();
  }

  /**
   *
   * @param deadline
   */
  dateFormatLocal(deadline: Deadline) {
    return new Date(
      deadline.value.toString() + Deadline.timestampNemesisBlock * 1000
    ).toLocaleString();
  }

  /**
   *
   *
   * @memberof TransactionsService
   */
  destroyAllTransactions() {
    this.setTransactionsConfirmed$([]);
    this.setTransactionsUnConfirmed$([]);
    this.setTransactionsAggregateBonded$([]);
  }

  /**
   *
   *
   * @param {number} numero
   * @returns
   * @memberof TransactionsService
   */
  formatNumberMilesThousands(n: number) {
    return n.toString().replace(/((?!^)|(?:^|.*?[^\d.,])\d{1,3})(\d{3})(?=(?:\d{3})*(?!\d))/gy, '$1,$2');
  }

  /**
   *
   */
  getAggregateBondedTransactions$(): Observable<TransactionsInterface[]> {
    return this._aggregateTransactions$;
  }

  /**
   *
   *
   * @returns {Observable<any>}
   * @memberof TransactionsService
   */
  getBalance$(): Observable<any> {
    return this.balance$;
  }

  /**
   *
   *
   * @param {string} data
   * @param {number} cantPart
   * @returns
   * @memberof TransactionsService
   */
  getDataPart(data: string, cantPart: number) {
    return {
      part1: data.slice(0, data.length - cantPart),
      part2: data.slice(-cantPart)
    };
  }

  /**
   *
   *
   * @returns {Observable<TransactionsInterface[]>}
   * @memberof DashboardService
   */
  getConfirmedTransactions$(): Observable<TransactionsInterface[]> {
    return this._confirmedTransactions$;
  }

  /**
   *
   *
   * @returns {Observable<TransactionsInterface[]>}
   * @memberof DashboardService
   */
  getUnconfirmedTransactions$(): Observable<TransactionsInterface[]> {
    return this.unconfirmedTransactions$;
  }

  /**
   *
   *
   * @returns
   * @memberof TransactionsService
   */
  getTypeTransactions() {
    return this.arraTypeTransaction;
  }

  /**
   *
   *
   * @returns {Observable<any>}
   * @memberof TransactionsService
   */
  getViewNotifications$(): Observable<any> {
    return this.notifications$;
  }

  /**
   *
   *
   * @param {boolean} notifications
   * @memberof TransactionsService
   */
  setViewNotifications$(notifications: boolean) {
    this.notificationsSubject.next(notifications);
  }

  /**
   *
   *
   * @param {Transaction} transaction
   * @returns {ConfirmedTransactions}
   * @memberof TransactionsService
   */
  getStructureDashboard(transaction: Transaction, othersTransactions?: TransactionsInterface[], group?: string): TransactionsInterface {
    if (othersTransactions && othersTransactions.length > 0) {
      try {
        const existTransction = othersTransactions.filter(next => next.data.transactionInfo.hash === transaction.transactionInfo.hash);
        if (existTransction && existTransction.length > 0) {
          return null;
        }
      } catch (error) {
        return null;
      }
    }

    const keyType = this.getNameTypeTransaction(transaction.type);
    if (keyType !== undefined) {
      const dataTransaction = this.validateIsSwapTransaction(transaction, keyType, group);
      const feeFormatter = this.amountFormatterSimple(dataTransaction.transaction.maxFee.compact());
      const rentalFeeSink = this.getRentalFeeSink(dataTransaction.transaction);
      const responseIsRecipient = this.validateIsRecipient(dataTransaction.transaction);
      return {
        data: dataTransaction.transaction,
        nameType: dataTransaction.nameType,
        fee: feeFormatter,
        feePart: this.getDataPart(feeFormatter, 6),
        sender: dataTransaction.transaction.signer,
        recipientRentalFeeSink: rentalFeeSink,
        recipient: responseIsRecipient.recipient,
        recipientAddress: responseIsRecipient.recipientPretty,
        receive: responseIsRecipient.isReceive,
        senderAddress: dataTransaction.transaction['signer'].address.pretty()
      };
    }
    return null;
  }

  // viewPartial(partial){
  //   this.lengthParcial = partial.length;
  //   this.viewParcial = (partial && partial.length > 0) ? true : false
  // }
  /**
   *
   *
   * @param {Transaction} transaction
   * @returns
   * @memberof TransactionsService
   */
  validateIsRecipient(transaction: Transaction) {
    let recipient = null;
    let recipientPretty = null;
    let isReceive = false;
    if (transaction['recipient'] !== undefined) {
      recipient = transaction['recipient'];
      recipientPretty = recipient.pretty();
      const currentWallet = Object.assign({}, this.walletService.getCurrentWallet());
      if (currentWallet.accounts) {
        if (currentWallet.accounts.find(element => this.proximaxProvider.createFromRawAddress(element.address).pretty() === recipientPretty)) {
          isReceive = true;
        }
      }
    }

    return {
      recipient,
      recipientPretty,
      isReceive
    };
  }

  /**
   *
   *
   * @param {Transaction} transaction
   * @param {string} keyType
   * @returns
   * @memberof TransactionsService
   */
  validateIsSwapTransaction(transaction: Transaction, keyType: string, group: string) {
    let isVerified = false;
    let nameType = this.arraTypeTransaction[keyType].name;
    if (group && (group === 'confirmed' || group === 'unconfirmed')) {
      if (transaction.type === this.arraTypeTransaction.aggregateBonded.id) {
        if (transaction['innerTransactions'].length === 1) {
          if (transaction['innerTransactions'][0]['message'] && transaction['innerTransactions'][0]['message'].payload !== '') {
            let newTransaction: any = null;
            try {
              const msg = JSON.parse(transaction['innerTransactions'][0]['message'].payload);
              const addressAccountMultisig = environment.swapAccount.addressAccountMultisig;
              const addressAccountSimple = environment.swapAccount.addressAccountSimple;
              const addressSender = transaction['innerTransactions'][0].signer.address.plain();
              if ((addressSender === addressAccountMultisig) || (addressSender === addressAccountSimple)) {
                if (msg && msg['type'] && msg['type'] === 'Swap') {
                  nameType = 'ProximaX Swap';
                  newTransaction = Object.assign({}, transaction['innerTransactions'][0]);
                  newTransaction['transactionInfo'] = transaction.transactionInfo;
                  newTransaction['nis1Hash'] = msg['nis1Hash'];
                  // newTransaction['transactionInfo'].hash = transaction.transactionInfo.hash;
                  newTransaction.size = transaction.size;
                  newTransaction.cosignatures = transaction['cosignatures'];
                  if (group && group === 'confirmed') {
                    const walletTransactionsNis = this.walletService.getWalletTransNisStorage().find(el => el.name === this.walletService.getCurrentWallet().name);
                    if (walletTransactionsNis !== undefined && walletTransactionsNis !== null) {
                      const transactions = walletTransactionsNis.transactions.filter(el => el.nis1TransactionHash !== msg['nis1Hash']);
                      walletTransactionsNis.transactions = transactions;
                      this.walletService.setSwapTransactions$(walletTransactionsNis.transactions);
                      this.walletService.saveAccountWalletTransNisStorage(walletTransactionsNis);
                    }
                  }
                }
              }
            } catch (error) { }

            if (newTransaction !== null) {
              isVerified = true;
              transaction = newTransaction;
            }
          }
        }
      }
    }

    if (!isVerified) {
      try {
        if (transaction['message'] && transaction['message'].payload !== '') {
          const msg = JSON.parse(transaction['message'].payload);
          const addressAccountMultisig = environment.swapAccount.addressAccountMultisig;
          const addressAccountSimple = environment.swapAccount.addressAccountSimple;
          const addressSender = transaction.signer.address.plain();
          if (addressSender === addressAccountMultisig || addressSender === addressAccountSimple) {
            if (msg && msg['type'] && msg['type'] === 'Swap') {
              nameType = 'ProximaX Swap';
              transaction['nis1Hash'] = msg['nis1Hash'];
              if (group && group === 'confirmed') {
                const walletTransactionsNis = this.walletService.getWalletTransNisStorage().find(el => el.name === this.walletService.getCurrentWallet().name);
                if (walletTransactionsNis !== undefined && walletTransactionsNis !== null) {
                  const transactions = walletTransactionsNis.transactions.filter(el => el.nis1TransactionHash !== msg['nis1Hash']);
                  walletTransactionsNis.transactions = transactions;
                  this.walletService.setSwapTransactions$(walletTransactionsNis.transactions);
                  this.walletService.saveAccountWalletTransNisStorage(walletTransactionsNis);
                }
              }
            }
          }
        }
      } catch (error) { }
    }

    return {
      transaction,
      nameType
    };
  }

  /**
   *
   *
   * @param {TransactionStatus} statusTransaction
   * @param {SignedTransaction[]} transactionSigned
   * @param {SignedTransaction[]} transactionReady
   * @returns
   * @memberof TransactionsService
   */
  validateStatusTx(statusTransaction: TransactionStatus, transactionSigned: SignedTransaction[], transactionReady: SignedTransaction[]) {
    if (statusTransaction !== null && statusTransaction !== undefined && transactionSigned !== null) {
      let dataReturn = null;
      for (const element of transactionSigned) {
        const match = statusTransaction['hash'] === element.hash;
        if (match) {
          transactionReady.push(element);
        }

        if (statusTransaction['type'] === 'confirmed' && match) {
          dataReturn = {
            statusBtn: false,
            transactionSigned: transactionSigned.filter(el => el.hash !== statusTransaction['hash']),
            transactionReady
          };
        } else if (statusTransaction['type'] === 'unconfirmed' && match) {
          dataReturn = {
            statusBtn: false,
            transactionSigned,
            transactionReady
          };
        } else if (statusTransaction['type'] === 'aggregateBondedAdded' && match) {
          dataReturn = {
            statusBtn: false,
            transactionSigned,
            transactionReady
          };
        } else if (statusTransaction['type'] === 'cosignatureSignedTransaction' && match) {
          dataReturn = {
            statusBtn: false,
            transactionSigned,
            transactionReady
          };
        } else if (statusTransaction['type'] === 'status' && match) {
          dataReturn = {
            statusBtn: false,
            transactionSigned: transactionSigned.filter(el => el.hash !== statusTransaction['hash']),
            transactionReady
          };
        }
      }

      return dataReturn;
    }
  }

  /**
   *
   *
   * @param {Transaction} transaction
   * @returns
   * @memberof TransactionsService
   */
  getRentalFeeSink(transaction: Transaction) {
    if (transaction['mosaics'] === undefined) {
      if (transaction.type === this.arraTypeTransaction.registerNameSpace.id) {
        return this.namespaceRentalFeeSink.address_public_test;
      } else if (
        transaction.type === this.arraTypeTransaction.mosaicDefinition.id ||
        transaction.type === this.arraTypeTransaction.mosaicSupplyChange.id
      ) {
        return this.mosaicRentalFeeSink.address_public_test;
      } else {
        return '-';
      }
    }
  }

  /**
   *
   *
   * @param {*} type
   * @returns
   * @memberof TransactionsService
   */
  getNameTypeTransaction(type: any) {
    return Object.keys(this.arraTypeTransaction).find(
      elm => this.arraTypeTransaction[elm].id === type
    );
  }

  /**
   *
   * @memberof TransactionsService
   */
  monitorNewAccounts() {
    this.walletService.getAccountsPushedSubject().subscribe(next => {
      if (next && next.length > 0) {
        // console.log('=== YOU HAVE NEW ACCOUNT ===', next);
        this.searchAccountsInfo(next);
      }
    });
  }

  /**
   * Search all account information
   * @param pushed
   */
  searchAccountsInfo(accounts: AccountsInterface[]) {
    this.walletService.searchAccountsInfo(accounts).then((data: { mosaicsId: MosaicId[]; accountsInfo: AccountsInfoInterface[]; }) => {
      const publicsAccounts: PublicAccount[] = [];
      this.walletService.validateMultisigAccount(accounts);
      accounts.forEach(x => {
        publicsAccounts.push(this.proximaxProvider.createPublicAccount(x.publicAccount.publicKey, x.network));
      });

      data.accountsInfo.forEach((element: AccountsInfoInterface) => {
        if (element.accountInfo) {
          const exist = accounts.find(account => element.accountInfo.address.plain() === account.address);
          if (exist) {
            if (!publicsAccounts.find(x => x.publicKey === exist.publicAccount.publicKey)) {
              publicsAccounts.push(
                this.proximaxProvider.createPublicAccount(
                  exist.publicAccount.publicKey,
                  exist.publicAccount.address.networkType
                )
              );
            }
          } else {
            if (!publicsAccounts.find(x => x.publicKey === element.accountInfo.publicKey)) {
              publicsAccounts.push(
                this.proximaxProvider.createPublicAccount(
                  element.accountInfo.publicKey,
                  element.accountInfo.publicAccount.address.networkType
                )
              );
            }
          }
        }
      });

      // Search all transactions aggregate bonded from array publics accounts
      if (publicsAccounts.length > 0) {
        this.searchAggregateBonded(publicsAccounts);
      }

      this.updateBalance();
      if (data.mosaicsId && data.mosaicsId.length > 0) {
        this.mosaicServices.searchInfoMosaics(data.mosaicsId);
      }
    }).catch(error => console.log(error));
  }

  /**
   *
   *
   * @param {*} amount
   * @memberof TransactionsService
   */
  setBalance$(amount: any): void {
    this.balance.next(this.amountFormatterSimple(amount));
  }

  /**
   *
   *
   * @param {TransactionsInterface[]} transactions
   * @memberof TransactionsService
   */
  setTransactionsAggregateBonded$(transactions: TransactionsInterface[]) {
    this._aggregateTransactionsSubject.next(transactions);
  }

  /**
   *
   *
   * @param {TransactionsInterface[]} transactions
   * @memberof DashboardService
   */
  setTransactionsConfirmed$(transactions: TransactionsInterface[]) {
    this._confirmedTransactionsSubject.next(transactions);
  }

  /**
   *
   *
   * @param {TransactionsInterface[]} transactions
   * @memberof DashboardService
   */
  setTransactionsUnConfirmed$(transactions: TransactionsInterface[]) {
    if (transactions.length > 0) {
    }
    transactions;
    this.unconfirmedTransactionsSubject.next(transactions);
  }

  /**
   *
   *
   * @param {string} hash
   * @memberof TransactionsService
   */
  setTransactionReady(hash: string) {
    if (!this.transactionsReady.find(x => x === hash)) {
      this.transactionsReady.push(hash);
    }
  }

  /**
   *
   *
   * @param {number} quantityOne
   * @param {number} quantityTwo
   * @returns {string}
   * @memberof TransactionsService
   */
  subtractAmount(quantityOne: number, quantityTwo: number, limitDecimal = 6): string {
    // console.log('quantityOne', quantityOne);
    // console.log('quantityTwo', quantityTwo);
    const residue: string[] = (quantityOne - quantityTwo).toString().replace(/,/g, '').split('.');
    // console.log('residue', residue);
    // console.log('residue.length', residue.length);
    const missing = (residue.length > 1) ? limitDecimal - residue[1].length : limitDecimal;
    residue[1] = (residue.length > 1) ? residue[1].slice(0, limitDecimal) : '';
    for (let index = 0; index < missing; index++) {
      residue[1] += 0;
    }

    return residue.join().replace(/,/g, '.');
  }

  /**
   *
   * @param str
   */
  toHex(str: any) {
    let result = '';
    for (let i = 0; i < str.length; i++) {
      result += str.charCodeAt(i).toString(16);
    }
    return result;
  }

  /**
   *
   *
   * @memberof TransactionsService
   */
  updateBalance() {
    const accountsInfo = this.walletService.getAccountsInfo().slice(0);
    const currentAccount = Object.assign(
      {},
      this.walletService.getCurrentAccount()
    );
    const dataBalance = accountsInfo.find(
      next => next.name === currentAccount.name
    );
    let balance = 0.0;
    if (dataBalance && dataBalance.accountInfo) {
      const x = dataBalance.accountInfo.mosaics.find(
        next => next.id.toHex() === environment.mosaicXpxInfo.id
      );
      if (x) {
        balance = x.amount.compact();
      }
    }

    this.setBalance$(balance);
  }

  /**
   *
   *
   * @param {TransactionType} type
   * @memberof TransactionsService
   */
  validateTypeTransaction(type: TransactionType) {
    if (
      type === this.arraTypeTransaction.mosaicAlias.id ||
      type === this.arraTypeTransaction.mosaicSupplyChange.id ||
      type === this.arraTypeTransaction.mosaicDefinition.id ||
      type === this.arraTypeTransaction.registerNameSpace.id ||
      type === this.arraTypeTransaction.aggregateComplete.id
    ) {
      this.mosaicServices.resetMosaicsStorage();
      this.namespaceService.resetNamespaceStorage();
    }

    //  this.namespaceService.buildNamespaceStorage();
    // this.updateBalance2();
  }

  /**
   *
   *
   * @param {number} balanceAccount
   * @param {number} feeTransaction
   * @param {number} rental
   * @returns {boolean}
   * @memberof TransactionsService
   */
  validateBuildSelectAccountBalance(balanceAccount: number, feeTransaction: number, rental: number): boolean {
    const totalFee = feeTransaction + rental;
    return balanceAccount >= totalFee;
  }


  /**
   *
   *
   * @param {AccountsInterface} account
   * @memberof TransactionsService
   */
  validateIsMultisigAccount(account: AccountsInterface) {
    if (account.isMultisign && account.isMultisign.cosignatories && account.isMultisign.cosignatories.length > 0) {
      return true;
    }

    return false;
  }

  /**
   *
   * Validate balance cosignatory
   *
   * @param {AccountsInfoInterface} accountInfo
   * @param {Number} feeTotal
   * @memberof DashboardService
   */
  validateBalanceCosignatorie(accountInfo: AccountsInfoInterface, feeTotal: number): BalanceCosignatorieValidate {
    const value: BalanceCosignatorieValidate = {
      infValidate: [{ disabled: false, info: '' }]
    };
    const disabled: boolean =
      accountInfo !== null &&
      accountInfo !== undefined &&
      accountInfo.accountInfo !== null;
    // Validate account info
    if (!disabled) {
      return { infValidate: [{ disabled: true, info: "Not Valid" }] };
    }
    // Validate mosaics
    if (
      !accountInfo.accountInfo.mosaics.find(
        next => next.id.toHex() === environment.mosaicXpxInfo.id
      )
    ) {
      return {
        infValidate: [{ disabled: true, info: "Insufficient Balance" }]
      };
    }
    // Validate balance account
    const balanceAccount = accountInfo.accountInfo.mosaics.find(next => next.id.toHex() === environment.mosaicXpxInfo.id).amount.compact();
    if (!(balanceAccount >= feeTotal)) {
      return {
        infValidate: [{ disabled: true, info: "Insufficient Balance" }]
      };
    }

    return { infValidate: [{ disabled: false, info: '' }] };
  }
}

export interface BalanceCosignatorieValidate {
  infValidate: [{ disabled: boolean; info: string }];
}

export interface TransactionsInterface {
  // data: Transaction;
  data: any;
  dateFile?: string;
  description?: string;
  effectiveFee?: {};
  nameType: string;
  timestamp?: string;
  fee: string;
  feePart: {
    part1: string;
    part2: string;
  };
  sender: PublicAccount;
  recipientRentalFeeSink: string;
  recipient: Address;
  recipientAddress: string;
  receive: boolean;
  senderAddress: string;
  fileName?: string;
  privateFile?: boolean;
  name?: string;
  hash?: string;
}

