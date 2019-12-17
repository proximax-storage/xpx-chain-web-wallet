import { Component, OnInit, OnDestroy } from '@angular/core';
import { SignedTransaction, RegisterNamespaceTransaction, Account, TransactionHttp } from 'tsjs-xpx-chain-sdk';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppConfig } from '../../../config/app.config';
import { DataBridgeService } from '../../../shared/services/data-bridge.service';
import { WalletService, AccountsInterface } from '../../../wallet/services/wallet.service';
import { ProximaxProvider } from '../../../shared/services/proximax.provider';
import { SharedService, ConfigurationForm } from '../../../shared/services/shared.service';
import { NamespacesService } from '../../../servicesModule/services/namespaces.service';
import { TransactionsService } from '../../../transactions/services/transactions.service';
import { HeaderServicesInterface } from '../../../servicesModule/services/services-module.service';
import { environment } from '../../../../environments/environment';
import { NodeService } from '../../../servicesModule/services/node.service';

@Component({
  selector: 'app-create-namespace',
  templateUrl: './create-namespace.component.html',
  styleUrls: ['./create-namespace.component.css']
})
export class CreateNamespaceComponent implements OnInit, OnDestroy {
  @BlockUI() blockUI: NgBlockUI;
  arrayselect: Array<object> = [{
    value: '1',
    label: 'New Root Namespace',
    selected: true,
    disabled: false
  }];

  accounts: any = [];
  amountAccount: number;
  block: number = null;
  blockBtnSend = false;
  calculateRentalFee: any = '0.000000';
  configurationForm: ConfigurationForm = {};
  cosignatory: AccountsInterface = null;
  isMultisig = false;
  insufficientBalanceCosignatory = false;
  duration: any;
  durationByBlock = '5760';
  endHeight: number;
  fee = '0.000000';
  insufficientBalance = false;
  insufficientBalanceDuration = false;
  minimiumFeeRentalFeeToRoot = 26.393510;
  minimiumFeeRentalFeeToSub = 10000035500;
  namespaceChangeInfo: any;
  namespaceInfo: Array<object> = [];
  namespaceForm: FormGroup;
  namespace: Array<object> = [];
  namespaceName: any;
  namespaceRoot: any;
  labelNamespace = '';
  listCosignatorie: any = [];
  lengthNamespace: number;
  paramsHeader: HeaderServicesInterface = {
    moduleName: 'Namespaces',
    componentName: 'Register'
  };

  passwordMain = 'password';
  registerRootNamespaceTransaction: RegisterNamespaceTransaction;
  registersubamespaceTransaction: RegisterNamespaceTransaction;
  rentalFee = 4576;
  sender: AccountsInterface = null;
  status = true;
  startHeight: number;
  statusButtonNamespace = true;
  showDuration = true;
  showSelectAccount = true;
  subscription: Subscription[] = [];
  transactionHttp: TransactionHttp = null;
  transactionSigned: SignedTransaction[] = [];
  transactionReady: SignedTransaction[] = [];
  transactionStatus = false;
  typeNamespace = 1;
  typeTx = 1; // 1 simple, 2 multisig
  validateForm = false;

  constructor(
    private nodeService: NodeService,
    private fb: FormBuilder,
    private walletService: WalletService,
    private proximaxProvider: ProximaxProvider,
    private sharedService: SharedService,
    private router: Router,
    private namespaceService: NamespacesService,
    private transactionService: TransactionsService,
    private dataBridge: DataBridgeService
  ) { }


  ngOnInit() {
    this.configurationForm = this.sharedService.configurationForm;
    this.lengthNamespace = this.configurationForm.namespaceName.maxLength;
    this.createForm();
    this.subscribeValueChange();
    this.showSelectAccount = true;
    this.transactionHttp = new TransactionHttp(environment.protocol + '://' + `${this.nodeService.getNodeSelected()}`);
    /*
    this.amountAccount = this.walletService.getAmountAccount();
    this.durationByBlock = this.transactionService.calculateDurationforDay(this.namespaceForm.get('duration').value).toString();
    this.validateRentalFee();
    this.getNamespaces();
    this.subscribeValueChange();*/
  }

