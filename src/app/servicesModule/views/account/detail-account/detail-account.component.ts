import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { WalletService, AccountsInterface, AccountsInfoInterface } from "../../../../wallet/services/wallet.service";
import { SharedService, ConfigurationForm } from "../../../../shared/services/shared.service"
import { AppConfig } from '../../../../config/app.config';
import { ActivatedRoute } from '@angular/router';
import { ProximaxProvider } from 'src/app/shared/services/proximax.provider';
import { ServicesModuleService, ContactsStorageInterface, HeaderServicesInterface } from '../../../services/services-module.service';

@Component({
  selector: 'app-detail-account',
  templateUrl: './detail-account.component.html',
  styleUrls: ['./detail-account.component.css']
})
export class DetailAccountComponent implements OnInit {

  paramsHeader: HeaderServicesInterface = {
    moduleName: 'Accounts',
    componentName: 'DETAILS',
    extraButton: 'View all accounts',
    routerExtraButton: `/${AppConfig.routes.viewAllAccount}`
  };
  address = '';
  accountName = '';
  accountInfo: AccountsInfoInterface = null;
  accountValid: boolean = false;
  configurationForm: ConfigurationForm;
  currenAccount: AccountsInterface = null;
  descriptionPrivateKey = `Make sure you store your private key in a safe place.
  Access to your digital assets cannot be recovered without it.`;
  editNameAccount = false;
  newNameAccount: string = '';
  privateKey = '';
  publicKey = '';
  routes = {
    backToService: `/${AppConfig.routes.service}`,
    viewAllAccounts: `/${AppConfig.routes.viewAllAccount}`
  };
  showPassword: boolean = true;
  subscribeAccount = null;
  titleAddress = 'Address:';
  titlePrivateKey = 'Private Key:';
  titlePublickey = 'Public Key:';
  validatingForm: FormGroup;


  constructor(
    private activateRoute: ActivatedRoute,
    private proximaxProvider: ProximaxProvider,
    private sharedService: SharedService,
    private walletService: WalletService,
    private serviceModuleService: ServicesModuleService
  ) {
  }

  ngOnInit() {
    this.configurationForm = this.sharedService.configurationForm;
    let param = this.activateRoute.snapshot.paramMap.get('name');
    this.currenAccount = (param) ? this.walletService.filterAccount(param) : this.walletService.filterAccount('', true);
    this.buildData();
    this.createForm();
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
   * @memberof DetailAccountComponent
   */
  ngOnDestroy(): void {
    if (this.subscribeAccount) {
      this.subscribeAccount.unsubscribe();
    }
  }

  /**
   *
   *
   * @memberof DetailAccountComponent
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
   * @memberof DetailAccountComponent
   */
  changeNameAccount() {
    if (this.newNameAccount !== '') {
      if (!this.walletService.validateNameAccount(this.newNameAccount)) {
        const paramsStorage: ContactsStorageInterface = {
          name: this.newNameAccount,
          address: this.address,
          walletContact: true,
          nameItem: '',
          update: true,
          dataComparate: {
            name: this.accountName,
            address: this.address
          }
        }
        const saved = this.serviceModuleService.saveContacts(paramsStorage);

        if (!saved) {
          this.sharedService.showError('', `Contact or account name already exists`);
          return;
        }
        this.walletService.changeName(this.accountName, this.newNameAccount);
        this.editNameAccount = !this.editNameAccount;
        this.currenAccount = this.walletService.filterAccount(this.newNameAccount);
        this.newNameAccount = '';
        this.buildData();
        this.sharedService.showSuccess('', 'Your account and contact name has been updated');
      } else {
        this.sharedService.showWarning('', 'This name is already in use');
      }
    }
  }

  /**
   *
   *
   * @returns
   * @memberof DetailAccountComponent
   */
  decryptWallet() {
    if (this.validatingForm.get('password').value !== '') {
      const common = { password: this.validatingForm.get('password').value };
      if (this.walletService.decrypt(common, this.currenAccount)) {
        this.privateKey = common['privateKey'].toUpperCase();
        this.validatingForm.get('password').patchValue('')
        this.showPassword = false;
        return;
      }
      this.validatingForm.get('password').patchValue('');
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
   * @memberof DetailAccountComponent
   */
  hidePrivateKey() {
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
}
