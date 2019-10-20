import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { MosaicSupplyType, UInt64, SignedTransaction, MosaicId } from 'tsjs-xpx-chain-sdk';
import { ProximaxProvider } from '../../../../shared/services/proximax.provider';
import { SharedService, ConfigurationForm } from '../../../../shared/services/shared.service';
import { MosaicService, MosaicsStorage } from '../../../../servicesModule/services/mosaic.service';
import { DataBridgeService } from '../../../../shared/services/data-bridge.service';
import { WalletService } from '../../../../wallet/services/wallet.service';
import { TransactionsService } from '../../../../transactions/services/transactions.service';
import { AppConfig } from '../../../../config/app.config';
import { HeaderServicesInterface } from '../../../services/services-module.service';
import { Subscription } from 'rxjs';


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
  currentBlock: number = 0;
  formMosaicSupplyChange: FormGroup;
  parentMosaic: any = [{
    value: '1',
    label: 'Select or enter here',
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
  divisibility: number = 0;
  duration: string = '0 days';
  supply: string = '0';
  blockButton: boolean = false;
  supplyMutable: boolean = false;
  passwordMain: string = 'password';
  transferable: boolean = false;
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
  deltaSupply: number = 0;
  totalSupply: string = '0';
  invalidSupply: boolean;
  errorSupply: string;
  blockBtn: boolean = false;
  maxLengthSupply: number = 13;
  mosaicSupplyChangeTransaction: any;
  fee: string = ' 0.000000';
  amountAccount: number;
  showTotal: boolean = false;
  errSupply: boolean = false;
  mosaicsInfoSelected: MosaicsStorage[];
  increase: boolean = true;
  errSupplyMin: boolean = false;
  subscription: Subscription[] = [];
  vestedBalance: { part1: string; part2: string; };
  noMosaics: boolean = false;

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
    private dataBridge: DataBridgeService
  ) { }


  async ngOnInit() {
    this.configurationForm = this.sharedService.configurationForm;
    this.createForm();
    this.formMosaicSupplyChange.get('deltaSupply').disable();
    this.formMosaicSupplyChange.get('mosaicSupplyType').disable();
    this.balance();

    this.subscribe['block'] = this.dataBridge.getBlock().subscribe(next => this.currentBlock = next);
    const data = await this.mosaicService.filterMosaics();
    const mosaicsSelect = this.parentMosaic.slice(0);
    data.forEach(element => {
      let expired = false;
      let nameExpired = '';
      if (element.mosaicInfo) {
        const nameMosaic = (element.mosaicNames.names.length > 0) ? element.mosaicNames.names[0].name : this.proximaxProvider.getMosaicId(element.idMosaic).toHex();
        const addressOwner = this.proximaxProvider.createAddressFromPublicKey(
          element.mosaicInfo.owner.publicKey,
          element.mosaicInfo.owner.address['networkType']
        );

        const currentAccount = Object.assign({}, this.walletService.getCurrentAccount());
        const isOwner = (addressOwner.pretty() === this.proximaxProvider.createFromRawAddress(currentAccount.address).pretty()) ? true : false;
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
    this.formMosaicSupplyChange.get('deltaSupply').valueChanges.subscribe(next => {

      if (parseFloat(next) <= this.configurationForm.mosaicWallet.maxSupply) {
        this.invalidSupply = false;
        this.blockBtn = false;
        this.errorSupply = '';

        if (!this.divisibility) {
          this.deltaSupply = parseInt(next);
        } else {
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

    this.parentMosaic = mosaicsSelect;
    if (this.parentMosaic.length === 1) {
      this.noMosaics = true;
      this.formMosaicSupplyChange.get('parentMosaic').disable();
      this.formMosaicSupplyChange.get('password').disable();
    }
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
    let vestedBalance = this.vestedBalance.part1.concat(this.vestedBalance.part2).replace(/,/g,'');
    this.amountAccount = Number(vestedBalance)
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
  calculate(val?) {
    if (this.increase) {
      let value = Number(this.supply.replace(/,/g,'')) + val;
      this.totalSupply = this.transactionService.amountFormatter(
        parseFloat(this.transactionService.addZeros(this.divisibility, value)),
        this.mosaicsInfoSelected[0].mosaicInfo
      );
      if (Number(this.supply) + val > 9000000000) {
        this.errSupply = true;
      } else {
        this.errSupply = false;
      }
    } else {

      let value = Number(this.supply.replace(/,/g,'')) - val;
      let restante = Number(value.toFixed(6));

      if (val > Number(this.supply.replace(/,/g,''))) {

        this.errSupplyMin = true;
        this.totalSupply = '0.000000'
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
  changeInputType(inputType) {
    let newType = this.sharedService.changeInputType(inputType)
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
      this.mosaicsInfoSelected = mosaicsInfoSelected
      this.builder()
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
          for (let element of this.transactionSigned) {
            const match = statusTransaction['hash'] === element.hash;
            if (match) {
              this.blockButton = false;
              this.clearForm()
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
      const validateAmount = this.transactionService.validateBuildSelectAccountBalance(this.amountAccount, Number(this.fee), 0)
      if (validateAmount) {
        this.blockButton = true;
        const common = {
          password: this.formMosaicSupplyChange.get('password').value,
          privateKey: ''
        }
        if (this.walletService.decrypt(common)) {
          const account = this.proximaxProvider.getAccountFromPrivateKey(common.privateKey, this.walletService.currentAccount.network);

          // const mosaicSupplyChangeTransaction = this.proximaxProvider.mosaicSupplyChangeTransaction(
          //   this.formMosaicSupplyChange.get('parentMosaic').value,
          //   this.deltaSupply,
          //   this.formMosaicSupplyChange.get('mosaicSupplyType').value,
          //   this.walletService.currentAccount.network
          // )
          const generationHash = this.dataBridge.blockInfo.generationHash;
          const signedTransaction = account.sign(this.mosaicSupplyChangeTransaction, generationHash); //Update-sdk-dragon
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
              this.clearForm()
              this.blockUI.stop(); // Stop blocking
              // this.sharedService.showError('', 'An unexpected error has occurred');
            });
        } else {
          this.blockButton = false;
        }
      } else {
        this.sharedService.showError('', 'insufficient Balance');
      }
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
      for (let element of this.transactionReady) {
        if (hash === element.hash) {
          exist = true;
        }
      }

      (exist) ? '' : this.sharedService.showWarning('', 'An error has occurred');
    }, 5000);
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
