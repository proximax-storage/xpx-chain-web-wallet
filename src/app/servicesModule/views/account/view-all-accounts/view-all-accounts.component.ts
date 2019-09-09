import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { WalletService } from '../../../../wallet/services/wallet.service';
import { AppConfig } from '../../../../config/app.config';
import { SharedService } from '../../../../shared/services/shared.service';
import { TransactionsService } from '../../../../transactions/services/transactions.service';
import { Subscription } from 'rxjs';
import { NamespacesService } from 'src/app/servicesModule/services/namespaces.service';
import { HeaderServicesInterface } from '../../../services/services-module.service';

@Component({
  selector: 'app-view-all-accounts',
  templateUrl: './view-all-accounts.component.html',
  styleUrls: ['./view-all-accounts.component.css']
})
export class ViewAllAccountsComponent implements OnInit {

  paramsHeader: HeaderServicesInterface = {
    moduleName: 'Accounts',
    componentName: 'VIEW ALL',
    extraButton: 'Create New Account',
    routerExtraButton: `/${AppConfig.routes.selectTypeCreationAccount}`
  };
  accountChanged: boolean = false;
  currentWallet: any = [];
  objectKeys = Object.keys;
  routes = {
    backToService: `/${AppConfig.routes.service}`,
    createNewAccount: `/${AppConfig.routes.selectTypeCreationAccount}`,
    viewDetails: `/${AppConfig.routes.account}/`
  };
  subscription: Subscription[] = [];

  constructor(
    private transactionService: TransactionsService,
    private walletService: WalletService,
    private sharedService: SharedService,
    private namespacesService: NamespacesService
  ) { }

  ngOnInit() {
    this.subscribeAccountInfoToBuildBalance();
  }

  ngOnDestroy(): void {
    // console.log('----ngOnDestroy---');
    this.subscription.forEach(subscription => {
      // console.log(subscription);
      subscription.unsubscribe();
    });
  }

  /**
   * Add balance to all accounts
   *
   * @memberof ViewAllAccountsComponent
   */
  buildBalance() {
    const currentWallet = Object.assign({}, this.walletService.currentWallet);
    if (currentWallet && Object.keys(currentWallet).length > 0) {
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

  /**
   *
   * @param message
   */
  copyMessage(message: string) {
    this.sharedService.showSuccess('', `${message} copied`);
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
    this.namespacesService.fillNamespacesDefaultAccount();
    this.buildBalance();
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
  subscribeAccountInfoToBuildBalance() {
    this.subscription.push(this.walletService.getAccountsInfo$().subscribe(
      next => {
        this.buildBalance();
      }
    ));
  }
}
