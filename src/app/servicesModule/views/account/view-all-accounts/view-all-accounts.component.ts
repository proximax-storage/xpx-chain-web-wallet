import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { WalletService, AccountsInterface } from '../../../../wallet/services/wallet.service';
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
    multisig: `/${AppConfig.routes.editAccountMultisign}/`,
    multisigConvert: `/${AppConfig.routes.convertToAccountMultisign}/`
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
    this.validateUniqueAccount();
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

  /**
   * Method to object clone
   * @param obj Object to clone
   * @memberof ViewAllAccountsComponent
   * @returns temp
   */
  clone(obj) {
    // console.log(obj);
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    const temp = obj.constructor();
    for (const key in obj) {
      temp[key] = this.clone(obj[key]);
    }
    return temp;
  }

  deleteVerification(account) {
    let erasable = false;

    if (account.default || account.encrypted === '') {
      erasable = false;
    } else {
      if (this.currentWallet.accounts.length === 2) {
        let noPrivateKey = this.currentWallet.accounts.filter(account => account.encrypted === "")
        if (noPrivateKey.length > 0) {
          erasable = false
        }
      } else {
        erasable = true
      }
    }

    return erasable
  }

  /**
   * Method to export account
   * @param {any} account
   * @memberof ViewAllAccountsComponent
   */
  exportAccount(account: any) {
    let acc = Object.assign({}, account);
    const accounts = [];
    accounts.push(acc);
    const wallet = {
      name: acc.name,
      accounts: accounts
    }

    wallet.accounts[0].name = 'Primary_Account';
    wallet.accounts[0].firstAccount = true;
    wallet.accounts[0].default = true;

    let wordArray = CryptoJS.enc.Utf8.parse(JSON.stringify(wallet));
    let file = CryptoJS.enc.Base64.stringify(wordArray);
    // Word array to base64
    const now = Date.now()
    const date = new Date(now);
    const year = date.getFullYear();
    const month = ((date.getMonth() + 1) < 10) ? `0${(date.getMonth() + 1)}` : date.getMonth() + 1;
    const day = (date.getDate() < 10) ? `0${date.getDate()}` : date.getDate();

    const blob = new Blob([file], { type: '' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    // the filename you want
    let networkTypeName = environment.typeNetwork.label
    networkTypeName = (networkTypeName.includes(' ')) ? networkTypeName.split(' ').join('') : networkTypeName;
    a.download = `${this.walletService.currentWallet.name}_${wallet.name}_${networkTypeName}_${year}-${month}-${day}.wlt`;
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

  validateUniqueAccount() {
    if (this.currentWallet.accounts.length === 1) {
      this.currentWallet.accounts[0].firstAccount = true;
      this.currentWallet.accounts[0].default = true;
    }
  }

  /**
     *
     *  @param {string} quantity
     * @memberof ViewAllAccountsComponent
     */
  /*getQuantity(quantity: string) {
    return this.transactionService.getDataPart(quantity, 6);
  }*/

  getQuantity(quantity: string) {
    return this.sharedService.amountFormat(quantity);
  }
}
