import { Component, OnInit } from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
  AbstractControl
} from "@angular/forms";
import { MosaicId, SignedTransaction, Address } from "tsjs-xpx-chain-sdk";
import { MosaicService, MosaicsStorage } from "../../../servicesModule/services/mosaic.service";
import { ProximaxProvider } from "../../../shared/services/proximax.provider";
import { DataBridgeService } from "../../../shared/services/data-bridge.service";
import { ServiceModuleService } from "../../../shared/services/service-module.service";
import { WalletService } from '../../../wallet/services/wallet.service';
import { SharedService, ConfigurationForm } from '../../../shared/services/shared.service';
import { TransactionsService, TransferInterface } from '../../services/transactions.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: "app-create-transfer",
  templateUrl: "./create-transfer.component.html",
  styleUrls: ["./create-transfer.component.css"]
})
export class CreateTransferComponent implements OnInit {

  amountXpxToSend = '0.000000';
  balanceXpx = '0.000000';
  configurationForm: ConfigurationForm;
  formTransfer: FormGroup;
  blockSendButton = false;
  invalidRecipient = false;
  insufficientBalance = false;
  msgErrorUnsupported = '';
  msgErrorUnsupportedContact = '';
  mosaicXpx: { id: string, name: string; divisibility: number } = null;
  otherMosaics = [];
  incrementMosaics = 0;
  selectOtherMosaics = [];
  subscribe = ['accountInfo', 'transactionStatus'];
  title = 'Make a transfer';
  transactionSigned: SignedTransaction = null;


  constructor(
    private fb: FormBuilder,
    private sharedService: SharedService,
    private walletService: WalletService,
    private proximaxProvider: ProximaxProvider,
    private transactionService: TransactionsService,
    private dataBridge: DataBridgeService,
    private mosaicServices: MosaicService
  ) { }

  ngOnInit() {
    this.configurationForm = this.sharedService.configurationForm;
    this.mosaicXpx = {
      id: environment.mosaicXpxInfo.id,
      name: environment.mosaicXpxInfo.name,
      divisibility: environment.mosaicXpxInfo.divisibility
    };
    this.selectOtherMosaics = [{
      value: "0",
      label: "Select mosaic",
      selected: true,
      disabled: true
    }];
    this.getMosaics();
    this.createFormTransfer();
  }

  ngOnDestroy(): void {
    this.subscribe.forEach(element => {
      if (this.subscribe[element] !== undefined) {
        this.subscribe[element].unsubscribe();
      }
    });
  }


  async getMosaics() {
    this.subscribe['accountInfo'] = this.walletService.getAccountInfoAsync().subscribe(
      async accountInfo => {
        const mosaicsSelect = this.selectOtherMosaics.slice(0);
        if (accountInfo !== undefined && accountInfo !== null) {
          if (accountInfo.mosaics.length > 0) {
            const mosaics = await this.mosaicServices.searchMosaics(accountInfo.mosaics.map(n => n.id));
            if (mosaics.length > 0) {
              for (let mosaic of mosaics) {
                const currentMosaic = accountInfo.mosaics.find(element => element.id.toHex() === this.proximaxProvider.getMosaicId(mosaic.id).toHex());
                const amount = (mosaic.mosaicInfo !== null) ?
                  this.transactionService.amountFormatter(currentMosaic.amount, mosaic.mosaicInfo) :
                  this.transactionService.amountFormatterSimple(currentMosaic.amount.compact());
                if (this.proximaxProvider.getMosaicId(mosaic.id).id.toHex() !== this.mosaicServices.mosaicXpx.mosaicId) {
                  const nameMosaic = (mosaic.mosaicNames.names.length > 0) ? mosaic.mosaicNames.names[0] : this.proximaxProvider.getMosaicId(mosaic.id).toHex();
                  mosaicsSelect.push({
                    label: `${nameMosaic} - (${amount})`,
                    value: mosaic.id,
                    balance: amount,
                    selected: false,
                    disabled: false
                  });
                } else {
                  this.balanceXpx = amount;
                  console.log('mosaic xpx');
                }
              }
              this.selectOtherMosaics = mosaicsSelect;
            }
          }
        }
      }
    );
  }

