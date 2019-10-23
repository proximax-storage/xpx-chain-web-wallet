import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first, timeout } from 'rxjs/operators';
import { PlainMessage, TransferTransaction, MultisigTransaction, Account } from 'nem-library';
import { PublicAccount } from 'tsjs-xpx-chain-sdk';
import { Subscription } from 'rxjs';

import { WalletService, AccountCreatedInterface, TransactionsNis1Interface } from '../../../wallet/services/wallet.service';
import { AppConfig } from '../../../config/app.config';
import { SharedService, ConfigurationForm } from '../../../shared/services/shared.service';
import { NemProviderService, AccountsInfoNis1Interface, WalletTransactionsNis1Interface } from '../../services/nem-provider.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-nis1-transfer-assets',
  templateUrl: './nis1-transfer-assets.component.html',
  styleUrls: ['./nis1-transfer-assets.component.css']
})
export class Nis1TransferAssetsComponent implements OnInit {

  accountToSwap: AccountsInfoNis1Interface = null;
  amountZero: boolean = false;
  blockButton: boolean;
  changeAccount = `/${AppConfig.routes.swapListCosignerNis1}`;
  configurationForm: ConfigurationForm;
  currentAccountCreated: AccountCreatedInterface;
  errorAmount: string;
  formTransfer: FormGroup;
  isMultisig = null;
  insufficientBalance = false;
  maxAmount: number = 0;
  mainAccount = false;
  optionsXPX = {
    prefix: '',
    thousands: ',',
    decimal: '.',
    precision: '6'
  };
  //ownedAccountSwap: AccountsInfoNis1Interface = null;
  passwordMain: string = 'password';
  processing: boolean = false;
  quantity: string = '0.000000';
  routeGoHome = `/${AppConfig.routes.home}`;
  routeContinue: string;
  spinnerVisibility = false;
  showCertifiedSwap = false;
  subscription: Subscription[] = [];
  transactionNis1: TransactionsNis1Interface;
  moreAccounts: string;

  constructor(
    private activateRoute: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private nemProvider: NemProviderService,
    private sharedService: SharedService,
    private walletService: WalletService
  ) { }