  ngOnDestroy(): void {
    this.subscription.forEach(subscription => {
      subscription.unsubscribe();
    });
  }

  /**
   *
   *
   * @param {SignedTransaction} signedTransaction
   * @memberof CreateNamespaceComponent
   */
  announceAggregateBonded(signedTransaction: SignedTransaction) { // change
    this.transactionHttp.announceAggregateBonded(signedTransaction).subscribe(
      async () => {
        this.blockBtnSend = false;
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
   * @param {*} inputType
   * @memberof CreateNamespaceComponent
   */
  changeInputType(inputType: any) {
    const newType = this.sharedService.changeInputType(inputType);
    this.passwordMain = newType;
  }

  /**
   *
   *
   * @memberof CreateNamespaceComponent
   */
  createForm() {
    // Form namespace default
    this.namespaceForm = this.fb.group({
      name: ['', [
        Validators.required,
        Validators.minLength(this.configurationForm.namespaceName.minLength),
      ]],

      namespaceRoot: ['1'],

      duration: ['', [
        Validators.required
      ]],

      password: ['', [
        Validators.required,
        Validators.minLength(this.configurationForm.passwordWallet.minLength),
        Validators.maxLength(this.configurationForm.passwordWallet.maxLength)
      ]],
    });
  }

  /**
   *
   *
   * @memberof CreateNamespaceComponent
   */
  createNamespace() {
    if (this.typeTx === 1) {
      this.sendTxSimple();
    } else if (this.typeTx === 2 && this.cosignatory) {
      this.sendAggregateBonded();
    } else {
      this.sharedService.showWarning('', 'Select a cosignatory');
    }
  }

  /**
   *
   *
   * @memberof CreateNamespaceComponent
   */
  sendTxSimple() {
    this.blockBtnSend = true;
    const common = { password: this.namespaceForm.get('password').value, privateKey: '' };
    if (this.walletService.decrypt(common, this.sender)) {
      const signedTransaction = this.signedTransaction(common);
      this.transactionSigned.push(signedTransaction);
      this.proximaxProvider.announce(signedTransaction).subscribe(() => {
        if (!this.transactionStatus) {
          this.getTransactionStatus();
        }

        this.clearForm();
        this.setTimeOutValidate(signedTransaction.hash);
      }, () => {
        this.blockBtnSend = false;
        this.clearForm();
        this.fee = '0.000000';
        this.sharedService.showError('', 'Error connecting to the node');
      }
      );
    } else {
      this.blockBtnSend = false;
    }
  }

  /**
   *
   *
   * @memberof CreateNamespaceComponent
   */
  sendAggregateBonded() {
    this.blockBtnSend = true;
    const common = { password: this.namespaceForm.get('password').value, privateKey: '' };
    if (this.walletService.decrypt(common, this.cosignatory)) {
      const innerTransaction = (this.typeNamespace === 1) ? [{
        signer: this.sender.publicAccount,
        tx: this.registerRootNamespaceTransaction
      }] : [{
        signer: this.sender.publicAccount,
        tx: this.registersubamespaceTransaction
      }];

      const generationHash = this.dataBridge.blockInfo.generationHash;
      const accountCosignatory = Account.createFromPrivateKey(common.privateKey, this.walletService.currentAccount.network);
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
                this.blockBtnSend = false;
                setTimeout(() => {
                  this.announceAggregateBonded(aggregateSigned);
                  this.blockBtnSend = false;
                  hashLockSigned = null;
                }, environment.delayBetweenLockFundABT);
              } else if (statusTransaction['type'] === 'status' && match) {
                this.blockBtnSend = false;
                this.transactionSigned = this.transactionSigned.filter(el => el.hash !== statusTransaction['hash']);
                hashLockSigned = null;
              }
            }
          }
        );
      }, err => { });
    }
  }


  /**
   *
   *
   * @memberof CreateNamespaceComponent
   */
  clearForm() {
    this.showDuration = true;
    this.insufficientBalance = false;
    this.insufficientBalanceDuration = false;
    this.calculateRentalFee = '0.000000';
    this.fee = '0.000000';
    this.namespaceForm.reset({
      name: '',
      namespaceRoot: '1',
      duration: '',
      password: ''
    }, {
      emitEvent: false
    }
    );
    this.statusButtonNamespace = true;
  }

  /**
   *
   *
   * @memberof CreateNamespaceComponent
   */
  disableForm() {
    if (this.namespaceForm.enabled) {
      this.namespaceForm.disable();
    }
  }

  /**
   *
   *
   * @memberof CreateNamespaceComponent
   */
  enableForm() {
    if (this.namespaceForm.disabled) {
      this.namespaceForm.enable();
    }
  }

  /**
   *
   *
   * @param {AccountsInterface} account
   * @memberof CreateNamespaceComponent
   */
  getNamespaces(account: AccountsInterface) {
    this.subscription.push(this.namespaceService.getNamespaceChanged().subscribe(
      async namespaceInfoData => {
        const namespaceInfo = this.namespaceService.filterNamespacesFromAccount(account.publicAccount.publicKey);
        this.namespace = [];
        this.namespaceInfo = [];
        if (namespaceInfo !== null && namespaceInfo !== undefined) {
          for (const data of namespaceInfo) {
            let rootResponse = null;
            if (data.namespaceInfo.depth === 1) {
              rootResponse = this.namespaceService.getRootNamespace(data, data.namespaceInfo.active, this.namespace, this.namespaceInfo);
            } else {
              rootResponse = this.namespaceService.getSubNivelNamespace(data, data.namespaceInfo.active, data.namespaceInfo.depth, this.namespace, this.namespaceInfo);
            }

            this.namespace = rootResponse.currentNamespace;
            this.namespaceInfo = rootResponse.namespaceInfo;
          }

          const arrayNamespaces = this.namespace.sort((a: any, b: any) => {
            return a.label === b.label ? 0 : +(a.label > b.label) || -1;
          });

          this.arrayselect = [{
            value: '1',
            label: 'New Root Namespace',
            selected: true,
            disabled: false
          }];

          this.arrayselect = this.arrayselect.concat(arrayNamespaces);
        }
      }, error => {
        this.blockUI.stop();
        this.router.navigate([AppConfig.routes.home]);
        this.sharedService.showError('', 'Check your connection and try again');
      }
    ));
  }

  /**
   *
   *
   * @param {string} quantity
   * @returns
   * @memberof CreateNamespaceComponent
   */
  getQuantity(quantity: string) {
    return this.sharedService.amountFormat(quantity);
  }

  /**
   *
   *
   * @param {*} e
   * @memberof CreateNamespaceComponent
   */
  limitDuration(e: any) {
    // tslint:disable-next-line: radix
    if (isNaN(parseInt(e.target.value))) {
      e.target.value = '';
      this.namespaceForm.get('duration').setValue('');
    } else {
      // tslint:disable-next-line: radix
      if (parseInt(e.target.value) > 365) {
        e.target.value = '365';
      // tslint:disable-next-line: radix
      } else if (parseInt(e.target.value) < 1) {
        e.target.value = '';
        this.namespaceForm.get('duration').setValue('');
      }
    }
  }

  /**
   *
   *
   * @memberof CreateNamespaceComponent
   */
  selectCosignatory(event: { disabledForm: boolean, cosignatory: AccountsInterface }) {
    if (event) {
      if (event.disabledForm) {
        this.insufficientBalanceCosignatory = true;
        this.disableForm();
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
   * @param {*} common
   * @returns {Promise<any>}
   * @memberof CreateNamespaceComponent
   */
  signedTransaction(common: any): SignedTransaction {
    let signedTransaction = null;
    const account = this.proximaxProvider.getAccountFromPrivateKey(common.privateKey, this.walletService.currentAccount.network);
    const generationHash = this.dataBridge.blockInfo.generationHash;
    if (this.typeNamespace === 1) {
      signedTransaction = account.sign(this.registerRootNamespaceTransaction, generationHash); // Update-sdk-dragon
    } else if (this.typeNamespace === 2) {
      signedTransaction = account.sign(this.registersubamespaceTransaction, generationHash); // Update-sdk-dragon
    }

    return signedTransaction;
  }

  /**
   *
   *
   * @param {AccountsInterface} event
   * @memberof CreateNamespaceComponent
   */
  selectAccountDebitFunds(account: AccountsInterface) {
    setTimeout(() => {
      const amountAccount = this.walletService.getAmountAccount(account.address);
      this.amountAccount = Number(this.transactionService.amountFormatterSimple(amountAccount).replace(/,/g, ''));
      this.sender = account;
      this.typeTx = (this.transactionService.validateIsMultisigAccount(this.sender)) ? 2 : 1;
      this.getNamespaces(account);
      this.validateRentalFee();
      this.validateFee();
    });
  }

  /**
   *
   *
   * @memberof CreateNamespaceComponent
   */
  subscribeValueChange() {
    // Duration ValueChange
    this.namespaceForm.get('duration').valueChanges.subscribe(next => {
      if (next <= 365) {
        if (next !== null && next !== undefined && String(next) !== '0' && next !== '') {
          if (this.showDuration) {
            this.durationByBlock = this.transactionService.calculateDurationforDay(next).toString();
            this.validateRentalFee();
          }
        } else {
          this.calculateRentalFee = '0.000000';
        }
      } else {
        this.durationByBlock = this.transactionService.calculateDurationforDay(365).toString();
        this.validateRentalFee();
      }

      this.duration = parseFloat(this.durationByBlock);
      this.validateFee();
    });

    // namespaceRoot ValueChange
    this.namespaceForm.get('namespaceRoot').valueChanges.subscribe(namespaceRoot => {
      if (namespaceRoot === null || namespaceRoot === undefined) {
        this.namespaceForm.get('namespaceRoot').setValue('1');
      } else if (namespaceRoot === '' || namespaceRoot === '1') {
        this.typeNamespace = 1;
        this.lengthNamespace = this.configurationForm.namespaceName.maxLength;
        this.namespaceForm.get('duration').setValidators([Validators.required]);
        this.showDuration = true;
        this.durationByBlock = this.transactionService.calculateDurationforDay(this.namespaceForm.get('duration').value).toString();
        this.validateRentalFee();
      } else {
        this.typeNamespace = 2;
        this.lengthNamespace = this.configurationForm.subNamespaceName.maxLength;
        this.namespaceForm.get('duration').patchValue('');
        this.namespaceForm.get('duration').clearValidators();
        this.namespaceForm.get('duration').updateValueAndValidity();
        this.showDuration = false;
        this.durationByBlock = '0';
        this.calculateRentalFee = '10.000000';
        this.validateRentalFee();
      }

      this.validateFee();
    });

    // NamespaceName ValueChange
    this.namespaceForm.get('name').valueChanges.subscribe(name => {
      const formatter = name.toLowerCase().replace(/[^a-z0-9]/gi, '').trim();
      if (formatter !== name) {
        this.namespaceForm.get('name').setValue(formatter);
      }

      this.namespaceName = formatter;
      this.validateFee();
    });
  }

  /**
   *
   *
   * @param {string} hash
   * @memberof CreateNamespaceComponent
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
        this.blockBtnSend = false;
        this.sharedService.showWarning('', 'An error has occurred');
      }
    }, 5000);
  }

  /**
   *
   *
   * @memberof CreateNamespaceComponent
   */
  validateFee() {
    if (this.namespaceName !== undefined && this.namespaceName !== '') {
      if (this.typeNamespace === 1) {
        this.registerRootNamespaceTransaction = this.proximaxProvider.registerRootNamespaceTransaction(
          this.namespaceName,
          this.walletService.currentAccount.network,
          this.duration
        );

        this.fee = this.transactionService.amountFormatterSimple(this.registerRootNamespaceTransaction.maxFee.compact());
      } else if (this.typeNamespace === 2) {
        const rootNamespaceName = this.namespaceForm.get('namespaceRoot').value;
        this.registersubamespaceTransaction = this.proximaxProvider.registersubNamespaceTransaction(
          rootNamespaceName,
          this.namespaceName,
          this.walletService.currentAccount.network
        );

        this.fee = this.transactionService.amountFormatterSimple(this.registersubamespaceTransaction.maxFee.compact());
      }
    } else {
      this.fee = '0.000000';
    }

    const validateAmount = this.transactionService.validateBuildSelectAccountBalance(
      this.amountAccount,
      Number(this.fee),
      Number(this.calculateRentalFee.replace(/,/g, ''))
    );
    if (!validateAmount) {
      this.insufficientBalance = true;
      this.insufficientBalanceDuration = false;
    } else {
      this.validateRentalFee();
    }
  }

  /**
   *
   *
   * @memberof CreateNamespaceComponent
   */
  validateRentalFee() {
    const amount = this.rentalFee * parseFloat(this.durationByBlock);
    this.calculateRentalFee = this.transactionService.amountFormatterSimple(amount);
    if (this.namespaceForm.get('namespaceRoot').value === '' || this.namespaceForm.get('namespaceRoot').value === '1') {
      if (this.amountAccount < this.minimiumFeeRentalFeeToRoot) {
        // ********** INSUFFICIENT BALANCE*************
        this.insufficientBalance = true;
        this.insufficientBalanceDuration = false;
        this.disableForm();
      } else {
        if (this.amountAccount < Number(this.calculateRentalFee)) {
          // **********DURATION INSUFFICIENT BALANCE*************
          this.insufficientBalance = false;
          this.insufficientBalanceDuration = true;
        } else {
          if (!this.insufficientBalanceCosignatory) {
            this.insufficientBalance = false;
            this.insufficientBalanceDuration = false;
            this.enableForm();
          }
        }
      }
    } else {
      const invalidBalance = this.amountAccount < Number(this.transactionService.amountFormatterSimple(this.minimiumFeeRentalFeeToSub));
      if (invalidBalance) {
        // **********DURATION INSUFFICIENT BALANCE*************
        this.insufficientBalance = true;
        this.insufficientBalanceDuration = false;
      } else {
        if (!this.insufficientBalanceCosignatory) {
          this.calculateRentalFee = '10,000.000000';
          this.insufficientBalance = false;
          this.insufficientBalanceDuration = false;
          this.enableForm();
        }
      }
    }
  }

  /**
   *
   *
   * @param {string} [nameInput='']
   * @param {string} [nameControl='']
   * @param {string} [nameValidation='']
   * @returns
   * @memberof CreateNamespaceComponent
   */
  validateInput(nameInput: string = '', nameControl: string = '', nameValidation: string = '') {
    let validation: AbstractControl = null;
    if (nameInput !== '' && nameControl !== '') {
      validation = this.namespaceForm.controls[nameControl].get(nameInput);
    } else if (nameInput === '' && nameControl !== '' && nameValidation !== '') {
      validation = this.namespaceForm.controls[nameControl].getError(nameValidation);
    } else if (nameInput !== '') {
      validation = this.namespaceForm.get(nameInput);
    }
    return validation;
  }

  // ------------------------------------------------------------------------------------------------------------------------




  getTransactionStatus() {
    // Get transaction status
    if (!this.subscription['transactionStatus']) {
      this.subscription['transactionStatus'] = this.dataBridge.getTransactionStatus().subscribe(
        statusTransaction => {
          const response = this.transactionService.validateStatusTx(statusTransaction, this.transactionSigned, this.transactionReady);
          if (response) {
            this.transactionReady = response.transactionReady;
            this.blockBtnSend = response.statusBtn;
            this.transactionSigned = response.transactionSigned;
          }
        }
      );
    }
  }
}
