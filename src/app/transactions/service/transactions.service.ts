import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject, } from 'rxjs';
import { NemProvider } from "../../shared/services/nem.provider";
import { TransferTransaction, Deadline, PlainMessage, NetworkType, TransactionHttp, XEM, Account } from "nem2-sdk";
import { WalletService } from "../../shared";
import { environment } from "../../../environments/environment";


@Injectable({
  providedIn: 'root'
})
export class TransactionsService {
  private _transConfirm = new BehaviorSubject<any>([]);
  private _transConfirm$: Observable<any> = this._transConfirm.asObservable();
  constructor(
    private nemProvider: NemProvider
  ) {

  }

  getTransConfirm$(): Observable<any> {
    return this._transConfirm$;
  }

  setTransConfirm$(data) {
    this._transConfirm.next(data);
  }

  sendTransfer(common, recipient, message, amount, network) {
    console.log(network);
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
    const transactionHttp = new TransactionHttp(environment.apiUrl);
    transactionHttp
      .announce(signedTransaction)
      .subscribe(
      x => console.log(x),
      err => console.error(err));
  }





}
