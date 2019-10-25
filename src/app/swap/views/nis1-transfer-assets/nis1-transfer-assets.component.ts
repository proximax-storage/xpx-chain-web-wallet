import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first, timeout } from 'rxjs/operators';
import { PlainMessage, TransferTransaction, MultisigTransaction, Account } from 'nem-library';
import { PublicAccount } from 'tsjs-xpx-chain-sdk';
import { Subscription } from 'rxjs';

import { WalletService, AccountCreatedInterface, TransactionsNis1Interface, AccountsInterface, CurrentWalletTransNis } from '../../../wallet/services/wallet.service';
import { AppConfig } from '../../../config/app.config';
import { SharedService, ConfigurationForm } from '../../../shared/services/shared.service';
import { NemProviderService, AccountsInfoNis1Interface, WalletTransactionsNis1Interface } from '../../services/nem-provider.service';
import { environment } from '../../../../environments/environment';
import { ProximaxProvider } from '../../../shared/services/proximax.provider';
import { ServicesModuleService } from './../../../servicesModule/services/services-module.service';


@Component({
  selector: 'app-nis1-transfer-assets',
  templateUrl: './nis1-transfer-assets.component.html',
  styleUrls: ['./nis1-transfer-assets.component.css']
})
export class Nis1TransferAssetsComponent implements OnInit {

  accountToSwap: AccountsInfoNis1Interface = null;
  accountSelected: AccountsInfoNis1Interface = null;
  amountZero: boolean = false;
  blockButton: boolean;
  configurationForm: ConfigurationForm;
  errorAmount: string;
  formTransfer: FormGroup;
  goToBackRoute = `/${AppConfig.routes.swapListCosignerNis1}`;
  isMultisig = null;
  insufficientBalance = false;
  maxAmount: number = 0;
  mainAccount = false;
  nameBtnBack = '';
  listContacts: any = [];
  optionsXPX = {
    prefix: '',
    thousands: ',',
    decimal: '.',
    precision: '6'
  };

  //ownedAccountSwap: AccountsInfoNis1Interface = null;
  ownedAccountSwap: AccountsInterface;
  passwordMain: string = 'password';
  processing: boolean = false;
  quantity: string = '0.000000';
  routeGoHome = `/${AppConfig.routes.home}`;
  routeContinue: string;
  spinnerVisibility = false;
  showBtnBack = false;
  showCertifiedSwap = false;
  subscription: Subscription[] = [];
  transactionNis1: TransactionsNis1Interface;
  isLogged: boolean = false;

  constructor(
    private activateRoute: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private nemProvider: NemProviderService,
    private proximaxProvider: ProximaxProvider,
    private serviceModuleService: ServicesModuleService,
    private sharedService: SharedService,
    private walletService: WalletService
  ) { }

  /**
   *
   *
   * @memberof Nis1TransferAssetsComponent
   */
  ngOnInit() {
    this.accountToSwap = null;
    this.configurationForm = this.sharedService.configurationForm;
    this.initComponent();
  }

  /**
   *
   *
   * @memberof Nis1TransferAssetsComponent
   */
  ngOnDestroy(): void {
    this.subscription.forEach(subscription => {
      subscription.unsubscribe();
    });
  }

