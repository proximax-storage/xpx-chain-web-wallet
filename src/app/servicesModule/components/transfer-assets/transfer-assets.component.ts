import { Component, OnInit } from '@angular/core';
import { WalletService } from 'src/app/wallet/services/wallet.service';
import { NemServiceService } from 'src/app/shared/services/nem-service.service';
import { FormGroup, Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { ConfigurationForm, SharedService } from 'src/app/shared/services/shared.service';

@Component({
  selector: 'app-transfer-assets',
  templateUrl: './transfer-assets.component.html',
  styleUrls: ['./transfer-assets.component.css']
})
export class TransferAssetsComponent implements OnInit {

  accountListVisible: boolean = false;

  element = {
    name: 'Element',
    address: 'VDBTDK-B55BPX-VSDQR7-AX3WX7-WFUZC3-65CTGJ-X2I5',
    balance: '50.000'
  };
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

  constructor(
    private walletService: WalletService,
    private fb: FormBuilder,
    private nemService: NemServiceService,
    private sharedService: SharedService
  ) {}

  ngOnInit() {
    this.configurationForm = this.sharedService.configurationForm;
    this.accountCreated = this.walletService.accountWalletCreated;
    this.quantity = this.walletService.accountInfoNis1.quantity;
    this.optionsXPX = {
      prefix: '',
      thousands: ',',
      decimal: '.',
      precision: this.walletService.accountInfoNis1.properties.divisibility
    }
    console.log('\n\n\n\nValue of this.walletService.accountInfoNis1', this.walletService.accountInfoNis1, '\n\n\n\nEnd value\n\n');
    console.log('\n\n\n\nValue of this.accountCreated', this.accountCreated, '\n\n\n\nEnd value\n\n');
    this.createFormTransfer();
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
}
