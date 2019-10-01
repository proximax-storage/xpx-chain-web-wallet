import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { WalletService } from '../../../../wallet/services/wallet.service';
import { AppConfig } from '../../../../config/app.config';
import { SharedService } from '../../../../shared/services/shared.service';
import { TransactionsService } from '../../../../transactions/services/transactions.service';
import { Subscription } from 'rxjs';
import { NamespacesService } from 'src/app/servicesModule/services/namespaces.service';
import { HeaderServicesInterface } from '../../../services/services-module.service';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-view-all-accounts',
  templateUrl: './view-all-accounts.component.html',
  styleUrls: ['./view-all-accounts.component.css']
})
export class ViewAllAccountsComponent implements OnInit {

  paramsHeader: HeaderServicesInterface = {
    moduleName: 'Accounts',
    componentName: 'View All',
    extraButton: 'Create a New Account',
    routerExtraButton: `/${AppConfig.routes.selectTypeCreationAccount}`

  };
  accountChanged: boolean = false;
  currentWallet: any = [];
  objectKeys = Object.keys;
  routes = {
    backToService: `/${AppConfig.routes.service}`,
    createNewAccount: `/${AppConfig.routes.selectTypeCreationAccount}`,
    viewDetails: `/${AppConfig.routes.account}/`,
    deleteAccount: `/${AppConfig.routes.deleteAccount}/`,
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
    console.log(this.currentWallet);

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
    // console.log('build',this.walletService.currentWallet)
    const currentWallet = Object.assign({}, this.walletService.currentWallet);
    if (currentWallet && Object.keys(currentWallet).length > 0) {
      for (let element of currentWallet.accounts) {
        const accountFiltered = this.walletService.filterAccountInfo(element.name);
        if (accountFiltered && accountFiltered.accountInfo) {
          const mosaicsNoXpx = accountFiltered.accountInfo.mosaics.filter(next => next.id.toHex() !== environment.mosaicXpxInfo.id);
          element['mosaics'] = mosaicsNoXpx.length;
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

  exportWallet() {
    let wordArray = CryptoJS.enc.Utf8.parse(JSON.stringify(this.walletService.currentWallet));
    let file = CryptoJS.enc.Base64.stringify(wordArray);
    // Word array to base64


    // let other = CryptoJS.enc.Base64.parse(file);
    // // Word array to JSON string
    // console.log('This is resp descryp---------------------------->', JSON.parse(other.toString(CryptoJS.enc.Utf8)));

    const blob = new Blob([file], { type: '' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    // the filename you want
    a.download = `${this.currentWallet.name}.wlt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
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
