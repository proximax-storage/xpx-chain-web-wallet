import { Component, OnDestroy, OnInit } from '@angular/core';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { AppConfig } from 'src/app/config/app.config';
import { Subscription } from 'rxjs';
import { WalletService, AccountsInterface } from 'src/app/wallet/services/wallet.service';

@Component({
  selector: 'app-contract-multisig',
  templateUrl: './contract-multisig.component.html',
  styleUrls: ['./contract-multisig.component.css']
})
export class ContractMultisigComponent implements OnInit, OnDestroy {

  @BlockUI() blockUI: NgBlockUI;
  moduleName = 'Accounts';
  componentName = 'Multisig';
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
    private walletService: WalletService
  ) { }

  ngOnInit() {
    this.load();
  }

  /**
   *
   *
   * @memberof ContractMultisigComponent
   */
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
      for (const element of currentWallet.accounts) {
        const accountFiltered = this.walletService.filterAccountInfo(element.name);
        if (accountFiltered && accountFiltered.multisigInfo) {
          element.isMultisign = accountFiltered.multisigInfo;

        }
      }
      this.currentWallet = currentWallet;
    }
  }

  isMultisign(accounts: AccountsInterface): boolean {
    let isMultisigValidate = false;
    if (accounts.isMultisign) {
      isMultisigValidate = this.isMultisigValidate(accounts.isMultisign.minRemoval, accounts.isMultisign.minApproval);
    }
    return Boolean(accounts.isMultisign !== null && accounts.isMultisign !== undefined && isMultisigValidate);
  }

  /**
   * Checks if the account is a multisig account.
   *
   * @param {number} minRemoval
   * @param {number} minApprova
   * @returns
   * @memberof ContractMultisigComponent
   */
  isMultisigValidate(minRemoval: number, minApprova: number) {
    return minRemoval !== 0 && minApprova !== 0;
  }

  /**
   *
   *
   * @memberof ContractMultisigComponent
   */
  load() {
    this.subscription.push(this.walletService.getAccountsInfo$().subscribe(
      next => {
        // console.log('----- ACCOUNT INFO -----', next);
        this.build();
      }
    ));
  }
}
