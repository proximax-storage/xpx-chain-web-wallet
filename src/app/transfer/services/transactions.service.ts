import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject } from "rxjs";
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
  Address
} from "tsjs-xpx-chain-sdk";
import { first } from "rxjs/operators";
import { ProximaxProvider } from "../../shared/services/proximax.provider";
import { NodeService } from "../../servicesModule/services/node.service";
import { environment } from "../../../environments/environment";
import { MosaicService } from "../../servicesModule/services/mosaic.service";
import { NamespacesService } from "../../servicesModule/services/namespaces.service";
import { WalletService } from '../../wallet/services/wallet.service';



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
  private _transConfirmSubject = new BehaviorSubject<TransactionsInterface[]>([]);
  private _transConfirm$: Observable<TransactionsInterface[]> = this._transConfirmSubject.asObservable();
  //Unconfirmed
  private _transUnConfirmSubject = new BehaviorSubject<TransactionsInterface[]>([]);
  private _transUnConfirm$: Observable<TransactionsInterface[]> = this._transUnConfirmSubject.asObservable();


  namespaceRentalFeeSink = environment.namespaceRentalFeeSink;
  mosaicRentalFeeSink = environment.mosaicRentalFeeSink;
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
    secretLock: {
      id: TransactionType.SECRET_LOCK,
      name: "Secret lock"
    },
    /* secretProof: {
       id: TransactionType.SECRET_PROOF,
       name: "Secret proof"
     }*/
  };

  constructor(
    private proximaxProvider: ProximaxProvider,
    private nodeService: NodeService,
    private walletService: WalletService,
    private mosaicService: MosaicService,
    private namespaceService: NamespacesService
  ) { }


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
    const signedTransaction = account.sign(transferTransaction);
    const transactionHttp = new TransactionHttp(
      environment.protocol + "://" + `${this.nodeService.getNodeSelected()}`
    );
    return {
      signedTransaction: signedTransaction,
      transactionHttp: transactionHttp
    };
  }


  /**
   *
   *
   * @param {Transaction} transaction
   * @returns {ConfirmedTransactions}
   * @memberof TransactionsService
   */
  getStructureDashboard(transaction: Transaction): TransactionsInterface {
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
          recipientRentalFeeSink = "XXXXX-XXXXX-XXXXXX";
        }
      }

      let recipient = null;
      let recipientPretty = null;
      let isReceive = false;
      if (transaction['recipient'] !== undefined) {
        recipient = transaction['recipient'];
        recipientPretty = transaction['recipient'].pretty();
        this.walletService.currentWallet.accounts.forEach(element => {
          if (this.proximaxProvider.createFromRawAddress(element.address).pretty() === transaction["recipient"].pretty()) {
            isReceive = true;
          }
        });
      }

      return {
        data: transaction,
        nameType: this.arraTypeTransaction[keyType].name,
        timestamp: this.dateFormat(transaction.deadline),
        fee: this.amountFormatterSimple(transaction.maxFee.compact()),
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


  /**************************************************************** */

  buildToSendTransfer(
    common: { password?: any; privateKey?: any },
    recipient: string,
    message: string,
    amount: any,
    network: NetworkType,
    mosaic: string | number[]
  ) {
    const recipientAddress = this.proximaxProvider.createFromRawAddress(recipient);
    const mosaicId = new MosaicId(mosaic);

    const transferTransaction = TransferTransaction.create(
      Deadline.create(5),
      recipientAddress,
      [new Mosaic(mosaicId, UInt64.fromUint(Number(amount)))],
      PlainMessage.create(message),
      network
    );

    //console.log('transfer transaction', transferTransaction);
    const account = Account.createFromPrivateKey(common.privateKey, network);
    const signedTransaction = account.sign(transferTransaction);
    const transactionHttp = new TransactionHttp(
      environment.protocol + "://" + `${this.nodeService.getNodeSelected()}`
    );
    return {
      signedTransaction: signedTransaction,
      transactionHttp: transactionHttp
    };
  }

  toHex(str) {
    var result = '';
    for (var i = 0; i < str.length; i++) {
      result += str.charCodeAt(i).toString(16);
    }
    return result;
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
    const divisibility = (manualDivisibility === '') ? mosaic['properties'].divisibility : manualDivisibility;
    const amount = (typeof (amountParam) === 'number') ? amountParam : amountParam.compact();
    const amountDivisibility = Number(
      amount / Math.pow(10, divisibility)
    );

    const amountFormatter = amountDivisibility.toLocaleString("en-us", {
      minimumFractionDigits: divisibility
    });
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
    const response =
      days +
      " days, " +
      hrs +
      " Hrs, " +
      mnts +
      " Minutes, " +
      seconds +
      " Seconds";
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
  * @returns {Observable<TransactionsInterface[]>}
  * @memberof DashboardService
  */
  getTransactionsConfirmed$(): Observable<TransactionsInterface[]> {
    return this._transConfirm$;
  }

  /**
   *
   *
   * @returns {Observable<TransactionsInterface[]>}
   * @memberof DashboardService
   */
  getTransactionsUnConfirmed$(): Observable<TransactionsInterface[]> {
    return this._transUnConfirm$;
  }

  /**
   *
   *
   * @memberof TransactionsService
   */
  updateBalance() {
    this.proximaxProvider.getAccountInfo(this.walletService.address).pipe(first()).subscribe(
      (accountInfo: AccountInfo) => {
        // console.log('AccountInfo ---> ', accountInfo);
        if (accountInfo !== null && accountInfo !== undefined) {
          //Search mosaics
          this.mosaicService.searchMosaics(accountInfo.mosaics.map(next => next.id));
          // Save account info returned in walletService
          this.walletService.setAccountInfo(accountInfo);
          if (accountInfo.mosaics.length > 0) {
            accountInfo.mosaics.forEach(element => {
              // If mosaicId is XPX, set balance in XPX
              if (element.id.toHex() === this.proximaxProvider.mosaicXpx.mosaicId) {
                // console.log('fure...');
                this.setBalance$(element.amount.compact());
              }
            });
          } else {
            this.setBalance$("0.000000");
          }
        }
      },
      (_err: any) => {
        this.setBalance$("0.000000");
      }
    );
  }

  /**
   *
   *
   * @param {Address} [address=null]
   * @returns
   * @memberof TransactionsService
   */
  async getAccountInfo(address: Address): Promise<AccountInfo> {
    const accountInfo = await this.proximaxProvider.getAccountInfo(address).toPromise();
    console.log(accountInfo);
    if (accountInfo !== null && accountInfo !== undefined) {
      //Search mosaics
      this.mosaicService.searchMosaics(accountInfo.mosaics.map(next => next.id));
    }
    return accountInfo;
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
   * @memberof DashboardService
   */
  setTransactionsConfirmed$(transactions: TransactionsInterface[]) {
    this._transConfirmSubject.next(transactions);
  }

  /**
   *
   *
   * @param {TransactionsInterface[]} transactions
   * @memberof DashboardService
   */
  setTransactionsUnConfirmed$(transactions: TransactionsInterface[]) {
    this._transUnConfirmSubject.next(transactions);
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
      this.mosaicService.resetMosaicsStorage();
      this.namespaceService.resetNamespaceStorage();
    }

    this.namespaceService.buildNamespaceStorage();
    this.updateBalance();
  }

  /**
   * Method to add leading zeros
   *
   * @param cant Quantity of zeros to add
   * @param amount Amount to add zeros
   */
  addZeros(cant, amount = '0') {
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
}


export interface TransactionsInterface {
  data: Transaction;
  nameType: string;
  timestamp: string;
  fee: string;
  sender: PublicAccount;
  recipientRentalFeeSink: string;
  recipient: Address;
  recipientAddress: string;
  receive: boolean;
  senderAddress: string;
}
