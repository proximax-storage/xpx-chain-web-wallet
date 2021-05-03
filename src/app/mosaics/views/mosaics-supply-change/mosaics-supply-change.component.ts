import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { MosaicSupplyType, UInt64, SignedTransaction, TransactionHttp, Account } from 'tsjs-xpx-chain-sdk';
import { Subscription } from 'rxjs';
import { environment } from './../../../../environments/environment';
import { NodeService } from '../../../servicesModule/services/node.service';
import { ProximaxProvider } from '../../../shared/services/proximax.provider';
import { SharedService, ConfigurationForm } from '../../../shared/services/shared.service';
import { MosaicService, MosaicsStorage } from '../../../servicesModule/services/mosaic.service';
import { DataBridgeService } from '../../../shared/services/data-bridge.service';
import { WalletService, AccountsInterface } from '../../../wallet/services/wallet.service';
import { TransactionsService } from '../../../transactions/services/transactions.service';
import { HeaderServicesInterface } from '../../../servicesModule/services/services-module.service';



@Component({
  selector: 'app-mosaics-supply-change',
  templateUrl: './mosaics-supply-change.component.html',
  styleUrls: ['./mosaics-supply-change.component.css']
})
export class MosaicsSupplyChangeComponent implements OnInit {

  paramsHeader: HeaderServicesInterface = {
    moduleName: 'Mosaics',
    componentName: 'Modify Supply',
  };

  @BlockUI() blockUI: NgBlockUI;
  currentBlock = 0;
  formMosaicSupplyChange: FormGroup;
  parentMosaic: any = [{
    value: '1',
    label: 'Select Mosaic',
    selected: false,
    disabled: true
  }];

  mosaicSupplyType: any = [{
    value: MosaicSupplyType.Increase,
    label: 'Increase',
    selected: false,
    disabled: false
  }, {
    value: MosaicSupplyType.Decrease,
    label: 'Decrease',
    selected: false,
    disabled: false
  }];

  mosaicsInfo: any[];
  divisibility = 0;
  duration = '0 days';
  transferable = false;
  supply = '0';
  supplyMutable = false;
  blockButton = false;
  passwordMain = 'password';
  transactionSigned: SignedTransaction[] = [];
  transactionReady: SignedTransaction[] = [];
  subscriptions = ['transactionStatus'];
  configurationForm: ConfigurationForm = {};
  subscribe = ['block'];
  optionsSupply = {
    prefix: '',
    thousands: ',',
    decimal: '.',
    precision: '0'
  };
  deltaSupply = 0;
  deltaSupplyValidate = false;
  totalSupply = '0';
  invalidSupply: boolean;
  errorSupply: string;
  blockBtn = false;
  maxLengthSupply = 13;
  mosaicSupplyChangeTransaction: any;
  fee = ' 0.000000';
  amountAccount: number;
  showTotal = false;
  errSupply = false;
  mosaicsInfoSelected: MosaicsStorage[];
  increase = true;
  errSupplyMin = false;
  subscription: Subscription[] = [];
  vestedBalance: { part1: string; part2: string; };
  noMosaics = false;
  noMosaicSelectable = false;

  signer: AccountsInterface = null;
  typeTx = 1; // 1 simple, 2 multisig
  insufficientBalanceCosignatory = false;
  cosignatory: AccountsInterface = null;
  showSelectAccount = true;
  isMultisig = false;
  transactionHttp: TransactionHttp = null;

  /**
   * Initialize dependencies and properties
   *
   * @params {services, dependencies} - Angular services to inject
   */
  constructor(
    private fb: FormBuilder,
    private proximaxProvider: ProximaxProvider,
    private sharedService: SharedService,
    private walletService: WalletService,
    private mosaicService: MosaicService,
    private transactionService: TransactionsService,
    private dataBridge: DataBridgeService,
    private nodeService: NodeService
  ) { }


  async ngOnInit() {
    this.transactionHttp = new TransactionHttp(environment.protocol + '://' + `${this.nodeService.getNodeSelected()}`);
    this.configurationForm = this.sharedService.configurationForm;
    this.createForm();
    this.formMosaicSupplyChange.get('deltaSupply').disable();
    this.formMosaicSupplyChange.get('mosaicSupplyType').disable();
    // this.balance();
    this.subscribeData();
  }

