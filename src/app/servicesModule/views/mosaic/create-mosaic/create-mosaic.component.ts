import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { UInt64, Deadline, AggregateTransaction, NetworkType, MosaicSupplyType, AliasActionType, SignedTransaction, MosaicDefinitionTransaction, Account } from 'tsjs-xpx-chain-sdk';
import { ProximaxProvider } from '../../../../shared/services/proximax.provider';
import { SharedService, ConfigurationForm } from '../../../../shared/services/shared.service';
import { DataBridgeService } from '../../../../shared/services/data-bridge.service';
import { WalletService, AccountsInterface, AccountsInfoInterface } from '../../../../wallet/services/wallet.service';
import { TransactionsService } from '../../../../transactions/services/transactions.service';
import { AppConfig } from '../../../../config/app.config';
import { environment } from 'src/environments/environment';
import { HeaderServicesInterface } from '../../../services/services-module.service';


@Component({
  selector: 'app-create-mosaic',
  templateUrl: './create-mosaic.component.html',
  styleUrls: ['./create-mosaic.component.css']
})
export class CreateMosaicComponent implements OnInit {

  paramsHeader: HeaderServicesInterface = {
    moduleName: 'Mosaics',
    componentName: 'CREATE',
  };
  @BlockUI() blockUI: NgBlockUI;
  configurationForm: ConfigurationForm = {};
  isOwner = false;
  mosaicForm: FormGroup;

  mosaicSupplyType: any = [{
    value: MosaicSupplyType.Increase,
    label: 'Increase',
    selected: true,
    disabled: false
  }, {
    value: MosaicSupplyType.Decrease,
    label: 'Decrease',
    selected: false,
    disabled: false
  }];
  durationByBlock = '5760';
  blockSend: boolean = false;
  transactionSigned: SignedTransaction[] = [];
  transactionReady: SignedTransaction[] = [];
  subscribe = ['transactionStatus'];
  rentalFee = '500000000';
  calculateRentalFee = '';
  currentAccount: AccountsInterface;
  insufficientBalance = true;
  accountInfo: AccountsInfoInterface;
  deltaSupply: number;
  invalidDivisibility: boolean;
  invalidSupply: boolean;
  blockButton: boolean;
  errorDivisibility: string;
  errorSupply: string;
  maxLengthSupply: number = 13;
  optionsSuply = {
    prefix: '',
    thousands: ',',
    decimal: '.',
    precision: '0'
  };
  supplyMutable: any;
  transferable: any;
  divisibility: any;
  aggregateTransaction: AggregateTransaction;
  fee: number;
  amountAccount: number;

  constructor(
    private fb: FormBuilder,
    private proximaxProvider: ProximaxProvider,
    private walletService: WalletService,
    private dataBridge: DataBridgeService,
    private sharedService: SharedService,
    private transactionService: TransactionsService
  ) {
  }

  ngOnInit() {
    this.createForm();
    this.subscribeValue();
    this.walletService.getAccountsInfo$().subscribe(
      x => this.validateBalance()
    );
    this.calculateRentalFee = this.transactionService.amountFormatterSimple(Number(this.rentalFee));
    this.configurationForm = this.sharedService.configurationForm;
    this.mosaicForm.disable();
    this.validateBalance();
    this.mosaicForm.get('duration').valueChanges.subscribe(next => {
      this.durationByBlock = this.transactionService.calculateDurationforDay(next).toString();
    });
    this.mosaicForm.get('divisibility').valueChanges.subscribe(next => {
      console.log('next', next)
      if (next > 6) {
        this.maxLengthSupply = 13;
        this.errorDivisibility = '-invalid';
        this.invalidDivisibility = true;
        this.blockButton = true;
      } else {
        this.optionsSuply = {
          prefix: '',
          thousands: ',',
          decimal: '.',
          precision: next
        };
        this.maxLengthSupply = 13 + parseFloat(next);
        this.errorDivisibility = '';
        this.blockButton = false;
        this.invalidDivisibility = false;
      }
      this.mosaicForm.get('deltaSupply').setValue('');
    });
    this.mosaicForm.get('deltaSupply').valueChanges.subscribe(next => {
      if (parseFloat(next) <= this.configurationForm.mosaicWallet.maxSupply) {
        this.invalidSupply = false;
        this.blockButton = false;
        this.errorSupply = '';

        if (!this.mosaicForm.get('divisibility').value) {
          this.deltaSupply = parseInt(next);
        } else {
          this.deltaSupply = parseInt(this.transactionService.addZeros(this.mosaicForm.get('divisibility').value, next));
        }
      } else {
        this.errorSupply = '-invalid';
        this.blockButton = true;
        this.invalidSupply = true;
      }
    });
  }

