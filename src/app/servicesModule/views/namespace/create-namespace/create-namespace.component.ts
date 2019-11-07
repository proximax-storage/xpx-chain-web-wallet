import { Component, OnInit } from '@angular/core';
import { SignedTransaction, MosaicId, Mosaic } from 'tsjs-xpx-chain-sdk';
import { FormGroup, FormBuilder, Validators, AbstractControl } from "@angular/forms";
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppConfig } from '../../../../config/app.config';
import { DataBridgeService } from '../../../../shared/services/data-bridge.service';
import { MosaicService } from '../../../../servicesModule/services/mosaic.service';
import { WalletService, AccountsInterface } from '../../../../wallet/services/wallet.service';
import { ProximaxProvider } from '../../../../shared/services/proximax.provider';
import { SharedService, ConfigurationForm } from '../../../../shared/services/shared.service';
import { NamespacesService } from '../../../../servicesModule/services/namespaces.service';
import { TransactionsService } from '../../../../transactions/services/transactions.service';
import { HeaderServicesInterface } from '../../../services/services-module.service';
import { environment } from '../../../../../environments/environment';
import { ServicesModuleService } from '../../../../servicesModule/services/services-module.service';

@Component({
  selector: 'app-create-namespace',
  templateUrl: './create-namespace.component.html',
  styleUrls: ['./create-namespace.component.css']
})
export class CreateNamespaceComponent implements OnInit {
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
  blockBtnSend: boolean = false;
  calculateRentalFee: any = '0.000000';
  configurationForm: ConfigurationForm = {};
  cosignatory: AccountsInterface = null;
  insufficientBalanceCosignatory: boolean = false;
  duration: any;
  durationByBlock = '5760';
  endHeight: number;
  fee: string = '0.000000';
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
  labelNamespace: string = '';
  listCosignatorie: any = [];
  lengthNamespace: number;
  paramsHeader: HeaderServicesInterface = {
    moduleName: 'Namespaces',
    componentName: 'Register'
  };

  passwordMain: string = 'password';
  registerRootNamespaceTransaction: any;
  registersubamespaceTransaction: any;
  rentalFee = 4576;
  sender: AccountsInterface = null;
  status: boolean = true;
  startHeight: number;
  statusButtonNamespace: boolean = true;
  showDuration: boolean = true;
  showSelectAccount = true;
  subscription: Subscription[] = [];
  transactionSigned: SignedTransaction[] = [];
  transactionReady: SignedTransaction[] = [];
  transactionStatus: boolean = false;
  typeNamespace: number = 1;
  typeTx: number = 1; // 1 simple, 2 multisig
  validateForm: boolean = false;