  /**
   *
   *
   * @memberof MosaicsSupplyChangeComponent
   */
  async filterMosaicByAccount() {
    this.clearForm();
    this.parentMosaic = [{
      value: '1',
      label: 'Select Mosaic',
      selected: false,
      disabled: true
    }];

    const data = await this.mosaicService.filterMosaics(null, this.signer.name);
    const mosaicsSelect = this.parentMosaic.slice(0);

    this.noMosaics = data.length > 0 ? false : true;

    data.forEach(element => {
      let expired = false;
      let nameExpired = '';
      if (element.mosaicInfo) {
        const nameMosaic = (element.mosaicNames.names.length > 0) ? element.mosaicNames.names[0].name : this.proximaxProvider.getMosaicId(element.idMosaic).toHex();
        const addressOwner = this.proximaxProvider.createAddressFromPublicKey(
          element.mosaicInfo.owner.publicKey,
          element.mosaicInfo.owner.address['networkType']
        );

        // const currentAccount = Object.assign({}, this.walletService.getCurrentAccount());
        const isOwner = (addressOwner.pretty() === this.proximaxProvider.createFromRawAddress(this.signer.address).pretty()) ? true : false;
        const durationMosaic = new UInt64([
          element.mosaicInfo['properties']['duration']['lower'],
          element.mosaicInfo['properties']['duration']['higher']
        ]);

        const createdBlock = new UInt64([
          element.mosaicInfo.height.lower,
          element.mosaicInfo.height.higher
        ]);

        if (durationMosaic.compact() > 0) {
          if (this.currentBlock >= durationMosaic.compact() + createdBlock.compact()) {
            expired = true;
            nameExpired = ' - Expired';
          }
        }

        if (isOwner && element.mosaicInfo['properties']['supplyMutable']) {
          mosaicsSelect.push({
            value: element.idMosaic,
            label: `${nameMosaic}${nameExpired}`,
            selected: false,
            disabled: expired
          });
        }
      }
    });

    this.parentMosaic = mosaicsSelect;
    if (this.parentMosaic.length === 1) {
      this.noMosaicSelectable = true;
      this.formMosaicSupplyChange.get('parentMosaic').disable();
      this.formMosaicSupplyChange.get('password').disable();
    } else {
      this.noMosaicSelectable = false;
      this.formMosaicSupplyChange.get('parentMosaic').enable();
      this.formMosaicSupplyChange.get('password').enable();
    }
  }

  /**
   *
   *
   * @param {*} mosaic
   * @returns
   * @memberof MosaicsSupplyChangeComponent
   */
  async optionSelected(mosaic: any) {
    this.errSupplyMin = false;
    this.errSupply = false;
    if (mosaic !== undefined) {
      this.showTotal = true;
      this.formMosaicSupplyChange.get('deltaSupply').enable();
      this.formMosaicSupplyChange.get('mosaicSupplyType').enable();
      const mosaicsInfoSelected: MosaicsStorage[] = await this.mosaicService.filterMosaics([this.proximaxProvider.getMosaicId(mosaic['value'])]);
      this.mosaicsInfoSelected = mosaicsInfoSelected;
      this.builder();
      if (mosaicsInfoSelected !== null || mosaicsInfoSelected !== undefined) {
        this.divisibility = mosaicsInfoSelected[0].mosaicInfo['properties'].divisibility;
        this.supplyMutable = mosaicsInfoSelected[0].mosaicInfo['properties'].supplyMutable;
        this.transferable = mosaicsInfoSelected[0].mosaicInfo['properties'].transferable;
        this.supply = this.transactionService.amountFormatter(
          new UInt64([
            mosaicsInfoSelected[0].mosaicInfo.supply['lower'],
            mosaicsInfoSelected[0].mosaicInfo.supply['higher']
          ]), mosaicsInfoSelected[0].mosaicInfo
        );
        this.calculate();
        // const durationBlock = new UInt64([
        //   mosaicsInfoSelected[0].mosaicInfo['properties']['duration']['lower'],
        //   mosaicsInfoSelected[0].mosaicInfo['properties']['duration']['higher']
        // ]);

        this.formMosaicSupplyChange.get('deltaSupply').setValue(0);
        this.maxLengthSupply = 13 + this.divisibility;
        this.optionsSupply = {
          prefix: '',
          thousands: ',',
          decimal: '.',
          precision: this.divisibility.toString()
        };

        // const durationDays = this.transactionService.calculateDuration(durationBlock);
        // this.duration = `(${durationBlock.compact()}) ${durationDays}`;
        this.duration = 'Does not expire';
        return;
      }
    }

    this.divisibility = 0;
    this.duration = '0 days';
    this.supply = '0';
    this.supplyMutable = false;
    this.transferable = false;
    return;
  }

