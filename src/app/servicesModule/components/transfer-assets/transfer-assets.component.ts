import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { WalletService } from 'src/app/wallet/services/wallet.service';
import { NemServiceService } from 'src/app/shared/services/nem-service.service';
import { FormGroup, Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { ConfigurationForm, SharedService } from 'src/app/shared/services/shared.service';
import { PlainMessage } from 'nem-library';
import { Router } from '@angular/router';
import { ProximaxProvider } from 'src/app/shared/services/proximax.provider';
import { AppConfig } from 'src/app/config/app.config';
import { first, timeout } from 'rxjs/operators';
import { TransactionsService } from 'src/app/transactions/services/transactions.service';
import { ServicesModuleService } from '../../services/services-module.service';
import { environment } from 'src/environments/environment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-transfer-assets',
  templateUrl: './transfer-assets.component.html',
  styleUrls: ['./transfer-assets.component.css']
})
export class TransferAssetsComponent implements OnInit {

  @Output() changeView = new EventEmitter();
  @Input() route: string;

  accountCreated: any;
  accountListVisible: boolean = false;
  accountSelected: any = null;
  availableContinue = false;
  blockButton: boolean;
  changeAccount: boolean = false;
  configurationForm: ConfigurationForm;
  divisivility: string = '6';
  errorAmount: string;
  formTransfer: FormGroup;
  insufficientBalance = false;
  listContacts: any = [];
  mosaics: any = null;
  maxAmount: number;
  passwordMain: string = 'password';
  processing: boolean = false;
  optionsXPX = {
    prefix: '',
    thousands: ',',
    decimal: '.',
    precision: '6'
  };
  quantity: string = '0.000000';
  routeEvent: string = `/${AppConfig.routes.viewAllAccount}`;
  searchBalance: boolean = true;
  spinnerVisibility = false;
  subscription: Subscription[] = [];
  // goToList: string =

  constructor(
    private walletService: WalletService,
    private fb: FormBuilder,
    private nemService: NemServiceService,
    private sharedService: SharedService,
    private router: Router,
    private proximaxService: ProximaxProvider,
    private transactionService: TransactionsService,
    private serviceModuleService: ServicesModuleService,
    private nemProvider: NemServiceService
  ) {
  }

  async ngOnInit() {
    this.configurationForm = this.sharedService.configurationForm;
    this.accountCreated = this.walletService.getAccountInfoNis1();
    this.accountSelected = this.walletService.getNis1AccountSelected();
    if (this.accountSelected) {
      this.initComponent();
    } else {
      this.router.navigate([AppConfig.routes.home]);
    }
  }

  changeInputType(inputType) {
    let newType = this.sharedService.changeInputType(inputType)
    this.passwordMain = newType;
  }

