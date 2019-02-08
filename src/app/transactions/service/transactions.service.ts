import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, } from 'rxjs';
import { UInt64, TransferTransaction, Deadline, PlainMessage, NetworkType, TransactionHttp, Account, Mosaic, MosaicId, MosaicInfo, TransactionType, Transaction } from "proximax-nem2-sdk";
import { NemProvider } from "../../shared/services/nem.provider";
import { WalletService } from "../../shared/services/wallet.service";
import { NodeService } from '../../servicesModule/services/node.service';
import { environment } from '../../../environments/environment';
import { MessageService } from '../../shared/services/message.service';
import { ProximaxProvider } from '../../shared/services/proximax.provider';

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {

  private _transConfirmSubject: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  private _transConfirm$: Observable<any> = this._transConfirmSubject.asObservable();
  private _transactionsUnconfirmed = new BehaviorSubject<any>([]);
  private _transactionsUnconfirmed$: Observable<any> = this._transactionsUnconfirmed.asObservable();
  namespaceRentalFeeSink = environment.namespaceRentalFeeSink;
  mosaicRentalFeeSink = environment.mosaicRentalFeeSink;
  arraTypeTransaction = {
    transfer: {
      id: TransactionType.TRANSFER,
      name: 'Transfer'
    },
    registerNameSpace: {
      id: TransactionType.REGISTER_NAMESPACE,
      name: 'Register namespace'
    },
    mosaicDefinition: {
      id: TransactionType.MOSAIC_DEFINITION,
      name: 'Mosaic definition'
    },
    mosaicSupplyChange: {
      id: TransactionType.MOSAIC_SUPPLY_CHANGE,
      name: 'Mosaic supply change'
    },
    modifyMultisigAccount: {
      id: TransactionType.MODIFY_MULTISIG_ACCOUNT,
      name: 'Modify multisig account'
    },
    aggregateComplete: {
      id: TransactionType.AGGREGATE_COMPLETE,
      name: 'Aggregate complete'
    },
    aggregateBonded: {
      id: TransactionType.AGGREGATE_BONDED,
      name: 'Aggregate bonded'
    },
    lock: {
      id: TransactionType.LOCK,
      name: 'Lock'
    },
    secretLock: {
      id: TransactionType.SECRET_LOCK,
      name: 'Secret lock'
    },
    secretProof: {
      id: TransactionType.SECRET_PROOF,
      name: 'Secret proof'
    }
  };


  constructor(
    private nemProvider: NemProvider,
    private nodeService: NodeService,
    private walletService: WalletService,
    private messageService: MessageService,
    private proximaxProvider: ProximaxProvider
  ) {
  }

  destroyAllTransactions() {
    this.setConfirmedTransaction$([]);
    this.setTransactionsUnconfirmed$([]);
  }

  getConfirmedTransactionsCache$(): Observable<any> {
    console.log("Método que devuelve las transacciones en caché");
    this.messageService.changeMessage('balanceChanged');
    return this._transConfirm$;

  }

  setConfirmedTransaction$(data) {
    console.log("setConfirmedTransaction: Establece las transacciones confirmadas222");
    this._transConfirmSubject.next(data);
  }

  getTransactionsUnconfirmedCache$(): Observable<any> {
    return this._transactionsUnconfirmed$;
  }

  setTransactionsUnconfirmed$(data) {
    this._transactionsUnconfirmed.next(data);
  }


  buildToSendTransfer(common: { password?: any; privateKey?: any; }, recipient: string, message: string, amount: any, network: NetworkType) {
    console.log("Aqui construye la transaccion");
    const recipientAddress = this.nemProvider.createFromRawAddress(recipient);
    const transferTransaction = TransferTransaction.create(
      Deadline.create(5),
      recipientAddress,
      //[new Mosaic(new MosaicId([3530084852,3559101211]),UInt64.fromUint(0))],
      [new Mosaic(new MosaicId(this.nemProvider.mosaic), UInt64.fromUint(Number(amount)))],
      PlainMessage.create(message),
      network);
    const account = Account.createFromPrivateKey(common.privateKey, network);
    const signedTransaction = account.sign(transferTransaction);
    const transactionHttp = new TransactionHttp(environment.protocol + '://' + `${this.nodeService.getNodeSelected()}`);
    return {
      signedTransaction: signedTransaction,
      transactionHttp: transactionHttp
    };
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
  amountFormatter(amount: UInt64, mosaicId: MosaicId, mosaics: MosaicInfo[]) {
    for (let m of mosaics) {
      if (m.mosaicId.toHex() === mosaicId.toHex()) {
        const amountDivisibility = Number(amount.compact() / Math.pow(10, m.divisibility));
        return (amountDivisibility).toLocaleString('en-us', { minimumFractionDigits: m.divisibility });
      }
    }
  }


  dateFormat(deadline: Deadline) {
    return new Date(deadline.value.toString() + (Deadline.timestampNemesisBlock * 1000)).toUTCString();
  }


  /**
   * BUILD TRANSACTIONS CONFIRMED/UNCONFIRMED
   *
   * @param {Transaction[]} transactions
   * @returns
   * @memberof TransactionsService
   */
  async buildTransactions(transactions: Transaction[]) {
    console.log("*****TODAS LAS TRANSACCIONES*****", transactions);
    const elementsConfirmed = [];
    if (transactions.length > 0) {
      for (let element of transactions) {
        element['date'] = this.dateFormat(element.deadline);
        if (element['recipient'] !== undefined) {
          element['isRemitent'] = this.walletService.address.pretty() === element['recipient'].pretty();
        }
        Object.keys(this.arraTypeTransaction).forEach(elm => {
          if (this.arraTypeTransaction[elm].id === element.type) {
            element['name_type'] = this.arraTypeTransaction[elm].name;
          }
        });

        if (element['mosaics'] !== undefined) {
          // Crea un nuevo array con los id de mosaicos
          const mosaicsId = element['mosaics'].map((mosaic: Mosaic) => { return mosaic.id; });
          // Busca la información de los mosaicos, retorna una promesa
          await this.proximaxProvider.getInfoMosaics(mosaicsId).then((mosaicsInfo: MosaicInfo[]) => {
            console.log("RESPONSE MOSAIC INFO", mosaicsInfo);
            element['mosaicsInfo'] = mosaicsInfo;
            element['mosaics'].forEach((mosaic: any) => {
              // Da formato al monto de la transacción
              mosaic['amountFormatter'] = this.amountFormatter(mosaic.amount, mosaic.id, element['mosaicsInfo']);
            });
          });

          console.log(element);
          elementsConfirmed.push(element);
        } else {
          console.log(this.arraTypeTransaction.registerNameSpace.id, element.type);
          if (element.type === this.arraTypeTransaction.registerNameSpace.id) {
            element['recipientRentalFeeSink'] = this.namespaceRentalFeeSink.address_public_test;
          }else if (element.type === this.arraTypeTransaction.mosaicDefinition.id) {
            element['recipientRentalFeeSink'] = this.mosaicRentalFeeSink.address_public_test;
          }else if (element.type === this.arraTypeTransaction.mosaicSupplyChange.id) {
            element['recipientRentalFeeSink'] = this.mosaicRentalFeeSink.address_public_test;
          }else {
            element['recipientRentalFeeSink'] = 'XXXXX-XXXXX-XXXXXX';
          }

          console.log("***** ESTO NO TIENE MOSAICO *****");
          elementsConfirmed.push(element);
        }
      }
    }

    console.log("*********************************Aqui todo el mundo contestó*****************************************");
    return elementsConfirmed;
  }
}
