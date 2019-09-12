import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { WalletService } from 'src/app/wallet/services/wallet.service';
import { NemServiceService } from 'src/app/shared/services/nem-service.service';
import { FormGroup, Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { ConfigurationForm, SharedService } from 'src/app/shared/services/shared.service';
import { PlainMessage } from 'nem-library';
import { Router } from '@angular/router';
import { ProximaxProvider } from 'src/app/shared/services/proximax.provider';
import { AppConfig } from 'src/app/config/app.config';

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

  constructor(
    private walletService: WalletService,
    private fb: FormBuilder,
    private nemService: NemServiceService,
    private sharedService: SharedService,
    private router: Router,
    private proximaxService: ProximaxProvider
  ) { }

  async ngOnInit() {
    if (this.walletService.accountWalletCreated) {
      this.configurationForm = this.sharedService.configurationForm;
      this.accountCreated = this.walletService.accountWalletCreated;
      this.quantity = this.walletService.accountInfoNis1.quantity;
      this.optionsXPX = {
        prefix: '',
        thousands: ',',
        decimal: '.',
        precision: this.walletService.accountInfoNis1.properties.divisibility
      }
      this.createFormTransfer();
      console.log('\n\n\n\nValue of this.walletService.accountInfoNis1', this.walletService.accountInfoNis1, '\n\n\n\nEnd value\n\n');
      console.log('\n\n\n\nValue of this.accountCreated', this.accountCreated, '\n\n\n\nEnd value\n\n');
    } else {
      this.router.navigate([`/${AppConfig.routes.home}`]);
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
    if (this.walletService.decrypt(common, this.accountCreated.dataAccount)) {
      console.log('\n\n\n\nValue common:\n', common, '\n\n\n\nEnd value\n\n');
      const catapultAccount = this.proximaxService.getPublicAccountFromPrivateKey(common['privateKey'], this.accountCreated.data.network);
      console.log('\n\n\n\nValue catapultAccount:\n', catapultAccount, '\n\n\n\nEnd value\n\n');

      const account = this.nemService.createAccountPrivateKey(common['privateKey']);
      const transaction = await this.nemService.createTransaction(PlainMessage.create(catapultAccount.publicKey), this.walletService.accountInfoNis1.assetId, quantity);
      this.nemService.anounceTransaction(transaction, account)
        .then(resp => {
          console.log('\n\n\n\nValue resp:\n', resp, '\n\n\n\nEnd value\n\n');
          this.sharedService.showSuccess('Transaction', resp['message']);
          this.changeView.emit({
            transaction: transaction,
            details: resp
          });
        })
        .catch(error => {
          this.sharedService.showError('Error', error.toString().split('_').join(' '));
          this.spinnerVisibility = false
        });
    }
  }

  navToRoute() {
    this.router.navigate([this.route]);
  }
}