  /**
   *
   *
   * @param {SignedTransaction} signedTransaction
   * @memberof MosaicsSupplyChangeComponent
   */
  announceAggregateBonded(signedTransaction: SignedTransaction) { // change
    this.transactionHttp.announceAggregateBonded(signedTransaction).subscribe(
      async () => {
        // this.blockBtnSend = false;
        this.fee = '0.000000';
        this.transactionSigned.push(signedTransaction);
      },
      err => {
        this.sharedService.showError('', err);
      });
  }

  /**
   *
   *
   * @memberof MosaicsSupplyChangeComponent
   */
  balance() {
    this.subscription.push(this.transactionService.getBalance$().subscribe(
      next => this.vestedBalance = this.transactionService.getDataPart(next, 6),
      error => this.vestedBalance = {
        part1: '0',
        part2: '000000'
      }
    ));
    const vestedBalance = this.vestedBalance.part1.concat(this.vestedBalance.part2).replace(/,/g, '');
    this.amountAccount = Number(vestedBalance);
  }

  /**
   * Create form namespace
   *
   * @memberof CreateMosaicComponent
   */
  builder() {
    const x = this.formMosaicSupplyChange.get('parentMosaic').value;
    if (x !== '') {
      this.mosaicSupplyChangeTransaction = this.proximaxProvider.mosaicSupplyChangeTransaction(
        this.formMosaicSupplyChange.get('parentMosaic').value,
        this.deltaSupply,
        this.formMosaicSupplyChange.get('mosaicSupplyType').value,
        this.walletService.currentAccount.network
      );
      this.fee = this.transactionService.amountFormatterSimple(this.mosaicSupplyChangeTransaction.maxFee.compact());
    }
  }

  /**
   *
   *
   * @param {*} [val]
   * @memberof MosaicsSupplyChangeComponent
   */
  calculate(val?: any) {
    if (this.increase) {
      const value = Number(this.supply.replace(/,/g, '')) + val;
      this.totalSupply = this.transactionService.amountFormatter(
        parseFloat(this.transactionService.addZeros(this.divisibility, value)),
        this.mosaicsInfoSelected[0].mosaicInfo
      );
      if (Number(this.supply) + val > this.configurationForm.mosaicWallet.maxSupply) {
        this.errSupply = true;
      } else {
        this.errSupply = false;
      }
    } else {

      const value = Number(this.supply.replace(/,/g, '')) - val;
      const restante = Number(value.toFixed(6));

      if (val > Number(this.supply.replace(/,/g, ''))) {

        this.errSupplyMin = true;
        this.totalSupply = '0.000000';
      } else {
        this.totalSupply = this.transactionService.amountFormatter(
          parseFloat(this.transactionService.addZeros(this.divisibility, restante)),
          this.mosaicsInfoSelected[0].mosaicInfo
        );
        this.errSupply = false;
        this.errSupplyMin = false;
      }


    }

  }

  /**
   *
   *
   * @param {*} inputType
   * @memberof MosaicsSupplyChangeComponent
   */
  changeInputType(inputType: any) {
    const newType = this.sharedService.changeInputType(inputType);
    this.passwordMain = newType;
  }

