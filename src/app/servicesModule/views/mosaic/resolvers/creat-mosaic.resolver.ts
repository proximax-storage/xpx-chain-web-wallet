import { Injectable } from '@angular/core';
import { Resolve, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { of as observableOf } from 'rxjs';
import 'rxjs/add/operator/delay';
import { first, map, catchError } from 'rxjs/operators';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { QueryParams } from 'proximax-nem2-sdk';
import { NemProvider } from '../../../../shared/services/nem.provider';
import { WalletService } from '../../../../shared/services/wallet.service';
// import { ApiService } from '../../core/services/api.services';
import { SharedService } from '../../../../shared/services/shared.service';
import { AppConfig } from '../../../../config/app.config';
// import { AuthService } from '../../auth/services/auth.service';

@Injectable()
export class CreateMosaicResolver implements Resolve<any> {

  @BlockUI() blockUI: NgBlockUI;
  constructor(
    private router: Router,
    private sharedService: SharedService,
    private nemProvider: NemProvider,
    private walletService: WalletService,
  ) { }

  resolve() {
    this.blockUI.start('Loading...'); // Start blocking

    return this.nemProvider.namespaceHttp.getNamespacesFromAccount(this.walletService.address, new QueryParams(5)).pipe(first(), map(
      next => {
        console.log(next);
        this.blockUI.stop();
        for (let index = 0; index < 100; index++) {
          console.log(index);
        }
        return next;
      }), catchError(error => {
        console.log(error);
        this.blockUI.stop();
        this.router.navigate([AppConfig.routes.home]);
        this.sharedService.showError('', error);
        return observableOf(null);
      }));
    }
}

/*
     return this.apiService.get('persons').pipe(first(), map(
   next => {
     if (typeof next === 'object' && Object.keys(next).length > 0) {
       this.blockUI.stop(); // Stop blocking
       return next.body;
     } else {
       this.router.navigate([AppConfig.routes.login]);
       this.blockUI.stop(); // Stop blocking
       this.sharedService.showError('Error', 'data null!');
       return observableOf(null);
     }
   }), catchError(() => {
     this.blockUI.stop();
     this.authService.setLogged(false);
     this.router.navigate([AppConfig.routes.login]);
     this.sharedService.showError('', 'Ha ocurrido un error al buscar los documentos.');
     return observableOf(null);
   }));



return  this.nemProvider.namespaceHttp.getNamespacesFromAccount(this.walletService.address, new QueryParams(5)).subscribe(
 namespaceInfo => {
   if (typeof next === 'object' && Object.keys(next).length > 0) {
     this.blockUI.stop(); // Stop blocking
     return next.body;
   } else {
     this.router.navigate([AppConfig.routes.login]);
     this.blockUI.stop(); // Stop blocking
     this.sharedService.showError('Error', 'data null!');
     return observableOf(null);
   }
 }), catchError(() => {
   this.blockUI.stop();
   this.authService.setLogged(false);
   this.router.navigate([AppConfig.routes.login]);
   this.sharedService.showError('', 'Ha ocurrido un error al buscar los documentos.');
   return observableOf(null);
 }));*/
