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

@Component({
  selector: 'app-transfer-assets',
  templateUrl: './transfer-assets.component.html',
  styleUrls: ['./transfer-assets.component.css']
})
export class TransferAssetsComponent implements OnInit {

  @Output() changeView = new EventEmitter();
  @Input() route: string;

  accountListVisible: boolean = false;
  formTransfer: FormGroup;
  configurationForm: ConfigurationForm;
  quantity: string;
  accountCreated: any;
  optionsXPX = {
    prefix: '',
    thousands: ',',
    decimal: '.',
    precision: '6'
  };
  spinnerVisibility = false;
  availableContinue = false;
  mosaics: any = null;
  divisivility: string = '6';
  routeEvent: string = `/${AppConfig.routes.viewAllAccount}`;
  searchBalance: boolean = true;
  accountSelected: any = null;
  listContacts: any = [];
  changeAccount: boolean = false;
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
    // this.mosaics = this.walletService.getAccountMosaicsNis1();
    this.accountSelected = this.walletService.getNis1AccountSelected();

    if (this.accountSelected) {
      this.createFormTransfer();
      this.booksAddress();
      console.log('this.accountCreated------>', this.accountCreated);
      console.log('this.accountSelected------>', this.accountSelected);
      console.log('curren Account------->', this.walletService.currentAccount);
      
      if (this.accountSelected.consignerAccounts !== undefined) {
        this.changeAccount = this.accountSelected.consignerAccounts.length > 1;
      }
  
      if (this.accountSelected.multiSign) {
        this.changeAccount = true;
      }
  
  
      if (this.accountSelected.mosaic === null) {
        this.routeEvent = `/${AppConfig.routes.nis1AccountList}`;
        this.nemService.getOwnedMosaics(this.accountSelected.address).pipe(first()).pipe((timeout(10000))).subscribe(
          next => {
            console.log('next------------_>', next);
  
            for (const el of next) {
              if (el.assetId.namespaceId === 'prx' && el.assetId.name === 'xpx') {
                let realQuantity = null;
                realQuantity = this.transactionService.addZeros(el.properties.divisibility, el.quantity);
                realQuantity = this.nemProvider.amountFormatter(realQuantity, el, el.properties.divisibility);
                this.accountSelected.mosaic = el;
                this.accountSelected.balance = realQuantity;
                this.searchBalance = false;
                console.log('\n\n\n\nValue of this.accountCreated', this.accountCreated, '\n\n\n\nEnd value\n\n');
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
              this.divisivility = '6';
            } else {
              this.searchBalance = false;
              this.quantity = this.accountSelected.balance;
              this.divisivility = this.accountSelected.mosaic.properties.divisibility.toString();
            }
          },
          error => {
            this.accountSelected.mosaic = null;
            this.accountSelected.balance = '0.000000';
            this.searchBalance = false;
          }
        );
      } else {
        this.quantity = this.accountSelected.balance;
        this.searchBalance = false;
      }
    } else {
      this.router.navigate([AppConfig.routes.auth]);
    }
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
    console.log('this.listContacts _________________>>>>>', this.walletService.currentWallet);

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
    let common = { password: this.formTransfer.get("password").value };
    const quantity = this.formTransfer.get("amountXpx").value;
    console.log('\n\n\n\nValue quantity:\n', quantity, '\n\n\n\nEnd value\n\n');
    // console.log('\n\n\n\nValue this.walletService.currentAccount:\n', this.walletService.currentAccount, '\n\n\n\nEnd value\n\n');
    console.log('Account Selecteddddd --------------->', this.walletService.getAccountSelectedWalletNis1());
    
    console.log('\n\n\n\nValue this.accountCreated:\n', this.accountCreated, '\n\n\n\nEnd value\n\n');
    const currentAccount = this.walletService.getAccountSelectedWalletNis1();
    if (this.walletService.decrypt(common, currentAccount)) {
      console.log('\n\n\n\nValue common:\n', common, '\n\n\n\nEnd value\n\n');
      const account = this.nemService.createAccountPrivateKey(common['privateKey']);

      if (this.accountSelected.multiSign) {
        const recipient = this.formTransfer.get('accountRecipient').value;
        const dataAccount = this.walletService.currentWallet.accounts.find(el => el.publicAccount.address['address'] === recipient.split('-').join(''));
        const catapultAccount = this.proximaxService.createPublicAccount(dataAccount.publicAccount.publicKey, dataAccount.network);
        const transaction = await this.nemService.createTransaction(PlainMessage.create(recipient), this.accountSelected.mosaic.assetId, quantity);

        this.nemService.createTransactionMultisign(transaction, this.nemService.createPublicAccount(this.accountSelected.publicKey))
          .then(next => {
            this.nemService.anounceTransaction(next, account).pipe(first()).pipe((timeout(15000)))
              .subscribe(next => {
                console.log('\n\n\n\nValue resp:\n', next, '\n\n\n\nEnd value\n\n');
                this.sharedService.showSuccess('Transaction', next['message']);
                this.changeView.emit({
                  transaction: transaction,
                  details: next,
                  catapultAccount: catapultAccount,
                  route: this.routeEvent
                });
              },
                error => {
                  this.sharedService.showError('Error', error.toString().split('_').join(' '));
                  this.spinnerVisibility = false
                });
          })
          .catch(error => {
            console.log('Esrror', error);
            this.sharedService.showError('Error', error.toString().split('_').join(' '));
            this.spinnerVisibility = false
          });
      } else {
        const catapultAccount = this.proximaxService.getPublicAccountFromPrivateKey(common['privateKey'], currentAccount.network);
        const transaction = await this.nemService.createTransaction(PlainMessage.create(catapultAccount.publicKey), this.accountSelected.mosaic.assetId, quantity);
        console.log('\n\n\n\nValue transaction:\n', transaction, '\n\n\n\nEnd value\n\n');
        console.log('\n\n\n\nValue catapultAccount:\n', catapultAccount, '\n\n\n\nEnd value\n\n');

        this.nemService.anounceTransaction(transaction, account).pipe(first()).pipe((timeout(15000)))
          .subscribe(next => {
            console.log('\n\n\n\nValue resp:\n', next, '\n\n\n\nEnd value\n\n');
            this.sharedService.showSuccess('Transaction', next['message']);
            this.changeView.emit({
              transaction: transaction,
              details: next,
              catapultAccount: catapultAccount,
              route: this.routeEvent
            });
          },
            error => {
              this.sharedService.showError('Error', error.toString().split('_').join(' '));
              this.spinnerVisibility = false
            });
      }
    }
  }

  navToRoute() {
    console.log('this.route-------->', this.route);
    const route = this.accountSelected.route
    this.walletService.setAccountSelectedWalletNis1(null);
    this.walletService.setNis1AccounsWallet(null);
    this.walletService.setAccountInfoNis1(null);
    this.walletService.setNis1AccountSelected(null);
    if (this.router.url === `/${AppConfig.routes.transferXpx}`) {
      this.router.navigate([AppConfig.routes.auth]);
    } else {
      this.router.navigate([route]);
    }
    // this.walletService.setAccountMosaicsNis1(null);
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
