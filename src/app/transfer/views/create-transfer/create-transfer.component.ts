import { Component, OnInit } from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl
} from "@angular/forms";
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { Router } from '@angular/router';
import { MosaicId, SignedTransaction, Address, UInt64, AccountInfo } from "tsjs-xpx-chain-sdk";
import { MosaicService, MosaicsStorage } from "../../../servicesModule/services/mosaic.service";
import { ProximaxProvider } from "../../../shared/services/proximax.provider";
import { DataBridgeService } from "../../../shared/services/data-bridge.service";
import { WalletService, AccountsInterface } from '../../../wallet/services/wallet.service';
import { SharedService, ConfigurationForm } from '../../../shared/services/shared.service';
import { TransactionsService, TransferInterface } from '../../services/transactions.service';
import { environment } from '../../../../environments/environment';
import { ServicesModuleService } from '../../../servicesModule/services/services-module.service';
import { AppConfig } from '../../../config/app.config';
import { first } from 'rxjs/operators';
import { Subscription } from 'rxjs';


@Component({
  selector: "app-create-transfer",
  templateUrl: "./create-transfer.component.html",
  styleUrls: ["./create-transfer.component.css"]
})
export class CreateTransferComponent implements OnInit {

  accounts: any = [];
  sender: AccountsInterface = null;
  allMosaics = [];
  balanceXpx = '0.000000';
  boxOtherMosaics = [];
  blockSendButton = false;
  blockButton: boolean = false;
  charRest: number;
  configurationForm: ConfigurationForm;
  currentBlock: number = 0;
  disabledBtnAddMosaic: boolean = false;
  errorOtherMosaics: boolean = false;
  formTransfer: FormGroup;
  incrementMosaics = 0;
  invalidRecipient = false;
  insufficientBalance = false;
  msgErrorUnsupported = '';
  msgErrorUnsupportedContact = '';
  mosaicXpx: { id: string, name: string; divisibility: number } = null;
  listContacts: any = [];
  optionsXPX = {
    prefix: '',
    thousands: ',',
    decimal: '.',
    precision: '6'
  };

  searching = true;
  selectOtherMosaics = [];
  showContacts = true;
  // subscribe = ['accountInfo', 'transactionStatus', 'char', 'block'];
  title = 'Make a transfer';
  transactionStatus: boolean = false;
  transactionSigned: SignedTransaction = null;
  subscription: Subscription[] = [];

  constructor(
    private dataBridge: DataBridgeService,
    private fb: FormBuilder,
    private mosaicServices: MosaicService,
    private proximaxProvider: ProximaxProvider,
    private serviceModuleService: ServicesModuleService,
    private sharedService: SharedService,
    private transactionService: TransactionsService,
    private walletService: WalletService,
    private router: Router
  ) { }

  /**
   *
   *
   * @memberof CreateTransferComponent
   */
  ngOnInit() {
    this.configurationForm = this.sharedService.configurationForm;
    this.createFormTransfer();
    this.subscribeValue();
    this.booksAddress();
    this.getAccountInfo();

    this.mosaicXpx = {
      id: environment.mosaicXpxInfo.id,
      name: environment.mosaicXpxInfo.name,
      divisibility: environment.mosaicXpxInfo.divisibility
    };

    this.walletService.currentWallet.accounts.forEach(element => {
      this.accounts.push({
        label: element.name,
        active: element.default,
        value: element
      });
    });

    //this.subscribe['block'] =
    this.subscription.push(this.dataBridge.getBlock().subscribe(next => {
      this.currentBlock = next;
    }));
  }

  /**
   *
   *
   * @memberof CreateTransferComponent
   */
  ngOnDestroy(): void {
    // console.log('----ngOnDestroy---');
    this.subscription.forEach(subscription => {
      // console.log(subscription);
      subscription.unsubscribe();
    });
  }


