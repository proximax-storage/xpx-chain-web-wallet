import { Component, OnInit } from '@angular/core';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { AppConfig } from 'src/app/config/app.config';
import { Subscription } from 'rxjs';
import { TransactionsService } from 'src/app/transfer/services/transactions.service';
import { WalletService, CurrentWalletInterface, AccountsInterface } from 'src/app/wallet/services/wallet.service';
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
    editAccount: `/${AppConfig.routes.editAccountMultisign}/`
  };
  subscription: Subscription[] = [];
  currentAccounts: AccountsInterface[] = []
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
    // console.log("poooo", currentWallet)
    if (currentWallet && Object.keys(currentWallet).length > 0) {


      for (let element of currentWallet.accounts) {
        const accountFiltered = this.walletService.filterAccountInfo(element.name);
        if (accountFiltered && accountFiltered.multisigInfo) {
          element.isMultisign = accountFiltered.multisigInfo

        }
      }
      this.currentWallet = currentWallet;
    }



    // this.walletService.currentWallet.accounts.forEach((element: AccountsInterface) => {
    //   const isMultisig: boolean = (element.isMultisign !== null &&
    //     element.isMultisign !== undefined && element.isMultisign.isMultisig())
    //   if (isMultisig) {
    //     this.currentAccounts.push(element)
    //   }
    // });
  }

  isMultisign(accounts: AccountsInterface): boolean {
     return Boolean(accounts.isMultisign !== null && accounts.isMultisign !== undefined && this.isMultisigValidate(accounts.isMultisign.minRemoval ,accounts.isMultisign.minApproval));
  }
  /**
     * Checks if the account is a multisig account.
     * @returns {boolean}
     */
  isMultisigValidate(minRemoval: number, minApprova: number) {
    return minRemoval !== 0 && minApprova !== 0;
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

        console.log('----- ACCOUNT INFO -----', next);
        this.build();
      }
    ));
  }

}
