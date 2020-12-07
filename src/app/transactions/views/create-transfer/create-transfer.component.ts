import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl
} from '@angular/forms';
import {
  MosaicId,
  SignedTransaction,
  UInt64,
  AccountInfo,
  Deadline,
  Mosaic,
  Account,
  TransactionHttp,
  PlainMessage,
  EncryptedMessage,
  TransferTransaction
} from 'tsjs-xpx-chain-sdk';
import { Subscription } from 'rxjs';
import { ModalDirective } from 'ng-uikit-pro-standard';
import * as FeeCalculationStrategy from 'tsjs-xpx-chain-sdk/dist/src/model/transaction/FeeCalculationStrategy';
import { MosaicService, MosaicsStorage } from '../../../servicesModule/services/mosaic.service';
import { ProximaxProvider } from '../../../shared/services/proximax.provider';
import { DataBridgeService } from '../../../shared/services/data-bridge.service';
import { WalletService, AccountsInterface, AccountsInfoInterface } from '../../../wallet/services/wallet.service';
import { SharedService, ConfigurationForm } from '../../../shared/services/shared.service';
import { TransactionsService, TransferInterface } from '../../services/transactions.service';
import { environment } from '../../../../environments/environment';
import { ServicesModuleService, HeaderServicesInterface } from '../../../servicesModule/services/services-module.service';
import { NodeService } from '../../../servicesModule/services/node.service';
import { AppConfig } from '../../../config/app.config';


@Component({
  selector: 'app-create-transfer',
  templateUrl: './create-transfer.component.html',
  styleUrls: ['./create-transfer.component.css']
})
export class CreateTransferComponent implements OnInit, OnDestroy {

  @ViewChild('basicModal', { static: true }) basicModal: ModalDirective;
  accounts: any = [];
  disabledAllField = false;
  sender: AccountsInterface = null;
  allMosaics = [];
  balanceXpx = '0.000000';
  boxOtherMosaics = [];
  blockSendButton = false;
  reloadBtn = false;
  charRest: number;
  cosignatorie: any = null;
  configurationForm: ConfigurationForm;
  currentBlock = 0;
  disabledBtnAddMosaic = false;
  errorOtherMosaics = false;
  formTransfer: FormGroup;
  passwordMain = 'password';
  saveContact: boolean;
  formContact = {
    name: '',
    address: ''
  };
  incrementMosaics = 0;
  invalidRecipient = false;
  insufficientBalance = false;
  msgLockfungCosignatorie = '';
  msgErrorUnsupported = '';
  msgErrorUnsupportedContact = '';
  mosaicXpx: { id: string, name: string; divisibility: number } = null;
  listContacts: any = [];
  listCosignatorie: any = [];
  fee: any = '0.037250';
  feeCosignatory: any = 10044500;
  goBack = `/${AppConfig.routes.service}`;
  optionsXPX = {
    prefix: '',
    thousands: ',',
    decimal: '.',
    precision: '6'
  };

  paramsHeader: HeaderServicesInterface = {
    moduleName: 'Transfer',
    componentName: 'Make a Transaction'
  };

  searching = true;
  selectOtherMosaics = [];
  showContacts = false;
  // subscribe = ['accountInfo', 'transactionStatus', 'char', 'block'];
  title = 'Make a Transaction';
  transactionHttp: TransactionHttp = null;
  transactionStatus = false;
  transactionSigned: SignedTransaction[] = [];
  transactionReady: SignedTransaction[] = [];
  subscription: Subscription[] = [];
  getBooksAddress: any;
  haveBalance = false;
  mosaicsToSend: any[];

  typeMessage = '1';
  recipientInfo = null;
  encryptedMsgDisable = true;
  messageWillBeEncrypted = false;
  messageMaxLength: number;

  constructor(
    private dataBridge: DataBridgeService,
    private fb: FormBuilder,
    private mosaicServices: MosaicService,
    private proximaxProvider: ProximaxProvider,
    private serviceModuleService: ServicesModuleService,
    private sharedService: SharedService,
    private transactionService: TransactionsService,
    private walletService: WalletService,
    private nodeService: NodeService
  ) { }

