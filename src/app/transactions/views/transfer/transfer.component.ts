import { Component, OnInit } from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl
} from "@angular/forms";
import { MosaicId, SignedTransaction } from "tsjs-xpx-catapult-sdk";
import { WalletService, SharedService } from "../../../shared";
import { TransactionsService } from "../../../transactions/service/transactions.service";
import { ServiceModuleService } from "../../../servicesModule/services/service-module.service";
import { MosaicService } from "../../../servicesModule/services/mosaic.service";
import { ProximaxProvider } from "../../../shared/services/proximax.provider";
import { MosaicsStorage } from "../../../servicesModule/interfaces/mosaics-namespaces.interface";
import { DataBridgeService } from "../../../shared/services/data-bridge.service";

@Component({
  selector: "app-transfer",
  templateUrl: "./transfer.component.html",
  styleUrls: ["./transfer.component.scss"]
})
export class TransferComponent implements OnInit {


  amountSend: string | number = '0.000000';
  blockSendButton: boolean;
  contactForm: FormGroup;
  contactSelected = '';
  contacts: any = [{
    value: "",
    label: "Select contact",
    selected: false,
    disabled: true
  }];
  configurationForm = {
    accountRecipient: {
      minLength: 40, maxLength: 46
    },
    amount: {
      maxLength: 20
    },
    message: {
      maxLength: 1024
    },
    password: {
      minLength: 8, maxLength: 30
    }
  }
  inputBlocked: boolean;
  insufficientBalance = false;
  mosaicsSelect: any = [
    {
      value: "0",
      label: "Select mosaic",
      selected: true,
      disabled: true
    },
    {
      value: this.proximaxProvider.mosaicXpx.mosaicId,
      label: this.proximaxProvider.mosaicXpx.mosaic,
      selected: false,
      disabled: false
    }
  ];
  msgErrorUnsupported = '';
  maskData = '0*';
  myClass = {
    'boxRecipientTrue': 'col-9 col-sm-10 col-md-6 col-lg-7 pr-2rem',
    'boxDirectoryTrue': 'col-12 col-md-4 col-lg-4 d-flex justify-content-center align-items-center background-dark-green-plus',
    'boxRecipientFalse': 'col-9 col-sm-8 col-md-8 col-lg-9 pl-2rem pr-2rem',
    'boxDirectoryFalse': 'col-12 col-sm-2 col-md-2 d-flex justify-content-center align-items-center background-dark-green-plus',
    'rowDirectoryTrue': 'col-10 col-md-8 col-lg-9',
    'rowAddContactTrue': 'col-2 col-md-4 col-lg-3 d-flex align-items-center',
    'rowAddContactFalse': 'col-12 d-flex align-items-center',
    'rowSearchingMosaicTrue': 'col-8 col-sm-8 col-md-8 col-lg-9',
    'rowSearchingMosaicFalse': 'col-10 col-sm-10 col-md-10 col-lg-11'
  }

  showContacts = false;
  subscribe = ['accountInfo', 'transactionStatus'];
  transferForm: FormGroup;
  transferIsSend = false;
  titleLabelAmount = 'Amount';
  searchMosaics: boolean = false;
  transactionSigned: SignedTransaction = null;

  constructor(
    private fb: FormBuilder,
    private walletService: WalletService,
    private sharedService: SharedService,
    private transactionService: TransactionsService,
    private ServiceModuleService: ServiceModuleService,
    private proximaxProvider: ProximaxProvider,
    private mosaicServices: MosaicService,
    private dataBridge: DataBridgeService
  ) { }

  ngOnInit() {
    const data = this.contacts.slice(0);
    const bookAddress = this.ServiceModuleService.getBooksAddress();
    this.contacts = [];
    if (bookAddress !== undefined && bookAddress !== null) {
      for (let x of bookAddress) {
        data.push(x);
      }
      this.contacts = data;
    }
    this.createForm();
    this.createFormContact();
    this.getMosaics();
    this.changeAddress();
    this.subscribeControls();
  }

  ngOnDestroy(): void {
    this.subscribe.forEach(element => {
      if (this.subscribe[element] !== undefined) {
        this.subscribe[element].unsubscribe();
      }
    });
  }