  initComponent() {
    this.createFormTransfer();
    this.formTransfer.get('amountXpx').reset();
    this.booksAddress();
    this.suscribe();

    if (this.accountSelected.consignerAccounts !== undefined) {
      this.changeAccount = this.accountSelected.consignerAccounts.length > 1;
    }

    if (this.accountSelected.multiSign) {
      this.changeAccount = true;
    }

    if (this.accountSelected.mosaic === null) {
      this.routeEvent = `/${AppConfig.routes.nis1AccountList}`;
      this.nemService.getOwnedMosaics(this.accountSelected.address).pipe(first()).pipe((timeout(10000))).subscribe(
        async next => {
          for (const el of next) {
            if (el.assetId.namespaceId === 'prx' && el.assetId.name === 'xpx') {
              let realQuantity = null;
              console.log(el.quantity);

              realQuantity = this.transactionService.addZeros(el.properties.divisibility, el.quantity);
              realQuantity = this.nemProvider.amountFormatter(realQuantity, el, el.properties.divisibility);

              console.log(realQuantity);

              this.accountSelected.mosaic = el;
              const transactions = await this.nemProvider.getUnconfirmedTransaction(this.accountSelected.address);

              if (transactions.length > 0) {
                let relativeAmount = realQuantity;
                for (const item of transactions) {
                  if (item.type === 257 && item['signer']['address']['value'] === this.accountSelected.address.value) {
                    for (const mosaic of item['_assets']) {
                      if (mosaic.assetId.namespaceId === 'prx' && mosaic.assetId.name === 'xpx') {
                        const quantity = parseFloat(this.nemProvider.amountFormatter(mosaic.quantity, el, 6));
                        const quantitywhitoutFormat = parseFloat(relativeAmount.split(',').join(''));
                        const restQuantity = (quantitywhitoutFormat - quantity).toFixed(el.properties.divisibility);
                        const quantityFormat = this.nemProvider.amountFormatter(Number(restQuantity.toString().split('.').join('')), el, 6);
                        relativeAmount = quantityFormat;
                      }
                    }
                  }
                }
                this.accountSelected.balance = relativeAmount;
              } else {
                this.accountSelected.balance = realQuantity;
              }
              this.searchBalance = false;
              this.optionsXPX = {
                prefix: '',
                thousands: ',',
                decimal: '.',
                precision: el.properties.divisibility.toString()
              }
            }
          }
          if (this.accountSelected.mosaic === null) {
            this.searchBalance = false;
            this.quantity = '0.000000';
            this.formTransfer.get('amountXpx').disable();
            this.formTransfer.get('password').disable();
            this.blockButton = true;
            this.divisivility = '6';
          } else {
            this.searchBalance = false;
            this.quantity = this.accountSelected.balance;
            if (this.quantity === '0.000000') {
              this.formTransfer.get('amountXpx').disable();
              this.formTransfer.get('password').disable();
              this.blockButton = true;

            } else {
              this.formTransfer.get('amountXpx').enable();
              this.formTransfer.get('password').enable();
              this.blockButton = false;
            }
            this.divisivility = this.accountSelected.mosaic.properties.divisibility.toString();
          }
          this.maxAmount = this.quantity.length;
        },
        error => {
          this.accountSelected.mosaic = null;
          this.accountSelected.balance = '0.000000';
          this.maxAmount = this.quantity.length;
          this.formTransfer.get('amountXpx').disable(); this.formTransfer.invalid
          this.formTransfer.get('password').disable();
          this.blockButton = true;
          this.searchBalance = false;
        }
      );
    } else {
      this.quantity = this.accountSelected.balance;
      if (this.quantity === '0.000000') {
        this.formTransfer.get('amountXpx').disable();
        this.formTransfer.get('password').disable();
        this.blockButton = true;
      } else {
        this.formTransfer.get('amountXpx').enable();
        this.formTransfer.get('password').enable();
        this.blockButton = false;
      }
      this.searchBalance = false;
      this.maxAmount = this.quantity.length;
    }
  }

  getQuantity(quantity) {
    return this.sharedService.amountFormat(quantity);
  }

  suscribe() {
    this.subscription.push(
      this.formTransfer.get('amountXpx').valueChanges.subscribe(
        next => {
          if (next !== null && next !== undefined) {
            if (next > parseFloat(this.quantity.split(',').join(''))) {
              this.blockButton = true;
              this.errorAmount = '-invalid';
              this.insufficientBalance = true;
            } else if (next === 0) {
              this.blockButton = true;
            } else {
              this.blockButton = false;
              this.insufficientBalance = false;
              this.errorAmount = '';
            }
          }
        }
      )
    );
  }

  ngOnDestroy(): void {
    // this.transactionService.setTransactionsConfirmed$([]);
    this.subscription.forEach(subscription => {
      subscription.unsubscribe();
    });
  }