  /**
   *
   *
   * @param {*} cant
   * @param {string} [amount='0']
   * @returns
   * @memberof CreateTransferComponent
   */
  addZeros(cant: any, amount: string = '0') {
    let x = '0';
    if (amount === '0') {
      for (let index = 0; index < cant - 1; index++) {
        amount += x;
      }
    } else {
      for (let index = 0; index < cant; index++) {
        amount += x;
      }
    }
    return amount;
  }


  /**
   *
   *
   * @param {AccountsInterface} accountToSend
   * @memberof CreateTransferComponent
   */
  changeSender(accountToSend: AccountsInterface) {
    if (accountToSend) {
      // console.log(accountToSend);
      // this.ngxService.start(); // start foreground spinner of the master loader with 'default' taskId
      // this.ngOnDestroy();
      this.clearForm();
      this.reset();
      this.sender = accountToSend;
      this.accounts.forEach(element => {
        if (accountToSend.name === element.value.name) {
          element.active = true;
        } else {
          element.active = false;
        }
      });

      this.charRest = this.configurationForm.message.maxLength;
      this.listContacts = [];
      //this.subscribe['char'] =
      this.subscription.push(this.formTransfer.get('message').valueChanges.subscribe(val => {
        if (val) {
          this.charRest = this.configurationForm.message.maxLength - val.length;
        }
      }));

      // this.updateAccountInfo();
      // this.getMosaics(accountToSend);
      const accountFiltered = this.walletService.filterAccountInfo(this.sender.name);
      if (accountFiltered) {
        this.buildCurrentAccountInfo(accountFiltered.accountInfo);
      }
    }
  }

  /**
   *
   *
   * @param {string} position
   * @param {*} account
   * @memberof CreateTransferComponent
   */
  accountSelected(position: number, account: any) {
    const accounts = [];
    Object.keys(this.accounts).forEach(element => {
      if (element === String(position)) {
        this.accounts[position].active = true;
      } else {
        this.accounts[position].active = false;
      }

      accounts.push(this.accounts[position]);
    });

    this.accounts = accounts;
  }


  /**
   *
   *
   * @memberof CreateTransferComponent
   */
  /*async getMosaics(currentAccount: AccountsInterface = null) {
    // this.ngxService.start();
    this.disabledBtnAddMosaic = false;
    if (currentAccount && !currentAccount.default) {
      const accountInfo = await this.transactionService.getAccountInfo(this.proximaxProvider.createFromRawAddress(currentAccount.address));
      if (accountInfo) {
        this.checkBlock(accountInfo);
      } else {
        this.disabledBtnAddMosaic = true;
        // this.ngxService.stop();
        // this.router.navigate([`/${AppConfig.routes.dashboard}`]);
      }
    } else {
      this.subscribe['accountInfo'] = this.walletService.getAccountInfoAsync().subscribe(
        async accountInfo => {
          this.checkBlock(accountInfo);
        }, error => {
          this.disabledBtnAddMosaic = true;
          // this.ngxService.stop();
          // this.router.navigate([`/${AppConfig.routes.dashboard}`])
        }
      );
    }
  }*/