  /**
   *
   *
   * @memberof CreateTransferComponent
   */
  ngOnInit() {
    this.configurationForm = this.sharedService.configurationForm;
    this.charRest = 0; // this.configurationForm.message.maxLength;
    this.createFormTransfer();
    this.subscribeValue();
    this.booksAddress();
    this.getAccountInfo();
    this.typeMessage = '1';
    this.messageMaxLength = this.configurationForm.message.maxLength;

    const amount = this.transactionService.getDataPart(this.amountFormatterSimple(this.feeCosignatory), 6);
    const formatterAmount = `<span class="fs-085rem">${amount.part1}</span><span class="fs-07rem">${amount.part2}</span>`;
    this.msgLockfungCosignatorie = `Cosignatory has sufficient balance (${formatterAmount} XPX) to cover LockFund Fee`;
    // update protocol
    this.transactionHttp = new TransactionHttp(this.sharedService.buildUrlBlockchain(`${this.nodeService.getNodeSelected()}`, this.sharedService.hrefProtocol()));

    // Mosaic by default
    this.mosaicXpx = {
      id: environment.mosaicXpxInfo.id,
      name: environment.mosaicXpxInfo.name,
      divisibility: environment.mosaicXpxInfo.divisibility
    };

    // Build the accounts with which I will transfer
    this.walletService.currentWallet.accounts.forEach((element: AccountsInterface) => {
      this.accounts.push({
        label: element.name,
        active: element.default,
        value: element
      });

      if (element.default) {
        this.findCosignatories(element);
      }
    });

    // Find Current Block
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
    this.subscription.forEach(subscription => {
      subscription.unsubscribe();
    });
  }

  /**
   *
   *
   * @param {string} amount
   * @param {(string | [])} mosaicId
   * @param {number} position
   * @memberof CreateTransferComponent
   */
  async amountOtherMosaicChanged(amount: string, mosaicId: string | [], position: number) {
    if (amount !== null && amount !== undefined) {
      const mosaic = await this.mosaicServices.filterMosaics([new MosaicId(mosaicId)]);
      const a = Number(amount);
      this.boxOtherMosaics[position].amountToBeSent = String((mosaic !== null) ? this.transactionService.amountFormatter(a, mosaic[0].mosaicInfo) : a);
      this.validateAmountToTransfer(amount, mosaic[0], position);
    } else {
      this.boxOtherMosaics[position].amountToBeSent = '0';
    }
  }

  /**
   * Build with mosaics
   *
   * @param {AccountInfo} accountInfo
   * @memberof CreateTransferComponent
   */
  async buildCurrentAccountInfo(accountInfo: AccountInfo) {
    const mosaicsSelect: any = [];
    if (accountInfo !== undefined && accountInfo !== null) {
      if (accountInfo.mosaics.length > 0) {
        const mosaics = await this.mosaicServices.filterMosaics(accountInfo.mosaics.map(n => n.id));
        // console.log('mosaics', mosaics);

        if (mosaics.length > 0) {
          for (const mosaic of mosaics) {
            const configInput = {
              prefix: '',
              thousands: ',',
              decimal: '.',
              precision: '0'
            };

            const currentMosaic = accountInfo.mosaics.find(element => element.id.toHex() === this.proximaxProvider.getMosaicId(mosaic.idMosaic).toHex());
            let amount = '';
            let expired = false;
            let nameExpired = '';
            // console.log(mosaic)
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
                // console.log(durationMosaic.compact());
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

            const x = this.proximaxProvider.getMosaicId(mosaic.idMosaic).id.toHex() !== environment.mosaicXpxInfo.id;
            if (x) {
              const nameMosaic = (mosaic.mosaicNames.names.length > 0) ? mosaic.mosaicNames.names[0].name : this.proximaxProvider.getMosaicId(mosaic.idMosaic).toHex();
              mosaicsSelect.push({
                label: `${nameMosaic}${nameExpired} > Balance: ${amount}`,
                value: mosaic.idMosaic,
                balance: amount,
                expired: false,
                selected: false,
                disabled: expired,
                config: configInput
              });
            } else {
              this.haveBalance = true;
              this.balanceXpx = amount;
            }
          }


          this.allMosaics = mosaicsSelect;
          this.selectOtherMosaics = mosaicsSelect;
          // console.log(this.allMosaics);
          // console.log(this.selectOtherMosaics);
        }
      }
    }

    return;
  }


  /**
  *
  *
  * @param {AccountsInterface} accountToSend
  * @memberof CreateTransferComponent
  */
  async changeSender(accountToSend: AccountsInterface) {
    if (accountToSend) {
      this.sender = accountToSend;
      this.findCosignatories(accountToSend);
      if (this.formTransfer.disabled && !this.disabledAllField) {
        this.formTransfer.enable();
      }

      this.clearForm();
      this.reset();
      this.accounts.forEach(element => {
        if (accountToSend.name === element.value.name) {
          element.active = true;
        } else {
          element.active = false;
        }
      });

      this.charRest = 0; // this.configurationForm.message.maxLength;
      const accountFiltered = this.walletService.filterAccountInfo(this.sender.name);
      if (accountFiltered) {
        await this.buildCurrentAccountInfo(accountFiltered.accountInfo);
      }

      if (!this.haveBalance) {
        this.insufficientBalance = true;
        this.formTransfer.controls['amountXpx'].disable();
      } else if (!this.disabledAllField) {
        this.insufficientBalance = false;
        this.formTransfer.controls['amountXpx'].enable();
      }
    }
  }

