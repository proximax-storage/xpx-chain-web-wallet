import { Component, OnInit } from '@angular/core';
import {
  MosaicInfo
} from 'proximax-nem2-sdk';
import { Observable } from "rxjs";
import { LoginService } from "../../../login/services/login.service";
import { DashboardService } from '../../services/dashboard.service';
import { TransactionsService } from '../../../transactions/service/transactions.service';
import { WalletService } from 'src/app/shared';
import { NemProvider } from 'src/app/shared/services/nem.provider';
import { first } from 'rxjs/operators';
import { ProximaxProvider } from 'src/app/shared/services/proximax.provider';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  cantConfirmed = 0;
  elementsConfirmed: any = [];

  elementsUnconfirmed: any;
  confirmedSelected = true;
  unconfirmedSelected = false;
  cantUnconfirmed = 0;
  dataSelected: any;
  isLogged$: Observable<boolean>;
  headElements = ['Recipient', 'Amount', 'Mosaic', 'Date'];
  subscriptions = [
    'isLogged',
    'getConfirmedTransactionsCaché'
  ];
  infoMosaic: MosaicInfo;

  constructor(
    private loginService: LoginService,
    private dashboardService: DashboardService,
    private transactionsService: TransactionsService,
    private walletService: WalletService,
    private nemProvider: NemProvider,
    private proximaxProvider: ProximaxProvider
  ) {
  }

  ngOnInit() {
    this.dashboardService.loadedDashboard();
    if (this.dashboardService.isLoadedDashboard == 1) {
      console.log("subscription");
      this.isLogged$ = this.loginService.getIsLogged();
      this.subscriptions['isLogged'] = this.isLogged$.subscribe(
        response => {
          if (response === false) {
            // DESTROY SUBSCRIPTION WHEN IS NOT LOGIN
            console.log("destroy subscription");
            this.dashboardService.isLoadedDashboard = 0;
            this.dashboardService.destroySubscription();
            console.log(this.subscriptions['isLogged']);
            this.subscriptions['isLogged'].unsubscribe();
            return;
          }
        }
      );

      // this.dashboardService.getTransactions().then((transactions: any) => {
      //   console.log("Estas son las transacciones en caché", transactions);
      //   this.cantConfirmed = transactions.cantConfirmed;
      //   this.elementsConfirmed = transactions.elementsConfirmed;
      //   console.log("Aqui ya termina ese proceso");
      // });
    }

    this.subscriptions['getTransConfirm'] = this.transactionsService.getConfirmedTransactionsCaché$().subscribe(
      async cacheTransactions => {
        console.log("HAY ALGO EN CACHE?", cacheTransactions);
        if (cacheTransactions.length > 0) {
          console.log("IGUALA LAS VARIABLES Y PINTALAS PUES");
          this.cantConfirmed = cacheTransactions.length;
          this.elementsConfirmed = cacheTransactions;
        } else {
          if (this.dashboardService.isLoadedDashboard == 1) {
            console.warn("Anda y busca todas las transacciones");
            const allTrasactions = await this.getAllTransactions();
            console.log("Todas las transacciones", allTrasactions);
          }
        }
      }
    );



  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.subscriptions['getTransConfirm'].unsubscribe();
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


  /**
  * Get all transactions http and
  * Foreach and assign to elementsConfirmed, to then add it to the observable
  *
  * @memberof DashboardComponent
  */
  async getAllTransactions() {
    const promise = new Promise(async (resolve, reject) => {
      this.subscriptions['getAllTransactions'] = this.nemProvider.getAllTransactionsFromAccount(this.walletService.publicAccount, this.walletService.network).pipe(first()).subscribe(
        async allTrasactions => {
          const elementsConfirmed = [];
          if (allTrasactions.length > 0) {
            for (let element of allTrasactions) {
              // Get mosaic information
              await this.proximaxProvider.getInfoMosaic(element['mosaics'][0].id).then((mosaicInfo: MosaicInfo) => {
                this.infoMosaic = mosaicInfo;
                element['amount'] = this.nemProvider.formatterAmount(element['mosaics'][0].amount.compact(), this.infoMosaic.divisibility);
                elementsConfirmed.push(this.transactionsService.formatTransaction(element));
              });
            };
            this.transactionsService.setConfirmedTransaction$(elementsConfirmed);
          }
          resolve(true);
        }, error => {
          console.error("Has ocurred a error", error);
          reject(false);
        });
    });
    return await promise;
  }






















  // /**
  //  * Valid if there are observable transactions
  //  *
  //  * @memberof DashboardComponent
  //  */
  // verifyTransactions() {
  //   this.subscriptions['getTransConfirm'] = this.transactionsService.getConfirmedTransactionsCaché$().pipe(first()).subscribe(
  //     resp => {
  //       if (resp.length > 0) {
  //         this.cantConfirmed = resp.length;
  //         this.elementsConfirmed = resp;
  //         return;
  //       }
  //       this.getAllTransactions();
  //       return;
  //     });
  // }

  // getTransactionsUnconfirmed() {
  //   this.subscriptions['transactionsUnconfirmed'] = this.transactionsService.getTransactionsUnconfirmed$().subscribe(
  //     resp => {
  //       console.log("TRANSACTIONS UNCONFIRMED", resp);
  //       this.cantUnconfirmed = resp.length;
  //       this.elementsUnconfirmed = resp;
  //     }
  //   );
  // }

  // /**
  //  * Get all transactions http and
  //  * Foreach and assign to elementsConfirmed, to then add it to the observable
  //  *
  //  * @memberof DashboardComponent
  //  */
  // getAllTransactions() {
  //   this.subscriptions['getAllTransactions'] = this.nemProvider.getAllTransactionsFromAccount(this.walletService.publicAccount, this.walletService.network)
  //     .pipe(first()).subscribe(
  //       async allTrasactions => {
  //         this.cantConfirmed = 0;
  //         for (let element of allTrasactions) {
  //           await this.proximaxProvider.getInfoMosaic(element['mosaics'][0].id).then((mosaicInfo: MosaicInfo) => {
  //             this.infoMosaic = mosaicInfo;
  //             element['amount'] = this.nemProvider.formatterAmount(element['mosaics'][0].amount.compact(), this.infoMosaic.divisibility);
  //             this.elementsConfirmed.push(this.transactionsService.formatTransaction(element));
  //             this.transactionsService.setConfirmedTransaction$(this.elementsConfirmed);
  //             this.cantConfirmed++;
  //           });
  //         };
  //       }, error => {
  //         console.error(error);
  //       });
  // }


}
