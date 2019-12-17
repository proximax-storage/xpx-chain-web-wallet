import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Subscription } from 'rxjs';
import {
  UInt64,
  Deadline,
  AggregateTransaction,
  MosaicSupplyType,
  SignedTransaction,
  MosaicId,
  TransactionHttp,
  Account,
  MosaicDefinitionTransaction,
  MosaicSupplyChangeTransaction,
  PublicAccount
} from 'tsjs-xpx-chain-sdk';
import { ProximaxProvider } from '../../../shared/services/proximax.provider';
import { SharedService, ConfigurationForm } from '../../../shared/services/shared.service';
import { DataBridgeService } from '../../../shared/services/data-bridge.service';
import { WalletService, AccountsInterface, AccountsInfoInterface } from '../../../wallet/services/wallet.service';
import { TransactionsService } from '../../../transactions/services/transactions.service';
import { environment } from '../../../../environments/environment';
import { HeaderServicesInterface } from '../../../servicesModule/services/services-module.service';
import { MosaicService } from '../../../servicesModule/services/mosaic.service';
import { NodeService } from 'src/app/servicesModule/services/node.service';


@Component({
  selector: 'app-create-mosaic',
  templateUrl: './create-mosaic.component.html',
  styleUrls: ['./create-mosaic.component.css']
})
export class CreateMosaicComponent implements OnInit, OnDestroy {

