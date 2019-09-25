import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject, Subscription } from "rxjs";
import {
  UInt64,
  TransferTransaction,
  Deadline,
  PlainMessage,
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
  MultisigAccountInfo,
  NamespaceId,
  AggregateTransaction,
  SignedTransaction,
  HashLockTransaction,
  LockFundsTransaction
} from "tsjs-xpx-chain-sdk";
import { first } from "rxjs/operators";
import { ProximaxProvider } from "../../shared/services/proximax.provider";
import { NodeService } from "../../servicesModule/services/node.service";
import { environment } from "../../../environments/environment";
import { MosaicService } from "../../servicesModule/services/mosaic.service";
import { NamespacesService } from "../../servicesModule/services/namespaces.service";
import { WalletService, AccountsInfoInterface, AccountsInterface } from '../../wallet/services/wallet.service';
// import { DataBridgeService } from 'src/app/shared/services/data-bridge.service';



export interface TransferInterface {
  common: { password?: any; privateKey?: any };
  recipient: string;
  message: string;
  network: NetworkType;
  mosaic: any;
}



@Injectable({
  providedIn: "root"
})
export class TransactionsService {

  private balance: BehaviorSubject<any> = new BehaviorSubject<any>("0.000000");
  private balance$: Observable<any> = this.balance.asObservable();

  //Confirmed
  private _confirmedTransactionsSubject = new BehaviorSubject<TransactionsInterface[]>([]);
  private _confirmedTransactions$: Observable<TransactionsInterface[]> = this._confirmedTransactionsSubject.asObservable();
  //Unconfirmed
  private unconfirmedTransactionsSubject = new BehaviorSubject<TransactionsInterface[]>([]);
  private unconfirmedTransactions$: Observable<TransactionsInterface[]> = this.unconfirmedTransactionsSubject.asObservable();
  //Aggregate Transactions
  private _aggregateTransactionsSubject: BehaviorSubject<TransactionsInterface[]> = new BehaviorSubject<TransactionsInterface[]>([]);
  private _aggregateTransactions$: Observable<TransactionsInterface[]> = this._aggregateTransactionsSubject.asObservable();