  /**
  *
  *
  * @memberof Nis1TransferAssetsComponent
  */
  async createTransaction() {
    if (!this.processing) {
      this.processing = true;
      let common = { password: this.formTransfer.get("password").value };
      if (this.ownedAccountSwap) {
        if (this.walletService.decrypt(common, this.ownedAccountSwap)) {
          const account = this.nemProvider.createAccountPrivateKey(common['privateKey']);
          const quantity = this.formTransfer.get("amountXpx").value;
          if (this.isMultisig) {
            const assetId = this.accountToSwap.mosaic.assetId;
            const recipient = this.formTransfer.get('accountRecipient').value;
            let msg: PlainMessage = null;
            if (recipient !== '' && recipient.length === 40 || recipient.length === 46) {
              const dataAccount = this.walletService.currentWallet.accounts.find(el => el.publicAccount.address['address'] === recipient.split('-').join(''));
              msg = PlainMessage.create(dataAccount.publicAccount.publicKey);
              // console.log(dataAccount);
            }else{
              msg = PlainMessage.create(this.accountToSwap.accountCosignatory.publicKey);
            }

            const transaction = await this.nemProvider.createTransaction(msg, assetId, quantity);
            //console.log('\nTRANSACTION CREATED -->', transaction)
            const publicAccountMultisig = this.nemProvider.createPublicAccount(this.accountToSwap.publicKey);
            this.nemProvider.createTransactionMultisign(transaction, publicAccountMultisig).then(next => {
              const publicAccount = this.proximaxProvider.createPublicAccount(this.ownedAccountSwap.publicAccount.publicKey);
              this.anounceTransaction(next, account, publicAccount);
            }).catch(error => {
              this.spinnerVisibility = false;
              this.processing = false;
              this.sharedService.showError('', error.toString().split('_').join(' '));
              this.router.navigate([`/${AppConfig.routes.home}`]);
            });
          } else if (!this.isMultisig) {
            //const assetId = this.ownedAccountSwap.mosaic.assetId;
            const assetId = this.accountToSwap.mosaic.assetId;
            const msg = PlainMessage.create(this.ownedAccountSwap.publicAccount.publicKey);
            const transaction = await this.nemProvider.createTransaction(msg, assetId, quantity);
            // console.log('\nTRANSACTION CREATED -->', transaction)
            const publicAccount = this.proximaxProvider.createPublicAccount(this.ownedAccountSwap.publicAccount.publicKey);
            this.anounceTransaction(transaction, account, publicAccount);
          }
        } else {
          this.spinnerVisibility = false;
          this.processing = false;
        }
      } else {
        this.router.navigate([`/${AppConfig.routes.home}`]);
      }
    }
  }

  /**
   *
   *
   * @param {*} signed
   * @param {*} account
   * @param {*} catapultAccount
   * @param {*} transaction
   * @memberof Nis1TransferAssetsComponent
   */
  anounceTransaction(transaction: TransferTransaction | MultisigTransaction, account: Account, siriusAccount: PublicAccount) {
    // console.log('\nIN ANNOUNCE TXN --->', transaction);
    this.nemProvider.anounceTransaction(transaction, account).pipe(first()).pipe((timeout(environment.timeOutTransactionNis1))).subscribe(next => {
      if (next && next['message'] && next['message'].toLowerCase() === 'success') {
        // console.log('next --->', next);
        this.routeContinue = `/${AppConfig.routes.home}`;
        this.transactionNis1 = {
          siriusAddres: siriusAccount.address.pretty(),
          nis1Timestamp: this.nemProvider.getTimeStampTimeWindow(transaction),
          nis1PublicKey: transaction.signer.publicKey,
          nis1TransactionHash: next['transactionHash'].data
        };

        let walletNis1Storage: CurrentWalletTransNis;
        if (this.walletService.getCurrentWallet()) {
          walletNis1Storage = this.walletService.getWalletTransNisStorage().find(el => el.name === this.walletService.getCurrentWallet().name);
        } else {
          walletNis1Storage = this.walletService.getWalletTransNisStorage().find(el => el.name === this.walletService.accountWalletCreated.wallet.name);
        }

        const transactionWalletNis1: WalletTransactionsNis1Interface = {
          name: (this.walletService.getCurrentWallet()) ? this.walletService.currentWallet.name : this.walletService.accountWalletCreated.wallet.name,
          transactions: (walletNis1Storage) ? walletNis1Storage.transactions : []
        };

        transactionWalletNis1.transactions.push(this.transactionNis1);
        this.nemProvider.saveAccountWalletTransNisStorage(transactionWalletNis1);
        this.processing = false;
        this.spinnerVisibility = false;
        this.showCertifiedSwap = true;
        this.walletService.accountWalletCreated = null;
        this.sharedService.showSuccess('', next['message']);
      } else {
        this.showCertifiedSwap = false;
        this.nemProvider.validateCodeMsgError(next['code'], next['message']);
        this.spinnerVisibility = false
        this.processing = false;
      }
    }, error => {
      this.nemProvider.validateCodeMsgError(error.error.code, error.error.message);
      this.spinnerVisibility = false
      this.processing = false;
    });
  }


