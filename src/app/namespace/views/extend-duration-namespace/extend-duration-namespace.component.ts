import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { SignedTransaction, MosaicId, NamespaceInfo, Account, TransactionHttp, UInt64 } from 'tsjs-xpx-chain-sdk';
import { NamespacesService, NamespaceStorageInterface } from '../../../servicesModule/services/namespaces.service';
import { AppConfig } from '../../../config/app.config';
import { DataBridgeService } from '../../../shared/services/data-bridge.service';
import { ProximaxProvider } from '../../../shared/services/proximax.provider';
import { MosaicService } from '../../../servicesModule/services/mosaic.service';
import { SharedService, ConfigurationForm } from '../../../shared/services/shared.service';
import { WalletService, AccountsInterface } from '../../../wallet/services/wallet.service';
import { TransactionsService } from '../../../transactions/services/transactions.service';
import { Subscription } from 'rxjs';
import { HeaderServicesInterface } from '../../../servicesModule/services/services-module.service';
import { environment } from '../../../../environments/environment';
import { NodeService } from 'src/app/servicesModule/services/node.service';

@Component({
  selector: 'app-extend-duration-namespace',
  templateUrl: './extend-duration-namespace.component.html',
  styleUrls: ['./extend-duration-namespace.component.css']
})
export class ExtendDurationNamespaceComponent implements OnInit, OnDestroy {

  arrayselect: Array<object> = [{
    value: '1',
    label: 'New Root Namespace',
    selected: true,
    disabled: false
  }];

  amountAccount: number;
  accountToSelect = null;
  block = 0;
  blockBtnSend = false;
  calculateRentalFee = '0.000000';
  cosignatory: AccountsInterface = null;
  configurationForm: ConfigurationForm = {};
  durationByBlock = '5760';
  endHeight = 0;
  extendNamespaceRootTransaction: any;
  extendDurationNamespaceForm: FormGroup;
  fee = '';
  insufficientBalanceCosignatory = false;
  insufficientBalance = false;
  insufficientBalanceDuration = false;
  namespaceChangeInfo: NamespaceStorageInterface = null;
  namespaceInfo: NamespaceStorageInterface[] = [];
  paramsHeader: HeaderServicesInterface = {
    moduleName: 'Namespaces',
    componentName: 'Extend Duration'
  };
  passwordMain = 'password';

  rentalFee = 4576;
  status = true;
  startHeight = 0;
  sender: AccountsInterface = null;
  showSelectAccount = false;
  statusTransaction = false;
  subscription: Subscription[] = [];
  transactionHttp: TransactionHttp = null;
  transactionSigned: SignedTransaction[] = [];
  transactionReady: SignedTransaction[] = [];
  transactionStatus = false;
  typeTx = 1; // 1 simple, 2 multisig
  subtractionHeight: any;
  totalBlock: any;
  exceededDuration = false;
  invalidDuration = true;
  isMultisig = false;
  noNamespace = false;
  namespaceParam: NamespaceStorageInterface = null;

  constructor(
    private activateRoute: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private sharedService: SharedService,
    private namespaceService: NamespacesService,
    private nodeService: NodeService,
    private dataBridgeService: DataBridgeService,
    private walletService: WalletService,
    private proximaxProvider: ProximaxProvider,
    private transactionService: TransactionsService,
    private mosaicServices: MosaicService
  ) { }


  ngOnInit() {
    if (this.activateRoute.snapshot.paramMap.get('id')) {
      const idUint64 = UInt64.fromHex(this.activateRoute.snapshot.paramMap.get('id'));
      const id = this.proximaxProvider.getNamespaceId([idUint64.lower, idUint64.higher]);
      this.namespaceParam = this.namespaceService.filterNamespaceFromId(id);
      if (this.namespaceParam) {
        this.accountToSelect = this.namespaceParam.namespaceInfo.owner.publicKey;
        this.showSelectAccount = true;
      }
    } else {
      this.showSelectAccount = true;
    }


    this.configurationForm = this.sharedService.configurationForm;
     // update protocol
     this.transactionHttp = new TransactionHttp(this.sharedService.buildUrlBlockchain(`${this.nodeService.getNodeSelected()}`, this.sharedService.hrefProtocol()));
    this.fee = '0.000000';
    this.createForm();
    // this.getNamespaces();
    this.extendDurationNamespaceForm.get('duration').disable();
    // this.amountAccount = this.walletService.getAmountAccount();
    this.durationByBlock = this.transactionService.calculateDurationforDay(this.extendDurationNamespaceForm.get('duration').value).toString();
    this.subscribeValueChange();
  }

