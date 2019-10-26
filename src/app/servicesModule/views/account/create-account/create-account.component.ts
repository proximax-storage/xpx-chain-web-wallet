import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { NetworkType, SimpleWallet } from 'tsjs-xpx-chain-sdk';
import { Router, ActivatedRoute } from '@angular/router';
import { Password } from 'nem-library';
import { WalletService, AccountsInterface } from '../../../../wallet/services/wallet.service';
import { environment } from '../../../../../environments/environment';
import { ProximaxProvider } from '../../../../shared/services/proximax.provider';
import { AppConfig } from '../../../../config/app.config';
import { ConfigurationForm, SharedService } from '../../../../shared/services/shared.service';
import { DataBridgeService } from '../../../../shared/services/data-bridge.service';
import { DashboardService } from '../../../../dashboard/services/dashboard.service';
import { NamespacesService } from '../../../services/namespaces.service';
import { TransactionsService } from '../../../../transactions/services/transactions.service';
import { ServicesModuleService } from '../../../../servicesModule/services/services-module.service';
import { NemProviderService } from '../../../../swap/services/nem-provider.service';

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
  foundXpx: boolean = false;
  isValid = false;
  moduleName = 'Accounts';
  othersAccounts = [];
  fromPrivateKey = false;
  formCreateAccount: FormGroup;
  routes = {
    back: `/${AppConfig.routes.selectTypeCreationAccount}`,
    backToService: `/${AppConfig.routes.service}`
  };
  nis1Account: any = null;
  saveNis1: boolean = false;
  passwordMain: string = 'password';
  pvkMain: string = 'password';
  privateKey: any;
  prefix: any;

  spinnerButton: boolean = false;

  constructor(
    private activateRoute: ActivatedRoute,
    private walletService: WalletService,
    private proximaxProvider: ProximaxProvider,
    private fb: FormBuilder,
    private sharedService: SharedService,
    private router: Router,
    private dataBridgeService: DataBridgeService,
    private dashboardService: DashboardService,
    private transactionService: TransactionsService,
    private namespaceService: NamespacesService,
    private serviceModuleService: ServicesModuleService,
    private nemProvider: NemProviderService
  ) { }

  ngOnInit() {
    let param = this.activateRoute.snapshot.paramMap.get('id');
    this.componentName = (param === '0') ? 'Create Account' : 'Import Account';
    this.buttonSend = (param === '0') ? 'Create' : 'Import';
    this.configurationForm = this.sharedService.configurationForm;
    const walletsStorage = JSON.parse(localStorage.getItem(environment.nameKeyWalletStorage));
    this.othersAccounts = walletsStorage.filter(elm => elm.name !== this.walletService.currentWallet.name);
    this.walletService.setNis1AccountsWallet$([]);
    this.walletService.setAccountInfoNis1(null);
    this.walletService.setNis1AccountSelected(null);
    this.walletService.setAccountSelectedWalletNis1(null);
    this.createForm(param);
    this.createAccount();
  }

  /**
   *
   *
   * @param {string} inputType
   * @param {boolean} isPvk
   * @memberof CreateAccountComponent
   */
  changeInputType(inputType: string, isPvk: boolean) {
    let newType = this.sharedService.changeInputType(inputType);
    if (isPvk) {
      this.pvkMain = newType;
    } else {
      this.passwordMain = newType;
    }
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
      this.formCreateAccount.get('privateKey').setValidators([
        Validators.minLength(this.configurationForm.privateKey.minLength),
        Validators.maxLength(this.configurationForm.privateKey.maxLength),
        Validators.pattern('^(0x|0X)?[a-fA-F0-9]+$')
      ]);
      this.formCreateAccount.controls['privateKey'].updateValueAndValidity({ emitEvent: false, onlySelf: true });
      this.fromPrivateKey = true;
    }
  }

  /**
   *
   *
   * @memberof CreateAccountComponent
   */
  async createAccount() {
    if (this.formCreateAccount.valid && this.isValid) {
      const allAccounts = this.walletService.currentWallet.accounts.slice(0);
      let walletName = this.formCreateAccount.get('nameWallet').value
      walletName = (walletName.includes(' ') === true) ? walletName.split(' ').join('_') : walletName;
      const nameAccount = walletName;
      if (Object.keys(allAccounts).find(elm => allAccounts[elm].name !== nameAccount)) {
        const password = this.proximaxProvider.createPassword(this.formCreateAccount.get('password').value);
        let common = { password: this.formCreateAccount.get('password').value };
        const currentAccount: AccountsInterface = allAccounts.find(next => next.firstAccount);
        if (this.walletService.decrypt(common, currentAccount)) {
          const network = environment.typeNetwork.value;
          let newAccount: SimpleWallet = null;
          if (this.fromPrivateKey) {
            this.privateKey = this.formCreateAccount.get('privateKey').value;
            if (this.privateKey.length > 64) {
              const newPrivateKey = this.privateKey;
              this.prefix = newPrivateKey.slice(0, -64);
              this.privateKey = newPrivateKey.slice(2);
            }
            newAccount = this.proximaxProvider.createAccountFromPrivateKey(nameAccount, password, this.privateKey, network);
            //newAccount = this.proximaxProvider.createAccountFromPrivateKey(nameAccount, password, this.formCreateAccount.get('privateKey').value, network);
            const accountEqual = this.walletService.getCurrentWallet().accounts.find(el => el.publicAccount.address['address'] === newAccount.address['address']);
            if (accountEqual && accountEqual !== undefined) {
              this.sharedService.showWarning('', 'This account already exists');
            } else {
              if (this.saveNis1) {
                this.spinnerButton = true;
                const nis1Wallet = this.nemProvider.createAccountPrivateKey(this.formCreateAccount.get('privateKey').value);
                const publicAccount = this.nemProvider.createPublicAccount(nis1Wallet.publicKey);
                this.nis1Account = {
                  address: nis1Wallet.address,
                  publicKey: nis1Wallet.publicKey
                };

                this.saveAccount(newAccount, walletName, password, this.prefix);
                this.nemProvider.getAccountInfoNis1(publicAccount, walletName);
                return;
              }

              this.saveAccount(newAccount, nameAccount, password, this.prefix);
            }
          } else {
            newAccount = this.proximaxProvider.createAccountSimple(nameAccount, password, network);
            this.saveAccount(newAccount, nameAccount, password, this.prefix);
          }
        }
      }
    }
  }

  /**
   * Method to save account in wallet
   * @param {SimpleWallet} newAccount interface Simple Wallet
   * @param {string} nameAccount account name
   * @param {Password} password wallet password
   * @memberof CreateAccountComponent
   */
  saveAccount(newAccount: SimpleWallet, nameAccount: string, password: Password, prefix: string) {
    this.namespaceService.searchNamespacesFromAccounts([newAccount.address]);
    const accountBuilded: AccountsInterface = this.walletService.buildAccount({
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
      ),
      isMultisign: null,
      nis1Account: this.nis1Account,
      prefixKeyNis1: prefix
    });


    this.clearForm();
    this.walletService.saveDataWalletCreated({
      name: nameAccount,
      algo: password,
      network: newAccount.network,
      fromPrivateKey: this.fromPrivateKey
    }, accountBuilded, newAccount);
    this.walletService.saveAccountWalletStorage(accountBuilded);
    this.walletService.setAccountSelectedWalletNis1(accountBuilded);
    this.serviceModuleService.saveContacts({ name: nameAccount, address: accountBuilded.address, walletContact: true, nameItem: '' });
    this.dataBridgeService.closeConection();
    this.dataBridgeService.connectnWs();
    this.dashboardService.isIncrementViewDashboard = 0;
    this.transactionService.searchAccountsInfo(this.walletService.currentWallet.accounts);
    // console.log('--------------------WalletService------------', this.walletService.currentWallet);
    // console.log('--------------------AccountInfo------------', this.walletService.currentAccount);
    this.router.navigate([`/${AppConfig.routes.accountCreated}`]);
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

  /**
   * Method to save a NIS1 account or not
   *
   * @memberof CreateAccountComponent
   */
  switchSaveNis1() {
    this.saveNis1 = !this.saveNis1;
  }

}
