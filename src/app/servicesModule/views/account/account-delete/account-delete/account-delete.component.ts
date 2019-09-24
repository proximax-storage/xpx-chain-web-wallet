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
  validatingForm: FormGroup;
  currenAccount: AccountsInterface = null;
  paramsHeader: HeaderServicesInterface = {
    moduleName: 'Accounts',
    componentName: 'DELETE',
    extraButton: 'View all accounts',
    routerExtraButton: `/${AppConfig.routes.viewAllAccount}`

  };
  privateKey = '';
  accountInfo: AccountsInfoInterface = null;
  subscribeAccount = null;
  accountValid: boolean = false;
  viewPublicKey = false;
  showPassword: boolean = true;
  title = 'Delete Account';
  descriptionPrivateKey = `Warning! Before proceeding, make sure store your private key in a safe place. Access to
  your digital assets cannot be recovered without it.`;
  titleDescription = '';
  description = 'Warning! Before proceeding, make sure store your private key in a safe place. Access to your digital assets cannot be recovered without it.';
  accountName: string;
  address: any;
  publicKey: string;
  configurationForm: ConfigurationForm;
  constructor(
    private activateRoute: ActivatedRoute,
    private sharedService: SharedService,
    private walletService: WalletService,
    private serviceModuleService: ServicesModuleService,
    private proximaxProvider: ProximaxProvider,
    private router: Router,
    private transactionService: TransactionsService,
  ) {
    this.configurationForm = this.sharedService.configurationForm;
    this.createForm();
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
  /**
   *
   */
  createForm() {
    this.validatingForm = new FormGroup({
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(this.configurationForm.passwordWallet.minLength),
        Validators.maxLength(this.configurationForm.passwordWallet.maxLength)
      ])
    });
  }

  /**
   *
   *
   * @returns
   * @memberof AccountDeleteComponent
   */
  decryptWallet() {
    console.log('decryptWallet');
    if (this.validatingForm.get('password').value !== '') {
      const common = { password: this.validatingForm.get('password').value };
      if (this.walletService.decrypt(common, this.currenAccount)) {
        this.privateKey = common['privateKey'].toUpperCase();
        this.validatingForm.get('password').patchValue('', { emitEvent: false, onlySelf: true });
        this.showPassword = false;
        return;
      }
      this.validatingForm.get('password').patchValue('', { emitEvent: false, onlySelf: true });;
      this.privateKey = '';
      return;
    } else {
      this.sharedService.showError('', 'Please, enter a password');
    }
  }

  get input() { return this.validatingForm.get('password'); }

  /**
   *
   *
   * @memberof AccountDeleteComponent
   */
  hidePrivateKey() {
    console.log('hidePrivateKey');
    this.privateKey = '';
    this.showPassword = true;
  }

  /**
  *
  *
  * @param {string} [nameInput='']
  * @param {string} [nameControl='']
  * @param {string} [nameValidation='']
  * @returns
  * @memberof AuthComponent
  */
  validateInput(nameInput: string = '', nameControl: string = '', nameValidation: string = '') {
    let validation: AbstractControl = null;
    if (nameInput !== '' && nameControl !== '') {
      validation = this.validatingForm.controls[nameControl].get(nameInput);
    } else if (nameInput === '' && nameControl !== '' && nameValidation !== '') {
      validation = this.validatingForm.controls[nameControl].getError(nameValidation);
    } else if (nameInput !== '') {
      validation = this.validatingForm.get(nameInput);
    }
    return validation;
  }
  /**
     *
     *
     * @memberof AccountDeleteComponent
     */

  goToRoute() {

    this.router.navigate([`/${AppConfig.routes.viewAllAccount}`]);
  }


  /**
   *
   *
   * @memberof AccountDeleteComponent
   */

  deleteAccount() {
    if (this.validatingForm.get('password').value !== '') {
      const common = { password: this.validatingForm.get('password').value };
      if (this.walletService.decrypt(common, this.currenAccount)) {
        const revalidateMultisig = true;
        this.walletService.removeAccountWallet(this.accountName, revalidateMultisig);
        this.transactionService.updateBalance();
        this.sharedService.showInfo('', 'Your account has be deleted');
        this.router.navigate([`/${AppConfig.routes.viewAllAccount}`]);
      }
      this.validatingForm.get('password').patchValue('', { emitEvent: false, onlySelf: true });
    } else {
      this.sharedService.showError('', 'Please, enter a password');
    }

  }

}
