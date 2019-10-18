import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first, timeout } from 'rxjs/operators';
import { PlainMessage } from 'nem-library';
import { Subscription } from 'rxjs';

import { WalletService, AccountsInfoNis1Interface } from '../../../wallet/services/wallet.service';
import { AppConfig } from '../../../config/app.config';
import { SharedService, ConfigurationForm } from '../../../shared/services/shared.service';
import { NemProviderService } from '../../services/nem-provider.service';
import { ProximaxProvider } from '../../../shared/services/proximax.provider';

@Component({
  selector: 'app-nis1-transfer-assets',
  templateUrl: './nis1-transfer-assets.component.html',
  styleUrls: ['./nis1-transfer-assets.component.css']
})
export class Nis1TransferAssetsComponent implements OnInit {

  accountToSwap: any = null;
  amountZero: boolean = false;
  blockButton: boolean;
  configurationForm: ConfigurationForm;
  errorAmount: string;
  formTransfer: FormGroup;
  insufficientBalance = false;
  mainAccount = false;
  optionsXPX = {
    prefix: '',
    thousands: ',',
    decimal: '.',
    precision: '6'
  };
  ownedAccountSwap: AccountsInfoNis1Interface = null;
  passwordMain: string = 'password';
  processing: boolean = false;
  quantity: string = '0.000000';
  routeGoHome = `/${AppConfig.routes.home}`;
  spinnerVisibility = false;
  show = false;
  subscription: Subscription[] = [];
  type = null;

  constructor(
    private activateRoute: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router,
    private nemProvider: NemProviderService,
    private proximaxProvider: ProximaxProvider,
    private sharedService: SharedService,
    private walletService: WalletService
  ) { }

  ngOnInit() {
    console.log(this.walletService.accountWalletCreated);
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
      const quantity = this.formTransfer.get("amountXpx").value;
      const currentAccount = this.walletService.getAccountSelectedWalletNis1();

      if (this.walletService.decrypt(common, currentAccount)) {
        const account = this.nemProvider.createAccountPrivateKey(common['privateKey']);
        /*const account = this.nemProvider.createAccountPrivateKey(common['privateKey']);
        if (this.accountSelected.multiSign) {
          // const recipient = this.formTransfer.get('accountRecipient').value;
          const dataAccount = this.walletService.currentWallet.accounts.find(el => el.publicAccount.address['address'] === recipient.split('-').join(''));
          const catapultAccount = this.proximaxProvider.createPublicAccount(dataAccount.publicAccount.publicKey, dataAccount.network);
          const transaction = await this.nemService.createTransaction(PlainMessage.create(catapultAccount.publicKey), this.accountSelected.mosaic.assetId, quantity);

          this.nemService.createTransactionMultisign(transaction, this.nemService.createPublicAccount(this.accountSelected.publicKey))
            .then(next => {
              this.anounceTransaction(next, account, catapultAccount, transaction);
            })
            .catch(error => {
              // console.log('Esrror', error);
              this.sharedService.showError('Error', error.toString().split('_').join(' '));
              this.spinnerVisibility = false;
              this.processing = false;
            });
        } else {*/
        const catapultAccount = this.proximaxProvider.getPublicAccountFromPrivateKey(common['privateKey'], currentAccount.network);
        const transaction = await this.nemProvider.createTransaction(PlainMessage.create(catapultAccount.publicKey), this.ownedAccountSwap.mosaic.assetId, quantity);
        this.anounceTransaction(transaction, account, catapultAccount, transaction);
        //}
      } else {
        this.spinnerVisibility = false;
        this.processing = false;
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
  anounceTransaction(signed: any, account: any, catapultAccount: any, transaction: any) {
    this.nemProvider.anounceTransaction(signed, account).pipe(first()).pipe((timeout(15000))).subscribe(next => {
      let wallet;
      if (this.walletService.getCurrentWallet()) {
        wallet = this.walletService.getWalletTransNisStorage().find(el => el.name === this.walletService.getCurrentWallet().name);
      } else {
        wallet = this.walletService.getWalletTransNisStorage().find(el => el.name === this.walletService.accountWalletCreated.wallet.name);
      }

      if (wallet !== undefined && wallet !== null) {
        wallet.transactions.push({
          siriusAddres: catapultAccount.address.pretty(),
          nis1Timestamp: `${transaction.timeWindow.timeStamp['_date']['_year']}-${transaction.timeWindow.timeStamp['_date']['_month']}-${transaction.timeWindow.timeStamp['_date']['_day']} ${transaction.timeWindow.timeStamp['_time']['_hour']}:${transaction.timeWindow.timeStamp['_time']['_minute']}:${transaction.timeWindow.timeStamp['_time']['_second']}`,
          nis1PublicKey: transaction.signer.publicKey,
          nis1TransactionHast: next['transactionHash'].data
        });
      } else {
        wallet = {
          name: (this.walletService.getCurrentWallet()) ? this.walletService.currentWallet.name : this.walletService.accountWalletCreated.wallet.name,
          transactions: [{
            siriusAddres: catapultAccount.address.pretty(),
            nis1Timestamp: `${transaction.timeWindow.timeStamp['_date']['_year']}-${transaction.timeWindow.timeStamp['_date']['_month']}-${transaction.timeWindow.timeStamp['_date']['_day']} ${transaction.timeWindow.timeStamp['_time']['_hour']}:${transaction.timeWindow.timeStamp['_time']['_minute']}:${transaction.timeWindow.timeStamp['_time']['_second']}`,
            nis1PublicKey: transaction.signer.publicKey,
            nis1TransactionHast: next['transactionHash'].data
          }]
        };
      }
      // console.log('\n\n\n\nValue resp:\n', wallet, '\n\n\n\nEnd value\n\n');
      this.walletService.setSwapTransactions$(wallet.transactions);
      this.walletService.saveAccountWalletTransNisStorage(wallet);
      this.sharedService.showSuccess('Transaction', next['message']);
      this.walletService.accountWalletCreated = null;
      this.processing = false;
      /*this.changeView.emit({
        transaction: transaction,
        details: next,
        catapultAccount: catapultAccount,
        route: this.routeEvent
      });*/
    }, error => {
      this.nemProvider.showMessageError(error.error.code);
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
    const accountSelected = this.walletService.getSelectedNis1Account();
    if (accountSelected) {
      const account = this.activateRoute.snapshot.paramMap.get('account');
      const type = this.activateRoute.snapshot.paramMap.get('type');
      this.ownedAccountSwap = accountSelected;
      if (account && type) {
        this.type = (type === '1') ? '1' : '2';
        if (this.type === '1' && accountSelected.address.plain() === account.replace(/-/g, '')) {
          // SIMPLE ACCOUNT
          this.accountToSwap = accountSelected;
          console.log('ACCOUNT TO SWAP--->', this.accountToSwap);
          this.createFormTransfer();
          this.subscribeAmount();
        } else if (accountSelected.multisigAccountsInfo.length > 0) {
          // MULTISIG ACCOUNT
          const multisigAccounts = accountSelected.multisigAccountsInfo;
          const accountFiltered = multisigAccounts.find(ac => ac.address === account.replace(/-/g, ''));
          if (accountFiltered) {
            accountFiltered.nameAccount = accountSelected.nameAccount;
            accountFiltered.accountCosignatory = accountSelected.address.pretty();
            accountFiltered.address = this.nemProvider.createAddressToString(accountFiltered.address);
            this.accountToSwap = accountFiltered;
            console.log('ACCOUNT TO SWAP--->', this.accountToSwap);
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