  /**
   *
   *
   * @memberof CreateTransferComponent
   */
  booksAddress() {
    const data = this.listContacts.slice(0);
    const bookAddress = this.serviceModuleService.getBooksAddress();
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
   * @param {*} event
   * @memberof CreateTransferComponent
   */
  selectContact(event: { label: string, value: string }) {
    if (event !== undefined && event.value !== '') {
      this.formTransfer.get('accountRecipient').patchValue(event.value);
    }
  }

  /**
   *
   *
   * @memberof CreateTransferComponent
   */
  createFormTransfer() {
    this.formTransfer = this.fb.group({
      accountRecipient: (this.accountSelected.multiSign) ? ['', [
        Validators.required,
        Validators.minLength(this.configurationForm.address.minLength),
        Validators.maxLength(this.configurationForm.address.maxLength)]] : ['', []],
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
   * @param {string} [nameInput='']
   * @param {string} [nameControl='']
   * @param {string} [nameValidation='']
   * @returns
   * @memberof TransferAssetsComponent
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

  changeVisibility() {
    this.accountListVisible = !this.accountListVisible;
  }

  selectMaxAmount() {
    const quantity = this.quantity.split(',').join('');
    this.formTransfer.get('amountXpx').setValue(quantity);
  }

  async createTransaction() {
    if (!this.processing) {
      this.processing = true;
      let common = { password: this.formTransfer.get("password").value };
      const quantity = this.formTransfer.get("amountXpx").value;
      const currentAccount = this.walletService.getAccountSelectedWalletNis1();

      if (this.walletService.decrypt(common, currentAccount)) {
        const account = this.nemService.createAccountPrivateKey(common['privateKey']);

        if (this.accountSelected.multiSign) {
          const recipient = this.formTransfer.get('accountRecipient').value;
          const dataAccount = this.walletService.currentWallet.accounts.find(el => el.publicAccount.address['address'] === recipient.split('-').join(''));
          const catapultAccount = this.proximaxService.createPublicAccount(dataAccount.publicAccount.publicKey, dataAccount.network);
          const transaction = await this.nemService.createTransaction(PlainMessage.create(recipient), this.accountSelected.mosaic.assetId, quantity);

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
        } else {
          const catapultAccount = this.proximaxService.getPublicAccountFromPrivateKey(common['privateKey'], currentAccount.network);
          const transaction = await this.nemService.createTransaction(PlainMessage.create(catapultAccount.publicKey), this.accountSelected.mosaic.assetId, quantity);
          this.anounceTransaction(transaction, account, catapultAccount, transaction);
        }
      } else {
        this.spinnerVisibility = false;
        this.processing = false;
      }
    }
  }

  anounceTransaction(signed, account, catapultAccount, transaction) {
    this.nemService.anounceTransaction(signed, account).pipe(first()).pipe((timeout(15000)))
      .subscribe(next => {
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
        this.changeView.emit({
          transaction: transaction,
          details: next,
          catapultAccount: catapultAccount,
          route: this.routeEvent
        });
      },
        error => {
          console.log('error--------------->', error);
          
          if (error.error.message) {
            switch (error.error.code) {
              case 521 || 535 || 542 || 551 || 565 || 582 || 591 || 610 || 622 || 672 || 711:
                this.sharedService.showError('Error', 'Some data is invalid');
                break;

              case 501 || 635 || 641 || 685 || 691:
                this.sharedService.showError('Error', 'Service not available');
                break;

              case 655 || 666:
                this.sharedService.showError('Error', 'insufficient XPX Balance');
                break;

              case 511:
                this.sharedService.showError('Error', 'Daily limit exceeded (5 swaps)');
                break;

              case 705:
                this.sharedService.showError('Error', 'Invalid Url');
                break;

              default:
                // this.sharedService.showError('Error', 'Error! try again later');
                this.sharedService.showError('Error', error.error.message.toString().split('_').join(' '));
                break;
            }
          } else {
            this.sharedService.showError('Error', error.toString().split('_').join(' '));
          }
          this.spinnerVisibility = false
          this.processing = false;
        });
  }

  navToRoute() {
    const route = this.accountSelected.route
    this.walletService.setAccountSelectedWalletNis1(null);
    this.walletService.setNis1AccounsWallet(null);
    this.walletService.setNis1AccountsWallet$([]);
    this.walletService.setAccountInfoNis1(null);
    this.walletService.setNis1AccountSelected(null);
    this.walletService.accountWalletCreated = null;
    if (this.router.url === `/${AppConfig.routes.transferXpx}`) {
      this.router.navigate([AppConfig.routes.home]);
    } else {
      this.router.navigate([route]);
    }
  }

  goToList() {
    this.walletService.setNis1AccountSelected(null);
    if (this.router.url === `/${AppConfig.routes.accountNis1TransferXpx}`) {
      this.router.navigate([AppConfig.routes.nis1AccountsConsigner]);
    } else {
      this.router.navigate([AppConfig.routes.walletNis1AccountConsigner]);
    }
  }
}