  /**
   * Get mosaics name
   *
   * @memberof TransferComponent
   */
  async getMosaics() {
    this.subscribe['accountInfo'] = this.walletService.getAccountInfoAsync().subscribe(
      async accountInfo => {
        this.searchMosaics = true;
        const mosaicsSelect = this.mosaicsSelect.slice(0);
        if (accountInfo !== undefined && accountInfo !== null) {
          if (accountInfo.mosaics.length > 0) {
            const mosaics = await this.mosaicServices.searchMosaics(accountInfo.mosaics.map(n => n.id));
            if (mosaics.length > 0) {
              for (let mosaic of mosaics) {
                if (this.proximaxProvider.getMosaicId(mosaic.id).id.toHex() !== this.mosaicServices.mosaicXpx.mosaicId) {
                  const nameMosaic = (mosaic.mosaicNames.names.length > 0) ? mosaic.mosaicNames.names[0] : this.proximaxProvider.getMosaicId(mosaic.id).toHex();
                  mosaicsSelect.push({
                    label: nameMosaic,
                    value: mosaic.id,
                    selected: false,
                    disabled: false
                  });
                }
              }

              this.mosaicsSelect = mosaicsSelect;
            }
          }

          this.searchMosaics = false;
        }
      }
    );
  }

  /**
   * Create form send transfer
   *
   * @memberof TransferComponent
   */
  createForm() {
    this.transferForm = this.fb.group({
      mosaicsSelect: [
        this.proximaxProvider.mosaicXpx.mosaicId,
        [Validators.required]
      ],
      contact: [''],
      accountRecipient: [
        '',
        [
          Validators.required,
          Validators.minLength(this.configurationForm.accountRecipient.minLength),
          Validators.maxLength(this.configurationForm.accountRecipient.maxLength)
        ]
      ],
      amount: ['0', [Validators.maxLength(this.configurationForm.amount.maxLength)]],
      message: ["", [Validators.maxLength(this.configurationForm.message.maxLength)]],
      password: [
        null,
        [
          Validators.required,
          Validators.minLength(this.configurationForm.password.minLength),
          Validators.maxLength(this.configurationForm.password.maxLength)
        ]
      ]
    });
  }

  /**
   * Create form contact
   *
   * @memberof TransferComponent
   */
  createFormContact() {
    this.contactForm = this.fb.group({
      user: [
        null,
        [Validators.required, Validators.minLength(2), Validators.maxLength(30)]
      ],
      address: [
        null,
        [
          Validators.required,
          Validators.minLength(46),
          Validators.maxLength(46)
        ]
      ]
    });
  }

  /**
   *
   *
   * @memberof TransferComponent
   */
  changeAddress() {
    this.transferForm.get('accountRecipient').valueChanges.subscribe(
      value => {
        if (this.contactSelected !== '') {
          if (this.contactSelected !== value) {
            this.transferForm.get('contact').patchValue('');
          }
        }
      }
    );
  }


  /**
   * Clean form
   *
   * @param {(string | (string | number)[])} [custom]
   * @param {(string | number)} [formControl]
   * @returns
   * @memberof TransferComponent
   */
  cleanForm(custom?: string | (string | number)[], formControl?: string | number) {
    if (custom !== undefined) {
      if (formControl !== undefined) {
        this.transferForm.controls[formControl].get(custom).reset();
        return;
      }
      this.transferForm.get(custom).reset();
      return;
    }
    this.amountSend = 0;
    this.transferForm.reset();
    return;
  }

  /**
   *
   *
   * @param {(string | (string | number)[])} control
   * @returns
   * @memberof TransferComponent
   */
  getInput(control: string | (string | number)[]) {
    return this.transferForm.get(control);
  }

