import { Component, OnInit, ViewChild } from '@angular/core';
import { first } from 'rxjs/operators'
import {
  Transaction,
  MosaicInfo
} from 'proximax-nem2-sdk';
import { NemProvider } from '../../../shared/services/nem.provider';
import { WalletService } from '../../../shared';
import { TransactionsService } from "../../../transactions/service/transactions.service";
import { Observable } from "rxjs";
import { LoginService } from "../../../login/services/login.service";
import { ProximaxProvider } from '../../../shared/services/proximax.provider';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  infoMosaic: MosaicInfo;
  elementsConfirmed: any = [];
  elementsUnconfirmed: any = [];
  confirmedSelected = true;
  unconfirmedSelected = false;
  cantConfirmed = 0;
  cantUnconfirmed = 0;
  dataSelected: Transaction;
  isLogged$: Observable<boolean>;
  headElements = ['Recipient', 'Amount', 'Mosaic', 'Date'];
  subscriptions = [
    'transactionsUnconfirmed',
    'getTransConfirm',
    'isLogged',
    'getAllTransactions'
  ];

  constructor(
    private loginService: LoginService,
    private walletService: WalletService,
    private nemProvider: NemProvider,
    private transactionsService: TransactionsService,
    private proximaxProvider: ProximaxProvider
  ) {
  }

  ngOnInit() {
    // DESTROY SUBSCRIPTION WHEN IS NOT LOGIN
    this.isLogged$ = this.loginService.getIsLogged();
    this.subscriptions['isLogged'] = this.isLogged$.subscribe(
      response => {
        console.log(response);
        if (response === false) {
          this.subscriptions['transactionsUnconfirmed'].unsubscribe();
          this.subscriptions['getTransConfirm'].unsubscribe();
          this.subscriptions['isLogged'].unsubscribe();
          if (this.subscriptions['getAllTransactions'] !== undefined) {
            this.subscriptions['getAllTransactions'].unsubscribe();
          }
        } else {
          this.verifyTransactions();
          this.getTransactionsUnconfirmed();
        }
      }
    );
  }

  // function foreach async
  // date() {
  //   const waitFor = (ms) => new Promise(r => setTimeout(r, ms))
  //   const asyncForEach = async (array, callback) => {
  //     for (let index = 0; index < array.length; index++) {
  //       await callback(array[index], index, array)
  //     }
  //   }

  //   const start = async () => {
  //     await asyncForEach([1, 2, 3], async (num) => {
  //       console.log("entrale wey");
  //       await waitFor(50)
  //       console.log(num)
  //     })
  //     console.log('Done')
  //   }

  //   start()
  // }

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
        console.log("TRANSACTIONS UNCONFIRMED", resp);
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
    this.subscriptions['getAllTransactions'] = this.nemProvider.getAllTransactionsFromAccount(this.walletService.publicAccount, this.walletService.network)
      .pipe(first()).subscribe(
        async allTrasactions => {
          this.cantConfirmed = 0;
          for (let element of allTrasactions) {
            await this.proximaxProvider.getInfoMosaic(element['mosaics'][0].id).then((mosaicInfo: MosaicInfo) => {
              this.infoMosaic = mosaicInfo;
              element['amount'] = this.nemProvider.formatterAmount(element['mosaics'][0].amount.compact(), this.infoMosaic.divisibility);
              this.elementsConfirmed.push(this.transactionsService.formatTransaction(element));
              this.transactionsService.setTransConfirm$(this.elementsConfirmed);
              this.cantConfirmed++;
            });
          };
        }, error => {
          console.error(error);
        });
  }



  /**
   *
   *
   * @param {any} param
   * @memberof DashboardComponent
   */
  selectTab(param: any) {
    if (param === 1) {
      this.confirmedSelected = true;
      this.unconfirmedSelected = false;
    } else {
      this.confirmedSelected = false;
      this.unconfirmedSelected = true;
    }
  }
}