  /**
   *
   *
   * @param {*} recipient
   * @memberof CreateTransferComponent
   */
  async verifyRecipientInfo(recipient: string) {
    // console.log(recipient);
    const invalidPublicKey = '0000000000000000000000000000000000000000000000000000000000000000'
    const net = environment.typeNetwork.value;
    let address;

    address = this.proximaxProvider.createFromRawAddress(recipient);

    try {
      if ([null].includes(recipient) === false) {
        const accountInfo = await this.proximaxProvider.getAccountInfo(address).toPromise();
        if (accountInfo.publicKey === invalidPublicKey) {
          throw new Error(`The receiver's public key is not valid for sending encrypted messages`);
        }
        this.recipientInfo = accountInfo;
        this.encryptedMsgDisable = false;
        // console.log(this.recipientInfo, this.encryptedMsgDisable);
      }
    } catch (error) {
      console.warn(error);
      if (error.statusCode && error.statusCode === 404) {
        this.encryptedMsgDisable = true;
      } else if ([undefined, null].includes(error.statusCode) && typeof error === 'string') {
        this.sharedService.showError('', error);
        this.encryptedMsgDisable = true;
      }
    }
  }

  /**
   *
   *
   * @param {*} amount
   * @returns {string}
   * @memberof CreateTransferComponent
   */
  amountFormatterSimple(amount: any): string {
    this.calculateFee(this.formTransfer.get('message').value);
    return this.transactionService.amountFormatterSimple(amount);
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
    const x = '0';
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
   * @param signedTransaction
   */
  announceAggregateBonded(signedTransaction: SignedTransaction) { // change
    this.transactionHttp.announceAggregateBonded(signedTransaction).subscribe(
      async () => {
        this.transactionSigned.push(signedTransaction);
      },
      err => {
        this.sharedService.showError('', err);
      });
  }

  /**
   *
   *
   * @memberof CreateTransferComponent
   */
  booksAddress() {
    this.listContacts = this.serviceModuleService.getBooksAddressBuilder();
  }

  /**
   *
   *
   * @param {number} message
   * @memberof CreateTransferComponent
   */
  calculateFee(message: number) {
    this.mosaicsToSend = this.validateMosaicsToSend();
    const x = TransferTransaction.calculateSize(PlainMessage.create(this.formTransfer.get('message').value).size(), this.mosaicsToSend.length);
    const b = FeeCalculationStrategy.calculateFee(x);
    if (message > 0) {
      this.fee = this.transactionService.amountFormatterSimple(b.compact());
    } else if (message === 0 && this.mosaicsToSend.length === 0) {
      this.fee = '0.037250';
    } else {
      this.fee = this.transactionService.amountFormatterSimple(b.compact());
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
        Validators.minLength(this.configurationForm.address.minLength),
        Validators.maxLength(this.configurationForm.address.maxLength)
      ]],
      amountXpx: ['', [
        Validators.maxLength(this.configurationForm.amount.maxLength)
      ]],
      contact: [''],
      cosignatorie: [null],
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
   * @param {*} inputType
   * @memberof CreateTransferComponent
   */
  changeInputType(inputType: any) {
    const newType = this.sharedService.changeInputType(inputType);
    this.passwordMain = newType;
  }

  /**
   *
   *
   * @param {string} event
   * @memberof CreateTransferComponent
   */
  changeMessageType(event) {
    this.typeMessage = event
    // console.log(event, this.configurationForm);

    if (this.typeMessage === '1') {
      if (this.messageWillBeEncrypted === true) {
        this.messageMaxLength = this.configurationForm.encryptedMessage.maxLength
        this.formTransfer.get('message').setValue('')
      } else {
        this.messageMaxLength = this.configurationForm.message.maxLength
        this.formTransfer.get('message').setValue('')
      }
    } else if (this.typeMessage === '2') {
      this.messageMaxLength = this.configurationForm.message.maxLength
      this.formTransfer.get('message').setValue('')
    }
    let recipient = this.formTransfer.get("amountXpx").value
    // console.log(event, recipient);
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
      this.cosignatorie = null;
      if (formControl !== undefined) {
        this.charRest = 0;
        this.formTransfer.controls[formControl].get(custom).reset();
        this.fee = '0.037250';
        return;
      }

      this.charRest = 0;
      this.formTransfer.get(custom).reset();
      this.fee = '0.037250';
      return;
    }

    this.charRest = 0;
    this.formTransfer.reset();
    this.fee = '0.037250';
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
   * @param element
   */
  findCosignatories(element: AccountsInterface) {
    this.cosignatorie = null;
    this.listCosignatorie = [];
    this.disabledAllField = false;
    if (element.isMultisign && element.isMultisign.cosignatories && element.isMultisign.cosignatories.length > 0) {
      if (element.isMultisign.cosignatories.length === 1) {
        const address = this.proximaxProvider.createFromRawAddress(element.isMultisign.cosignatories[0].address['address']);
        const cosignatorieAccount: AccountsInterface = this.walletService.filterAccountWallet('', null, address.pretty());
        if (cosignatorieAccount) {
          const accountFiltered: AccountsInfoInterface = this.walletService.filterAccountInfo(cosignatorieAccount.name);
          const infValidate = this.transactionService.validateBalanceCosignatorie(accountFiltered, Number(this.feeCosignatory)).infValidate;
          this.cosignatorie = cosignatorieAccount;
          this.listCosignatorie = [{
            label: cosignatorieAccount.name,
            value: cosignatorieAccount,
            selected: true,
            disabled: infValidate[0].disabled,
            info: infValidate[0].info
          }];

        } else {
          this.disabledAllField = true;
          this.formTransfer.disable();
        }
        return;
      } else {
        const listCosignatorie = [];
        element.isMultisign.cosignatories.forEach(cosignatorie => {
          const address = this.proximaxProvider.createFromRawAddress(cosignatorie.address['address']);
          const cosignatorieAccount: AccountsInterface = this.walletService.filterAccountWallet('', null, address.pretty());
          if (cosignatorieAccount) {
            const accountFiltered: AccountsInfoInterface = this.walletService.filterAccountInfo(cosignatorieAccount.name);
            const infValidate = this.transactionService.validateBalanceCosignatorie(accountFiltered, Number(this.feeCosignatory)).infValidate;
            listCosignatorie.push({
              label: cosignatorieAccount.name,
              value: cosignatorieAccount,
              selected: true,
              disabled: infValidate[0].disabled,
              info: infValidate[0].info
            });
          }
        });

        if (listCosignatorie && listCosignatorie.length > 0) {
          this.listCosignatorie = listCosignatorie;
          if (listCosignatorie.length === 1) {
            this.cosignatorie = listCosignatorie[0].value;
          }
        } else {
          this.disabledAllField = true;
          this.formTransfer.disable();
        }

        return;
      }
    }
  }

  /**
   *
   *
   * @memberof CreateTransferComponent
   */
  getAccountInfo() {
    this.subscription.push(this.walletService.getAccountsInfo$().subscribe(
      next => {
        this.searching = false;
        this.changeSender(this.walletService.currentAccount);
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
    if (!this.subscription['transactionStatus']) {
      this.subscription['transactionStatus'] = this.dataBridge.getTransactionStatus().subscribe(
        statusTransaction => {
          if (statusTransaction !== null && statusTransaction !== undefined && this.transactionSigned !== null) {
            for (const element of this.transactionSigned) {
              const match = statusTransaction['hash'] === element.hash;
              if (match) {
                this.transactionReady.push(element);
              }

              if (statusTransaction['type'] === 'confirmed' && match) {
                this.reloadBtn = false;
                this.blockSendButton = false;
                this.transactionSigned = this.transactionSigned.filter(el => el.hash !== statusTransaction['hash']);
              } else if (statusTransaction['type'] === 'unconfirmed' && match) {
                this.reloadBtn = false;
                this.blockSendButton = false;
              } else if (statusTransaction['type'] === 'aggregateBondedAdded' && match) {
                this.reloadBtn = false;
                this.blockSendButton = false;
              } else if (statusTransaction['type'] === 'cosignatureSignedTransaction' && match) {
                this.reloadBtn = false;
                this.blockSendButton = false;
              } else if (statusTransaction['type'] === 'status' && match) {
                this.reloadBtn = false;
                this.blockSendButton = false;
                this.transactionSigned = this.transactionSigned.filter(el => el.hash !== statusTransaction['hash']);
              }
            }
          }
        }
      );
    }
  }

  /**
   *
   * @param signedTransactionHashLock
   * @param signedTransactionBonded
   */
  getTransactionStatusHashLock(signedTransactionHashLock: SignedTransaction, signedTransactionBonded: SignedTransaction) {
    // Get transaction status
    this.subscription['getTransactionStatushashLock'] = this.dataBridge.getTransactionStatus().subscribe(
      statusTransaction => {
        if (statusTransaction !== null && statusTransaction !== undefined && signedTransactionHashLock !== null) {
          const match = statusTransaction['hash'] === signedTransactionHashLock.hash;
          if (statusTransaction['type'] === 'confirmed' && match) {
            setTimeout(() => {
              this.announceAggregateBonded(signedTransactionBonded);
              signedTransactionHashLock = null;
            }, environment.delayBetweenLockFundABT);
          } else if (statusTransaction['type'] === 'unconfirmed' && match) {
          } else if (statusTransaction['type'] === 'status' && match) {
            this.reloadBtn = false;
            this.blockSendButton = false;
            this.transactionSigned = this.transactionSigned.filter(el => el.hash !== statusTransaction['hash']);
            signedTransactionHashLock = null;
          }
        }
      }
    );
  }

  /**
   *
   *
   * @param {*} quantity
   * @returns
   * @memberof CreateTransferComponent
   */
  getQuantity(quantity: string) {
    return this.sharedService.amountFormat(quantity);
  }


  /**
   *
   *
   * @param {Event} $event
   * @param {number} i
   * @memberof CreateTransferComponent
   */
  otherMosaicsChange(mosaicSelected: any, position: number) {
    // console.log('\n\n mosaicSelected ---> ', mosaicSelected);
    // console.log('\n\n this.boxOtherMosaics[position] ---> ', this.boxOtherMosaics[position]);
    if (mosaicSelected !== undefined) {
      if (this.boxOtherMosaics[position].beforeValue === '' || !this.boxOtherMosaics[position].beforeValue) {
        this.otherMosaicsBuild(mosaicSelected, position);
      } else {
        if (this.boxOtherMosaics[position].beforeValue !== '' && this.boxOtherMosaics[position].beforeValue === mosaicSelected.label) {
          const currentMosaic = this.boxOtherMosaics[position].selectOtherMosaics.find(elm => elm.label === mosaicSelected.label);
          const otherMosaics = this.boxOtherMosaics[position].selectOtherMosaics.filter(elm => elm.label !== mosaicSelected.label);
          currentMosaic.disabled = false;
          otherMosaics.push(currentMosaic);
          const i = this.boxOtherMosaics.indexOf(this.boxOtherMosaics[position]);
          if (i !== -1) {
            this.boxOtherMosaics.map(element => {
              return element.selectOtherMosaics = otherMosaics;
            });
            this.boxOtherMosaics.splice(i, 1);
          }
        } else {
          const currentMosaic = this.boxOtherMosaics[position].selectOtherMosaics.find(elm => elm.label === this.boxOtherMosaics[position].beforeValue);
          const otherMosaics = this.boxOtherMosaics[position].selectOtherMosaics.filter(elm => elm.label !== this.boxOtherMosaics[position].beforeValue);
          currentMosaic.disabled = false;
          otherMosaics.push(currentMosaic);
          this.boxOtherMosaics[position].selectOtherMosaics = otherMosaics;
          this.otherMosaicsBuild(mosaicSelected, position);
        }
      }
    } else {
      const i = this.boxOtherMosaics.indexOf(this.boxOtherMosaics[position]);
      if (i !== -1) {
        this.boxOtherMosaics.splice(i, 1);
      }
    }
  }

  /**
   *
   *
   * @param {*} mosaicSelected
   * @param {number} position
   * @memberof CreateTransferComponent
   */
  otherMosaicsBuild(mosaicSelected: any, position: number) {
    this.boxOtherMosaics[position].amount = '';
    this.boxOtherMosaics[position].balance = mosaicSelected.balance;
    this.boxOtherMosaics[position].config = mosaicSelected.config;
    this.boxOtherMosaics[position].errorBalance = false;
    this.boxOtherMosaics[position].id = mosaicSelected.value;
    this.boxOtherMosaics[position].beforeValue = mosaicSelected.label;
    const currentMosaic = this.boxOtherMosaics[position].selectOtherMosaics.find(elm => elm.label === mosaicSelected.label);
    const otherMosaics = this.boxOtherMosaics[position].selectOtherMosaics.filter(elm => elm.label !== mosaicSelected.label);
    currentMosaic.disabled = true;
    otherMosaics.push(currentMosaic);
    this.boxOtherMosaics.map(element => {
      return element.selectOtherMosaics = otherMosaics;
    });
  }

  /**
   *
   *
   * @memberof CreateTransferComponent
   */
  pushedOtherMosaics() {
    if (this.selectOtherMosaics.length > 0) {
      if (this.boxOtherMosaics.length === 0) {
        // console.log('VALIDA 1');
        // console.log('SELECT boxOtherMosaics ---> ', this.boxOtherMosaics);
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
        // console.log('SELECT boxOtherMosaics ---> ', this.boxOtherMosaics);
        this.boxOtherMosaics.forEach(element => {
          if (element.id === '') {
            // console.log('VALIDA 2');
            this.sharedService.showWarning('', 'You must select a mosaic and place the quantity');
            x = true;
          } else if (element.amount === '' || Number(element.amount) === 0) {
            // console.log('VALIDA 3');
            this.sharedService.showWarning('', 'The quantity of the selected mosaic must be greater than zero');
            x = true;
          }
        });

        if (!x) {
          // console.log('VALIDA 4');
          // console.log('this.selectOtherMosaics ---> ', this.selectOtherMosaics);
          // console.log('this.boxOtherMosaics ---> ', this.boxOtherMosaics);
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
    this.haveBalance = false;
    this.allMosaics = [];
    this.balanceXpx = '0.000000';
    this.boxOtherMosaics = [];
    this.blockSendButton = false;
    this.reloadBtn = false;
    this.charRest = this.configurationForm.message.maxLength;
    this.disabledBtnAddMosaic = false;
    this.errorOtherMosaics = false;
    this.incrementMosaics = 0;
    this.invalidRecipient = false;
    this.insufficientBalance = false;
    this.msgErrorUnsupported = '';
    this.msgErrorUnsupportedContact = '';
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
  }


  /**
   *
   *
   * @memberof CreateTransferComponent
   */
  saveContactFn() {
    this.getBooksAddress = this.serviceModuleService.getBooksAddress();
    if (this.getBooksAddress) {
      const contact = this.getBooksAddress.find(el => el.value === this.formTransfer.get('accountRecipient').value.split('-').join(''));
      if (!contact) {
        this.formContact.address = this.formTransfer.get('accountRecipient').value.split('-').join('');
        this.saveContact = false;
        this.basicModal.show();
      }
    } else {
      this.formContact.address = this.formTransfer.get('accountRecipient').value.split('-').join('');
      this.saveContact = false;
      this.basicModal.show();
    }
  }

  /**
   *
   *
   * @memberof CreateTransferComponent
   */
  sendTransfer() {
    if (this.formTransfer.valid && (!this.blockSendButton || !this.errorOtherMosaics)) {
      this.reloadBtn = true;
      this.blockSendButton = true;
      if (this.transactionService.validateBuildSelectAccountBalance(Number(this.balanceXpx.split(',').join('')), Number(this.fee), Number(this.formTransfer.get('amountXpx').value))) {
        const common = { password: this.formTransfer.get('password').value };
        const mosaicsToSend = this.validateMosaicsToSend();
        const type = (this.cosignatorie) ? true : false;
        switch (type) {
          case true:
            /*console.log('TRANSFIERE CON COSIGNATARIO');
            // console.log('ACCOUNT SENDER ----> ', this.sender);
            // console.log('COSIGNATARIO SELECCIONADO ----> ', this.cosignatorie);*/
            const generationHash = this.dataBridge.blockInfo.generationHash;
            if (this.walletService.decrypt(common, this.cosignatorie)) {
              // console.log(this.typeMessage, common);

              const params: TransferInterface = {
                common,
                recipient: (this.formTransfer.get('accountRecipient').value),
                message: this.verifyMessage(this.formTransfer.get('message').value, common['privateKey']),
                network: this.walletService.currentAccount.network,
                mosaic: mosaicsToSend
              };
              // console.log('True', params);

              const cosignatoryAccount = Account.createFromPrivateKey(params.common.privateKey, params.network);
              const recipientAddress = this.proximaxProvider.createFromRawAddress(params.recipient);
              const mosaics = params.mosaic;
              const allMosaics = [];
              mosaics.forEach((element: any) => {
                allMosaics.push(new Mosaic(
                  new MosaicId(element.id),
                  UInt64.fromUint(Number(element.amount))
                )
                );
              });

              const transferBuilder = TransferTransaction.create(
                Deadline.create(environment.deadlineTransfer.deadline, environment.deadlineTransfer.chronoUnit),
                recipientAddress,
                allMosaics,
                params.message,
                params.network
              );

              const innerTxn = [{
                signer: this.sender.publicAccount,
                tx: transferBuilder
              }];

              const aggregateSigned = this.transactionService.buildAggregateTransaction(cosignatoryAccount, innerTxn, generationHash);
              const hashLockSigned = this.transactionService.buildHashLockTransaction(aggregateSigned, cosignatoryAccount, generationHash);
              this.saveContactFn();
              this.clearForm();

              this.transactionService.buildTransactionHttp().announce(hashLockSigned).subscribe(async () => {
                this.getTransactionStatusHashLock(hashLockSigned, aggregateSigned);
              }, err => { });
            } else {
              this.formTransfer.get('password').setValue('');
              this.blockSendButton = false;
              this.reloadBtn = false;
            }

            break;
          case false:
            if (this.walletService.decrypt(common, this.sender)) {
              // console.log(this.typeMessage, common);

              const params: TransferInterface = {
                common,
                recipient: (this.formTransfer.get('accountRecipient').value),
                message: this.verifyMessage(this.formTransfer.get('message').value, common['privateKey']),
                network: this.walletService.currentAccount.network,
                mosaic: mosaicsToSend
              };

              // console.log('False', params);

              const transferBuilder = this.transactionService.buildTransferTransaction(params);

              this.transactionSigned.push(transferBuilder.signedTransaction);
              this.saveContactFn();
              this.clearForm();
              this.transactionService.buildTransactionHttp().announce(transferBuilder.signedTransaction).subscribe(
                async () => {
                  /*this.reloadBtn = false;
                  this.blockSendButton = false;*/
                  this.getTransactionStatus();
                  this.dataBridge.setTimeOutValidateTransaction(transferBuilder.signedTransaction.hash);
                }, err => {
                  this.reloadBtn = false;
                  this.blockSendButton = false;
                  this.sharedService.showError('', err);
                }
              );
            } else {
              this.formTransfer.get('password').setValue('');
              this.blockSendButton = false;
              this.reloadBtn = false;
            }
            break;
        }
      } else {
        this.reloadBtn = false;
        this.blockSendButton = false;
        this.sharedService.showError('', 'Insufficient Balance');
      }
    }
  }



  /**
   *
   *
   * @param {*} $event
   * @memberof CreateTransferComponent
   */
  selectCosignatorie($event: any) {
    if ($event) {
      this.cosignatorie = $event.value;
    } else {
      this.cosignatorie = null;
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

    this.verifyRecipientInfo(this.formTransfer.get('accountRecipient').value);
    this.formTransfer.get('message').setValue('');
    this.typeMessage = '1';
    this.messageWillBeEncrypted = false;
  }

  /**
   *
   *
   * @memberof CreateTransferComponent
   */
  subscribeValue() {
    this.formTransfer.get('accountRecipient').valueChanges.subscribe(value => {
      let valueWithoutSpaces = '';
      if (value) {
        valueWithoutSpaces = value.trim();
      }

      const accountRecipient = (valueWithoutSpaces !== undefined && valueWithoutSpaces !== null && valueWithoutSpaces !== '') ? valueWithoutSpaces.split('-').join('') : '';
      //  const accountSelected = (value) ? value.split('-').join('') : '';
      const contact = this.formTransfer.get('contact').value;
      const accountSelected = (contact !== undefined && contact !== null && contact !== '') ? contact.value.split('-').join('') : '';
      if ((accountSelected !== '') && (accountSelected !== accountRecipient)) {
        this.formTransfer.get('contact').patchValue('');
      }
      if (accountRecipient !== null && accountRecipient !== undefined && accountRecipient.length === 40) {
        const currentAccount = Object.assign({}, this.walletService.getCurrentAccount());
        if (!this.proximaxProvider.verifyNetworkAddressEqualsNetwork(
          this.proximaxProvider.createFromRawAddress(currentAccount.address).plain(), accountRecipient)
        ) {
          if (valueWithoutSpaces !== value) {
            this.formTransfer.get('accountRecipient').setValue(valueWithoutSpaces);
          }
          this.blockSendButton = true;
          this.msgErrorUnsupported = 'Recipient Address Network unsupported';
        } else {
          this.blockSendButton = false;
          this.msgErrorUnsupported = '';
        }
      } else if (!this.formTransfer.get('accountRecipient').getError('required') && this.formTransfer.get('accountRecipient').valid) {
        this.blockSendButton = true;
        this.msgErrorUnsupported = 'Recipient Address Network unsupported';
      } else {
        if (valueWithoutSpaces !== value) {
          this.formTransfer.get('accountRecipient').setValue(valueWithoutSpaces);
        }
        this.blockSendButton = false;
        this.msgErrorUnsupported = '';
      }
    });

    this.subscription.push(this.formTransfer.get('message').valueChanges.subscribe(val => {
      if (val && val !== '') {
        this.charRest = val.length;
        this.calculateFee(val.length);
      } else {
        this.charRest = 0;
        this.calculateFee(0);
      }


      if (val && val !== null) {
        if (this.typeMessage === '1') {
          if (this.messageWillBeEncrypted === true) {
            let REGEX = /[^a-zA-Z0-9 ]\s*/;
            if (val.search(REGEX) > -1) {
              let subStr = val.replace(REGEX, '');
              this.formTransfer.get('message').setValue(subStr);
            }
          }
        } else if (this.typeMessage === '2') {
          let REGEX = /[^A-Fa-f0-9]/g;
          if (val.search(REGEX) > -1) {
            let subStr = val.replace(REGEX, '');
            this.formTransfer.get('message').setValue(subStr);
          }
        }
      }
    }));

    this.formTransfer.get('amountXpx').valueChanges.subscribe(value => {
      if (value !== null && value !== undefined) {
        const a = Number(value);
        let validateAmount = false;
        if (this.sender) {
          const accountInfo = this.walletService.filterAccountInfo(this.sender.name);
          // console.log('Account INfo- ---->', accountInfo);
          if (accountInfo !== undefined && accountInfo !== null && Object.keys(accountInfo).length > 0) {
            if (accountInfo.accountInfo.mosaics.length > 0) {
              const filtered = accountInfo.accountInfo.mosaics.find(element => {
                return element.id.toHex() === new MosaicId(environment.mosaicXpxInfo.id).toHex();
              });

              const arrAmount = value.toString().replace(/,/g, '').split('.');
              let decimal;
              let realAmount;

              if (arrAmount.length < 2) {
                decimal = this.addZeros(environment.mosaicXpxInfo.divisibility);
              } else {
                const arrDecimals = arrAmount[1].split('');
                decimal = this.addZeros(environment.mosaicXpxInfo.divisibility - arrDecimals.length, arrAmount[1]);
              }

              realAmount = `${arrAmount[0]}${decimal}`;
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
        }

        if (validateAmount) {
          if (Number(value) > 0) {
            this.insufficientBalance = true;
            this.blockSendButton = true;
          } else if ((Number(value) === 0 || value === '') && this.insufficientBalance) {
            this.insufficientBalance = false;
          }
        }
      }

      this.calculateFee(this.formTransfer.get('message').value);
    });
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
          return element.id.toHex() === new MosaicId(mosaic.idMosaic).toHex();
        });

        if (filtered !== undefined && filtered !== null) {
          const arrAmount = amount.toString().replace(/,/g, '').split('.');
          let decimal;
          let realAmount;

          if (mosaic.mosaicInfo['properties'].divisibility > 0) {
            if (arrAmount.length < 2) {
              decimal = this.addZeros(mosaic.mosaicInfo['properties'].divisibility);
            } else {
              const arrDecimals = arrAmount[1].split('');
              decimal = this.addZeros(mosaic.mosaicInfo['properties'].divisibility - arrDecimals.length, arrAmount[1]);
            }

            realAmount = `${arrAmount[0]}${decimal}`;
          } else {
            realAmount = arrAmount[0];
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
    const amountXpx = this.formTransfer.get('amountXpx').value;

    if (amountXpx !== '' && amountXpx !== null && Number(amountXpx) !== 0) {
      // console.log(amountXpx);
      const arrAmount = amountXpx.toString().replace(/,/g, '').split('.');
      let decimal;
      let realAmount;

      if (arrAmount.length < 2) {
        decimal = this.addZeros(environment.mosaicXpxInfo.divisibility);
      } else {
        const arrDecimals = arrAmount[1].split('');
        decimal = this.addZeros(environment.mosaicXpxInfo.divisibility - arrDecimals.length, arrAmount[1]);
      }
      realAmount = `${arrAmount[0]}${decimal}`;
      mosaics.push({
        id: this.mosaicXpx.id,
        amount: realAmount
      });
    }

    this.boxOtherMosaics.forEach(element => {
      if (element.id !== '' && element.amount !== '' && Number(element.amount) !== 0) {
        const arrAmount = element.amount.toString().replace(/,/g, '').split('.');
        let decimal;
        let realAmount;

        if (element.config.precision != undefined && element.config.precision != null && element.config.precision > 0) {
          if (arrAmount.length < 2) {
            decimal = this.addZeros(element.config.precision);
          } else {
            const arrDecimals = arrAmount[1].split('');
            decimal = this.addZeros(element.config.precision - arrDecimals.length, arrAmount[1]);
          }

          realAmount = `${arrAmount[0]}${decimal}`;
        } else {
          realAmount = arrAmount[0];
        }
        mosaics.push({
          id: element.id,
          amount: realAmount
        });
      }
    });

    // console.log(mosaics);

    return mosaics;
  }

  /**
   *
   *
   * @param {string} message
   * @param {*} senderPrivateKey
   * @returns
   * @memberof CreateTransferComponent
   */
  verifyMessage(message: string, senderPrivateKey: any) {
    let result;
    if (message !== null && message !== '') {
      switch (this.typeMessage) {
        case '1':

          if (this.messageWillBeEncrypted === true) {
            result = EncryptedMessage.create(message, this.recipientInfo.publicAccount, senderPrivateKey);
          } else {
            result = PlainMessage.create(message);
          }
          // console.log('Plain Message', result);
          break;

        case '2':
          result = PlainMessage.create(message);
          // console.log('Hex Message', result);
          break;
      }
    } else {
      result = PlainMessage.create('');
    }

    // console.log(result);
    return result;
  }

  /**
   *
   *
   * @memberof CreateTransferComponent
   */
  getValueAndVerify() {
    const recipientValue = (this.formTransfer.get('accountRecipient').value.includes('-')) ?
      this.formTransfer.get('accountRecipient').value.split('-').join('') :
      this.formTransfer.get('accountRecipient').value;

    if (recipientValue.length === 40 || recipientValue.length === 46) {
      this.verifyRecipientInfo(recipientValue);
    }
  }

  /**
   * Save contact
   *
   * @returns
   * @memberof CreateTransferComponent
   */
  saveContactNew() {
    const books = { value: this.formContact.address, label: this.formContact.name };
    if (!this.getBooksAddress) {
      this.serviceModuleService.setBookAddress([books], '');
      this.formContact = { name: '', address: '' };
      this.booksAddress();
      this.basicModal.hide();
      this.sharedService.showSuccess('', `Contact Successfully Saved`);
      return;
    }

    const issetData = this.getBooksAddress.find(element => element.label === this.formContact.name);
    if (issetData === undefined) {
      this.getBooksAddress.push(books);
      this.serviceModuleService.setBookAddress(this.getBooksAddress, '');
      this.formContact = { name: '', address: '' };
      this.booksAddress();
      this.basicModal.hide();
      this.sharedService.showSuccess('', `Contact Successfully Saved`);
      return;
    }

    this.sharedService.showError('User repeated', `The contact "${this.formContact.name}" already exists`);
  }

  setMessageToEncrypted() {
    // console.log(this.messageWillBeEncrypted);
    if (this.messageWillBeEncrypted === true) {
      this.messageMaxLength = this.configurationForm.encryptedMessage.maxLength
    } else {
      this.messageMaxLength = this.configurationForm.message.maxLength
    }
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