  /**
   *
   *
   * @memberof TransferComponent
   */
  getTransactionStatus() {
    // Get transaction status
    this.subscribe['transactionStatus'] = this.dataBridge.getTransactionStatus().subscribe(
      statusTransaction => {
        if (statusTransaction !== null && statusTransaction !== undefined && this.transactionSigned !== null) {
          const match = statusTransaction['data'].transactionInfo.hash === this.transactionSigned.hash;
          if (statusTransaction['type'] === 'confirmed' && match) {
            this.transactionSigned = null;
            this.sharedService.showSuccess('', 'Transaction confirmed');
          } else if (statusTransaction['type'] === 'unconfirmed' && match) {
            this.transactionSigned = null;
            this.sharedService.showInfo('', 'Transaction unconfirmed');
          } else if (match) {
            this.transactionSigned = null;
            this.sharedService.showWarning('', statusTransaction['type'].status);
          }
        }
      }
    );
  }


  /**
   * Gets errors
   *
   * @param {(string | (string | number)[])} control
   * @param {*} [typeForm]
   * @param {(string | number)} [formControl]
   * @returns
   * @memberof TransferComponent
   */
  getError(control: string | (string | number)[], typeForm?: any, formControl?: string | number) {
    const form = typeForm === undefined ? this.transferForm : this.contactForm;
    if (formControl === undefined) {
      if (form.get(control).getError("required")) {
        return `This field is required`;
      } else if (form.get(control).getError("minlength")) {
        return `This field must contain minimum ${form.get(control).getError("minlength").requiredLength} characters`;
      } else if (form.get(control).getError("maxlength")) {
        return `This field must contain maximum ${form.get(control).getError("maxlength").requiredLength} characters`;
      }
    } else {
      if (form.controls[formControl].get(control).getError("required")) {
        return `This field is required`;
      } else if (form.controls[formControl].get(control).getError("minlength")) {
        return `This field must contain minimum ${form.controls[formControl].get(control).getError("minlength").requiredLength} characters`;
      } else if (form.controls[formControl].get(control).getError("maxlength")) {
        return `This field must contain maximum ${form.controls[formControl].get(control).getError("maxlength").requiredLength} characters`;
      } else if (form.controls[formControl].getError("noMatch")) {
        return `Password doesn't match`;
      }
    }
  }

  get input() {
    return this.transferForm.get('accountRecipient');
  }

  /**
   * Save contact
   *
   * @returns
   * @memberof TransferComponent
   */
  saveContact() {
    if (this.contactForm.valid) {
      const dataStorage = this.ServiceModuleService.getBooksAddress();
      const books = {
        value: this.contactForm.get("address").value,
        label: this.contactForm.get("user").value
      };
      if (dataStorage === null) {
        this.ServiceModuleService.setBookAddress([books]);
        this.contactForm.reset();
        this.sharedService.showSuccess("", `Successfully created user`);
        this.contacts = this.ServiceModuleService.getBooksAddress();
        return;
      }

      const issetData = dataStorage.find(
        (element: { label: any }) =>
          element.label === this.contactForm.get("user").value
      );
      if (issetData === undefined) {
        dataStorage.push(books);
        this.ServiceModuleService.setBookAddress(dataStorage);
        this.contactForm.reset();
        this.sharedService.showSuccess("", `Successfully created contact`);
        this.contacts = this.ServiceModuleService.getBooksAddress();
        return;
      }

      this.sharedService.showError(
        "User repeated",
        `The contact "${this.contactForm.get("user").value}" already exists`
      );
    }
  }


  /**
   * Send a transfer transaction
   *
   * @memberof TransferComponent
   */
  sendTransfer() {
    if (this.transferForm.invalid) {
      this.validateAllFormFields(this.transferForm);
      this.inputBlocked = false;
    } else if (!this.inputBlocked) {
      this.inputBlocked = true;
      let common = { password: this.transferForm.get("password").value };
      this.blockSendButton = true;
      if (this.walletService.decrypt(common)) {
        const buildTransferTransaction = this.transactionService.buildToSendTransfer(
          common,
          this.transferForm.get("accountRecipient").value,
          this.transferForm.get("message").value === null ? "" : this.transferForm.get("message").value,
          this.transferForm.get("amount").value,
          this.walletService.network,
          this.transferForm.get("mosaicsSelect").value
        );

        this.dataBridge.setTransactionStatus(null);
        this.transactionSigned = buildTransferTransaction.signedTransaction;
        buildTransferTransaction.transactionHttp.announce(buildTransferTransaction.signedTransaction).subscribe(
          async () => {
            this.showContacts = false;
            this.inputBlocked = false;
            this.cleanForm();
            this.getTransactionStatus();
          }, err => {
            this.inputBlocked = false;
            this.cleanForm();
            this.sharedService.showError('', err);
          }
        );
      } else {
        this.inputBlocked = false;
      }
    }
  }