  /**
   * Create form namespace
   *
   * @memberof CreateMosaicComponent
   */
  createForm() {
    this.formMosaicSupplyChange = this.fb.group({
      parentMosaic: ['', Validators.required],
      mosaicSupplyType: [MosaicSupplyType.Increase, Validators.required],
      deltaSupply: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(30)]],
    });
  }

  /**
   *
   *
   * @memberof MosaicSupplyChange
   */
  clearForm() {
    this.fee = '0.000000';
    this.formMosaicSupplyChange.get('mosaicSupplyType').disable();
    this.showTotal = false;
    this.errSupply = false;
    this.errSupplyMin = false;
    this.divisibility = 0;
    this.duration = '0 days';
    this.transferable = false;
    this.supply = '0';
    this.supplyMutable = false;
    this.formMosaicSupplyChange.reset({
      parentMosaic: '',
      mosaicSupplyType: MosaicSupplyType.Increase,
      deltaSupply: '',
      password: ''
    },
      {
        emitEvent: false
      });
  }

  /**
   *
   *
   * @param {*} event
   * @memberof MosaicsSupplyChangeComponent
   */
  type(event) {
    this.formMosaicSupplyChange.get('deltaSupply').setValue(0);
    this.optionsSupply = {
      prefix: '',
      thousands: ',',
      decimal: '.',
      precision: this.divisibility.toString()
    };
    if (event.value === 1) {
      this.increase = true;
    } else {
      this.increase = false;
    }
  }


  /**
   *
   * @param param
   * @param formControl
   */
  getError(param: string | (string | number)[], formControl?: any) {
    if (this.formMosaicSupplyChange.get(param).getError('required')) {
      return `This field is required`;
    } else if (this.formMosaicSupplyChange.get(param).getError('minlength')) {
      return `This field must contain minimum ${this.formMosaicSupplyChange.get(param).getError('minlength').requiredLength} characters`;
    } else if (this.formMosaicSupplyChange.get(param).getError('maxlength')) {
      return `This field must contain maximum ${this.formMosaicSupplyChange.get(param).getError('maxlength').requiredLength} characters`;
    }
  }

  /**
   *
   *
   * @readonly
   * @memberof MosaicsSupplyChangeComponent
   */
  get input() { return this.formMosaicSupplyChange.get('password'); }

  /**
   *
   *
   * @memberof MosaicsSupplyChangeComponent
   */
  getTransactionStatus() {
    // Get transaction status
    this.subscriptions['transactionStatus'] = this.dataBridge.getTransactionStatus().subscribe(
      statusTransaction => {
        if (statusTransaction !== null && statusTransaction !== undefined && this.transactionSigned !== null) {
          for (const element of this.transactionSigned) {
            const match = statusTransaction['hash'] === element.hash;
            if (match) {
              this.blockButton = false;
              this.clearForm();
              this.transactionReady.push(element);
            }
            if (statusTransaction['type'] === 'confirmed' && match) {
              this.transactionSigned = this.transactionSigned.filter(el => el.hash !== statusTransaction['hash']);
            } else if (statusTransaction['type'] === 'unconfirmed' && match) {
            } else if (match) {
              this.transactionSigned = this.transactionSigned.filter(el => el.hash !== statusTransaction['hash']);
            }
          }
        }
      }
    );
  }

  /**
   *
   *
   * @param {string} quantity
   * @returns
   * @memberof MosaicsSupplyChangeComponent
   */
  getQuantity(quantity: string) {
    return this.sharedService.amountFormat(quantity);
  }

  /**
   *
   *
   * @memberof MosaicsSupplyChangeComponent
   */
  send() {
    if (this.formMosaicSupplyChange.valid) {
      const validateAmount = this.transactionService.validateBuildSelectAccountBalance(this.amountAccount, Number(this.fee), 0);
      if (validateAmount) {
        this.blockButton = true;
        const common = {
          password: this.formMosaicSupplyChange.get('password').value,
          privateKey: ''
        };

        if (this.typeTx === 1) {
          if (this.walletService.decrypt(common, this.signer)) {
            const account = this.proximaxProvider.getAccountFromPrivateKey(common.privateKey, this.walletService.currentAccount.network);
            this.sendTxSimple(account);
          } else {
            this.blockButton = false;
            return;
          }
        } else if (this.typeTx === 2 && this.cosignatory) {
          if (this.walletService.decrypt(common, this.cosignatory)) {
            this.sendAggregateBonded(common.privateKey);
          } else {
            this.blockButton = false;
            return;
          }
        } else {
          this.sharedService.showWarning('', 'Select a cosignatory');
          return;
        }



      } else {
        this.sharedService.showError('', 'insufficient Balance');
      }
    }
  }

  /**
   *
   *
   * @param {Account} account
   * @memberof MosaicsSupplyChangeComponent
   */
  sendTxSimple(account: Account) {
    const generationHash = this.dataBridge.blockInfo.generationHash;
    const signedTransaction = account.sign(this.mosaicSupplyChangeTransaction, generationHash);
    this.transactionSigned.push(signedTransaction);
    this.proximaxProvider.announce(signedTransaction).subscribe(
      x => {

        this.blockUI.stop();
        if (this.subscriptions['transactionStatus'] === undefined || this.subscriptions['transactionStatus'] === null) {
          this.getTransactionStatus();
        }

        this.setTimeOutValidate(signedTransaction.hash);
      },
      err => {
        this.blockButton = false;
        this.clearForm();
        this.blockUI.stop(); // Stop blocking
      });
  }

  /**
   *
   *
   * @param {string} pvk
   * @memberof MosaicsSupplyChangeComponent
   */
  sendAggregateBonded(pvk: string) {
    const innerTransaction = [{
      signer: this.signer.publicAccount,
      tx: this.mosaicSupplyChangeTransaction
    }];

    const generationHash = this.dataBridge.blockInfo.generationHash;
    const accountCosignatory = Account.createFromPrivateKey(pvk, this.walletService.currentAccount.network);
    const aggregateSigned = this.transactionService.buildAggregateTransaction(accountCosignatory, innerTransaction, generationHash);
    let hashLockSigned = this.transactionService.buildHashLockTransaction(aggregateSigned, accountCosignatory, generationHash);
    this.transactionService.buildTransactionHttp().announce(hashLockSigned).subscribe(async () => {
      this.clearForm();
      this.subscription['getTransactionStatushashLock'] = this.dataBridge.getTransactionStatus().subscribe(
        statusTransaction => {
          this.clearForm();
          if (statusTransaction !== null && statusTransaction !== undefined && hashLockSigned !== null) {
            const match = statusTransaction['hash'] === hashLockSigned.hash;
            if (statusTransaction['type'] === 'confirmed' && match) {
              this.blockButton = false;
              setTimeout(() => {
                this.announceAggregateBonded(aggregateSigned);
                this.blockButton = false;
                hashLockSigned = null;
              }, environment.delayBetweenLockFundABT);
            } else if (statusTransaction['type'] === 'status' && match) {
              this.blockButton = false;
              this.transactionSigned = this.transactionSigned.filter(el => el.hash !== statusTransaction['hash']);
              hashLockSigned = null;
            }
          }
        }
      );
    }, err => { });
  }

  /**
   *
   *
   * @param {AccountsInterface} account
   * @memberof MosaicsSupplyChangeComponent
   */
  selectAccountDebitFunds(account: AccountsInterface) {
    setTimeout(() => {
      const amountAccount = this.walletService.getAmountAccount(account.address);
      this.amountAccount = Number(this.transactionService.amountFormatterSimple(amountAccount).replace(/,/g, ''));
      this.signer = account;
      this.typeTx = (this.transactionService.validateIsMultisigAccount(this.signer)) ? 2 : 1;
      this.filterMosaicByAccount();
      // this.validateBalance();
    });
  }

  /**
   *
   *
   * @param {{ disabledForm: boolean, cosignatory: AccountsInterface }} event
   * @memberof MosaicsSupplyChangeComponent
   */
  selectCosignatory(event: { disabledForm: boolean, cosignatory: AccountsInterface }) {
    if (event) {
      if (event.disabledForm) {
        this.insufficientBalanceCosignatory = true;
        // this.disableForm();
      } else {
        this.insufficientBalanceCosignatory = false;
        this.cosignatory = event.cosignatory;
      }
    } else {
      this.insufficientBalanceCosignatory = false;
      this.cosignatory = null;
    }
  }

  /**
   *
   *
   * @param {string} hash
   * @memberof MosaicsSupplyChangeComponent
   */
  setTimeOutValidate(hash: string) {
    setTimeout(() => {
      let exist = false;
      for (const element of this.transactionReady) {
        if (hash === element.hash) {
          exist = true;
        }
      }

      if (!exist) {
        this.sharedService.showWarning('', 'An error has occurred')
      }
    }, 5000);
  }

  /**
   *
   *
   * @memberof MosaicsSupplyChangeComponent
   */
  subscribeData() {
    this.subscribe['block'] = this.dataBridge.getBlock().subscribe(next => this.currentBlock = next);
    this.formMosaicSupplyChange.get('deltaSupply').valueChanges.subscribe(next => {
      this.deltaSupplyValidate = true
      if (parseFloat(next) <= this.configurationForm.mosaicWallet.maxSupply) {
        this.invalidSupply = false;
        this.blockBtn = false;
        this.errorSupply = '';

        if (!this.divisibility) {
          // tslint:disable-next-line: radix
          this.deltaSupply = parseInt(next);
        } else {
          // tslint:disable-next-line: radix
          this.deltaSupply = parseInt(this.transactionService.addZeros(this.divisibility, next));
          this.calculate(next);
        }
      } else {
        this.errorSupply = '-invalid';
        this.blockBtn = true;
        this.invalidSupply = true;
      }
      this.builder();
    });
  }
  /**
   *
   *
   * @param {string} [nameInput='']
   * @param {string} [nameControl='']
   * @param {string} [nameValidation='']
   * @returns
   * @memberof MosaicsSupplyChangeComponent
   */
  validateInput(nameInput: string = '', nameControl: string = '', nameValidation: string = '') {
    let validation: AbstractControl = null;
    if (nameInput !== '' && nameControl !== '') {
      validation = this.formMosaicSupplyChange.controls[nameControl].get(nameInput);
    } else if (nameInput === '' && nameControl !== '' && nameValidation !== '') {
      validation = this.formMosaicSupplyChange.controls[nameControl].getError(nameValidation);
    } else if (nameInput !== '') {
      validation = this.formMosaicSupplyChange.get(nameInput);
    }
    return validation;
  }
}