  ngOnInit() {
    this.accountToSwap = null;
    this.configurationForm = this.sharedService.configurationForm;
    this.initComponent();
  }

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
      if (this.currentAccountCreated) {
        if (this.walletService.decrypt(common, this.currentAccountCreated.dataAccount)) {
          const account = this.nemProvider.createAccountPrivateKey(common['privateKey']);
          const quantity = this.formTransfer.get("amountXpx").value;
          if (this.isMultisig) {
            const assetId = this.accountToSwap.mosaic.assetId;
            const msg = PlainMessage.create(this.accountToSwap.accountCosignatory.publicKey);
            const transaction = await this.nemProvider.createTransaction(msg, assetId, quantity);
            const publicAccountMultisig = this.nemProvider.createPublicAccount(this.accountToSwap.publicKey);
            this.nemProvider.createTransactionMultisign(transaction, publicAccountMultisig).then(next => {
              this.anounceTransaction(next, account, this.currentAccountCreated.dataAccount.publicAccount);
            }).catch(error => {
              this.spinnerVisibility = false;
              this.processing = false;
              this.sharedService.showError('', error.toString().split('_').join(' '));
              this.router.navigate([`/${AppConfig.routes.home}`]);
            });
          } else if (!this.isMultisig) {
            //const assetId = this.ownedAccountSwap.mosaic.assetId;
            const assetId = this.accountToSwap.mosaic.assetId;
            const msg = PlainMessage.create(this.currentAccountCreated.dataAccount.publicAccount.publicKey);
            const transaction = await this.nemProvider.createTransaction(msg, assetId, quantity);
            this.anounceTransaction(transaction, account, this.currentAccountCreated.dataAccount.publicAccount);
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
  anounceTransaction(transaction: TransferTransaction | MultisigTransaction, account: Account, catapultAccount: any) {
    this.nemProvider.anounceTransaction(transaction, account).pipe(first()).pipe((timeout(environment.timeOutTransactionNis1))).subscribe(next => {
      if (next && next['message'] && next['message'].toLowerCase() === 'success') {
        //console.log('RESPONSE ANNOUNCE --->', next);
        //console.log('ACCOUNT WALLET CREATED --->', this.walletService.accountWalletCreated);
        this.routeContinue = `/${AppConfig.routes.home}`;
        this.transactionNis1 = {
          siriusAddres: catapultAccount.address.pretty(),
          nis1Timestamp: this.nemProvider.getTimeStampTimeWindow(transaction),
          nis1PublicKey: transaction.signer.publicKey,
          nis1TransactionHash: next['transactionHash'].data
        };

        const transactionWalletNis1: WalletTransactionsNis1Interface = {
          name: this.walletService.accountWalletCreated.wallet.name,
          transactions: [this.transactionNis1]
        };

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
  createFormTransfer() {
    this.formTransfer = this.fb.group({
      /* accountRecipient: (this.accountSelected.multiSign) ? ['', [
         Validators.required,
         Validators.minLength(this.configurationForm.address.minLength),
         Validators.maxLength(this.configurationForm.address.maxLength)]] : ['', []],*/
      amountXpx: ['', [
        Validators.required,
        Validators.maxLength(this.configurationForm.amount.maxLength)
      ]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(this.configurationForm.passwordWallet.minLength),
          Validators.maxLength(this.configurationForm.passwordWallet.maxLength)
        ]
      ]
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
    let publicAccount = null;
    if (this.walletService.currentWallet) {
    }else {
      this.currentAccountCreated = Object.assign({}, this.walletService.accountWalletCreated);
      if (this.currentAccountCreated && Object.keys(this.currentAccountCreated).length > 0){
        publicAccount = PublicAccount.createFromPublicKey(
          this.currentAccountCreated.dataAccount.publicAccount.publicKey,
          this.currentAccountCreated.dataAccount.network
        );
      }
    }

    const accountSelected = Object.assign({}, this.nemProvider.getSelectedNis1Account());
    console.log('accountSelected ---> ', accountSelected);
    if (accountSelected && Object.keys(accountSelected).length > 0 && publicAccount) {
      const account = this.activateRoute.snapshot.paramMap.get('account');
      const type = this.activateRoute.snapshot.paramMap.get('type');
      this.moreAccounts = this.activateRoute.snapshot.paramMap.get('moreAccounts');
      //this.ownedAccountSwap = Object.assign({}, accountSelected);
      if (account && type) {
        this.isMultisig = (type === '1') ? false : true;
        if (!this.isMultisig && accountSelected.address.plain() === account.replace(/-/g, '')) {
          // SIMPLE ACCOUNT
          this.accountToSwap = Object.assign({}, accountSelected);
          this.quantity = this.accountToSwap.balance;
          this.maxAmount = this.quantity.length;
          this.showCertifiedSwap = false;
          this.createFormTransfer();
          this.subscribeAmount();
        } else if (this.isMultisig && accountSelected.multisigAccountsInfo.length > 0) {
          // MULTISIG ACCOUNT
          //console.log('------isMultisig------');
          const multisigAccounts = accountSelected.multisigAccountsInfo.slice(0);
          /*console.log('------multisigAccounts------', multisigAccounts);
          console.log('------ ACCOUNT PARAMS -----', account);*/
          const accountFiltered = multisigAccounts.find(ac => ac.address.replace(/-/g, '') === account.replace(/-/g, ''));
          // console.log('----accountFiltered----', accountFiltered);
          if (accountFiltered) {
            this.accountToSwap = Object.assign({}, accountFiltered);
            this.accountToSwap.address = this.nemProvider.createAddressToString(accountFiltered.address);
            this.accountToSwap.nameAccount = accountSelected.nameAccount;
            this.accountToSwap.accountCosignatory = publicAccount;
            this.quantity = this.accountToSwap.balance;
            this.maxAmount = this.quantity.length;
            this.showCertifiedSwap = false;
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