  /**
   *
   *
   * @memberof Nis1TransferAssetsComponent
   */
  booksAddress() {
    const data = this.listContacts.slice(0);
    const bookAddress = this.serviceModuleService.getBooksAddress();
    // console.log('bookAddress', bookAddress);
    this.listContacts = [];
    if (bookAddress !== undefined && bookAddress !== null) {
      for (let x of bookAddress) {
        data.push(x);
      }
      this.listContacts = data;
    }

    if (this.listContacts.length === 0) {
      const contacts = `${environment.itemBooksAddress}-${this.walletService.accountWalletCreated.wallet.name}`;
      this.listContacts = JSON.parse(localStorage.getItem(contacts));
    }
  }

  /**
   *
   *
   * @memberof Nis1TransferAssetsComponent
   */
  createFormTransfer() {
    this.formTransfer = this.fb.group({
      accountRecipient: (this.isMultisig && this.isLogged && this.listContacts.length > 1) ? ['', [
        Validators.required,
        Validators.minLength(this.configurationForm.address.minLength),
        Validators.maxLength(this.configurationForm.address.maxLength)
      ]] : ['', []],
      amountXpx: ['', [
        Validators.required,
        Validators.maxLength(this.configurationForm.amount.maxLength)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(this.configurationForm.passwordWallet.minLength),
        Validators.maxLength(this.configurationForm.passwordWallet.maxLength)
      ]]
    });
  }

  /**
   *
   *
   * @param {*} inputType
   * @memberof Nis1TransferAssetsComponent
   */
  changeInputType(inputType: string) {
    this.passwordMain = this.sharedService.changeInputType(inputType)
  }


  /**
   *
   *
   * @param {string} quantity
   * @returns
   * @memberof Nis1TransferAssetsComponent
   */
  getQuantity(quantity: string) {
    return this.sharedService.amountFormat(quantity);
  }

