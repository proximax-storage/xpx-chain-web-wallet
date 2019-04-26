import { Injectable } from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';
import { ProximaxProvider } from '../../shared/services/proximax.provider';
import { MosaicInfo, QueryParams, PublicAccount, Transaction } from 'proximax-nem2-sdk';
import { Observable, BehaviorSubject } from 'rxjs';
import { WalletService } from '../../shared/services/wallet.service';
import { MosaicService } from '../..//servicesModule/services/mosaic.service';
import { NemProvider } from 'src/app/shared/services/nem.provider';
import { TransactionsInterface } from './dashboard.interface';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  processComplete = false;
  isLogged$: Observable<boolean>;
  isIncrementViewDashboard = 0;
  searchComplete = false;


  infoMosaic: MosaicInfo;
  subscriptions = [
    'transactionsUnconfirmed',
    'transactionsConfirmed',
    'isLogged',
    'getAllTransactions'
  ];

  constructor(
    private authService: AuthService,
    private walletService: WalletService,
    private mosaicService: MosaicService,
    private nemProvider: NemProvider
  ) { }

  /**
  * Destroy all subscriptions
  *
  * @memberof DashboardService
  */
  destroySubscription() {
    this.subscriptions.forEach(element => {
      if (this.subscriptions[element] !== undefined) {
        this.subscriptions[element].unsubscribe();
      }
    });
  }


  /**
   * Subscribe if logged
   *
   * @memberof DashboardService
   */
  subscribeLogged() {
    if (this.isIncrementViewDashboard === 1) {
      this.isLogged$ = this.authService.getIsLogged();
      this.subscriptions['isLogged'] = this.isLogged$.subscribe(
        response => {
          if (response === false) {
            // DESTROY SUBSCRIPTION WHEN IS NOT LOGIN
            console.log("NOT LOGGED!");
            this.searchComplete = false;
            this.isIncrementViewDashboard = 0;
            this.destroySubscription();
            // this.subscriptions['isLogged'].unsubscribe();
            this.walletService.destroyAccountInfo();
            this.mosaicService.destroyMosaicCache();
            return;
          }
        }
      );
    }
  }




  /**
   *
   *
   * @param {PublicAccount} publicAccount
   * @param {QueryParams} [queryParams]
   * @returns {Observable<Transaction[]>}
   * @memberof DashboardService
   */
  getAllTransactionsPromise(publicAccount: PublicAccount, queryParams?: QueryParams): Promise<Transaction[]> {
    if (queryParams !== undefined) {
      return this.nemProvider.getAllTransactionsFromAccount(publicAccount, queryParams).toPromise();
    }

    return this.nemProvider.getAllTransactionsFromAccount(publicAccount, this.walletService.network).toPromise();
  }

  /**
   *
   *
   * @returns {number}
   * @memberof DashboardService
   */
  getCantViewDashboard(): number {
    return this.isIncrementViewDashboard;
  }


  /**
   * Verify if the dashboard was loaded once
   *
   * @memberof DashboardService
   */
  incrementViewDashboard() {
    this.isIncrementViewDashboard++;
  }
}
