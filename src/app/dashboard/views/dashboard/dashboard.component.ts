import { Component, OnInit, ViewChild } from '@angular/core';
import { mergeMap, first } from 'rxjs/operators'
import {
  TransferTransaction,
  Deadline,
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
import { Observable } from "rxjs";
import { LoginService } from "../../../login/services/login.service";

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
  isLogged$: Observable<boolean>;
  headElements = ['Account', 'Amount', 'Mosaic', 'Date'];
  subscriptions = [
    'transactionsUnconfirmed',
    'getTransConfirm'
  ];

  constructor(
    private loginService: LoginService,
    private walletService: WalletService,
    private nemProvider: NemProvider,
    private transactionsService: TransactionsService
  ) {
  }

  ngOnInit() {
    this.isLogged$ = this.loginService.getIsLogged();
    this.isLogged$.subscribe(
      response => {
        if (response === false) {
          this.subscriptions['transactionsUnconfirmed'].unsubscribe();
          this.subscriptions['getTransConfirm'].unsubscribe();
        }
      }
    );

    this.verifyTransactions();
    this.getTransactionsUnconfirmed();
  }

  /**
   * Valid if there are observable transactions
   *
   * @memberof DashboardComponent
   */
  verifyTransactions() {
    this.subscriptions['getTransConfirm'] = this.transactionsService.getTransConfirm$().pipe(first()).subscribe(
      resp => {
        if (resp.length > 0) {
          this.cantConfirmed = resp.length;
          this.elementsConfirmed = resp;
          return;
        }
        this.getAllTransactions();
        return;
      });
  }

  getTransactionsUnconfirmed() {
    this.subscriptions['transactionsUnconfirmed'] = this.transactionsService.getTransactionsUnconfirmed$().subscribe(
      resp => {
        this.cantUnconfirmed = resp.length;
        this.elementsUnconfirmed = resp;
      }
    );
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

  getBalance() {
    //obtener balance de la cuenta d
    this.nemProvider.getBalance(this.walletService.address).pipe(
      mergeMap((_) => _)
    ).subscribe(mosaic => console.log('You have', mosaic, mosaic.fullName()),
      err => console.error(err));
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
}