  /**
   *
   *
   * @memberof Nis1TransferAssetsComponent
   */
  initComponent() {
    this.accountSelected = Object.assign({}, this.nemProvider.getSelectedNis1Account());
    const moreAccounts = this.activateRoute.snapshot.paramMap.get('moreAccounts');
    // console.log('more accounts ', moreAccounts);
    if (this.walletService.getCurrentWallet()) {
      this.booksAddress();
      this.isLogged = true;
      this.showBtnBack = true;
      this.ownedAccountSwap = this.walletService.filterAccountWallet(this.accountSelected.nameAccount);
      if (moreAccounts !== '0') {
        this.nameBtnBack = 'Back to Select Account';
        this.goToBackRoute = `/${AppConfig.routes.swapListCosigners}`;
      } else {
        this.nameBtnBack = 'Back to Account List';
        this.goToBackRoute = `/${AppConfig.routes.swapAccountList}`;
      }
    } else {
      this.isLogged = false;
      this.showBtnBack = false;
      const currentAccountCreated = Object.assign({}, this.walletService.accountWalletCreated);
      if (currentAccountCreated && Object.keys(currentAccountCreated).length > 0) {
        this.ownedAccountSwap = currentAccountCreated.dataAccount;
      }

      if (moreAccounts !== '0') {
        this.showBtnBack = true;
        this.nameBtnBack = 'Back to Select Account';
        this.goToBackRoute = `/${AppConfig.routes.swapListCosignerNis1}`;
      }
    }

    // console.log('this.ownedAccountSwap ---> ', this.ownedAccountSwap);
    // console.log('accountSelected ---> ', this.accountSelected);
    if (this.accountSelected && Object.keys(this.accountSelected).length > 0 && this.ownedAccountSwap) {
      const account = this.activateRoute.snapshot.paramMap.get('account');
      const type = this.activateRoute.snapshot.paramMap.get('type');
      if (account && type) {
        this.isMultisig = (type === '1') ? false : true;
        if (!this.isMultisig && this.accountSelected.address.plain() === account.replace(/-/g, '')) {
          // SIMPLE ACCOUNT
          this.accountToSwap = Object.assign({}, this.accountSelected);
          this.quantity = this.accountToSwap.balance;
          this.maxAmount = this.quantity.length;
          this.showCertifiedSwap = false;
          this.createFormTransfer();
          this.subscribeAmount();
        } else if (this.isMultisig && this.accountSelected.multisigAccountsInfo.length > 0) {
          // MULTISIG ACCOUNT
          //console.log('------isMultisig------');
          const multisigAccounts = this.accountSelected.multisigAccountsInfo.slice(0);
          /*console.log('------multisigAccounts------', multisigAccounts);
          console.log('------ ACCOUNT PARAMS -----', account);*/
          const accountFiltered = multisigAccounts.find(ac => ac.address.replace(/-/g, '') === account.replace(/-/g, ''));
          // console.log('----accountFiltered----', accountFiltered);
          if (accountFiltered) {
            this.accountToSwap = Object.assign({}, accountFiltered);
            this.accountToSwap.address = this.nemProvider.createAddressToString(accountFiltered.address);
            this.accountToSwap.nameAccount = this.accountSelected.nameAccount;
            this.accountToSwap.accountCosignatory = this.proximaxProvider.createPublicAccount(this.ownedAccountSwap.publicAccount.publicKey);
            this.quantity = this.accountToSwap.balance;
            this.maxAmount = this.quantity.length;
            this.showCertifiedSwap = false;
            // console.log(this.accountToSwap);
            this.createFormTransfer();
            this.subscribeAmount();
          }
        }
      }
    }

    if (!this.accountToSwap) {
      this.router.navigate([`/${AppConfig.routes.home}`]);
    }
  }

  /**
   *
   *
   * @param {{ label: string, value: string }} event
   * @memberof Nis1TransferAssetsComponent
   */
  selectContact(event: { label: string, value: string }) {
    if (event !== undefined && event.value !== '') {
      this.formTransfer.get('accountRecipient').patchValue(event.value);
    }
  }

  /**
   *
   *
   * @memberof Nis1TransferAssetsComponent
   */
  selectMaxAmount() {
    this.formTransfer.get('amountXpx').setValue(this.quantity.split(',').join(''));
  }

  /**
   *
   *
   * @memberof Nis1TransferAssetsComponent
   */
  subscribeAmount() {
    this.subscription.push(
      this.formTransfer.get('amountXpx').valueChanges.subscribe(
        next => {
          if (next !== null && next !== undefined) {
            if (next > parseFloat(this.quantity.split(',').join(''))) {
              this.blockButton = true;
              this.errorAmount = '-invalid';
              this.amountZero = false;
              this.insufficientBalance = true;
            } else if (next === 0) {
              this.blockButton = true;
              this.insufficientBalance = false;
              this.errorAmount = '-invalid';
              this.amountZero = true;
            } else {
              this.blockButton = false;
              this.insufficientBalance = false;
              this.amountZero = false;
              this.errorAmount = '';
            }
          }
        }
      )
    );
  }

  /**
   *
   *
   * @param {string} [nameInput='']
   * @param {string} [nameControl='']
   * @param {string} [nameValidation='']
   * @returns
   * @memberof Nis1TransferAssetsComponent
   */
  validateInput(nameInput: string = '', nameControl: string = '', nameValidation: string = '') {
    let validation: AbstractControl = null;
    if (nameInput !== '' && nameControl !== '') {
      validation = this.formTransfer.controls[nameControl].get(nameInput);
    } else if (nameInput === '' && nameControl !== '' && nameValidation !== '') {
      validation = this.formTransfer.controls[nameControl].getError(nameValidation);
    } else if (nameInput !== '') {
      validation = this.formTransfer.get(nameInput);
    }
    return validation;
  }
}
