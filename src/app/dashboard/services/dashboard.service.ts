import { Injectable } from '@angular/core';
import { MosaicInfo, QueryParams, PublicAccount, Transaction } from 'tsjs-xpx-chain-sdk';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth/services/auth.service';
import { WalletService } from '../../shared/services/wallet.service';
import { DataBridgeService } from '../../shared/services/data-bridge.service';
import { NamespacesService } from '../../servicesModule/services/namespaces.service';

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
    private dataBridgeService: DataBridgeService,
    private namespaceService: NamespacesService
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
            this.searchComplete = false;
            this.isIncrementViewDashboard = 0;
            this.destroySubscription();
            // this.subscriptions['isLogged'].unsubscribe();
            this.dataBridgeService.closeConenection();
            this.walletService.destroyAccountInfo();
            this.namespaceService.destroyDataNamespace();
            return;
          }
        }
      );
    }
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
