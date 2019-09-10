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
  Address,
  MultisigAccountInfo,
  NamespaceId,
  AggregateTransaction
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
  private _transConfirmSubject = new BehaviorSubject<TransactionsInterface[]>([]);
  private _transConfirm$: Observable<TransactionsInterface[]> = this._transConfirmSubject.asObservable();
  //Unconfirmed
  private _transUnConfirmSubject = new BehaviorSubject<TransactionsInterface[]>([]);
  private _transUnConfirm$: Observable<TransactionsInterface[]> = this._transUnConfirmSubject.asObservable();
  generationHash: string;

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
  namespaceRentalFeeSink = environment.namespaceRentalFeeSink;
  mosaicRentalFeeSink = environment.mosaicRentalFeeSink;


  constructor(
    private proximaxProvider: ProximaxProvider,
    private nodeService: NodeService,
    private walletService: WalletService,
    private mosaicServices: MosaicService,
    private namespaceService: NamespacesService,
    // private dataBridge: DataBridgeService,
  ) {

   }


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
    // const generationHash = this.dataBridge.blockInfo.generationHash;
    console.log('generationHash',this.generationHash)
    const account = Account.createFromPrivateKey(params.common.privateKey, params.network);
    const signedTransaction = account.sign(transferTransaction, this.generationHash);
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
    let isValid = true;
    if (othersTransactions && othersTransactions.length > 0) {
      const x = othersTransactions.filter(next => next.data.transactionInfo.hash === transaction.transactionInfo.hash);
      if (x && x.length > 0) {
        isValid = false;
      }
    }

    const keyType = this.getNameTypeTransaction(transaction.type);
    if (keyType !== undefined && isValid) {
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
      return {
        data: transaction,
        nameType: this.arraTypeTransaction[keyType].name,
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
    // const generationHash = this.dataBridge.blockInfo.generationHash;
    const generationHash = ''
    const signedTransaction = account.sign(transferTransaction, generationHash); //Update-sdk-dragon
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
   * @param accounts
   * @param pushed
   */
  searchAccountsInfo(accounts: AccountsInterface[], pushed = false) {
    this.walletService.searchAccountsInfo(accounts).then(
      (mosaicsIds: MosaicId[]) => {
        this.updateBalance();
        if (mosaicsIds && mosaicsIds.length > 0) {
          this.mosaicServices.searchInfoMosaics(mosaicsIds)
        }
      }
    ).catch(error => console.log(error));
  }


  /**
   *
   *
   * @param {AccountsInfoInterface[]} accounts
   * @returns {Promise<AccountInfo[]>}
   * @memberof TransactionsService
   */
  async searchAccountsInfo2(accounts: AccountsInterface[], pushed = false) {//: Promise<AccountsInfoInterface[]> {
    const accountsInfo: AccountsInfoInterface[] = [];
    let counter = 0;
    accounts.forEach((element, i) => {
      //  console.log('paso esta cuenta...', element);
      this.proximaxProvider.getAccountInfo(this.proximaxProvider.createFromRawAddress(element.address)).pipe(first()).subscribe(
        async accountInfo => {
          const mosaicsIds: (NamespaceId | MosaicId)[] = [];
          if (accountInfo) {

            // if (element.default) {
            //   const mosaics = accountInfo.mosaics.slice(0);
            //   const findXPX = mosaics.find(mosaic => mosaic.id.toHex() === environment.mosaicXpxInfo.id);
            //   if (findXPX) {
            //     this.setBalance$(findXPX.amount.compact());
            //   } else {
            //     this.setBalance$('0.000000');
            //   }
            // }

            accountInfo.mosaics.map(n => n.id).forEach(id => {
              const pushea = mosaicsIds.find(next => next.id.toHex() === id.toHex());
              if (!pushea) {
                mosaicsIds.push(id);
              }
            });
          }

          // this.mosaicServices.searchMosaics(mosaicsIds);
          let isMultisig: MultisigAccountInfo = null;
          try {
            isMultisig = await this.proximaxProvider.getMultisigAccountInfo(this.proximaxProvider.createFromRawAddress(element.address)).toPromise();
          } catch (error) {
            isMultisig = null
          }
          const accountsInfo = [{
            name: element.name,
            accountInfo: accountInfo,
            multisigInfo: isMultisig
          }];

          const publicAccount = this.proximaxProvider.createPublicAccount(element.publicAccount.publicKey, element.publicAccount.address.networkType);
          this.walletService.changeIsMultiSign(element.name, isMultisig, publicAccount)
          this.walletService.setAccountsInfo(accountsInfo, true);
          counter = counter + 1;
          if (accounts.length === counter && mosaicsIds.length > 0) {
            this.mosaicServices.searchInfoMosaics(mosaicsIds);
          }
        }, error => {
          counter = counter + 1;
          if (accounts.length === i) {
          }
        }
      );
    });

    // return accountsInfo;
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
      this.mosaicServices.resetMosaicsStorage();
      this.namespaceService.resetNamespaceStorage();
    }

    //  this.namespaceService.buildNamespaceStorage();
    // this.updateBalance2();
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
