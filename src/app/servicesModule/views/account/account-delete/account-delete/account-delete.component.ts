import { Component, OnInit } from '@angular/core';
import { HeaderServicesInterface, ServicesModuleService } from 'src/app/servicesModule/services/services-module.service';
import { AppConfig } from 'src/app/config/app.config';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedService, ConfigurationForm } from 'src/app/shared/services/shared.service';
import { WalletService, AccountsInterface, AccountsInfoInterface } from 'src/app/wallet/services/wallet.service';
import { ProximaxProvider } from 'src/app/shared/services/proximax.provider';
import { FormGroup, AbstractControl, Validators, FormControl } from '@angular/forms';
import { TransactionsService } from 'src/app/transactions/services/transactions.service';
import { PublicAccount } from 'tsjs-xpx-chain-sdk';

@Component({
  selector: 'app-account-delete',
  templateUrl: './account-delete.component.html',
  styleUrls: ['./account-delete.component.css']
})
export class AccountDeleteComponent implements OnInit {
  // validatingForm: FormGroup;
  currenAccount: AccountsInterface = null;
  paramsHeader: HeaderServicesInterface = {
    moduleName: 'Accounts',
    componentName: 'Delete',
    extraButton: 'View All Accounts',
    routerExtraButton: `/${AppConfig.routes.viewAllAccount}`
  };
  routes = {
    viewAllAccount: `/${AppConfig.routes.viewAllAccount}`,
    deleteAccountConfirm: `/${AppConfig.routes.deleteAccountConfirm}/`,
  };
  accountInfo: AccountsInfoInterface = null;
  subscribeAccount = null;
  accountValid: boolean = false;
  viewPublicKey = false;
  showPassword: boolean = true;
  title = 'Accounts that are associated with this device.';
  texAlert = 'Would you like to delete permanently this account?'
  accountName: string;
  address: any;
  publicKey: string;
  configurationForm: ConfigurationForm;
  constructor(
    private activateRoute: ActivatedRoute,
    private sharedService: SharedService,
    private walletService: WalletService,
    private proximaxProvider: ProximaxProvider
  ) {
  }


  /**
    *
    *
    * @memberof AccountDeleteComponent
    */
  ngOnDestroy(): void {
    if (this.subscribeAccount) {
      this.subscribeAccount.unsubscribe();
    }
  }
  ngOnInit() {

    let param = this.activateRoute.snapshot.paramMap.get('name');
    this.currenAccount = this.walletService.filterAccountWallet(param);
    this.buildData();
    this.subscribeAccount = this.walletService.getAccountsInfo$().subscribe(
      async accountInfo => {
        if (accountInfo && !this.accountInfo) {
          this.accountInfo = this.walletService.filterAccountInfo(this.currenAccount.name);
          this.accountValid = (
            this.accountInfo !== null &&
            this.accountInfo !== undefined &&
            this.accountInfo.accountInfo &&
            this.accountInfo.accountInfo.publicKey !== "0000000000000000000000000000000000000000000000000000000000000000"
          );

          if (this.subscribeAccount) {
            this.subscribeAccount.unsubscribe();
          }
        }
      }
    );




  }

  /**
  *
  *
  * @memberof AccountDeleteComponent
  */
  buildData() {
    this.accountName = this.currenAccount.name;
    this.address = this.proximaxProvider.createFromRawAddress(this.currenAccount.address).pretty();
    this.publicKey = this.currenAccount.publicAccount.publicKey;
  }
  /**
   *
   * @param message
   */
  copyMessage(message: string) {
    this.sharedService.showSuccess('', `${message} copied`);
  }
}