  paramsHeader: HeaderServicesInterface = {
    moduleName: 'Mosaics',
    componentName: 'Create',
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
  blockSend = false;
  transactionSigned: SignedTransaction[] = [];
  transactionReady: SignedTransaction[] = [];
  subscribe = ['transactionStatus'];
  rentalFee = 4576;
  calculateRentalFee = '10,000.000000';
  currentAccount: AccountsInterface;
  insufficientBalance = true;
  accountInfo: AccountsInfoInterface;
  deltaSupply: number;
  invalidDivisibility: boolean;
  // invalidSupply: boolean;
  blockButton: boolean;
  errorDivisibility: string;
  errorSupply: string;
  maxLengthSupply = 13;
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
  fee: any = '0.000000';
  amountAccount: number;
  notExpire: any;
  subscription: Subscription[] = [];
  vestedBalance: { part1: string; part2: string; };
  passwordMain = 'password';
  invalidSupply: boolean;
  sender: AccountsInterface = null;
  typeTx = 1; // 1 simple, 2 multisig
  insufficientBalanceCosignatory = false;
  cosignatory: AccountsInterface = null;
  showSelectAccount = true;
  isMultisig = false;
  transactionHttp: TransactionHttp = null;

  constructor(
    private fb: FormBuilder,
    private proximaxProvider: ProximaxProvider,
    private walletService: WalletService,
    private dataBridge: DataBridgeService,
    private sharedService: SharedService,
    private transactionService: TransactionsService,
    private mosaicServices: MosaicService,
    private nodeService: NodeService
  ) {
  }

  ngOnInit() {
    this.configurationForm = this.sharedService.configurationForm;
    this.transactionHttp = new TransactionHttp(environment.protocol + '://' + `${this.nodeService.getNodeSelected()}`);
    this.createForm();
    this.subscribeValue();

    // this.balance();
    this.walletService.getAccountsInfo$().subscribe(
      x => this.validateBalance()
    );

    // this.calculateRentalFee = this.transactionService.amountFormatterSimple(Number(this.rentalFee));
    // this.mosaicForm.disable();
  }

  ngOnDestroy(): void {
    this.subscribe.forEach(element => {
      if (this.subscribe[element] !== undefined) {
        this.subscribe[element].unsubscribe();
      }
    });
  }

  /**
   *
   *
   * @param {SignedTransaction} signedTransaction
   * @memberof CreateMosaicComponent
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
   * @param {number} amount
   * @returns
   * @memberof CreateMosaicComponent
   */
  async validateRentalFee(amount: number) {
    const accountInfo = this.walletService.filterAccountInfo();
    if (accountInfo && accountInfo.accountInfo && accountInfo.accountInfo.mosaics && accountInfo.accountInfo.mosaics.length > 0) {
      const xpxInBalance = accountInfo.accountInfo.mosaics.find(element => {
        return element.id.toHex() === new MosaicId(environment.mosaicXpxInfo.id).toHex();
      });

      if (xpxInBalance) {
        const invalidBalance = xpxInBalance.amount.compact() < amount;
        const mosaic = await this.mosaicServices.filterMosaics([xpxInBalance.id]);
        if (mosaic && mosaic[0].mosaicInfo) {
          this.calculateRentalFee = this.transactionService.amountFormatterSimple(amount);
        } else {
          this.insufficientBalance = true;
        }

        if (invalidBalance) {
          this.insufficientBalance = false;
        } else if (!invalidBalance) {
          this.insufficientBalance = false;
        }

        return;
      }
    }

    this.insufficientBalance = true;
  }


  /**
   *
   *
   * @memberof CreateMosaicComponent
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
   *
   *
   * @param {*} account
   * @param {*} params
   * @memberof CreateMosaicComponent
   */
  buildMosaicDefinition(publicAccount: PublicAccount, params: any) {
    const mosaicDefinitionTransaction = this.proximaxProvider.buildMosaicDefinition(params);
    const mosaicSupplyChangeTransaction = this.proximaxProvider.buildMosaicSupplyChange(
      mosaicDefinitionTransaction.mosaicId,
      MosaicSupplyType.Increase,
      UInt64.fromUint(this.deltaSupply),
      this.walletService.currentAccount.network
    );

    this.aggregateTransaction = AggregateTransaction.createComplete(
      Deadline.create(environment.deadlineTransfer.deadline, environment.deadlineTransfer.chronoUnit),
      [
        mosaicDefinitionTransaction.toAggregate(publicAccount),
        mosaicSupplyChangeTransaction.toAggregate(publicAccount)
      ],
      this.walletService.currentAccount.network,
      []
    );
    this.fee = this.transactionService.amountFormatterSimple(this.aggregateTransaction.maxFee.compact());
  }

  /**
   *
   *
   * @param {*} inputType
   * @memberof CreateMosaicComponent
   */
  changeInputType(inputType: string) {
    const newType = this.sharedService.changeInputType(inputType);
    this.passwordMain = newType;
  }

  /**
   * Create form namespace
   *
   * @memberof CreateMosaicComponent
   */
  createForm() {
    this.mosaicForm = this.fb.group({
      deltaSupply: ['', [Validators.required]],
      password: ['', [
        Validators.required,
        Validators.minLength(this.configurationForm.passwordWallet.minLength),
        Validators.maxLength(this.configurationForm.passwordWallet.maxLength)
      ]],
      duration: [''],
      divisibility: ['', [Validators.required]],
      notExpire: [true],
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

    this.calculateRentalFee = '10,000.000000';
    this.optionsSuply = {
      prefix: '',
      thousands: ',',
      decimal: '.',
      precision: '0'
    };
    this.invalidSupply = false;
    this.mosaicForm.reset({
      deltaSupply: '',
      password: '',
      duration: '',
      divisibility: '',
      transferable: false,
      supplyMutable: false,
      notExpire: true,
    }, {
      emitEvent: false
    });
  }

  /**
   *
   *
   * @memberof CreateMosaicComponent
   */
  cleanCheck() {
    this.divisibility = '';
    this.transferable = false;
    this.supplyMutable = false;
  }

  /**
   *
   *
   * @returns
   * @memberof CreateMosaicComponent
   */
  getParams() {
    const account = this.proximaxProvider.getPublicAccountFromPrivateKey(
      this.sender.publicAccount.publicKey,
      this.walletService.currentAccount.network
    );

    // tslint:disable-next-line: radix
    const duration = (this.mosaicForm.get('duration').enabled) ? parseInt(this.durationByBlock) : undefined;
    return {
      nonce: null,
      owner: account,
      supplyMutable: '',
      transferable: '',
      divisibility: '',
      duration,
      network: this.walletService.currentAccount.network
    };
  }

  /**
   *
   *
   * @memberof CreateMosaicComponent
   */
  subscribeValue() {
    this.mosaicForm.get('supplyMutable').valueChanges.subscribe(supplyMutable => {
      if (this.sender) {
        const params = this.getParams();
        this.supplyMutable = supplyMutable;
        params.supplyMutable = this.supplyMutable;
        params.nonce = this.proximaxProvider.createNonceRandom();
        this.buildMosaicDefinition(params.owner, params);
      }
    });

    this.mosaicForm.get('divisibility').valueChanges.subscribe(divisibility => {
      if (this.sender) {
        const params = this.getParams();
        this.divisibility = divisibility;
        params.divisibility = this.divisibility;
        params.nonce = this.proximaxProvider.createNonceRandom();
        this.buildMosaicDefinition(params.owner, params);

        if (divisibility > 6) {
          this.maxLengthSupply = 13;
          this.errorDivisibility = '-invalid';
          this.invalidDivisibility = true;
          this.blockButton = true;
        } else {
          this.optionsSuply = {
            prefix: '',
            thousands: ',',
            decimal: '.',
            precision: divisibility
          };
          this.invalidSupply = false;
          this.maxLengthSupply = 13 + parseFloat(divisibility);
          this.errorDivisibility = '';
          this.blockButton = false;
          this.invalidDivisibility = false;
        }
      }
    });

    this.mosaicForm.get('transferable').valueChanges.subscribe(transferable => {
      if (this.sender) {
        const params = this.getParams();
        this.transferable = transferable;
        params.transferable = this.transferable;
        params.nonce = this.proximaxProvider.createNonceRandom();
        this.buildMosaicDefinition(params.owner, params);
      }
    });

    this.mosaicForm.get('deltaSupply').valueChanges.subscribe(next => {
      if (parseFloat(next) <= this.configurationForm.mosaicWallet.maxSupply) {
        if (next === 0) {
          this.invalidSupply = true;
        } else {
          this.invalidSupply = false;
        }

        // this.invalidSupply = false;
        this.blockButton = false;
        this.errorSupply = '';

        if (!this.mosaicForm.get('divisibility').value) {
          // tslint:disable-next-line: radix
          this.deltaSupply = parseInt(next);
        } else {
          // tslint:disable-next-line: radix
          this.deltaSupply = parseInt(this.transactionService.addZeros(this.mosaicForm.get('divisibility').value, next));
        }
      } else {
        this.errorSupply = '-invalid';
        this.blockButton = true;
        // this.invalidSupply = true;
      }
    });

    /*this.mosaicForm.get('duration').valueChanges.subscribe(next => {
      this.durationByBlock = this.transactionService.calculateDurationforDay(next).toString();
      this.validateRentalFee(this.rentalFee * parseFloat(this.durationByBlock));
    });*/
  }

  /**
   *
   *
   * @memberof CreateMosaicComponent
   */
  sendForm() {
    if (this.mosaicForm.valid && !this.blockSend) {
      const validateAmount = this.transactionService.validateBuildSelectAccountBalance(
        this.amountAccount, Number(this.fee), Number(this.calculateRentalFee.replace(/,/g, ''))
      );

      if (validateAmount) {
        const common = {
          password: this.mosaicForm.get('password').value,
          privateKey: ''
        };

        let account = null;
        if (this.typeTx === 1) {
          if (this.walletService.decrypt(common, this.sender)) {
            account = this.proximaxProvider.getAccountFromPrivateKey(common.privateKey, this.walletService.currentAccount.network);
          } else {
            this.blockSend = false;
            return;
          }
        } else if (this.typeTx === 2 && this.cosignatory) {
          if (this.walletService.decrypt(common, this.cosignatory)) {
            account = this.proximaxProvider.getAccountFromPrivateKey(common.privateKey, this.walletService.currentAccount.network);
          } else {
            this.blockSend = false;
            return;
          }
        } else {
          this.sharedService.showWarning('', 'Select a cosignatory');
          return;
        }

        if (account) {
          const duration = undefined;
          const params = {
            owner: this.proximaxProvider.createPublicAccount(
              this.sender.publicAccount.publicKey,
              this.walletService.currentAccount.network
            ),
            supplyMutable: this.mosaicForm.get('supplyMutable').value,
            transferable: this.mosaicForm.get('transferable').value,
            divisibility: this.mosaicForm.get('divisibility').value,
            duration,
            network: this.walletService.currentAccount.network
          };

          const mosaicDefinitionTransaction = this.proximaxProvider.buildMosaicDefinition(params);
          const mosaicSupplyChangeTransaction = this.proximaxProvider.buildMosaicSupplyChange(
            mosaicDefinitionTransaction.mosaicId,
            MosaicSupplyType.Increase,
            UInt64.fromUint(this.deltaSupply),
            this.walletService.currentAccount.network
          );

          const transactions = {
            definition: mosaicDefinitionTransaction,
            supplyChange: mosaicSupplyChangeTransaction
          };


          if (this.typeTx === 1) {
            this.sendTxSimple(account, transactions);
          } else if (this.typeTx === 2) {
            this.sendAggregateBonded(common.privateKey, transactions);
          } else {
            this.sharedService.showWarning('', 'Select a cosignatory');
          }
        }
      } else {
        this.sharedService.showError('', 'Insufficient Balance');
      }
    }
  }

  /**
   *
   *
   * @param {Account} account
   * @param {{ definition: MosaicDefinitionTransaction, supplyChange: MosaicSupplyChangeTransaction }} transactions
   * @memberof CreateMosaicComponent
   */
  sendTxSimple(account: Account, transactions: { definition: MosaicDefinitionTransaction, supplyChange: MosaicSupplyChangeTransaction }) {
    this.blockSend = true;
    const aggregateTransaction = AggregateTransaction.createComplete(
      Deadline.create(),
      [
        transactions.definition.toAggregate(account.publicAccount),
        transactions.supplyChange.toAggregate(account.publicAccount)
      ],
      this.walletService.currentAccount.network,
      []
    );

    // I SIGN THE TRANSACTION
    const generationHash = this.dataBridge.blockInfo.generationHash;
    const signedTransaction = account.sign(aggregateTransaction, generationHash);  // Update-sdk-dragon
    this.transactionSigned.push(signedTransaction);
    this.proximaxProvider.announce(signedTransaction).subscribe(
      async x => {
        if (this.subscribe['transactionStatus'] === undefined || this.subscribe['transactionStatus'] === null) {
          this.getTransactionStatus();
        }

        this.setTimeOutValidate(signedTransaction.hash);
      }, error => {
        this.blockSend = false;
      }
    );
  }

  /**
   *
   *
   * @memberof CreateMosaicComponent
   */
  sendAggregateBonded(pvk: any, transactions: { definition: MosaicDefinitionTransaction, supplyChange: MosaicSupplyChangeTransaction }) {
    const innerTransaction = [{
      signer: this.sender.publicAccount,
      tx: transactions.definition
    }, {
      signer: this.sender.publicAccount,
      tx: transactions.supplyChange
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
              this.blockSend = false;
              setTimeout(() => {
                this.announceAggregateBonded(aggregateSigned);
                this.blockSend = false;
                hashLockSigned = null;
              }, environment.delayBetweenLockFundABT);
            } else if (statusTransaction['type'] === 'status' && match) {
              this.blockSend = false;
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
   * @param {string} hash
   * @memberof CreateMosaicComponent
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
        this.sharedService.showWarning('', 'Error connecting to the node');
      }
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
          for (const element of this.transactionSigned) {
            const match = statusTransaction['hash'] === element.hash;
            if (match) {
              this.transactionReady.push(element);
              this.blockSend = false;
              this.clearForm();
              this.cleanCheck();
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
   * @memberof CreateMosaicComponent
   */
  getQuantity(quantity: string) {
    return this.sharedService.amountFormat(quantity);
  }


  /**
   *
   *
   * @param {AccountsInterface} account
   * @memberof CreateMosaicComponent
   */
  selectAccountDebitFunds(account: AccountsInterface) {
    setTimeout(() => {
      const amountAccount = this.walletService.getAmountAccount(account.address);
      this.amountAccount = Number(this.transactionService.amountFormatterSimple(amountAccount).replace(/,/g, ''));
      this.sender = account;
      this.typeTx = (this.transactionService.validateIsMultisigAccount(this.sender)) ? 2 : 1;
      this.validateBalance();
    });
  }

  /**
   *
   *
   * @param {{ disabledForm: boolean, cosignatory: AccountsInterface }} event
   * @memberof CreateMosaicComponent
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
   * @memberof CreateMosaicComponent
   */
  validateBalance() {
    this.mosaicForm.disable();
    if (this.sender) {
      this.accountInfo = this.walletService.filterAccountInfo(this.sender.name);
      if (this.accountInfo && this.accountInfo.accountInfo && this.accountInfo.accountInfo.mosaics && this.accountInfo.accountInfo.mosaics.length > 0) {
        const mosaicXPX = this.accountInfo.accountInfo.mosaics.find(x => x.id.toHex() === environment.mosaicXpxInfo.id);
        if (mosaicXPX) {
          const amountMosaicXpx = this.transactionService.amountFormatterSimple(mosaicXPX.amount.compact()).replace(/,/g, '');
          const rentalFee = this.calculateRentalFee.replace(/,/g, '');
          if (Number(amountMosaicXpx) >= (Number(rentalFee) + Number(this.fee))) {
            this.insufficientBalance = false;
            this.mosaicForm.enable();
            return;
          }
        }
      }

      this.insufficientBalance = true;
      return;
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


  /**
   *
   *
   * @param {*} e
   * @memberof CreateMosaicComponent
   */
  limitLength(e: { target: { value: string; }; }) {
    // tslint:disable-next-line: radix
    if (isNaN(parseInt(e.target.value))) {
      e.target.value = '';
    } else {
      // tslint:disable-next-line: radix
      if (parseInt(e.target.value) > 6) {
        e.target.value = '';
        // tslint:disable-next-line: radix
      } else if (parseInt(e.target.value) < 0) {
        e.target.value = '';
      }
    }
  }

  /**
   *
   *
   * @memberof CreateMosaicComponent
   */
  /*noExpite() {
    const accountInfo = this.walletService.filterAccountInfo();
    if (accountInfo && accountInfo.accountInfo && accountInfo.accountInfo.mosaics && accountInfo.accountInfo.mosaics.length > 0) {
      const xpxInBalance = accountInfo.accountInfo.mosaics.find(element => {
        return element.id.toHex() === new MosaicId(environment.mosaicXpxInfo.id).toHex();
      });

      const invalidBalance = xpxInBalance.amount.compact() < 10000000;
      if (invalidBalance) {
        this.insufficientBalance = true;
      } else {
        this.calculateRentalFee = '10.000000';
        this.insufficientBalance = false;
      }
    }
  }*/
}