  arraTypeTransaction = {
    transfer: {
      id: TransactionType.TRANSFER,
      name: "Transfer"
    },
    registerNameSpace: {
      id: TransactionType.REGISTER_NAMESPACE,
      name: "Register namespace"
    },
    mosaicDefinition: {
      id: TransactionType.MOSAIC_DEFINITION,
      name: "Mosaic definition"
    },
    mosaicSupplyChange: {
      id: TransactionType.MOSAIC_SUPPLY_CHANGE,
      name: "Mosaic supply change"
    },
    modifyMultisigAccount: {
      id: TransactionType.MODIFY_MULTISIG_ACCOUNT,
      name: "Modify multisig account"
    },
    aggregateComplete: {
      id: TransactionType.AGGREGATE_COMPLETE,
      name: "Aggregate complete"
    },
    aggregateBonded: {
      id: TransactionType.AGGREGATE_BONDED,
      name: "Aggregate bonded"
    },
    mosaicAlias: {
      id: TransactionType.MOSAIC_ALIAS,
      name: "Mosaic Alias"
    },
    addressAlias: {
      id: TransactionType.ADDRESS_ALIAS,
      name: "Address Alias"
    },

    /* lock: {
       id: TransactionType.LOCK,
       name: "Lock"
     },*/
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
  generationHash: string = '';



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
  addZeros(cant, amount = 0) {
    let decimal;
    let realAmount;
    if (amount === 0) {
      decimal = this.addDecimals(cant);
      realAmount = `0${decimal}`
    } else {
      let arrAmount = amount.toString().replace(/,/g, "").split('.');
      if (arrAmount.length < 2) {
        decimal = this.addDecimals(cant);
      } else {
        let arrDecimals = arrAmount[1].split('');
        decimal = this.addDecimals(cant - arrDecimals.length, arrAmount[1]);
      }
      realAmount = `${arrAmount[0]}${decimal}`
    }
    return realAmount;
  }

  /**
   * Method to add leading zeros
   *
   * @param cant Quantity of zeros to add
   * @param amount Amount to add zeros
   */
  addDecimals(cant, amount = '0') {
    let x = '0';
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
  * @param {Address} [address=null]
  * @returns
  * @memberof TransactionsService
  */
  async getAccountInfo(address: Address): Promise<AccountInfo> {
    try {
      const accountInfo = await this.proximaxProvider.getAccountInfo(address).toPromise();
      // console.log(accountInfo);
      if (accountInfo !== null && accountInfo !== undefined) {
        //Search mosaics
        this.mosaicServices.searchInfoMosaics(accountInfo.mosaics.map(next => next.id));
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
    for (let publicAccount of publicsAccounts) {
      const aggregateTransaction = await this.proximaxProvider.getAggregateBondedTransactions(publicAccount).toPromise();
      aggregateTransaction.forEach((a: AggregateTransaction) => {
        const existTransction = aggregateTransactions.find(x => x.data.transactionInfo.hash === a.transactionInfo.hash);
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
  amountFormatter(amountParam: UInt64 | number, mosaic: MosaicInfo, manualDivisibility = '') {
    let amountFormatter = '';
    if (mosaic !== null && mosaic !== undefined) {
      const divisibility = (manualDivisibility === '') ? mosaic['properties'].divisibility : manualDivisibility;
      const amount = (typeof (amountParam) === 'number') ? amountParam : amountParam.compact();
      const amountDivisibility = Number(
        amount / Math.pow(10, divisibility)
      );

      amountFormatter = amountDivisibility.toLocaleString("en-us", {
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
  amountFormatterSimple(amount: Number) {
    const amountDivisibility = Number(amount) / Math.pow(10, 6);
    return amountDivisibility.toLocaleString("en-us", { minimumFractionDigits: 6 });
  }

  /**
   *
   * @param params
   */
  buildTransferTransaction(params: TransferInterface) {
    const recipientAddress = this.proximaxProvider.createFromRawAddress(params.recipient);
    const mosaics = params.mosaic;
    const allMosaics = [];
    mosaics.forEach(element => {
      allMosaics.push(new Mosaic(
        new MosaicId(element.id),
        UInt64.fromUint(Number(element.amount))
      )
      );
    });

    const transferTransaction = TransferTransaction.create(
      Deadline.create(5),
      recipientAddress,
      allMosaics,
      PlainMessage.create(params.message),
      params.network
    );

    const account = Account.createFromPrivateKey(params.common.privateKey, params.network);
    const signedTransaction = account.sign(transferTransaction, this.generationHash);
    const transactionHttp = this.buildTransactionHttp();
    return {
      signedTransaction: signedTransaction,
      transactionHttp: transactionHttp,
      transferTransaction: transferTransaction
    };
  }

  /**
   *
   * @param signedTransaction
   */
  buildHashLockTransaction(signedTransaction: SignedTransaction): LockFundsTransaction {
    return HashLockTransaction.create(
      Deadline.create(),
      new Mosaic(new MosaicId(environment.mosaicXpxInfo.id), UInt64.fromUint(Number(10000000))),
      UInt64.fromUint(480),
      signedTransaction,
      this.walletService.currentAccount.network
    );
  }


  /**
   *
   * @param sender
   * @param transaction
   */
  buildAggregateTransaction(sender: PublicAccount, transaction: Transaction): AggregateTransaction {
    // console.log('sender --->', sender);
    return AggregateTransaction.createBonded(
      Deadline.create(),
      [transaction.toAggregate(sender)],
      this.walletService.currentAccount.network
    );
  }


  /**
   *
   */
  buildTransactionHttp(protocol = environment.protocol, node = this.nodeService.getNodeSelected()) {
    return new TransactionHttp(
      protocol + "://" + `${node}`
    );
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
    let days = Math.floor(seconds / (3600 * 24));
    seconds -= days * 3600 * 24;
    let hrs = Math.floor(seconds / 3600);
    seconds -= hrs * 3600;
    let mnts = Math.floor(seconds / 60);
    seconds -= mnts * 60;
    const response = days + " days, " + hrs + " Hrs, " + mnts + " Minutes, " + seconds + " Seconds";
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
    ).toUTCString();
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
    return n
      .toString()
      .replace(
        /((?!^)|(?:^|.*?[^\d.,])\d{1,3})(\d{3})(?=(?:\d{3})*(?!\d))/gy,
        "$1,$2"
      );
  }


  validateBuildSelectAccountBalance(balanceAccount: number, feeTransaction: number, rental: number): boolean {
    const totalFee = feeTransaction + rental;
    // console.log('balanceAccount', balanceAccount)
    // console.log('totalFee', totalFee)
    return (balanceAccount >= totalFee)

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
    }
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
   * @param {Transaction} transaction
   * @returns {ConfirmedTransactions}
   * @memberof TransactionsService
   */
  getStructureDashboard(transaction: Transaction, othersTransactions?: TransactionsInterface[]): TransactionsInterface {
    if (othersTransactions && othersTransactions.length > 0) {
      const x = othersTransactions.filter(next => next.data.transactionInfo.hash === transaction.transactionInfo.hash);
      if (x && x.length > 0) {
        return null;
      }
    }

    const keyType = this.getNameTypeTransaction(transaction.type);
    if (keyType !== undefined) {
      let recipientRentalFeeSink = '';
      if (transaction["mosaics"] === undefined) {
        if (transaction.type === this.arraTypeTransaction.registerNameSpace.id) {
          recipientRentalFeeSink = this.namespaceRentalFeeSink.address_public_test;
        } else if (
          transaction.type === this.arraTypeTransaction.mosaicDefinition.id ||
          transaction.type === this.arraTypeTransaction.mosaicSupplyChange.id
        ) {
          recipientRentalFeeSink = this.mosaicRentalFeeSink.address_public_test;
        } else {
          recipientRentalFeeSink = "XXXXXX-XXXXXX-XXXXXX-XXXXXX-XXXXXX-XXXX";
        }
      }

      let recipient = null;
      let recipientPretty = null;
      let isReceive = false;
      if (transaction['recipient'] !== undefined) {
        recipient = transaction['recipient'];
        recipientPretty = transaction['recipient'].pretty();
        const currentWallet = Object.assign({}, this.walletService.getCurrentWallet());
        if (currentWallet.accounts) {
          if (currentWallet.accounts.find(element => this.proximaxProvider.createFromRawAddress(element.address).pretty() === transaction["recipient"].pretty())) {
            isReceive = true;
          }
        }
      }

      const feeFormatter = this.amountFormatterSimple(transaction.maxFee.compact());
      let nameType = this.arraTypeTransaction[keyType].name;
      try {
        if (transaction['message'] && transaction['message'].payload !== '') {
          const msg = JSON.parse(transaction['message'].payload);
          if (transaction.signer.address.plain() === environment.swapAccount.address) {
            if (msg && msg['type'] && msg['type'] === 'Swap') {
              nameType = 'ProximaX Swap'
            }
          }
        }
      } catch (error) {
        // console.log(error);
      }

      return {
        data: transaction,
        nameType: nameType,
        timestamp: this.dateFormat(transaction.deadline),
        fee: feeFormatter,
        feePart: this.getDataPart(feeFormatter, 6),
        sender: transaction.signer,
        recipientRentalFeeSink: recipientRentalFeeSink,
        recipient: recipient,
        recipientAddress: recipientPretty,
        receive: isReceive,
        senderAddress: transaction['signer'].address.pretty()
      }
    }
    return null;
  }

  /**
   *
   *
   * @param {*} type
   * @returns
   * @memberof TransactionsService
   */
  getNameTypeTransaction(type: any) {
    return Object.keys(this.arraTypeTransaction).find(elm => this.arraTypeTransaction[elm].id === type);
  }

  /**
   *
   * @memberof TransactionsService
   */
  monitorNewAccounts() {
    this.walletService.getAccountsPushedSubject().subscribe(
      next => {
        if (next && next.length > 0) {
          // console.log('=== YOU HAVE NEW ACCOUNT ===', next);
          this.searchAccountsInfo(next);
        }
      }
    );
  }

  /**
   * Search all account information
   * @param pushed
   */
  searchAccountsInfo(accounts: AccountsInterface[]) {
    // console.log('ACCOUNTS INTERFACE ---> ', accounts);
    this.walletService.searchAccountsInfo(accounts).then(
      (data: { mosaicsId: MosaicId[], accountsInfo: AccountsInfoInterface[] }) => {
        console.log('=== DATA ===', data);
        this.walletService.validateMultisigAccount(accounts);
        const publicsAccounts: PublicAccount[] = [];
        data.accountsInfo.forEach((element: AccountsInfoInterface) => {
          if (element.accountInfo) {
            publicsAccounts.push(this.proximaxProvider.createPublicAccount(
              element.accountInfo.publicKey,
              element.accountInfo.publicAccount.address.networkType
            ));
          }
        });

        // console.log('==== publicsAccounts ====', publicsAccounts);
        // Search all transactions aggregate bonded from array publics accounts
        if (publicsAccounts.length > 0) {
          this.searchAggregateBonded(publicsAccounts);
        }

        this.updateBalance();
        if (data.mosaicsId && data.mosaicsId.length > 0) {
          this.mosaicServices.searchInfoMosaics(data.mosaicsId)
        }

      }
    ).catch(error => console.log(error));
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
    this.unconfirmedTransactionsSubject.next(transactions);
  }

  /**
   *
   * @param str
   */
  toHex(str: any) {
    var result = '';
    for (var i = 0; i < str.length; i++) {
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
    const currentAccount = Object.assign({}, this.walletService.getCurrentAccount());
    const dataBalance = accountsInfo.find(next => next.name === currentAccount.name);
    let balance = 0.000000;
    if (dataBalance && dataBalance.accountInfo) {
      // console.log('----dataBalance----', dataBalance);
      const x = dataBalance.accountInfo.mosaics.find(next => next.id.toHex() === environment.mosaicXpxInfo.id);
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
}


export interface TransactionsInterface {
  // data: Transaction;
  data: any;
  dateFile?: string;
  description?: string;
  nameType: string;
  timestamp: string;
  fee: string;
  feePart: {
    part1: string;
    part2: string;
  }
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
