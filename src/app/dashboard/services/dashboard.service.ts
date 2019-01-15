import { Injectable } from '@angular/core';
import { TransactionsService } from "../../transactions/service/transactions.service";
import { first } from 'rxjs/operators';
import { LoginService } from '../../login/services/login.service';
import { WalletService } from '../../shared';
import { NemProvider } from '../../shared/services/nem.provider';
import { ProximaxProvider } from '../../shared/services/proximax.provider';
import { Transaction, MosaicInfo } from 'proximax-nem2-sdk';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private transactionsSubject: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  private transactions$: Observable<any> = this.transactionsSubject.asObservable();


  isLoadedDashboard = 0;
  allTransactions: any;
  infoMosaic: MosaicInfo;
  subscriptions = [
    'transactionsUnconfirmed',
    'getTransConfirm',
    'isLogged',
    'getAllTransactions'
  ];
  constructor(
    private walletService: WalletService,
    private nemProvider: NemProvider,
    private transactionsService: TransactionsService,
    private proximaxProvider: ProximaxProvider,
  ) { }



  getTransactionsObs(): Observable<any> {
    return this.allTransactions.transactions$;
  }


  /**
   * Valid if there are observable transactions
   *
   * @memberof DashboardComponent
  //  */
  // async getTransactions() {
  //   const promise = new Promise(async (resolve, reject) => {
  //     // Search all transactions confirmed in cache
  //     this.subscriptions['getTransConfirm'] = this.transactionsService.getConfirmedTransactionsCaché$().pipe(first()).subscribe(
  //       async resp => {
  //         console.log("Esto fue lo que consiguió en getConfirmedTransactionsCaché", resp);
  //         if (resp.length > 0) {
  //           console.log("Ya lo tengo en caché, ya una vez lo buscó y es mayor a cero!");
  //           const cantConfirmed = resp.length;
  //           const elementsConfirmed = resp;
  //           resolve({
  //             'cantConfirmed': cantConfirmed,
  //             'elementsConfirmed': elementsConfirmed,
  //             'infoMosaic': this.infoMosaic
  //           });
  //         } else {
  //           console.log("se siguió ejecutando y busca TODAS las transacciones.");
  //           // Get all transactions
  //           this.allTransactions = await this.getAllTransactions();
  //           resolve(this.allTransactions);
  //         }
  //       });
  //   });
  //   return await promise;
  // }

  /**
   * Get all transactions http and
   * Foreach and assign to elementsConfirmed, to then add it to the observable
   *
   * @memberof DashboardComponent
   */
  // async getAllTransactions() {
  //   const promise = new Promise(async (resolve, reject) => {
  //     this.subscriptions['getAllTransactions'] =
  //       this.nemProvider.getAllTransactionsFromAccount(this.walletService.publicAccount, this.walletService.network).pipe(first()).subscribe(
  //         async allTrasactions => {
  //           console.log("ESTOY EN TODAS LAS TRANSACCIONES -----------", allTrasactions);
  //           const elementsConfirmed = [];
  //           const cantConfirmed = allTrasactions.length;
  //           for (let element of allTrasactions) {
  //             // Get mosaic information
  //             await this.proximaxProvider.getInfoMosaic(element['mosaics'][0].id).then((mosaicInfo: MosaicInfo) => {
  //               console.log("Aqui me respondio getInfoMosaic");
  //               this.infoMosaic = mosaicInfo;
  //               element['amount'] = this.nemProvider.formatterAmount(element['mosaics'][0].amount.compact(), this.infoMosaic.divisibility);
  //               elementsConfirmed.push(this.transactionsService.formatTransaction(element));
  //             });
  //           };

  //           console.log("Done!");
  //           this.transactionsService.setConfirmedTransaction$(elementsConfirmed);
  //           resolve({
  //             'cantConfirmed': cantConfirmed,
  //             'elementsConfirmed': elementsConfirmed,
  //             'infoMosaic': this.infoMosaic
  //           });
  //         }, error => {
  //           console.error("Has ocurred a error", error);
  //           reject(error);
  //         });
  //   });
  //   return await promise;
  // }

  // getTransactionsUnconfirmed() {
  //   this.subscriptions['transactionsUnconfirmed'] = this.transactionsService.getTransactionsUnconfirmed$().subscribe(
  //     resp => {
  //       console.log("TRANSACTIONS UNCONFIRMED", resp);
  //       this.cantUnconfirmed = resp.length;
  //       const elementsUnconfirmed = resp;
  //     }
  //   );
  // }

  /**
   * Verify if the dashboard was loaded once
   *
   * @memberof DashboardService
   */
  loadedDashboard() {
    this.isLoadedDashboard++;
  }

  /**
   * Destroy all subscriptions
   *
   * @memberof DashboardService
   */
  destroySubscription() {
    this.subscriptions.forEach(element => {
      if (this.subscriptions[element] !== undefined) {
        this.subscriptions[element].unsubscribe();
        this.proximaxProvider.destroyInfoMosaic();
      }
    });
  }

}
