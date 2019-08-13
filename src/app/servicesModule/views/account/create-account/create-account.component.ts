import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { NetworkType, SimpleWallet } from 'tsjs-xpx-chain-sdk';
import { Router, ActivatedRoute } from '@angular/router';
import { WalletService, AccountsInterface } from '../../../../wallet/services/wallet.service';
import { environment } from '../../../../../environments/environment';
import { ProximaxProvider } from '../../../../shared/services/proximax.provider';
import { AppConfig } from '../../../../config/app.config';
import { ConfigurationForm, SharedService } from '../../../../shared/services/shared.service';
import { DataBridgeService } from '../../../../shared/services/data-bridge.service';
import { DashboardService } from '../../../../dashboard/services/dashboard.service';
import { TransactionsService } from 'src/app/transfer/services/transactions.service';

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.css']
})
export class CreateAccountComponent implements OnInit {

  buttonSend = '';
  componentName = '';
  configurationForm: ConfigurationForm = {}
  currentWallet = [];
  errorWalletExist: string;
  isValid = false;
  moduleName = 'Accounts';
  othersAccounts = [];
  fromPrivateKey = false;
  formCreateAccount: FormGroup;
  routes = {
    back: `/${AppConfig.routes.selectTypeCreationAccount}`,
    backToService: `/${AppConfig.routes.service}`
  };


  constructor(
    private activateRoute: ActivatedRoute,
    private walletService: WalletService,
    private proximaxProvider: ProximaxProvider,
    private fb: FormBuilder,
    private sharedService: SharedService,
    private router: Router,
    private dataBridgeService: DataBridgeService,
    private dashboardService: DashboardService,
    private transactionService: TransactionsService
  ) { }

  ngOnInit() {
    let param = this.activateRoute.snapshot.paramMap.get('id');
    this.componentName = (param === '0') ? 'Create account' : 'Import account';
    this.buttonSend = (param === '0') ? 'Create' : 'Import';
    this.configurationForm = this.sharedService.configurationForm;
    const walletsStorage = JSON.parse(localStorage.getItem(environment.nameKeyWalletStorage));
    this.othersAccounts = walletsStorage.filter(elm => elm.name !== this.walletService.currentWallet.name);
    this.createForm(param);
    this.createAccount();
  }

  /**
   *
   *
   * @memberof CreateAccountComponent
   */
  createForm(param: string) {
    this.formCreateAccount = this.fb.group({
      nameWallet: ['', [
        Validators.required,
        Validators.minLength(this.configurationForm.nameWallet.minLength),
        Validators.maxLength(this.configurationForm.nameWallet.maxLength)
      ]],
      privateKey: ['', [
        Validators.minLength(this.configurationForm.privateKey.minLength),
        Validators.maxLength(this.configurationForm.privateKey.maxLength),
        Validators.pattern('^(0x|0X)?[a-fA-F0-9]+$')
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(this.configurationForm.passwordWallet.minLength),
        Validators.maxLength(this.configurationForm.passwordWallet.maxLength)
      ]]
    });

    if (param === '1') {
      this.formCreateAccount.get('privateKey').setValidators([Validators.required]);
      this.fromPrivateKey = true;
    }
  }

