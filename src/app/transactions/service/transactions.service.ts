import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject, } from 'rxjs';
import { NemProvider } from "../../shared/services/nem.provider";
import { TransferTransaction, Deadline, PlainMessage, NetworkType, TransactionHttp, XEM, Account } from "nem2-sdk";
import { WalletService } from "../../shared";
import { environment } from "../../../environments/environment";
import { ServiceModuleService } from "../../servicesModule/services/service-module.service";


@Injectable({
  providedIn: 'root'
})
export class TransactionsService {
  private _transConfirm = new BehaviorSubject<any>([]);
  private _transConfirm$: Observable<any> = this._transConfirm.asObservable();
  private _transactionsUnconfirmed = new BehaviorSubject<any>([]);
  private _transactionsUnconfirmed$: Observable<any> = this._transactionsUnconfirmed.asObservable();

  constructor(
    private nemProvider: NemProvider,
    private serviceModule: ServiceModuleService
  ) {

  }

  destroyAllTransactions() {
    this.setTransConfirm$([]);
    this.setTransactionsUnconfirmed$([]);
  }

  getTransConfirm$(): Observable<any> {
    return this._transConfirm$;
  }

  setTransConfirm$(data) {
    this._transConfirm.next(data);
  }

  getTransactionsUnconfirmed$(): Observable<any> {
    return this._transactionsUnconfirmed$;
  }

  setTransactionsUnconfirmed$(data) {
    this._transactionsUnconfirmed.next(data);
  }


  sendTransfer(common, recipient, message, amount, network) {
    //9E8A529894129F737C40560DCAE25E99C91C18F55E2417C1188398DB0D3D09BD  private key
    const recipientAddress = this.nemProvider.createFromRawAddress(recipient);
    const transferTransaction = TransferTransaction.create(
      Deadline.create(5),
      recipientAddress,
      [XEM.createRelative(Number(1))],
      PlainMessage.create(message),
      network);
    const account = Account.createFromPrivateKey(common.privateKey, network);
    const signedTransaction = account.sign(transferTransaction);
    const transactionHttp = new TransactionHttp(`http://${this.serviceModule.getNode()}`);
    return {
      signedTransaction: signedTransaction,
      transactionHttp: transactionHttp
    };
  }

  formatTransaction(data) {
    const date = `${data.deadline.value.monthValue()}/${data.deadline.value.dayOfMonth()}/${data.deadline.value.year()}`;
    return  data = {
      address: data.signer.address['address'],
      amount: data['mosaics'][0].amount.compact(),
      message: data['message'],
      transactionInfo: data.transactionInfo,
      fee: data.fee.compact(),
      mosaic: 'xem',
      date: date,
      recipient: data['recipient'],
      signer: data.signer
    };
  }
}
