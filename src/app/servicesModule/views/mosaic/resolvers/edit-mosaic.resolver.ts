import { Injectable } from '@angular/core';
import { Resolve, Router } from '@angular/router';
import { of as observableOf } from 'rxjs';
import { first, map, catchError } from 'rxjs/operators';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { QueryParams } from 'tsjs-xpx-catapult-sdk';
import { ProximaxProvider } from '../../../../shared/services/proximax.provider';
import { WalletService } from '../../../../shared/services/wallet.service';
import { SharedService } from '../../../../shared/services/shared.service';
import { AppConfig } from '../../../../config/app.config';

@Injectable()
export class EditMosaicResolver implements Resolve<any> {

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
        const response = [];
        if (next.length > 0) {
          for (let element of next) {
            this.proximaxProvider.getInfoMosaicFromNamespacePromise(element.id).then(
              rsp => {
                // console.log("rsprsp", rsp);
              }, error => {
                // console.log(error);
              }
            );
          }

          if (response.length > 0) {
            this.blockUI.stop();
            return next;
          } else {
            this.router.navigate([AppConfig.routes.createMosaic]);
            this.sharedService.showInfo('', 'You must create a mosaic');
            this.blockUI.stop();
            return next;
          }
        } else {
          this.blockUI.stop();
          this.sharedService.showError('', 'You must create a namespace');
          this.router.navigate([AppConfig.routes.createNamespace]);
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