  ngOnDestroy(): void {
    this.destroySubscription();
  }

  /**
   *
   *
   * @param {number} amount
   * @memberof ExtendDurationNamespaceComponent
   */
  async validateRentalFee(amount: number) {
    if (this.sender) {
      const accountInfo = this.walletService.filterAccountInfo(this.sender.name);
      if (
        accountInfo && accountInfo.accountInfo &&
        accountInfo.accountInfo.mosaics && accountInfo.accountInfo.mosaics.length > 0
      ) {
        if (accountInfo.accountInfo.mosaics.length > 0) {
          const filtered = accountInfo.accountInfo.mosaics.find(element => {
            return element.id.toHex() === new MosaicId(environment.mosaicXpxInfo.id).toHex();
          });

          if (filtered) {
            const invalidBalance = filtered.amount.compact() < amount;
            const mosaic = await this.mosaicServices.filterMosaics([filtered.id]);
            this.calculateRentalFee = this.transactionService.amountFormatter(amount, mosaic[0].mosaicInfo);
            if (invalidBalance) {
              this.insufficientBalance = false;
              this.insufficientBalanceDuration = true;
            } else {
              this.insufficientBalance = false;
              this.insufficientBalanceDuration = false;
            }
          } else {
            if (this.extendDurationNamespaceForm.enabled) {
              this.extendDurationNamespaceForm.disable();
            }
            this.insufficientBalanceDuration = false;
            this.insufficientBalance = true;
          }
        } else {
          if (this.extendDurationNamespaceForm.enabled) {
            this.extendDurationNamespaceForm.disable();
          }
          this.insufficientBalanceDuration = false;
          this.insufficientBalance = true;
          this.extendDurationNamespaceForm.controls['password'].disable();
        }
      } else {
        if (this.extendDurationNamespaceForm.enabled) {
          this.extendDurationNamespaceForm.disable();
        }
        this.insufficientBalanceDuration = false;
        this.insufficientBalance = true;
      }
    }
  }


  /**
   *
   *
   * @param {SignedTransaction} signedTransaction
   * @memberof ExtendDurationNamespaceComponent
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
   * @memberof ExtendDurationNamespaceComponent
   */
  builder() {
    if (this.extendDurationNamespaceForm.get('namespaceRoot').value !== undefined && this.extendDurationNamespaceForm.get('namespaceRoot').value !== '') {
      this.extendNamespaceRootTransaction = this.proximaxProvider.registerRootNamespaceTransaction(
        this.extendDurationNamespaceForm.get('namespaceRoot').value,
        this.walletService.currentAccount.network,
        parseFloat(this.durationByBlock)
      );

      this.fee = this.transactionService.amountFormatterSimple(this.extendNamespaceRootTransaction.maxFee.compact());
    }
  }

  /**
   *
   *
   * @param {*} inputType
   * @memberof ExtendDurationNamespaceComponent
   */
  changeInputType(inputType: string) {
    const newType = this.sharedService.changeInputType(inputType);
    this.passwordMain = newType;
  }

