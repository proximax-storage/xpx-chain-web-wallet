import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject, } from 'rxjs';
import { NemProvider } from "../../shared/services/nem.provider";
import { UInt64, TransferTransaction, Deadline, PlainMessage, NetworkType, TransactionHttp, Account, Mosaic, MosaicId } from "nem2-sdk";
import { WalletService } from "../../shared/services/wallet.service";
import { environment } from "../../../environments/environment";
import { NodeService } from '../../servicesModule/services/node.service';

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
    private nodeService: NodeService,
    private walletService: WalletService
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


  buildToSendTransfer(common, recipient, message, amount, network) {
    const recipientAddress = this.nemProvider.createFromRawAddress(recipient);
    const transferTransaction = TransferTransaction.create(
      Deadline.create(5),
      recipientAddress,
      //[new Mosaic(new MosaicId([3530084852,3559101211]),UInt64.fromUint(0))],
      [new Mosaic( new MosaicId(this.nemProvider.mosaic), UInt64.fromUint(Number(amount)))],
      PlainMessage.create(message),
      network);
    const account = Account.createFromPrivateKey(common.privateKey, network);
    const signedTransaction = account.sign(transferTransaction);
    const transactionHttp = new TransactionHttp(`https://${this.nodeService.getNodeSelected()}`);
    return {
      signedTransaction: signedTransaction,
      transactionHttp: transactionHttp
    };
  }

  formatTransaction(data) {
    let response = {};
    const date = `${data.deadline.value.monthValue()}/${data.deadline.value.dayOfMonth()}/${data.deadline.value.year()}`;
    const isRemitent = this.walletService.address.pretty() === data.recipient.pretty();
    return  response = {
      address: data.signer.address.pretty(),
      amount: data['mosaics'][0].amount.compact(),
      message: data['message'],
      transactionInfo: data.transactionInfo,
      fee: data.fee.compact(),
      mosaic: 'pxp',
      date: date,
      recipient: data['recipient'],
      signer: data.signer,
      isRemitent: isRemitent
    };
  }
}
