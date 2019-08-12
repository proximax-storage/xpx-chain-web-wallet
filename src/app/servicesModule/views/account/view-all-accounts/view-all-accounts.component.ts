import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { WalletService } from '../../../../wallet/services/wallet.service';
import { AppConfig } from '../../../../config/app.config';
import { SharedService } from '../../../../shared/services/shared.service';
import { TransactionsService } from '../../../../transfer/services/transactions.service';

@Component({
  selector: 'app-view-all-accounts',
  templateUrl: './view-all-accounts.component.html',
  styleUrls: ['./view-all-accounts.component.css']
})
export class ViewAllAccountsComponent implements OnInit {

  accountChanged: boolean = false;
  componentName = 'View all';
  currentWallet: any = [];
  moduleName = 'Accounts';
  objectKeys = Object.keys;
  routes = {
    backToService: `/${AppConfig.routes.service}`,
    createNewAccount: `/${AppConfig.routes.selectTypeCreationAccount}`,
    viewDetails: `/${AppConfig.routes.account}/`
  };
  subscriptions = ['accountInfo'];

  constructor(
    private transactionService: TransactionsService,
    private walletService: WalletService
  ) { }

  ngOnInit() {
    this.load();
  }

  ngOnDestroy(): void {
    // this.transactionService.setTransactionsConfirmed$([]);
    this.subscriptions.forEach(element => {
      if (this.subscriptions[element] !== undefined) {
        this.subscriptions[element].unsubscribe();
      }
    });
  }

  /**
   *
   *
   * @param {string} nameSelected
   * @memberof ViewAllAccountsComponent
   */
  changeAsPrimary(nameSelected: string) {
    // this.sharedService.showSuccess('', 'Account changed to default');
    this.accountChanged = true;
    this.walletService.changeAsPrimary(nameSelected);
    this.walletService.use(this.walletService.currentWallet);
    this.load();
    this.transactionService.updateBalance();
    setTimeout(() => {
      this.accountChanged = false;
    }, 2000);
  }

  /**
   *
   *
   * @memberof ViewAllAccountsComponent
   */
  load() {
    // console.log(this.walletService.accountsInfo);
    this.subscriptions['accountInfo'] = this.walletService.getAccountsInfo$().subscribe(
      next => {
        // console.log('----- ACCOUNT INFO -----', next);
        const currentWallet = Object.assign({}, this.walletService.currentWallet);
        if (currentWallet) {
          for (let element of currentWallet.accounts) {
            const accountFiltered = this.walletService.filterAccountInfo(element.name);
            if (accountFiltered && accountFiltered.accountInfo) {
              const mosaicXPX = accountFiltered.accountInfo.mosaics.find(next => next.id.toHex() === environment.mosaicXpxInfo.id);
              if (mosaicXPX) {
                element['balance'] = this.transactionService.amountFormatterSimple(mosaicXPX.amount.compact());
              } else {
                element['balance'] = '0.000000';
              }
            } else {
              element['balance'] = '0.000000';
            }
          }
          this.currentWallet = currentWallet;
        }
      }
    );
  }
}
