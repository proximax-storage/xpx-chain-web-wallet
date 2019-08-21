import { Component, OnInit } from '@angular/core';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { AppConfig } from 'src/app/config/app.config';
import { Subscription } from 'rxjs';
import { TransactionsService } from 'src/app/transfer/services/transactions.service';
import { WalletService } from 'src/app/wallet/services/wallet.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-multi-signature-contract',
  templateUrl: './multi-signature-contract.component.html',
  styleUrls: ['./multi-signature-contract.component.css']
})
export class MultiSignatureContractComponent implements OnInit {

  @BlockUI() blockUI: NgBlockUI;
  moduleName = 'Accounts';
  componentName = 'Multisign';
  objectKeys = Object.keys;
  currentWallet: any = [];
  routes = {
    backToService: `/${AppConfig.routes.service}`,
    convertToAccount: `/${AppConfig.routes.convertToAccountMultisign}`,
    viewDetails: `/${AppConfig.routes.account}/`
  };
  subscription: Subscription[] = [];
  constructor(
    private transactionService: TransactionsService,
    private walletService: WalletService,
    private sharedService: SharedService) { }

  ngOnInit() {
    this.load();
  }
  ngOnDestroy(): void {
    // console.log('----ngOnDestroy---');
    this.subscription.forEach(subscription => {
      // console.log(subscription);
      subscription.unsubscribe();
    });
  }


  /**
   *
   *
   * @memberof ViewAllAccountsComponent
   */
  build() {
    const currentWallet = Object.assign({}, this.walletService.currentWallet);
    if (currentWallet && Object.keys(currentWallet).length > 0) {
      for (let element of currentWallet.accounts) {
        const accountFiltered = this.walletService.filterAccountInfo(element.name);
        // if (accountFiltered && accountFiltered.accountInfo) {
        //   const mosaicXPX = accountFiltered.accountInfo.mosaics.find(next => next.id.toHex() === environment.mosaicXpxInfo.id);
        //   if (mosaicXPX) {
        //     element['balance'] = this.transactionService.amountFormatterSimple(mosaicXPX.amount.compact());
        //   } else {
        //     element['balance'] = '0.000000';
        //   }
        // } else {
        //   element['balance'] = '0.000000';
        // }
      }
      this.currentWallet = currentWallet;
    }
  }


    /**
   *
   *
   * @memberof MultiSignatureContractComponent
   */
  load() {
    // console.log(this.walletService.accountsInfo);
    this.subscription.push(this.walletService.getAccountsInfo$().subscribe(
      next => {
        // console.log('----- ACCOUNT INFO -----', next);
        this.build();
      }
    ));
  }

}