  /**
   *
   *
   * @memberof CreateTransferComponent
   */
  createFormTransfer() {
    this.formTransfer = this.fb.group({
      accountRecipient: ['', [
        Validators.required,
        Validators.minLength(this.configurationForm.accountRecipient.minLength),
        Validators.maxLength(this.configurationForm.accountRecipient.maxLength)
      ]],
      amountXpx: ['', [
        Validators.maxLength(this.configurationForm.amount.maxLength)
      ]],
      message: ['', [
        Validators.maxLength(this.configurationForm.message.maxLength)
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
   * @param {(string | (string | number)[])} [custom]
   * @param {(string | number)} [formControl]
   * @returns
   * @memberof CreateTransferComponent
   */
  clearForm(custom?: string | (string | number)[], formControl?: string | number) {
    if (custom !== undefined) {
      if (formControl !== undefined) {
        this.formTransfer.controls[formControl].get(custom).reset();
        return;
      }
      this.formTransfer.get(custom).reset();
      return;
    }

    this.formTransfer.reset();
    return;
  }

  deleteMoreMosaic(position: number) {
    console.log(this.otherMosaics);
    console.log(position);
    const otherMosaics = this.otherMosaics.filter(elemt => elemt !== position);
    this.otherMosaics = otherMosaics;
  }

  getTransactionStatus() {
    // Get transaction status
    this.subscribe['transactionStatus'] = this.dataBridge.getTransactionStatus().subscribe(
      statusTransaction => {
        if (statusTransaction !== null && statusTransaction !== undefined && this.transactionSigned !== null) {
          const statusTransactionHash = (statusTransaction['type'] === 'error') ? statusTransaction['data'].hash : statusTransaction['data'].transactionInfo.hash;
          const match = statusTransactionHash === this.transactionSigned.hash;
          if (statusTransaction['type'] === 'confirmed' && match) {
            this.transactionSigned = null;
            this.sharedService.showSuccess('', 'Transaction confirmed');
          } else if (statusTransaction['type'] === 'unconfirmed' && match) {
            this.transactionSigned = null;
            this.sharedService.showInfo('', 'Transaction unconfirmed');
          } else if (match) {
            this.transactionSigned = null;
            this.sharedService.showWarning('', statusTransaction['data'].status.split('_').join(' '));
          }
        }
      }
    );
  }

  /**
   *
   *
   * @param {Event} $event
   * @param {number} i
   * @memberof CreateTransferComponent
   */
  otherMosaicsChange(mosaicSelected: any) {
    console.log(mosaicSelected);
  }

  pushedOtherMosaics() {
    this.otherMosaics.push({
      id: '',
      amount: ''
    });
  }

  /**
   *
   *
   * @memberof CreateTransferComponent
   */
  sendTransfer() {
    console.log('send transfer....');
    if (this.formTransfer.valid) {
      const mosaicsToSend = this.validateMosaicsToSend();
      this.blockSendButton = true;
      let common = { password: this.formTransfer.get("password").value };
      if (this.walletService.decrypt(common)) {
        const params: TransferInterface = {
          common: common,
          recipient: this.formTransfer.get("accountRecipient").value,
          message: (this.formTransfer.get("message").value === null) ? "" : this.formTransfer.get("message").value,
          network: this.walletService.network,
          mosaic: mosaicsToSend
        };

        console.log('----- TRANSACTION ----', params);
        const buildTransferTransaction = this.transactionService.buildTransferTransaction(params);
        console.log('----- buildTransferTransaction ----', buildTransferTransaction);
        this.transactionSigned = buildTransferTransaction.signedTransaction;
        this.clearForm();
        buildTransferTransaction.transactionHttp.announce(buildTransferTransaction.signedTransaction).subscribe(
          async () => {
            this.blockSendButton = false;
            //this.resetMosaic();
            if (this.subscribe['transactionStatus'] === undefined || this.subscribe['transactionStatus'] === null) {
              this.getTransactionStatus();
            }
          }, err => {
            this.blockSendButton = false;
            this.clearForm();
            this.sharedService.showError('', err);
          }
        );
      }
    }
  }

  /**
   *
   *
   * @returns
   * @memberof CreateTransferComponent
   */
  validateMosaicsToSend() {
    const mosaics = [];
    const amountXpx = this.formTransfer.get("amountXpx").value;
    if (amountXpx !== '') {
      mosaics.push({
        id: this.mosaicXpx.id,
        amount: amountXpx
      });
    }



    return mosaics;
  }

  /**
   *
   *
   * @param {string} [nameInput='']
   * @param {string} [nameControl='']
   * @param {string} [nameValidation='']
   * @returns
   * @memberof CreateTransferComponent
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
