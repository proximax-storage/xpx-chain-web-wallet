import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { WalletService } from 'src/app/wallet/services/wallet.service';
import { NemServiceService } from 'src/app/shared/services/nem-service.service';
import { FormGroup, Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { ConfigurationForm, SharedService } from 'src/app/shared/services/shared.service';
import { PlainMessage } from 'nem-library';
import { Router } from '@angular/router';
import { ProximaxProvider } from 'src/app/shared/services/proximax.provider';
import { AppConfig } from 'src/app/config/app.config';
import { environment } from 'src/environments/environment';

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
  divisivility: string;
  routeEvent: string = `/${AppConfig.routes.viewAllAccount}`;
  disabledForm: boolean = true;
  searchBalance: boolean = true;

  constructor(
    private walletService: WalletService,
    private fb: FormBuilder,
    private nemService: NemServiceService,
    private sharedService: SharedService,
    private router: Router,
    private proximaxService: ProximaxProvider,
    private nemProvider: NemServiceService
  ) { }

  async ngOnInit() {
    this.configurationForm = this.sharedService.configurationForm;
    this.createFormTransfer();
    this.accountCreated = this.walletService.getAccountInfoNis1();
    this.mosaics = this.walletService.getAccountMosaicsNis1();
    console.log('\n\n\n\nValue of this.walletService.accountMosaicsNis1', this.mosaics, '\n\n\n\nEnd value\n\n');
    console.log('\n\n\n\nValue of this.accountCreated', this.accountCreated, '\n\n\n\nEnd value\n\n');
    if (this.mosaics === null) {
      this.routeEvent = `/${AppConfig.routes.nis1AccountList}`;
      const mosaicNis1 = await this.nemProvider.getOwnedMosaics(this.accountCreated.nis1Account.address).toPromise();
      if (mosaicNis1 && mosaicNis1.length > 0) {
        for (const el of mosaicNis1) {
          if (el.assetId.namespaceId === 'prx' && el.assetId.name === 'xpx') {
            this.mosaics = el;
            this.walletService.setAccountMosaicsNis1(el);
            this.disabledForm = false;
            this.searchBalance = false;
          }
        }
      }
    } else {
      this.disabledForm = false;
      this.searchBalance = false;
    }
    if (this.mosaics === null) {
      this.quantity = '0.000000';
      this.divisivility = '6';
    } else {
      this.quantity = this.mosaics.quantity;
      this.divisivility = this.mosaics.properties.divisibility.toString();
    }
    console.log('\n\n\n\nValue of this.accountCreated', this.accountCreated, '\n\n\n\nEnd value\n\n');
    this.optionsXPX = {
      prefix: '',
      thousands: ',',
      decimal: '.',
      precision: this.divisivility
    }
  }

  /**
   *
   *
   * @memberof CreateTransferComponent
   */
  createFormTransfer() {
    this.formTransfer = this.fb.group({
      accountRecipient: ['', []],
      amountXpx: ['', [
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
    this.formTransfer.get('amountXpx').setValue(this.quantity);
  }

  async createTransaction() {
    let common = { password: this.formTransfer.get("password").value };
    const quantity = this.formTransfer.get("amountXpx").value;
    console.log('\n\n\n\nValue quantity:\n', quantity, '\n\n\n\nEnd value\n\n');
    if (this.walletService.decrypt(common, this.accountCreated)) {
      console.log('\n\n\n\nValue common:\n', common, '\n\n\n\nEnd value\n\n');
      const catapultAccount = this.proximaxService.getPublicAccountFromPrivateKey(common['privateKey'], this.accountCreated.network);
      console.log('\n\n\n\nValue catapultAccount:\n', catapultAccount, '\n\n\n\nEnd value\n\n');

      const account = this.nemService.createAccountPrivateKey(common['privateKey']);
      const transaction = await this.nemService.createTransaction(PlainMessage.create(catapultAccount.publicKey), this.walletService.accountMosaicsNis1.assetId, quantity);
      this.nemService.anounceTransaction(transaction, account)
        .then(resp => {
          console.log('\n\n\n\nValue resp:\n', resp, '\n\n\n\nEnd value\n\n');
          this.sharedService.showSuccess('Transaction', resp['message']);
          this.changeView.emit({
            transaction: transaction,
            details: resp,
            catapultAccount: catapultAccount,
            route: this.routeEvent
          });
        })
        .catch(error => {
          this.sharedService.showError('Error', error.toString().split('_').join(' '));
          this.spinnerVisibility = false
        });
    }
  }

  navToRoute() {
    this.walletService.setAccountInfoNis1(null);
    this.walletService.setAccountMosaicsNis1(null);
    this.router.navigate([this.route]);
  }
}