  /**
   *
   *
   * @memberof TransferComponent
   */
  subscribeControls() {
    // Account Recipient
    this.transferForm.get('accountRecipient').valueChanges.subscribe(
      value => {
        if (value !== null && value !== undefined && value.length >= 40 && value.length <= 46) {
          if (!this.proximaxProvider.verifyNetworkAddressEquals(this.walletService.address.plain(), value)) {
            this.msgErrorUnsupported = 'Recipient Address Network unsupported';
          } else {
            this.msgErrorUnsupported = '';
          }
        } else {
          this.msgErrorUnsupported = '';
        }
      }
    );

    // Mosaic Select
    this.transferForm.get('mosaicsSelect').valueChanges.subscribe(
      value => {
        this.titleLabelAmount = (typeof (value) === 'string' && value === this.proximaxProvider.mosaicXpx.mosaicId) ? 'Amount' : 'Quantity';
        if (value !== null && value !== undefined) {
          const mosaic = this.mosaicServices.filterMosaic(new MosaicId(value));
          const a = Number(this.transferForm.get('amount').value);
          this.amountSend = (mosaic !== null) ? this.transactionService.amountFormatter(a, mosaic.mosaicInfo) : a;
          this.validateAmountToTransfer(a, mosaic)
        } else {
          this.amountSend = 0;
        }
      }
    );

    // Amount
    this.transferForm.get('amount').valueChanges.subscribe(
      value => {
        if (value !== null && value !== undefined && value < 0) {
          this.transferForm.get('amount').patchValue(0);
          return;
        } else {
          if (this.transferForm.get('mosaicsSelect').value !== null && this.transferForm.get('mosaicsSelect').value !== undefined) {
            const mosaic = this.mosaicServices.filterMosaic(new MosaicId(this.transferForm.get('mosaicsSelect').value));
            const a = Number(this.transferForm.get('amount').value);
            this.amountSend = (mosaic !== null) ? this.transactionService.amountFormatter(a, mosaic.mosaicInfo) : a;
            this.validateAmountToTransfer(a, mosaic)
          } else {
            this.amountSend = 0;
          }
        }
      }
    );

    // Contact
    this.transferForm.get('contact').valueChanges.subscribe(
      value => {
        this.contactSelected = '';
        if (value !== undefined && value !== null && value !== '') {
          this.contactSelected = value;
          this.transferForm.get("accountRecipient").patchValue(value);
        }
      }
    );
  }

  /**
   *
   *
   * @param {FormGroup} formGroup
   * @memberof TransferComponent
   */
  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  /**
   *
   *
   * @param {*} amount
   * @param {MosaicsStorage} mosaic
   * @returns
   * @memberof TransferComponent
   */
  validateAmountToTransfer(amount, mosaic: MosaicsStorage) {
    const accountInfo = this.walletService.getAccountInfo();
    if (accountInfo !== undefined && accountInfo !== null && Object.keys(accountInfo).length > 0) {
      const filtered = accountInfo.mosaics.find(element => {
        return element.id.toHex() === new MosaicId(mosaic.id).toHex();
      });
      const invalidBalance = filtered.amount.compact() < amount;
      if (invalidBalance && !this.insufficientBalance) {
        this.insufficientBalance = true;
        this.inputBlocked = true;
        this.transferForm.controls['contact'].disable();
        this.transferForm.controls['accountRecipient'].disable();
        this.transferForm.controls['message'].disable();
        this.transferForm.controls['password'].disable();
      } else if (!invalidBalance && this.insufficientBalance) {
        this.insufficientBalance = false;
        this.inputBlocked = false;
        this.transferForm.controls['mosaicsSelect'].enable();
        this.transferForm.controls['contact'].enable();
        this.transferForm.controls['accountRecipient'].enable();
        this.transferForm.controls['message'].enable();
        this.transferForm.controls['password'].enable();
      }
    }
  }
}
