import { Component, OnInit, ViewChild } from '@angular/core';
import { mergeMap, first } from 'rxjs/operators'
import {
  TransferTransaction,
  Deadline,
  XEM,
  PlainMessage,
  NetworkType,
  Account,
  TransactionHttp,
  PublicAccount,
  Transaction
} from 'nem2-sdk';
import { NemProvider } from '../../../shared/services/nem.provider';
import { WalletService } from '../../../shared';
import { TransactionsService } from "../../../transactions/service/transactions.service";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  elementsConfirmed: any = [];
  elementsUnconfirmed: any = [];
  confirmedSelected = true;
  unconfirmedSelected = false;
  cantConfirmed = 0;
  cantUnconfirmed = 0;
  dataSelected: Transaction;
  headElements = ['Account', 'Amount', 'Mosaic', 'Date'];


  constructor(
    private walletService: WalletService,
    private nemProvider: NemProvider,
    private transactionsService: TransactionsService
  ) {
  }

  ngOnInit() {
    this.verifyTransactions();
  }

  /**
   * Valid if there are observable transactions
   *
   * @memberof DashboardComponent
   */
  verifyTransactions() {
    this.transactionsService.getTransConfirm$().subscribe(
      resp => {
        if (resp.length > 0) {
          this.cantConfirmed = resp.length;
          this.elementsConfirmed = resp;
          return;
        }
        this.getAllTransactions();
        return;
      });

      this.transactionsService.getTransactionsUnconfirmed$().subscribe(
        resp => {
          this.cantUnconfirmed = resp.length;
          this.elementsUnconfirmed = resp;
        }
      );
  }

  getBalance() {
    //obtener balance de la cuenta d
    this.nemProvider.getBalance(this.walletService.address).pipe(
      mergeMap((_) => _)
    ).subscribe(mosaic => console.log('You have', mosaic, mosaic.fullName()),
      err => console.error(err));
  }

  /**
   * Get all transactions http and
   * Foreach and assign to elementsConfirmed, to then add it to the observable
   *
   * @memberof DashboardComponent
   */
  getAllTransactions() {
    this.nemProvider.getAllTransactionsFromAccount(this.walletService.publicAccount, this.walletService.network).pipe(first()).subscribe(
      trans => {
        trans.forEach(element => {
          this.cantConfirmed = trans.length;
          this.elementsConfirmed.push(this.transactionsService.formatTransaction(element));
          console.log('elementsConfirmed::::', this.elementsConfirmed);
        });
        this.transactionsService.setTransConfirm$(this.elementsConfirmed);
      },
      error => {
        console.error(error);
      });
  }

  /**
   *
   *
   * @param {any} param
   * @memberof DashboardComponent
   */
  selectTab(param) {
    if (param === 1) {
      this.confirmedSelected = true;
      this.unconfirmedSelected = false;
    } else {
      this.confirmedSelected = false;
      this.unconfirmedSelected = true;
    }
  }

  // enviarTrasferencia() {
  //   //9E8A529894129F737C40560DCAE25E99C91C18F55E2417C1188398DB0D3D09BD  private key
  //   const recipientAddress = this.nemProvider.createFromRawAddress('SB3RWA-5O4EHD-64WZU3-5C3FTC-5QFYSN-P64VCV-NDX3');
  //   const transferTransaction = TransferTransaction.create(
  //     Deadline.create(),
  //     recipientAddress,
  //     [XEM.createRelative(10000000)],
  //     PlainMessage.create('Welcome To NEM'),
  //     NetworkType.MIJIN_TEST);
  //   const account = Account.createFromPrivateKey('0F3CC33190A49ABB32E7172E348EA927F975F8829107AAA3D6349BB10797D4F6', NetworkType.MIJIN_TEST);
  //   const signedTransaction = account.sign(transferTransaction);

  //   const transactionHttp = new TransactionHttp('http://192.168.10.38:3000/');

  //   transactionHttp
  //     .announce(signedTransaction)
  //     .subscribe(
  //     x => console.log(x),
  //     err => console.error(err));
  // }
}
