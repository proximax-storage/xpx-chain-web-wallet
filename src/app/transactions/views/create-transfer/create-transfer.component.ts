import { Component, OnInit, ViewChild } from "@angular/core";
import {
  FormGroup,
  FormBuilder,
  Validators,
  AbstractControl
} from "@angular/forms";
import { Router } from '@angular/router';
import { MosaicId, SignedTransaction, UInt64, AccountInfo, HashLockTransaction, Deadline, Mosaic, AggregateTransaction, Account, TransactionHttp, LockFundsTransaction, TransferTransaction, PlainMessage } from "tsjs-xpx-chain-sdk";
import { MosaicService, MosaicsStorage } from "../../../servicesModule/services/mosaic.service";
import { ProximaxProvider } from "../../../shared/services/proximax.provider";
import { DataBridgeService } from "../../../shared/services/data-bridge.service";
import { WalletService, AccountsInterface } from '../../../wallet/services/wallet.service';
import { SharedService, ConfigurationForm } from '../../../shared/services/shared.service';
import { TransactionsService, TransferInterface } from '../../services/transactions.service';
import { environment } from '../../../../environments/environment';
import { ServicesModuleService } from '../../../servicesModule/services/services-module.service';
import { Subscription } from 'rxjs';
import { ModalDirective } from 'ng-uikit-pro-standard';
import { NodeService } from 'src/app/servicesModule/services/node.service';
import * as FeeCalculationStrategy from 'tsjs-xpx-chain-sdk/dist/src/model/transaction/FeeCalculationStrategy';


@Component({
  selector: "app-create-transfer",
  templateUrl: "./create-transfer.component.html",
  styleUrls: ["./create-transfer.component.css"]
})
export class CreateTransferComponent implements OnInit {

  @ViewChild('basicModal', { static: true }) basicModal: ModalDirective;
  accounts: any = [];
  disabledAllField = false;
  sender: AccountsInterface = null;
  allMosaics = [];
  balanceXpx = '0.000000';
  boxOtherMosaics = [];
  blockSendButton = false;
  blockButton: boolean = false;
  charRest: number;
  cosignatorie: any = null;
  configurationForm: ConfigurationForm;
  currentBlock: number = 0;
  disabledBtnAddMosaic: boolean = false;
  errorOtherMosaics: boolean = false;
  formTransfer: FormGroup;
  saveContact: boolean;
  formContact = {
    name: '',
    address: ''
  };
  incrementMosaics = 0;
  invalidRecipient = false;
  insufficientBalance = false;
  msgErrorUnsupported = '';
  msgErrorUnsupportedContact = '';
  mosaicXpx: { id: string, name: string; divisibility: number } = null;
  listContacts: any = [];
  listCosignatorie: any = [];
  fee: any = '0.037250'
  optionsXPX = {
    prefix: '',
    thousands: ',',
    decimal: '.',
    precision: '6'
  };

  searching = true;
  selectOtherMosaics = [];
  showContacts = false;
  // subscribe = ['accountInfo', 'transactionStatus', 'char', 'block'];
  title = 'Make a Transfer';
  transactionHttp: TransactionHttp = null;
  transactionStatus: boolean = false;
  transactionSigned: SignedTransaction[] = [];
  transactionReady: SignedTransaction[] = [];
  subscription: Subscription[] = [];
  getBooksAddress: any;
  haveBalance = false;
  mosaicsToSend: any[];

  constructor(
    private dataBridge: DataBridgeService,
    private fb: FormBuilder,
    private mosaicServices: MosaicService,
    private proximaxProvider: ProximaxProvider,
    private serviceModuleService: ServicesModuleService,
    private sharedService: SharedService,
    private transactionService: TransactionsService,
    private walletService: WalletService,
    private nodeService: NodeService,
    private router: Router
  ) { }