  /**
   *
   *
   * @memberof ExtendDurationNamespaceComponent
   */
  createForm() {
    // Form Renew Namespace
    this.extendDurationNamespaceForm = this.fb.group({
      namespaceRoot: ['', [Validators.required]],
      duration: ['', [Validators.required]],
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
   * @memberof ExtendDurationNamespaceComponent
   */
  clearForm() {
    this.exceededDuration = false;
    this.extendDurationNamespaceForm.reset({
      namespaceRoot: '',
      duration: '',
      password: ''
    }, { emitEvent: false });


    // if (this.extendDurationNamespaceForm.disabled) {
    //   this.extendDurationNamespaceForm.enable();
    // }

    this.startHeight = 0;
    this.endHeight = 0;
    this.durationByBlock = '0';
    this.calculateRentalFee = '0.000000';
    this.fee = '0.000000';
    this.insufficientBalance = false;
    this.insufficientBalanceDuration = false;
  }


  /**
   *
   *
   * @memberof ExtendDurationNamespaceComponent
   */
  calculateSubtractionHeight() {
    this.subtractionHeight = this.endHeight - this.block;
    this.totalBlock = this.subtractionHeight + Number(this.durationByBlock);
  }

  /**
   *
   *
   * @memberof ExtendDurationNamespaceComponent
   */
  destroySubscription() {
    this.subscription.forEach(subscription => {
      subscription.unsubscribe();
    });
  }

  /**
   *
   *
   * @memberof ExtendDurationNamespaceComponent
   */
  extendDuration() {
    if (this.extendDurationNamespaceForm.valid && !this.blockBtnSend) {
      const validateAmount = this.transactionService.validateBuildSelectAccountBalance(
        this.amountAccount,
        Number(this.fee),
        Number(this.calculateRentalFee.replace(/,/g, '')
        )
      );

      if (validateAmount) {
        if (this.typeTx === 1) {
          this.sendTxSimple();
        } else if (this.typeTx === 2 && this.cosignatory) {
          this.sendAggregateBonded();
        } else {
          this.sharedService.showWarning('', 'Select a cosignatory');
        }



      } else {
        this.sharedService.showError('', 'Insufficient balance');
      }
    }
  }

  /**
   *
   *
   * @memberof ExtendDurationNamespaceComponent
   */
  getTransactionStatus() {
    this.subscription.push(this.dataBridgeService.getTransactionStatus().subscribe(
      statusTransaction => {
        if (statusTransaction !== null && statusTransaction !== undefined && this.transactionSigned !== null) {
          for (const element of this.transactionSigned) {
            const statusTransactionHash = statusTransaction.hash;
            const match = statusTransactionHash === element.hash;
            if (match) {
              this.blockBtnSend = false;
              this.clearForm();
              this.transactionReady.push(element);
            }

            if (statusTransaction['type'] === 'confirmed' && match) {
              this.transactionSigned = this.transactionSigned.filter(el => el.hash !== statusTransactionHash);
            } else if (statusTransaction['type'] === 'unconfirmed' && match) {
            } else if (match) {
              this.transactionSigned = this.transactionSigned.filter(el => el.hash !== statusTransactionHash);
            }
          }
        }
      }
    ));
  }

  /**
   *
   *
   * @memberof ExtendDurationNamespaceComponent
   */
  getNamespaces(account: AccountsInterface) {
    this.extendDurationNamespaceForm.get('namespaceRoot').setValue('');
    this.subscription.push(this.namespaceService.getNamespaceChanged().subscribe(
      async namespaceInfoData => {
        const namespaceInfo = this.namespaceService.filterNamespacesFromAccount(account.publicAccount.publicKey);
        this.namespaceInfo = namespaceInfo;
        if (namespaceInfo !== undefined && namespaceInfo !== null && namespaceInfo.length > 0) {
          const arrayselect = [];
          for (const namespaceRoot of namespaceInfo) {
            if (namespaceRoot.namespaceInfo.depth === 1) {
              const buildedArray = {
                id: `${this.proximaxProvider.getNamespaceId(namespaceRoot.id).toHex()}`,
                value: `${namespaceRoot.namespaceName.name}`,
                label: `${namespaceRoot.namespaceName.name}`,
                selected: false,
                disabled: false
              };

              arrayselect.push(buildedArray);
              this.arrayselect.push({
                name: `${namespaceRoot.namespaceName.name}`,
                dataNamespace: namespaceRoot
              });

              this.noNamespace = false;
              this.extendDurationNamespaceForm.enable();
            }
          }

          if (arrayselect) {
            if (this.accountToSelect && namespaceInfo.find(x => x.namespaceInfo.owner.publicKey === this.accountToSelect)) {
              this.extendDurationNamespaceForm.get('namespaceRoot').setValue(this.namespaceParam.namespaceName.name);
              this.durationByBlock = this.transactionService.calculateDurationforDay(this.extendDurationNamespaceForm.get('duration').value).toString();
              this.validateRentalFee(this.rentalFee * parseFloat(this.durationByBlock));
              this.optionSelected({
                id: this.namespaceParam.idToHex,
                value: this.namespaceParam.namespaceName.name
              });
            } else {
              this.extendDurationNamespaceForm.get('namespaceRoot').setValue('');
            }
          }

          this.arrayselect = arrayselect;
        } else {
          this.noNamespace = true;
          this.extendDurationNamespaceForm.disable();
        }
      }, error => {
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
   * @memberof ExtendDurationNamespaceComponent
   */
  getQuantity(quantity: string) {
    return this.sharedService.amountFormat(quantity);
  }

  /**
   *
   *
   * @param {*} e
   * @memberof ExtendDurationNamespaceComponent
   */
  limitDuration(e: any) {
    // tslint:disable-next-line: radix
    if (isNaN(parseInt(e.target.value))) {
      e.target.value = '';
      this.extendDurationNamespaceForm.get('duration').setValue('');
    } else {
      // tslint:disable-next-line: radix
      if (parseInt(e.target.value) > 365) {
        // this.exceededDuration = true;
        e.target.value = '365';
        // tslint:disable-next-line: radix
      } else if (parseInt(e.target.value) < 1) {
        e.target.value = '';
        this.extendDurationNamespaceForm.get('duration').setValue('');
      }
    }
  }

  /**
   *
   *
   * @param {*} namespace
   * @memberof ExtendDurationNamespaceComponent
   */
  optionSelected($event: any) {
    if ($event && $event.value !== '1') {
      this.extendDurationNamespaceForm.get('duration').enable();
      this.namespaceChangeInfo = this.namespaceInfo.find(namespace =>
        this.proximaxProvider.getNamespaceId(namespace.id).toHex() === $event.id
      );

      // console.log('this.namespaceChangeInfo ---> ', this.namespaceChangeInfo);
      if (this.namespaceChangeInfo) {
        this.startHeight = this.namespaceChangeInfo.namespaceInfo.startHeight.lower;
        this.endHeight = this.namespaceChangeInfo.namespaceInfo.endHeight.lower;
        this.calculateSubtractionHeight();
      }
      this.builder();
      this.invalidDuration = false;
    } else {
      this.extendDurationNamespaceForm.get('duration').disable();
      this.extendDurationNamespaceForm.get('duration').patchValue('');
      this.startHeight = 0;
      this.endHeight = 0;

    }
  }

  /**
   *
   *
   * @param {string} [nameInput='']
   * @param {string} [nameControl='']
   * @param {string} [nameValidation='']
   * @returns
   * @memberof ExtendDurationNamespaceComponent
   */
  validateInput(nameInput: string = '', nameControl: string = '', nameValidation: string = '') {
    let validation: AbstractControl = null;
    if (nameInput !== '' && nameControl !== '') {
      validation = this.extendDurationNamespaceForm.controls[nameControl].get(nameInput);
    } else if (nameInput === '' && nameControl !== '' && nameValidation !== '') {
      validation = this.extendDurationNamespaceForm.controls[nameControl].getError(nameValidation);
    } else if (nameInput !== '') {
      validation = this.extendDurationNamespaceForm.get(nameInput);
    }
    return validation;
  }

  /**
   *
   *
   * @param {string} hash
   * @memberof ExtendDurationNamespaceComponent
   */
  setTimeOutValidate(hash: string) {
    setTimeout(() => {
      let exist = false;
      for (const element of this.transactionReady) {
        if (hash === element.hash) {
          exist = true;
        }
      }

      // tslint:disable-next-line: no-unused-expression
      (exist) ? '' : this.sharedService.showWarning('', 'An error has occurred');
    }, 5000);
  }

  /**
   *
   *
   * @memberof ExtendDurationNamespaceComponent
   */
  sendTxSimple() {
    this.blockBtnSend = true;
    const common = {
      password: this.extendDurationNamespaceForm.get('password').value,
      privateKey: ''
    };

    if (this.walletService.decrypt(common, this.sender)) {
      const signedTransaction = this.signedTransaction(common);
      this.transactionSigned.push(signedTransaction);
      this.proximaxProvider.announce(signedTransaction).subscribe(
        () => {
          this.startHeight = 0;
          this.endHeight = 0;
          if (this.statusTransaction === false) {
            this.statusTransaction = true;
            this.getTransactionStatus();
          }

          this.setTimeOutValidate(signedTransaction.hash);
        }, () => {
          this.blockBtnSend = false;
          this.clearForm();
        }
      );
    } else {
      this.blockBtnSend = false;
    }
  }

  /**
   *
   *
   * @memberof ExtendDurationNamespaceComponent
   */
  sendAggregateBonded() {
    this.blockBtnSend = true;
    const common = {
      password: this.extendDurationNamespaceForm.get('password').value,
      privateKey: ''
    };

    if (this.walletService.decrypt(common, this.cosignatory)) {
      const innerTransaction = [{
        signer: this.sender.publicAccount,
        tx: this.extendNamespaceRootTransaction
      }];

      const generationHash = this.dataBridgeService.blockInfo.generationHash;
      const accountCosignatory = Account.createFromPrivateKey(common.privateKey, this.walletService.currentAccount.network);
      const aggregateSigned = this.transactionService.buildAggregateTransaction(accountCosignatory, innerTransaction, generationHash);
      let hashLockSigned = this.transactionService.buildHashLockTransaction(aggregateSigned, accountCosignatory, generationHash);
      this.transactionService.buildTransactionHttp().announce(hashLockSigned).subscribe(async () => {
        this.clearForm();
        this.subscription['getTransactionStatushashLock'] = this.dataBridgeService.getTransactionStatus().subscribe(
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
   * @param {*} common
   * @returns {SignedTransaction}
   * @memberof ExtendDurationNamespaceComponent
   */
  signedTransaction(common: any): SignedTransaction {
    const account = this.proximaxProvider.getAccountFromPrivateKey(common.privateKey, this.walletService.currentAccount.network);
    const generationHash = this.dataBridgeService.blockInfo.generationHash;
    const signedTransaction = account.sign(this.extendNamespaceRootTransaction, generationHash);  // Update-sdk-dragon
    return signedTransaction;
  }

  /**
   *
   *
   * @param {AccountsInterface} account
   * @memberof ExtendDurationNamespaceComponent
   */
  selectAccountDebitFunds(account: AccountsInterface) {
    setTimeout(() => {
      const amountAccount = this.walletService.getAmountAccount(account.address);
      this.amountAccount = Number(this.transactionService.amountFormatterSimple(amountAccount).replace(/,/g, ''));
      this.sender = account;
      this.typeTx = (this.transactionService.validateIsMultisigAccount(this.sender)) ? 2 : 1;
      this.getNamespaces(account);
      this.validateRentalFee(this.rentalFee * this.extendDurationNamespaceForm.get('duration').value);
      // this.validateFee();
    });
  }

  /**
   *
   *
   * @param {{ disabledForm: boolean, cosignatory: AccountsInterface }} event
   * @memberof ExtendDurationNamespaceComponent
   */
  selectCosignatory(event: { disabledForm: boolean, cosignatory: AccountsInterface }) {
    if (event) {
      if (event.disabledForm) {
        this.insufficientBalanceCosignatory = true;
        this.extendDurationNamespaceForm.disable();
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
   * @memberof ExtendDurationNamespaceComponent
   */
  subscribeValueChange() {
    this.subscription.push(this.dataBridgeService.getBlock().subscribe(next => {
      this.block = next;
      this.calculateSubtractionHeight();
    }));


    this.validateRentalFee(this.rentalFee * this.extendDurationNamespaceForm.get('duration').value);
    this.extendDurationNamespaceForm.get('duration').valueChanges.subscribe(next => {
      if (next <= 365) {
        if (next !== null && next !== undefined && String(next) !== '0') {
          this.durationByBlock = this.transactionService.calculateDurationforDay(next).toString();
          this.totalBlock = this.subtractionHeight + Number(this.durationByBlock);
          if (this.totalBlock <= 2102400) {
            // 5 years = 10512000
            this.exceededDuration = false;
          } else {
            this.exceededDuration = true;
          }

          this.validateRentalFee(this.rentalFee * parseFloat(this.durationByBlock));
          this.builder();
        } else {
          this.calculateRentalFee = '0.000000';
          this.durationByBlock = '0';
          this.extendDurationNamespaceForm.get('duration').patchValue('');
        }
      } else {
        this.durationByBlock = this.transactionService.calculateDurationforDay(365).toString();
        this.validateRentalFee(this.rentalFee * parseFloat(this.durationByBlock));
        this.builder();
      }
    });

    // namespaceRoot ValueChange
    this.extendDurationNamespaceForm.get('namespaceRoot').valueChanges.subscribe(namespaceRoot => {
      // this.optionSelected(namespaceRoot);
      if (namespaceRoot === null || namespaceRoot === undefined) {
        this.extendDurationNamespaceForm.get('namespaceRoot').setValue('');
      } else {
        this.durationByBlock = this.transactionService.calculateDurationforDay(this.extendDurationNamespaceForm.get('duration').value).toString();
        this.validateRentalFee(this.rentalFee * parseFloat(this.durationByBlock));
      }
    });
  }
}