  ngOnDestroy(): void {
    this.subscribe.forEach(element => {
      if (this.subscribe[element] !== undefined) {
        this.subscribe[element].unsubscribe();
      }
    });
  }



  /**
   * Create form namespace
   *
   * @memberof CreateMosaicComponent
   */
  createForm() {
    this.mosaicForm = this.fb.group({
      deltaSupply: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(30)]],
      duration: ['', [Validators.required]],
      divisibility: ['', [Validators.required]],
      notExpire: [false],
      transferable: [false],
      supplyMutable: [false],
    });
  }

  /**
   *
   *
   * @memberof CreateMosaicComponent
   */
  clearForm() {
    if (this.mosaicForm.get('duration').disabled) {
      this.mosaicForm.get('duration').enable({
        emitEvent: false
      });
    }

    this.optionsSuply = {
      prefix: '',
      thousands: ',',
      decimal: '.',
      precision: '0'
    };

    this.mosaicForm.reset({
      deltaSupply: '',
      password: '',
      duration: '',
      divisibility: '',
      transferable: false,
      supplyMutable: false,
      notExpire: false,
    },
      {
        emitEvent: false
      });
  }


  subscribeValue() {
    const account = this.walletService.currentAccount;
    // const nonce = this.proximaxProvider.createNonceRandom();
    // console.log('nonce', nonce);
    const duration = (this.mosaicForm.get('duration').enabled) ? parseInt(this.durationByBlock) : undefined;
    let params = {
      nonce: null,
      account: account,
      supplyMutable: '',
      transferable: '',
      divisibility: '',
      duration: duration,
      network: this.walletService.currentAccount.network
    }

    this.mosaicForm.get('supplyMutable').valueChanges.subscribe(
      supplyMutable => {
        this.supplyMutable = supplyMutable;
        params.supplyMutable = this.supplyMutable;
        this.buildMosaicDefinition(account, params)
      });
    this.mosaicForm.get('transferable').valueChanges.subscribe(
      transferable => {
        this.transferable = transferable
        params.transferable = this.transferable;
        this.buildMosaicDefinition(account, params)

      });
    this.mosaicForm.get('divisibility').valueChanges.subscribe(
      divisibility => {
        this.divisibility = divisibility
        params.divisibility = this.divisibility;
        params.nonce = this.proximaxProvider.createNonceRandom();
        this.buildMosaicDefinition(account, params)
      });
    this.calculateFee();

  }

  calculateFee() {
    const account = this.walletService.filterAccountInfo(this.proximaxProvider.createFromRawAddress(this.walletService.currentAccount.address).pretty(), true);
    let mosaics = account.accountInfo.mosaics;
    let amoutMosaic = mosaics.filter(mosaic => mosaic.id.toHex() == environment.mosaicXpxInfo.id);
    this.amountAccount = amoutMosaic[0].amount.compact()
  }

  buildMosaicDefinition(account, params) {
    const mosaicDefinitionTransaction = this.proximaxProvider.buildMosaicDefinition(params);

    const mosaicSupplyChangeTransaction = this.proximaxProvider.buildMosaicSupplyChange(
      mosaicDefinitionTransaction.mosaicId,
      MosaicSupplyType.Increase,
      UInt64.fromUint(this.deltaSupply),
      this.walletService.currentAccount.network
    );
    this.aggregateTransaction = AggregateTransaction.createComplete(
      Deadline.create(),
      [
        mosaicDefinitionTransaction.toAggregate(account.publicAccount),
        mosaicSupplyChangeTransaction.toAggregate(account.publicAccount)
      ],
      this.walletService.currentAccount.network,
      []
    );
    this.fee = Number(this.transactionService.amountFormatterSimple(this.aggregateTransaction.maxFee.compact()))
  }
  /**
   *
   *
   * @param {*} $event
   * @memberof CreateMosaicComponent
   */
  changeNotExpire($event) {
    console.log($event);
    if (!$event.checked) {
      if (this.mosaicForm.get('duration').disabled) {
        this.mosaicForm.get('duration').enable({
          emitEvent: false
        });
      }
    } else {
      if (this.mosaicForm.get('duration').enabled) {
        this.mosaicForm.get('duration').setValue('', {
          emitEvent: false
        });
        this.mosaicForm.get('duration').disable({
          emitEvent: false
        });
      }
    }
  }

  /**
   *
   *
   * @memberof CreateMosaicComponent
   */
  send() {
    if (this.mosaicForm.valid && !this.blockSend) {
      const validateAmount = this.transactionService.validateBuildSelectAccountBalance(this.amountAccount, this.fee, Number(this.calculateRentalFee))
      if (validateAmount) {
        const common = {
          password: this.mosaicForm.get('password').value,
          privateKey: ''
        }

        if (this.walletService.decrypt(common)) {
          this.blockSend = true;
          const account = this.proximaxProvider.getAccountFromPrivateKey(common.privateKey, this.walletService.currentAccount.network);
          // const nonce = this.proximaxProvider.createNonceRandom();
          // const duration = (this.mosaicForm.get('duration').enabled) ? parseInt(this.durationByBlock) : undefined;
          // const params = {
          //   nonce: nonce,
          //   account: account,
          //   supplyMutable: this.mosaicForm.get('supplyMutable').value,
          //   transferable: this.mosaicForm.get('transferable').value,
          //   divisibility: this.mosaicForm.get('divisibility').value,
          //   duration: duration,
          //   network: this.walletService.currentAccount.network
          // }

          // //BUILD TRANSACTION
          //  const mosaicDefinitionTransaction = this.proximaxProvider.buildMosaicDefinition(params);
          //  console.log('-------- mosaicDefinitionTransaction sed', mosaicDefinitionTransaction);
          //  console.log('-------- mosaicDefinitionTransaction sed', mosaicDefinitionTransaction.maxFee.compact());
          // const mosaicSupplyChangeTransaction = this.proximaxProvider.buildMosaicSupplyChange(
          //   mosaicDefinitionTransaction.mosaicId,
          //   MosaicSupplyType.Increase,
          //   UInt64.fromUint(this.deltaSupply),
          //   this.walletService.currentAccount.network
          // );

          // const aggregateTransaction = AggregateTransaction.createComplete(
          //   Deadline.create(),
          //   [
          //     mosaicDefinitionTransaction.toAggregate(account.publicAccount),
          //     mosaicSupplyChangeTransaction.toAggregate(account.publicAccount)
          //   ],
          //   this.walletService.currentAccount.network,
          //   []
          // );


          // this.dataBridge.setTransactionStatus(null);
          // I SIGN THE TRANSACTION
          const generationHash = this.dataBridge.blockInfo.generationHash
          const signedTransaction = account.sign(this.aggregateTransaction, generationHash);  //Update-sdk-dragon
          this.transactionSigned.push(signedTransaction);
          //ANNOUNCEMENT THE TRANSACTION-
          this.proximaxProvider.announce(signedTransaction).subscribe(
            async x => {
              this.blockSend = false;
              this.clearForm();
              this.cleanCheck();
              if (this.subscribe['transactionStatus'] === undefined || this.subscribe['transactionStatus'] === null) {
                this.getTransactionStatus();
              }

              this.setTimeOutValidate(signedTransaction.hash);
            }, error => {
              this.blockSend = false;
            }
          );
        } else {
          this.blockSend = false;
        }
      } else {
        this.sharedService.showError('', 'insufficient balance');
      }
    }
  }

  cleanCheck() {
    this.divisibility = '';
    this.transferable = false;
    this.supplyMutable = false;
  }
  /**
   *
   *
   * @param {string} hash
   * @memberof CreateMosaicComponent
   */
  setTimeOutValidate(hash: string) {
    setTimeout(() => {
      let exist = false;
      for (let element of this.transactionReady) {
        if (hash === element.hash) {
          exist = true;
        }
      }

      (exist) ? '' : this.sharedService.showWarning('', 'Error connecting to the node');
    }, 5000);
  }

  /**
   *
   *
   * @memberof CreateMosaicComponent
   */
  getTransactionStatus() {
    // Get transaction status
    this.subscribe['transactionStatus'] = this.dataBridge.getTransactionStatus().subscribe(
      statusTransaction => {
        if (statusTransaction !== null && statusTransaction !== undefined && this.transactionSigned !== null) {
          for (let element of this.transactionSigned) {
            const statusTransactionHash = (statusTransaction['type'] === 'error') ? statusTransaction['data'].hash : statusTransaction['data'].transactionInfo.hash;
            const match = statusTransactionHash === element.hash;
            if (match) {
              this.transactionReady.push(element);
            }

            if (statusTransaction['type'] === 'confirmed' && match) {
              this.transactionSigned = this.transactionSigned.filter(el => el.hash !== statusTransactionHash);
              this.sharedService.showSuccess('', 'Transaction confirmed');
            } else if (statusTransaction['type'] === 'unconfirmed' && match) {
              this.sharedService.showInfo('', 'Transaction unconfirmed');
            } else if (match) {
              this.transactionSigned = this.transactionSigned.filter(el => el.hash !== statusTransactionHash);
              this.sharedService.showWarning('', statusTransaction['data'].status.split('_').join(' '));
            }
          }
        }
      }
    );
  }

  /**
   *
   *
   * @memberof CreateMosaicComponent
   */
  validateBalance() {
    this.mosaicForm.disable();
    this.currentAccount = this.walletService.currentAccount;
    this.accountInfo = this.walletService.filterAccountInfo(this.currentAccount.name);
    if (this.accountInfo && this.accountInfo.accountInfo.mosaics && this.accountInfo.accountInfo.mosaics.length > 0) {
      const mosaicXPX = this.accountInfo.accountInfo.mosaics.find(x => x.id.toHex() === environment.mosaicXpxInfo.id);
      if (mosaicXPX) {
        if (mosaicXPX.amount.compact() >= Number(this.rentalFee)) {
          this.insufficientBalance = false;
          this.mosaicForm.enable();
          return;
        }
      }
      this.insufficientBalance = true;
    }
  }

  /**
   *
   *
   * @param {string} [nameInput='']
   * @param {string} [nameControl='']
   * @param {string} [nameValidation='']
   * @returns
   * @memberof CreateMosaicComponent
   */
  validateInput(nameInput: string = '', nameControl: string = '', nameValidation: string = '') {
    let validation: AbstractControl = null;
    if (nameInput !== '' && nameControl !== '') {
      validation = this.mosaicForm.controls[nameControl].get(nameInput);
    } else if (nameInput === '' && nameControl !== '' && nameValidation !== '') {
      validation = this.mosaicForm.controls[nameControl].getError(nameValidation);
    } else if (nameInput !== '') {
      validation = this.mosaicForm.get(nameInput);
    }
    return validation;
  }

  limitDuration(e) {
    console.log();
    if (isNaN(parseInt(e.target.value))) {
      e.target.value = ''
    } else {
    if (parseInt(e.target.value) > 365) {
        e.target.value = ''
      } else if (parseInt(e.target.value) < 1) {
        e.target.value = ''
      }
    }
  }

  limitLength(e) {
    if (isNaN(parseInt(e.target.value))) {
      e.target.value = ''
    } else {
      if (parseInt(e.target.value) > 6) {
        e.target.value = ''
      } else if (parseInt(e.target.value) < 0) {
        e.target.value = ''
      }
    }
  }
}