  /**
   *
   *
   * @memberof CreateTransferComponent
   */
  ngOnInit() {
    this.configurationForm = this.sharedService.configurationForm;
    this.charRest = this.configurationForm.message.maxLength;
    this.createFormTransfer();
    this.subscribeValue();
    this.booksAddress();
    this.getAccountInfo();
    //this.getTransactionStatus();
    this.transactionHttp = new TransactionHttp(environment.protocol + "://" + `${this.nodeService.getNodeSelected()}`); //change

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
        if (mosaics.length > 0) {
          for (let mosaic of mosaics) {
            let configInput = {
              prefix: '',
              thousands: ',',
              decimal: '.',
              precision: '0'
            };

            const currentMosaic = accountInfo.mosaics.find(element => element.id.toHex() === this.proximaxProvider.getMosaicId(mosaic.idMosaic).toHex());
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

            const x = this.proximaxProvider.getMosaicId(mosaic.idMosaic).id.toHex() !== environment.mosaicXpxInfo.id;
            if (x) {
              const nameMosaic = (mosaic.mosaicNames.names.length > 0) ? mosaic.mosaicNames.names[0].name : this.proximaxProvider.getMosaicId(mosaic.idMosaic).toHex();
              mosaicsSelect.push({
                label: `${nameMosaic}${nameExpired}`,
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

      this.charRest = this.configurationForm.message.maxLength;
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
  announceAggregateBonded(signedTransaction: SignedTransaction) { //change
    this.transactionHttp.announceAggregateBonded(signedTransaction).subscribe(
      async () => {
        this.transactionSigned.push(signedTransaction)
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
   * @param {(string | (string | number)[])} [custom]
   * @param {(string | number)} [formControl]
   * @returns
   * @memberof CreateTransferComponent
   */
  clearForm(custom?: string | (string | number)[], formControl?: string | number) {
    if (custom !== undefined) {
      if (formControl !== undefined) {
        this.formTransfer.controls[formControl].get(custom).reset();
        this.fee = '0.037250'
        return;
      }

      this.formTransfer.get(custom).reset();
      this.fee = '0.037250'
      return;
    }

    this.formTransfer.reset();
    this.fee = '0.037250'
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
          this.cosignatorie = cosignatorieAccount;
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
            listCosignatorie.push({
              label: cosignatorieAccount.name,
              value: cosignatorieAccount,
              selected: true
            });
          }
        });

        if (listCosignatorie.length === 1) {
          this.cosignatorie = listCosignatorie[0].value;
          return;
        }

        if (listCosignatorie && listCosignatorie.length > 0) {
          this.listCosignatorie = listCosignatorie;
        } else {
          this.disabledAllField = true;
          this.formTransfer.disable();
        }

        return;
      }
    }
    // }
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
        // if (next && next.length > 0) {
        this.searching = false;
        this.changeSender(this.walletService.currentAccount);
        // }
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
          // console.log('statusTransaction', statusTransaction);
          if (statusTransaction !== null && statusTransaction !== undefined && this.transactionSigned !== null) {
            for (let element of this.transactionSigned) {
              const match = statusTransaction['hash'] === element.hash;
              if (match) {
                this.transactionReady.push(element);
              }

              if (statusTransaction['type'] === 'confirmed' && match) {
                this.transactionSigned = this.transactionSigned.filter(el => el.hash !== statusTransaction['hash']);
                this.sharedService.showSuccess('', 'Transaction confirmed');
              } else if (statusTransaction['type'] === 'unconfirmed' && match) {
                this.sharedService.showInfo('', 'Transaction unconfirmed');
              } else if (statusTransaction['type'] === 'aggregateBondedAdded' && match) {
                this.sharedService.showInfo('', 'Transaction aggregate bonded added');
              } else if (statusTransaction['type'] === 'cosignatureSignedTransaction' && match) {
                this.sharedService.showInfo('', 'Transaction cosignature signed');
              } else if (statusTransaction['type'] === 'error' && match) {
                this.transactionSigned = this.transactionSigned.filter(el => el.hash !== statusTransaction['hash']);
                // this.sharedService.showWarning('', statusTransaction['data'].status.split('_').join(' '));
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
          // const statusTransactionHash = (statusTransaction['type'] === 'error') ? statusTransaction['data'].hash : statusTransaction['data'].transactionInfo.hash;
          const match = statusTransaction['hash'] === signedTransactionHashLock.hash;
          if (statusTransaction['type'] === 'confirmed' && match) {
            this.announceAggregateBonded(signedTransactionBonded)
            signedTransactionHashLock = null;
            this.sharedService.showSuccess('', 'Transaction confirmed hash Lock');
          } else if (statusTransaction['type'] === 'unconfirmed' && match) {
            // signedTransactionHashLock = null;
            this.sharedService.showInfo('', 'Transaction unconfirmed hash Lock');
          } else if (match) {
            signedTransactionHashLock = null;
            // this.sharedService.showWarning('', statusTransaction['data'].status.split('_').join(' '));
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
          if (element.id === '') {
            this.sharedService.showWarning('', 'You must select a mosaic and place the quantity');
            x = true;
          } else if (element.amount === '' || Number(element.amount) === 0) {
            this.sharedService.showWarning('', 'The quantity of mosaics is missing');
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
    this.haveBalance = false;
    this.allMosaics = [];
    this.balanceXpx = '0.000000';
    this.boxOtherMosaics = [];
    this.blockSendButton = false;
    this.blockButton = false;
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
   * @param {string} hash
   * @memberof CreateTransferComponent
   */
 /* setTimeOutValidate(hash: string) {
    setTimeout(() => {
      let exist = false;
      for (let element of this.transactionReady) {
        if (hash === element.hash) {
          exist = true;
        }
      }

      (exist) ? '' : this.sharedService.showWarning('', 'An error has occurred');
    }, 5000);
  }*/

  /**
   *
   *
   * @memberof CreateTransferComponent
   */
  sendTransfer() {
    if (this.formTransfer.valid && (!this.blockSendButton || !this.errorOtherMosaics)) {
      this.blockButton = true;
      this.blockSendButton = true;
      if (this.transactionService.validateBuildSelectAccountBalance(Number(this.balanceXpx.split(',').join('')), this.fee, 0)) {
        const common = { password: this.formTransfer.get("password").value };
        const mosaicsToSend = this.validateMosaicsToSend();
        const type = (this.cosignatorie) ? true : false;
        switch (type) {
          case true:
            /*console.log('TRANSFIERE CON COSIGNATARIO');
            // console.log('ACCOUNT SENDER ----> ', this.sender);
            // console.log('COSIGNATARIO SELECCIONADO ----> ', this.cosignatorie);*/
            const generationHash = this.dataBridge.blockInfo.generationHash;
            if (this.walletService.decrypt(common, this.cosignatorie)) {
              const params: TransferInterface = {
                common: common,
                recipient: (this.formTransfer.get("accountRecipient").value),
                message: (this.formTransfer.get("message").value === null) ? "" : this.formTransfer.get("message").value,
                network: this.walletService.currentAccount.network,
                mosaic: mosaicsToSend
              };

              // Create account from private key
              const account = Account.createFromPrivateKey(params.common.privateKey, params.network);
              // Build transfer transaction
              // const transferBuilder = this.transactionService.buildTransferTransaction(params);
              //-----------------------------------------------------------------------
              const recipientAddress = this.proximaxProvider.createFromRawAddress(params.recipient);
              const mosaics = params.mosaic;
              const allMosaics = [];
              mosaics.forEach(element => {
                allMosaics.push(new Mosaic(
                  new MosaicId(element.id),
                  UInt64.fromUint(Number(element.amount))
                )
                );
              });

              const transferBuilder = TransferTransaction.create(
                Deadline.create(5),
                recipientAddress,
                allMosaics,
                PlainMessage.create(params.message),
                params.network
              );

              //-----------------------------------------------------------------------
              // Build aggregate transaction
              const aggregateTransaction = this.transactionService.buildAggregateTransaction(this.sender.publicAccount, transferBuilder);
              // console.log('=== Build aggregate transaction ===', aggregateTransaction);
              // Sign transaction
              const aggregateSigned = account.sign(aggregateTransaction, generationHash);
              // Build hash lock transaction
              const hashLockTransaction: LockFundsTransaction = this.transactionService.buildHashLockTransaction(aggregateSigned);
              // console.log('=== Build hash lock transaction === ', hashLockTransaction);
              // Hash lock signed
              const hashLockSigned = account.sign(hashLockTransaction, generationHash);
              this.saveContactFn();
              this.clearForm();
              this.transactionService.buildTransactionHttp().announce(hashLockSigned).subscribe(async () => {
                this.getTransactionStatusHashLock(hashLockSigned, aggregateSigned);
              }, err => {
                // console.log('ERROR ----> ', err);
              });
            } else {
              this.formTransfer.get('password').setValue('');
              this.blockSendButton = false;
              this.blockButton = false;
            }

            break;
          case false:
            if (this.walletService.decrypt(common, this.sender)) {
              const params: TransferInterface = {
                common: common,
                recipient: (this.formTransfer.get("accountRecipient").value),
                message: (this.formTransfer.get("message").value === null) ? "" : this.formTransfer.get("message").value,
                network: this.walletService.currentAccount.network,
                mosaic: mosaicsToSend
              };

              const transferBuilder = this.transactionService.buildTransferTransaction(params);
              this.transactionSigned.push(transferBuilder.signedTransaction);
              this.saveContactFn();
              this.clearForm();
              this.transactionService.buildTransactionHttp().announce(transferBuilder.signedTransaction).subscribe(
                async () => {
                  this.blockButton = false;
                  this.blockSendButton = false;
                  // this.getTransactionStatus();
                }, err => {
                  this.blockButton = false;
                  this.blockSendButton = false;
                  this.clearForm();
                  this.sharedService.showError('', err);
                }
              );
            } else {
              this.formTransfer.get('password').setValue('');
              this.blockSendButton = false;
              this.blockButton = false;
            }
            break;
        }
      } else {
        this.blockButton = false;
        this.blockSendButton = false;
        this.sharedService.showError('', 'Insufficient balance');
      }
    }
  }

  /**
   *
   */
  saveContactFn() {
    this.getBooksAddress = this.serviceModuleService.getBooksAddress();
    if (this.getBooksAddress) {
      const contact = this.getBooksAddress.find(el => el.value === this.formTransfer.get("accountRecipient").value.split('-').join(''));
      if (!contact) {
        this.formContact.address = this.formTransfer.get("accountRecipient").value.split('-').join('');
        this.saveContact = false;
        this.basicModal.show();
      }
    } else {
      this.formContact.address = this.formTransfer.get("accountRecipient").value.split('-').join('');
      this.saveContact = false;
      this.basicModal.show();
    }
  }

  /**
   *
   * @param $event
   */
  selectCosignatorie($event) {
    // console.log('COSIGNATORIE SELECTED ', $event);
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
        let valueWithoutSpaces = '';
        if (value) {
          valueWithoutSpaces = value.trim();
        }
        const accountRecipient = (valueWithoutSpaces !== undefined && valueWithoutSpaces !== null && valueWithoutSpaces !== '') ? valueWithoutSpaces.split('-').join('') : '';
        const accountSelected = (this.formTransfer.get('contact').value) ? this.formTransfer.get('contact').value.split('-').join('') : '';
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
        } else if (!this.formTransfer.get('accountRecipient').getError("required") && this.formTransfer.get('accountRecipient').valid) {
          this.blockSendButton = true;
          this.msgErrorUnsupported = 'Recipient Address Network unsupported';
        } else {
          if (valueWithoutSpaces !== value) {
            this.formTransfer.get('accountRecipient').setValue(valueWithoutSpaces);
          }
          this.blockSendButton = false;
          this.msgErrorUnsupported = '';
        }
      }
    );

    this.subscription.push(this.formTransfer.get('message').valueChanges.subscribe(val => {
      if (val) {
        this.charRest = this.configurationForm.message.maxLength - val.length;

        this.calculateFee(val.length);
      } else {
        this.calculateFee(0);
      }
    }));

    //Amount XPX
    this.formTransfer.get('amountXpx').valueChanges.subscribe(
      value => {
        if (value !== null && value !== undefined) {
          const a = Number(value);
          let validateAmount = false;
          if (this.sender) {
            let accountInfo = this.walletService.filterAccountInfo(this.sender.name);
            // console.log('Account INfo- ---->', accountInfo);
            if (accountInfo !== undefined && accountInfo !== null && Object.keys(accountInfo).length > 0) {
              if (accountInfo.accountInfo.mosaics.length > 0) {
                const filtered = accountInfo.accountInfo.mosaics.find(element => {
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
      }
    );
  }


  calculateFee(message: number) {
    this.mosaicsToSend = this.validateMosaicsToSend();
    const x = TransferTransaction.calculateSize(PlainMessage.create(this.formTransfer.get("message").value).size(), this.mosaicsToSend.length);
    const b = FeeCalculationStrategy.calculateFee(x);
    if (message > 0) {
      this.fee = this.transactionService.amountFormatterSimple(b.compact())
    } else if (message === 0 && this.mosaicsToSend.length === 0) {
      this.fee = '0.037250'
    }
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

    if (amountXpx !== '' && amountXpx !== null && Number(amountXpx) !== 0) {
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
      realAmount = `${arrAmount[0]}${decimal}`;
      mosaics.push({
        id: this.mosaicXpx.id,
        amount: realAmount
      });
    }

    this.boxOtherMosaics.forEach(element => {
      if (element.id !== '' && element.amount !== '' && Number(element.amount) !== 0) {
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

    // console.log(mosaics);

    return mosaics;
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
      this.sharedService.showSuccess('', `Successfully saved contact`);
      return;
    }

    const issetData = this.getBooksAddress.find(element => element.label === this.formContact.name);
    if (issetData === undefined) {
      this.getBooksAddress.push(books);
      this.serviceModuleService.setBookAddress(this.getBooksAddress, '');
      this.formContact = { name: '', address: '' };
      this.booksAddress();
      this.basicModal.hide();
      this.sharedService.showSuccess('', `Successfully saved contact`);
      return;
    }

    this.sharedService.showError('User repeated', `The contact "${this.formContact.name}" already exists`);
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