  /**
   *
   *
   * @memberof CreateAccountComponent
   */
  createAccount() {
    if (this.formCreateAccount.valid && this.isValid) {
      const allAccounts = this.walletService.currentWallet.accounts.slice(0);
      const nameAccount = this.formCreateAccount.get('nameWallet').value;
      if (Object.keys(allAccounts).find(elm => allAccounts[elm].name !== nameAccount)) {
        const password = this.proximaxProvider.createPassword(this.formCreateAccount.get('password').value);
        let common = { password: this.formCreateAccount.get('password').value };
        const currentAccount: AccountsInterface = allAccounts.find(next => next.firstAccount);
        if (this.walletService.decrypt(common, currentAccount)) {
          const network = NetworkType.TEST_NET;
          let newAccount: SimpleWallet = null;
          if (this.fromPrivateKey) {
            newAccount = this.proximaxProvider.createAccountFromPrivateKey(nameAccount, password, this.formCreateAccount.get('privateKey').value, network);
          } else {
            newAccount = this.proximaxProvider.createAccountSimple(nameAccount, password, network);
          }

          const pvk = this.proximaxProvider.decryptPrivateKey(
            password,
            newAccount.
              encryptedPrivateKey.encryptedKey,
            newAccount.encryptedPrivateKey.iv
          ).toUpperCase();

          const accountBuilded = this.walletService.buildAccount({
            address: newAccount.address['address'],
            byDefault: false,
            encrypted: newAccount.encryptedPrivateKey.encryptedKey,
            firstAccount: false,
            iv: newAccount.encryptedPrivateKey.iv,
            network: newAccount.network,
            nameAccount: nameAccount,
            publicAccount: this.proximaxProvider.getPublicAccountFromPrivateKey(
              this.proximaxProvider.decryptPrivateKey(
                password,
                newAccount.encryptedPrivateKey.encryptedKey,
                newAccount.encryptedPrivateKey.iv
              ).toUpperCase(), newAccount.network
            )
          });



          this.clearForm();
          this.walletService.saveDataWalletCreated({
            name: nameAccount,
            algo: password,
            network: newAccount.network,
            fromPrivateKey: this.fromPrivateKey
          }, accountBuilded, newAccount);
          this.walletService.saveAccountStorage(nameAccount, accountBuilded);
          this.router.navigate([`/${AppConfig.routes.accountCreated}`]);
          this.dataBridgeService.closeConenection();
          this.dataBridgeService.connectnWs();
          this.dashboardService.isIncrementViewDashboard = 0;
          this.transactionService.searchAccountsInfo(this.walletService.currentWallet.accounts);

        }
      }
    }
  }


  /**
   *
   *
   * @param {string} [nameInput='']
   * @param {string} [nameControl='']
   * @returns
   * @memberof CreateAccountComponent
   */
  clearForm(nameInput: string = '', nameControl: string = '') {
    if (nameInput !== '') {
      if (nameControl !== '') {
        this.formCreateAccount.controls[nameControl].get(nameInput).reset();
        return;
      }

      this.formCreateAccount.get(nameInput).reset();
      return;
    }

    this.formCreateAccount.reset();
    return;
  }

  /**
   *
   *
   * @param {string} [nameInput='']
   * @param {string} [nameControl='']
   * @param {string} [nameValidation='']
   * @returns
   * @memberof CreateAccountComponent
   */
  validateInput(nameInput: string = '', nameControl: string = '', nameValidation: string = '') {
    let validation: AbstractControl = null;
    if (nameInput !== '' && nameControl !== '') {
      validation = this.formCreateAccount.controls[nameControl].get(nameInput);
    } else if (nameInput === '' && nameControl !== '' && nameValidation !== '') {
      validation = this.formCreateAccount.controls[nameControl].getError(nameValidation);
    } else if (nameInput !== '') {
      validation = this.formCreateAccount.get(nameInput);
    }
    return validation;
  }

  /**
   *
   *
   * @returns
   * @memberof CreateAccountComponent
   */
  validateNameAccount() {
    if (this.formCreateAccount.get('nameWallet').valid) {
      const nameAccount = this.formCreateAccount.get('nameWallet').value;
      const existWallet = Object.keys(this.walletService.currentWallet.accounts).find(elm => this.walletService.currentWallet.accounts[elm].name === nameAccount);
      if (existWallet !== undefined) {
        this.isValid = false;
        this.errorWalletExist = '-invalid';
        return true;
      } else {
        this.isValid = true;
        this.errorWalletExist = '';
        return false;
      }
    }
  }

}
