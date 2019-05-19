import { Injectable } from '@angular/core';
import { Resolve, Router } from '@angular/router';
import { of as observableOf } from 'rxjs';
import 'rxjs/add/operator/delay';
import { first, map, catchError } from 'rxjs/operators';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { QueryParams } from 'tsjs-xpx-catapult-sdk';
import { ProximaxProvider } from '../../../../shared/services/proximax.provider';
import { WalletService } from '../../../../shared/services/wallet.service';
import { SharedService } from '../../../../shared/services/shared.service';
import { AppConfig } from '../../../../config/app.config';

@Injectable()
export class CreateNamespaceResolver implements Resolve<any> {

  @BlockUI() blockUI: NgBlockUI;
  constructor(
    private router: Router,
    private sharedService: SharedService,
    private proximaxProvider: ProximaxProvider,
    private walletService: WalletService,
  ) { }

  resolve() {
    this.blockUI.start('Loading...'); // Start blocking
    return this.proximaxProvider.namespaceHttp.getNamespacesFromAccount(this.walletService.address, new QueryParams(5)).pipe(first(), map(
      next => {
        // console.log("All namespaces", next);
        if (next.length > 0) {
          this.blockUI.stop();
          return next;
        } else {
          this.blockUI.stop();
          return observableOf(null);
        }
      }), catchError(error => {
        // console.log(error);
        this.blockUI.stop();
        this.router.navigate([AppConfig.routes.home]);
        this.sharedService.showError('', error);
        return observableOf(null);
      }));
  }
}