  /**
   *
   *
   * @param {AccountInfo} accountInfo
   * @memberof CreateTransferComponent
   */
  async buildCurrentAccountInfo(accountInfo: AccountInfo) {
    const mosaicsSelect: any = [];
    // console.log(accountInfo);
    if (accountInfo !== undefined && accountInfo !== null) {
      if (accountInfo.mosaics.length > 0) {
        const mosaics = await this.mosaicServices.searchMosaics(accountInfo.mosaics.map(n => n.id));
        if (mosaics.length > 0) {
          for (let mosaic of mosaics) {
            let configInput = {
              prefix: '',
              thousands: ',',
              decimal: '.',
              precision: '0'
            };

            const currentMosaic = accountInfo.mosaics.find(element => element.id.toHex() === this.proximaxProvider.getMosaicId(mosaic.id).toHex());
            let amount = '';
            let expired = false;
            let nameExpired = '';
            if ('mosaicInfo' in mosaic) {
              amount = this.transactionService.amountFormatter(currentMosaic.amount, mosaic.mosaicInfo);
              const durationMosaic = new UInt64([
                mosaic.mosaicInfo['properties']['duration']['lower'],
                mosaic.mosaicInfo['properties']['duration']['higher']
              ]);

              configInput.precision = mosaic.mosaicInfo['properties']['divisibility'];

              const createdBlock = new UInt64([
                mosaic.mosaicInfo.height.lower,
                mosaic.mosaicInfo.height.higher
              ]);

              if (durationMosaic.compact() > 0) {
                if (this.currentBlock >= durationMosaic.compact() + createdBlock.compact()) {
                  expired = true;
                  nameExpired = ' - Expired';
                }
              }
            } else {
              amount = this.transactionService.amountFormatterSimple(currentMosaic.amount.compact());
              nameExpired = ' - Expired';
              expired = true;
            }

            if (this.proximaxProvider.getMosaicId(mosaic.id).id.toHex() !== this.mosaicServices.mosaicXpx.mosaicId) {
              const nameMosaic = (mosaic.mosaicNames.names.length > 0) ? mosaic.mosaicNames.names[0] : this.proximaxProvider.getMosaicId(mosaic.id).toHex();
              mosaicsSelect.push({
                label: `${nameMosaic}${nameExpired}`,
                value: mosaic.id,
                balance: amount,
                expired: false,
                selected: false,
                disabled: expired,
                config: configInput
              });
            } else {
              this.balanceXpx = amount;
            }
          }

          this.allMosaics = mosaicsSelect;
          this.selectOtherMosaics = mosaicsSelect;
        }
      }
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
      contact: [''],
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

  /**
   *
   *
   * @param {number} position
   * @memberof CreateTransferComponent
   */
  deleteMoreMosaic(position: number) {
    const otherMosaics = [];
    Object.keys(this.boxOtherMosaics).forEach(element => {
      if (Number(element) !== position) {
        otherMosaics.push(this.boxOtherMosaics[Number(element)]);
      }
    });
    this.boxOtherMosaics = otherMosaics;
  }

  /**
   *
   *
   * @memberof CreateTransferComponent
   */
  getAccountInfo() {
    //this.subscribe['accountsInfo'] =
    this.subscription.push(this.walletService.getAccountsInfo$().subscribe(
      next => {
        // console.log(next);
        if (next && next.length > 1 && this.searching) {
          this.searching = false;
          this.changeSender(this.walletService.currentAccount);
        }
      }
    ));
  }


  /**
   *
   *
   * @memberof CreateTransferComponent
   */
  getTransactionStatus() {
    // Get transaction status
    //this.subscribe['transactionStatus'] =
    this.subscription.push(this.dataBridge.getTransactionStatus().subscribe(
      statusTransaction => {
        this.transactionStatus = true;
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
    ));
  }

  /**
   *
   *
   * @param {string} amount
   * @param {(string | [])} mosaicId
   * @param {number} position
   * @memberof CreateTransferComponent
   */
  modelChanged(amount: string, mosaicId: string | [], position: number) {
    if (amount !== null && amount !== undefined) {
      const mosaic = this.mosaicServices.filterMosaic(new MosaicId(mosaicId));
      const a = Number(amount);
      this.boxOtherMosaics[position].amountToBeSent = String((mosaic !== null) ? this.transactionService.amountFormatter(a, mosaic.mosaicInfo) : a);
      this.validateAmountToTransfer(amount, mosaic, position);
    } else {
      this.boxOtherMosaics[position].amountToBeSent = '0';
    }
  }

  /**
   *
   *
   * @param {Event} $event
   * @param {number} i
   * @memberof CreateTransferComponent
   */
  otherMosaicsChange(mosaicSelected: any, position: number) {
    if (mosaicSelected !== undefined) {
      this.boxOtherMosaics[position].amount = '';
      this.boxOtherMosaics[position].balance = mosaicSelected.balance;
      this.boxOtherMosaics[position].config = mosaicSelected.config;
      this.boxOtherMosaics[position].errorBalance = false;
      this.boxOtherMosaics[position].id = mosaicSelected.value;

      this.boxOtherMosaics.forEach(element => {
        const newMosaic = [];
        let otherMosaic = element.selectOtherMosaics.filter(elm => elm.label !== mosaicSelected.label);
        let currentMosaic = element.selectOtherMosaics.filter(elm => elm.label === mosaicSelected.label);
        currentMosaic.forEach(current => {
          current.disabled = true;
          newMosaic.push(current);
        });

        otherMosaic.forEach(others => {
          newMosaic.push(others);
        });

        newMosaic.forEach(element => {
          if (this.boxOtherMosaics[position].beforeValue !== '' && element.label === this.boxOtherMosaics[position].beforeValue) {
            element.disabled = false;
          }
        });

        element.selectOtherMosaics = newMosaic;
      });

      this.boxOtherMosaics[position].beforeValue = mosaicSelected.label;

    } else {
      this.boxOtherMosaics[position].id = '';
      this.boxOtherMosaics[position].balance = '';
      this.boxOtherMosaics[position].amount = '';
      this.boxOtherMosaics[position].errorBalance = false;
      this.boxOtherMosaics[position].amountToBeSent = 0;
    }
  }

  /**
   *
   *
   * @memberof CreateTransferComponent
   */
  pushedOtherMosaics() {
    if (this.selectOtherMosaics.length > 0) {
      if (this.boxOtherMosaics.length === 0) {
        this.boxOtherMosaics.push({
          id: '',
          balance: '',
          beforeValue: '',
          amount: '',
          errorBalance: false,
          amountToBeSent: 0,
          random: Math.floor(Math.random() * 1455654),
          selectOtherMosaics: this.selectOtherMosaics,
          config: null
        });
      } else {
        let x = false;
        this.boxOtherMosaics.forEach(element => {
          if (element.id === '' || element.amount === '' || Number(element.amount) === 0) {
            x = true;
          }
        });

        if (!x) {
          this.boxOtherMosaics.push({
            id: '',
            balance: '',
            amount: '',
            errorBalance: false,
            amountToBeSent: 0,
            random: Math.floor(Math.random() * 1455654),
            selectOtherMosaics: this.selectOtherMosaics,
            config: null
          });
        }
      }
    }
  }

  /**
   *
   *
   * @memberof CreateTransferComponent
   */
  reset() {
    this.allMosaics = [];
    this.balanceXpx = '0.000000';
    this.boxOtherMosaics = [];
    this.blockSendButton = false;
    this.blockButton = false;
    this.charRest = 0;
    this.disabledBtnAddMosaic = false;
    this.errorOtherMosaics = false;
    this.incrementMosaics = 0;
    this.invalidRecipient = false;
    this.insufficientBalance = false;
    this.msgErrorUnsupported = '';
    this.msgErrorUnsupportedContact = '';
    this.listContacts = [];
    this.optionsXPX = {
      prefix: '',
      thousands: ',',
      decimal: '.',
      precision: '6'
    };
    this.selectOtherMosaics = [];
    this.showContacts = false;
    // this.subscribe = ['accountsInfo', 'transactionStatus', 'char', 'block'];
    this.title = 'Make a transfer';
    this.transactionSigned = null;
  }

  /**
   *
   *
   * @memberof CreateTransferComponent
   */
  sendTransfer() {
    if (this.formTransfer.valid && (!this.blockSendButton || !this.errorOtherMosaics)) {
      const mosaicsToSend = this.validateMosaicsToSend();
      this.blockButton = true;
      this.blockSendButton = true;
      let common = { password: this.formTransfer.get("password").value };
      if (this.walletService.decrypt(common, this.sender)) {
        const params: TransferInterface = {
          common: common,
          recipient: this.formTransfer.get("accountRecipient").value,
          message: (this.formTransfer.get("message").value === null) ? "" : this.formTransfer.get("message").value,
          network: this.walletService.currentAccount.network,
          mosaic: mosaicsToSend
        };

        const transferBuilder = this.transactionService.buildTransferTransaction(params);
        this.transactionSigned = transferBuilder.signedTransaction;
        this.clearForm();
        transferBuilder.transactionHttp.announce(transferBuilder.signedTransaction).subscribe(
          async () => {
            this.blockButton = false;
            this.blockSendButton = false;
            if (!this.transactionStatus) {
              this.getTransactionStatus();
            }
          }, err => {
            this.blockButton = false;
            this.blockSendButton = false;
            this.clearForm();
            this.sharedService.showError('', err);
          }
        );
      } else {
        this.blockButton = false;
      }
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
  subscribeValue() {
    // Account recipient
    this.formTransfer.get('accountRecipient').valueChanges.subscribe(
      value => {
        const accountRecipient = (value !== undefined && value !== null && value !== '') ? value.split('-').join('') : '';
        const accountSelected = (this.formTransfer.get('contact').value) ? this.formTransfer.get('contact').value.split('-').join('') : '';
        if ((accountSelected !== '') && (accountSelected !== accountRecipient)) {
          this.formTransfer.get('contact').patchValue('');
        }

        if (accountRecipient !== null && accountRecipient !== undefined && accountRecipient.length === 40) {
          const currentAccount = Object.assign({}, this.walletService.getCurrentAccount());
          if (!this.proximaxProvider.verifyNetworkAddressEqualsNetwork(
            this.proximaxProvider.createFromRawAddress(currentAccount.address).plain(), accountRecipient)
          ) {
            this.blockSendButton = true;
            this.msgErrorUnsupported = 'Recipient Address Network unsupported';
          } else {
            this.blockSendButton = false;
            this.msgErrorUnsupported = '';
          }
        } else if (!this.formTransfer.get('accountRecipient').getError("required") && this.formTransfer.get('accountRecipient').valid) {
          this.blockSendButton = true;
          this.msgErrorUnsupported = 'Recipient Address Network unsupported';
        } else {
          this.blockSendButton = false;
          this.msgErrorUnsupported = '';
        }
      }
    );

    //Amount XPX
    // const mosaic = this.mosaicServices.filterMosaic(new MosaicId(this.mosaicXpx.id));
    this.formTransfer.get('amountXpx').valueChanges.subscribe(
      value => {
        // console.log('----VALUE INPUT XPX-------', value);
        if (value !== null && value !== undefined) {
          const a = Number(value);
          let validateAmount = false;
          const accountInfo = this.walletService.filterAccountInfo(this.sender.name).accountInfo;
          if (accountInfo !== undefined && accountInfo !== null && Object.keys(accountInfo).length > 0) {
            if (accountInfo.mosaics.length > 0) {
              const filtered = accountInfo.mosaics.find(element => {
                return element.id.toHex() === new MosaicId(environment.mosaicXpxInfo.id).toHex();
              });

              let arrAmount = value.toString().replace(/,/g, "").split('.');
              let decimal;
              let realAmount;

              if (arrAmount.length < 2) {
                decimal = this.addZeros(environment.mosaicXpxInfo.divisibility);
              } else {
                let arrDecimals = arrAmount[1].split('');
                decimal = this.addZeros(environment.mosaicXpxInfo.divisibility - arrDecimals.length, arrAmount[1]);
              }

              realAmount = `${arrAmount[0]}${decimal}`

              if (filtered !== undefined && filtered !== null) {
                const invalidBalance = filtered.amount.compact() < Number(realAmount);
                if (invalidBalance && !this.insufficientBalance) {
                  this.insufficientBalance = true;
                  this.blockSendButton = true;
                } else if (!invalidBalance && this.insufficientBalance) {
                  this.insufficientBalance = false;
                  this.blockSendButton = false;
                }
              } else {
                validateAmount = true;
              }
            } else {
              validateAmount = true;
            }
          } else {
            validateAmount = true;
          }

          if (validateAmount) {
            if (Number(value) >= 1) {
              this.insufficientBalance = true;
              this.blockSendButton = true;
            } else if ((Number(value) === 0 || value === '') && this.insufficientBalance) {
              this.insufficientBalance = false;
            }
          }
        }
      }
    );
  }


  /**
   *
   *
   * @param {*} amount
   * @param {MosaicsStorage} mosaic
   * @memberof CreateTransferComponent
   */
  validateAmountToTransfer(amount: string, mosaic: MosaicsStorage, position: number) {
    let validateAmount = false;
    const accountInfo = this.walletService.filterAccountInfo(this.sender.name);
    if (accountInfo !== undefined && accountInfo !== null && Object.keys(accountInfo).length > 0) {
      if (accountInfo.accountInfo.mosaics.length > 0) {
        const filtered = accountInfo.accountInfo.mosaics.find(element => {
          return element.id.toHex() === new MosaicId(mosaic.id).toHex();
        });

        if (filtered !== undefined && filtered !== null) {
          let arrAmount = amount.toString().replace(/,/g, "").split('.');
          let decimal;
          let realAmount;

          if (mosaic.mosaicInfo['properties'].divisibility > 0) {
            if (arrAmount.length < 2) {
              decimal = this.addZeros(mosaic.mosaicInfo['properties'].divisibility);
            } else {
              let arrDecimals = arrAmount[1].split('');
              decimal = this.addZeros(mosaic.mosaicInfo['properties'].divisibility - arrDecimals.length, arrAmount[1]);
            }

            realAmount = `${arrAmount[0]}${decimal}`
          } else {
            realAmount = arrAmount[0]
          }

          const invalidBalance = Number(realAmount) > filtered.amount.compact();
          if (invalidBalance && !this.boxOtherMosaics[position].errorBalance) {
            this.boxOtherMosaics[position].errorBalance = true;
            this.errorOtherMosaics = true;
          } else if (!invalidBalance && this.boxOtherMosaics[position].errorBalance) {
            this.boxOtherMosaics[position].errorBalance = false;
            this.errorOtherMosaics = false;
          }
        } else {
          validateAmount = true;
        }
      } else {
        validateAmount = true;
      }
    } else {
      validateAmount = true;
    }

    if (validateAmount) {
      if (Number(amount) >= 0) {
        this.boxOtherMosaics[position].errorBalance = true;
        this.errorOtherMosaics = true;
      } else if ((Number(amount) === 0 || amount === '') && this.boxOtherMosaics[position].errorBalance) {
        this.boxOtherMosaics[position].errorBalance = false;
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

    if (amountXpx !== '' && amountXpx !== null) {
      // console.log(amountXpx);
      let arrAmount = amountXpx.toString().replace(/,/g, "").split('.');
      let decimal;
      let realAmount;

      if (arrAmount.length < 2) {
        decimal = this.addZeros(environment.mosaicXpxInfo.divisibility);
      } else {
        let arrDecimals = arrAmount[1].split('');
        decimal = this.addZeros(environment.mosaicXpxInfo.divisibility - arrDecimals.length, arrAmount[1]);
      }
      realAmount = `${arrAmount[0]}${decimal}`
      mosaics.push({
        id: this.mosaicXpx.id,
        amount: realAmount
      });
    }

    this.boxOtherMosaics.forEach(element => {
      if (element.id !== '' && element.amount !== '') {
        let arrAmount = element.amount.toString().replace(/,/g, "").split('.');
        let decimal;
        let realAmount;

        if (element.config.precision != undefined && element.config.precision != null && element.config.precision > 0) {
          if (arrAmount.length < 2) {
            decimal = this.addZeros(element.config.precision);
          } else {
            let arrDecimals = arrAmount[1].split('');
            decimal = this.addZeros(element.config.precision - arrDecimals.length, arrAmount[1]);
          }

          realAmount = `${arrAmount[0]}${decimal}`
        } else {
          realAmount = arrAmount[0]
        }
        mosaics.push({
          id: element.id,
          amount: realAmount
        });
      }
    });

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
