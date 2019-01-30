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
  searching = false;

  headElements = ['Recipient', 'Amount', 'Mosaic', 'Date'];
  subscriptions = [
    'getConfirmedTransactionsCache',
    'transactionsUnconfirmed',
    'getAllTransactions',
    'getTransConfirm'
  ];
  infoMosaic: MosaicInfo;

  constructor(
    private dashboardService: DashboardService,
    private transactionsService: TransactionsService,
    private walletService: WalletService,
    private nemProvider: NemProvider,
    private proximaxProvider: ProximaxProvider
  ) {
  }

  ngOnInit() {
    this.dashboardService.loadedDashboard();
    this.dashboardService.subscribeLogged();
    this.getConfirmedTransactions();
    this.getUnconfirmedTransactions();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(element => {
      if (this.subscriptions[element] !== undefined && this.subscriptions[element] !== 'isLogged') {
        console.log("Destruye: ", element);
        this.subscriptions[element].unsubscribe();
      }
    });
  }

  /**
   * Get all confirmed transactions
   *
   * @memberof DashboardComponent
   */
  getConfirmedTransactions() {
    this.searching = true;
    this.subscriptions['getTransConfirm'] = this.transactionsService.getConfirmedTransactionsCache$().subscribe(
      async cacheTransactions => {
        console.log("HAY ALGO EN CACHE DE LAS TRANSACCIONES CONFIRMADAS?", cacheTransactions);
        if (cacheTransactions.length > 0) {
          if (cacheTransactions.length > 10) {
            this.elementsConfirmed = cacheTransactions.slice(0, 10);
            this.cantConfirmed = this.elementsConfirmed.length;
            this.searching = false;
          } else {
            console.log("IGUALA LAS VARIABLES Y PINTALAS PUES");
            this.cantConfirmed = cacheTransactions.length;
            this.elementsConfirmed = cacheTransactions;
            this.searching = false;
          }
        } else {
          if (this.dashboardService.isLoadedDashboard == 1) {
            const allTrasactions = await this.getAllTransactions();
          }
        }
      }
    );
  }

  getUnconfirmedTransactions() {
    this.subscriptions['transactionsUnconfirmed'] = this.transactionsService.getTransactionsUnconfirmedCache$().subscribe(
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
  async getAllTransactions() {
    const promise = new Promise(async (resolve, reject) => {
      this.subscriptions['getAllTransactions'] = this.nemProvider.getAllTransactionsFromAccount(this.walletService.publicAccount, this.walletService.network).pipe(first()).subscribe(
        async allTrasactions => {
          console.log("All transactions", allTrasactions);
          const elementsConfirmed = [];
          if (allTrasactions.length > 0) {
            for (let element of allTrasactions) {
              // Get mosaic information
              if (element['mosaics'] !== undefined && element['mosaics'].length > 0) {
                await this.proximaxProvider.getInfoMosaic(element['mosaics'][0].id).then((mosaicInfo: MosaicInfo) => {
                  this.infoMosaic = mosaicInfo;
                  element['amount'] = this.nemProvider.formatterAmount(element['mosaics'][0].amount.compact(), this.infoMosaic.divisibility);
                  elementsConfirmed.push(this.transactionsService.formatTransaction(element));
                });
              };
              this.transactionsService.setConfirmedTransaction$(elementsConfirmed);
            }
          }
          this.searching = false;
          resolve(true);
        }, error => {
          this.searching = false;
          console.error("Has ocurred a error", error);
          reject(false);
        });
    });
    return await promise;
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