  constructor(
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
   * @param {*} inputType
   * @memberof CreateNamespaceComponent
   */
  changeInputType(inputType: any) {
    let newType = this.sharedService.changeInputType(inputType)
    this.passwordMain = newType;
  }

  /**
   *
   *
   * @memberof CreateNamespaceComponent
   */
  createForm() {
    //Form namespace default
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
    console.log('this.sender', this.sender);
    console.log('this.cosignatory', this.cosignatory);
    console.log('this.typeTx', this.typeTx);
    if (this.typeTx === 1) {
      console.log('envio la tx simple');
      const validateAmount = this.transactionService.validateBuildSelectAccountBalance(this.amountAccount, Number(this.fee), Number(this.calculateRentalFee.replace(/,/g, '')));
      if (validateAmount) {
        this.sendTxSimple();
      } else {
        this.sharedService.showError('', 'Insufficient Balance');
      }
    } else if (this.typeTx === 2 && this.cosignatory) {
      console.log('envio la tx multifirma');
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
      this.proximaxProvider.announce(signedTransaction).subscribe(
        () => {
          if (!this.transactionStatus) {
            this.getTransactionStatus();
          }

          this.clearForm();
          this.setTimeOutValidate(signedTransaction.hash);
        }, () => {
          this.blockBtnSend = false;
          this.clearForm();
          this.fee = '0.000000'
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
   * @memberof CreateNamespaceComponent
   */
  getNamespaces() {
    this.subscription.push(this.namespaceService.getNamespaceChanged().subscribe(
      async namespaceInfo => {
        this.namespace = [];
        this.namespaceInfo = [];
        if (namespaceInfo !== null && namespaceInfo !== undefined) {
          for (let data of namespaceInfo) {
            let rootResponse = null;
            if (data.namespaceInfo.depth === 1) {
              rootResponse = this.namespaceService.getRootNamespace(data, data.namespaceInfo.active, this.namespace, this.namespaceInfo);
            } else {
              rootResponse = this.namespaceService.getSubNivelNamespace(data, data.namespaceInfo.active, data.namespaceInfo.depth, this.namespace, this.namespaceInfo);
            }

            this.namespace = rootResponse.currentNamespace;
            this.namespaceInfo = rootResponse.namespaceInfo;
          }

          let arrayNamespaces = this.namespace.sort(function (a: any, b: any) {
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
      },
      error => {
        // console.log(error);
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
    if (isNaN(parseInt(e.target.value))) {
      e.target.value = '';
      this.namespaceForm.get('duration').setValue('');
    } else {
      if (parseInt(e.target.value) > 365) {
        e.target.value = '365'
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
    console.log('event', event);
    if (event) {
      if (event.disabledForm) {
        this.insufficientBalanceCosignatory = true;
        this.disableForm();
      } else {
        this.insufficientBalanceCosignatory = false;
        this.cosignatory = event.cosignatory;
        console.log(this.cosignatory);
      }
    } else {
      this.insufficientBalanceCosignatory = false;
      this.cosignatory = null;
    }
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
      this.getNamespaces();
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
            console.log('call 1');
            this.validateRentalFee();
            // console.log(this.durationByBlock);
          }
        } else {
          this.calculateRentalFee = '0.000000';
        }
      } else {
        this.durationByBlock = this.transactionService.calculateDurationforDay(365).toString();
        console.log('call 2');
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
        console.log('call 3');
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
        console.log('call 4');
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
      this.validateFee()
    })
  }

  /**
   *
   *
   * @memberof CreateNamespaceComponent
   */
  validateFee() {
    if (this.namespaceName !== undefined && this.namespaceName !== '') {
      if (this.typeNamespace == 1) {
        this.registerRootNamespaceTransaction = this.proximaxProvider.registerRootNamespaceTransaction(
          this.namespaceName,
          this.walletService.currentAccount.network,
          this.duration
        );

        this.fee = this.transactionService.amountFormatterSimple(this.registerRootNamespaceTransaction.maxFee.compact());
      } else if (this.typeNamespace == 2) {
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

    const validateAmount = this.transactionService.validateBuildSelectAccountBalance(this.amountAccount, Number(this.fee), Number(this.calculateRentalFee.replace(/,/g, '')));
    if (!validateAmount) {
      this.insufficientBalance = true;
      this.insufficientBalanceDuration = false;
    } else {
      console.log('call 5');
      this.validateRentalFee();
    }
  }

  /**
   *
   *
   * @memberof CreateNamespaceComponent
   */
  validateRentalFee() {
    console.log('entra.....');
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
          console.log('JABILITALO...');
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


  /**
   *
   *
   * @param {string} hash
   * @memberof CreateNamespaceComponent
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
   * @memberof CreateNamespaceComponent
   */
  getTransactionStatus() {
    this.transactionStatus = true;
    // Get transaction status
    this.subscription.push(this.dataBridge.getTransactionStatus().subscribe(
      statusTransaction => {
        // this.blockBtnSend = false;
        if (statusTransaction !== null && statusTransaction !== undefined && this.transactionSigned !== null) {
          for (let element of this.transactionSigned) {
            const match = statusTransaction['hash'] === element.hash;
            if (match) {
              this.transactionReady.push(element);
              this.blockBtnSend = false;
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
    ));
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
    console.log(common);
    const account = this.proximaxProvider.getAccountFromPrivateKey(common.privateKey, this.walletService.currentAccount.network);
    console.log(account);
    console.log(this.registerRootNamespaceTransaction);
    const generationHash = this.dataBridge.blockInfo.generationHash;
    if (this.typeNamespace == 1) {
      signedTransaction = account.sign(this.registerRootNamespaceTransaction, generationHash); //Update-sdk-dragon
    } else if (this.typeNamespace == 2) {
      signedTransaction = account.sign(this.registersubamespaceTransaction, generationHash); //Update-sdk-dragon
    }

    return signedTransaction;
  }
}
