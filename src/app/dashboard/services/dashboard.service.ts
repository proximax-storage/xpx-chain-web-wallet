import { Injectable } from '@angular/core';
import { LoginService } from '../../login/services/login.service';
import { ProximaxProvider } from '../../shared/services/proximax.provider';
import { MosaicInfo } from 'proximax-nem2-sdk';
import { Observable, BehaviorSubject } from 'rxjs';
import { WalletService } from '../../shared/services/wallet.service';
import { MosaicService } from '../..//servicesModule/services/mosaic.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private transactionsSubject: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  private transactions$: Observable<any> = this.transactionsSubject.asObservable();


  isLogged$: Observable<boolean>;
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
    private loginService: LoginService,
    private proximaxProvider: ProximaxProvider,
    private walletService: WalletService,
    private mosaicService: MosaicService
  ) { }


  subscribeLogged() {
    this.isLogged$ = this.loginService.getIsLogged();
    if (this.isLoadedDashboard == 1) {
      this.isLogged$ = this.loginService.getIsLogged();
      this.subscriptions['isLogged'] = this.isLogged$.subscribe(
        response => {
          if (response === false) {
            // DESTROY SUBSCRIPTION WHEN IS NOT LOGIN
            console.log("Ha cambiado isLogged, destroy subscription");
            this.isLoadedDashboard = 0;
            this.proximaxProvider.destroyInfoMosaic();
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

  getTransactionsObs(): Observable<any> {
    return this.allTransactions.transactions$;
  }



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
      }
    });
  }

}
