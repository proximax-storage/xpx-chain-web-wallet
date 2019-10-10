import { Component, OnInit } from '@angular/core';
import { SignedTransaction, MosaicId } from 'tsjs-xpx-chain-sdk';
import { FormGroup, FormBuilder, Validators, AbstractControl } from "@angular/forms";
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppConfig } from '../../../../config/app.config';
import { DataBridgeService } from '../../../../shared/services/data-bridge.service';
import { MosaicService } from '../../../../servicesModule/services/mosaic.service';
import { WalletService } from '../../../../wallet/services/wallet.service';
import { ProximaxProvider } from '../../../../shared/services/proximax.provider';
import { SharedService, ConfigurationForm } from '../../../../shared/services/shared.service';
import { NamespacesService } from '../../../../servicesModule/services/namespaces.service';
import { TransactionsService } from '../../../../transactions/services/transactions.service';
import { HeaderServicesInterface } from '../../../services/services-module.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-create-namespace',
  templateUrl: './create-namespace.component.html',
  styleUrls: ['./create-namespace.component.css']
})
export class CreateNamespaceComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;
  arrayselect: Array<object> = [{
    value: '1',
    label: 'New root Namespace',
    selected: true,
    disabled: false
  }];

  amountAccount: number;
  block: number = null;
  blockBtnSend: boolean = false;
  calculateRentalFee: any = '0.000000';
  configurationForm: ConfigurationForm = {};
  duration: any;
  durationByBlock = '5760';
  endHeight: number;
  fee: string;
  insufficientBalance = false;
  insufficientBalanceDuration = false;
  namespaceChangeInfo: any;
  namespaceInfo: Array<object> = [];
  namespaceForm: FormGroup;
  namespace: Array<object> = [];
  namespaceName: any;
  namespaceRoot: any;
  labelNamespace: string = '';
  lengthNamespace: number;
  paramsHeader: HeaderServicesInterface = {
    moduleName: 'Namespaces & Sub-Namespaces',
    componentName: 'Register'
  };
  passwordMain: string = 'password';

  registerRootNamespaceTransaction: any;
  registersubamespaceTransaction: any;
  rentalFee = 4576;
  status: boolean = true;
  startHeight: number;
  statusButtonNamespace: boolean = true;
  showDuration: boolean = true;
  subscription: Subscription[] = [];
  transactionSigned: SignedTransaction[] = [];
  transactionReady: SignedTransaction[] = [];
  transactionStatus: boolean = false;
  typetransfer: number = 1;
  validateForm: boolean = false;

  constructor(
    private fb: FormBuilder,
    private walletService: WalletService,
    private proximaxProvider: ProximaxProvider,
    private sharedService: SharedService,
    private router: Router,
    private dataBridgeService: DataBridgeService,
    private namespaceService: NamespacesService,
    private transactionService: TransactionsService,
    private mosaicServices: MosaicService,
    private dataBridge: DataBridgeService
  ) { }


  ngOnInit() {
    this.fee = '0.000000';
    this.configurationForm = this.sharedService.configurationForm;
    this.lengthNamespace = this.configurationForm.namespaceName.maxLength;
    this.createForm();
    this.amountAccount = this.walletService.getAmountAccount();
    this.durationByBlock = this.transactionService.calculateDurationforDay(this.namespaceForm.get('duration').value).toString();
    this.validateRentalFee(this.rentalFee * parseFloat(this.durationByBlock));
    this.getNamespaces();
    this.subscribeValueChange();
  }

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
  * @param {*} amount
  * @param {MosaicsStorage} mosaic
  * @memberof CreateNamespaceComponent
  */
  async validateRentalFee(amount: number) {
    const accountInfo = this.walletService.filterAccountInfo();
    if (accountInfo && accountInfo.accountInfo && accountInfo.accountInfo.mosaics && accountInfo.accountInfo.mosaics.length > 0) {
      const xpxInBalance = accountInfo.accountInfo.mosaics.find(element => {
        return element.id.toHex() === new MosaicId(environment.mosaicXpxInfo.id).toHex();
      });

      if (xpxInBalance) {
        if (this.namespaceForm.get('namespaceRoot').value === '' || this.namespaceForm.get('namespaceRoot').value === '1') {
          const invalidBalance = xpxInBalance.amount.compact() < amount;
          const mosaic = await this.mosaicServices.filterMosaics([xpxInBalance.id]);
          if (mosaic && mosaic[0].mosaicInfo) {
            this.calculateRentalFee = this.transactionService.amountFormatterSimple(amount);
          } else {
            // **********INSUFFICIENT BALANCE*************
            // console.log('AQUI FUE');
            this.insufficientBalance = true;
            if (this.namespaceForm.enabled) {
              this.namespaceForm.disable();
            }
          }

          if (invalidBalance) {
            // **********DURATION INSUFFICIENT BALANCE*************
            this.insufficientBalance = false;
            this.insufficientBalanceDuration = true;
          } else if (!invalidBalance) {
            this.insufficientBalance = false;
            this.insufficientBalanceDuration = false;
            if (this.namespaceForm.disabled) {
              this.namespaceForm.enable();
            }
          }
        } else {
          // **********SUBNAMESPACE*************
          const invalidBalance = xpxInBalance.amount.compact() < 10000000;
          if (invalidBalance) {
            // **********DURATION INSUFFICIENT BALANCE*************
            // console.log('AQUI FUE 1');
            this.insufficientBalance = true;
            this.insufficientBalanceDuration = false;
          } else {
            this.calculateRentalFee = '10,000.000000';
            this.insufficientBalance = false;
            this.insufficientBalanceDuration = false;
            if (this.namespaceForm.disabled) {
              this.namespaceForm.enable();
            }
          }
        }
      } else {
        // **********INSUFFICIENT BALANCE*************
        // console.log('AQUI FUE 2');
        this.insufficientBalance = true;
        if (this.namespaceForm.enabled) {
          this.namespaceForm.disable();
        }
      }
    } else {
      // **********INSUFFICIENT BALANCE*************
      // console.log('AQUI FUE 3');
      this.insufficientBalance = true;
      if (this.namespaceForm.enabled) {
        this.namespaceForm.disable();
      }
    }
  }


  /**
   *
   *
   * @memberof CreateNamespaceComponent
   */
  builder() {
    if (this.namespaceName !== undefined && this.namespaceName !== '') {
      if (this.typetransfer == 1) {
        this.registerRootNamespaceTransaction = this.proximaxProvider.registerRootNamespaceTransaction(
          this.namespaceName,
          this.walletService.currentAccount.network,
          this.duration
        );
        this.fee = this.transactionService.amountFormatterSimple(this.registerRootNamespaceTransaction.maxFee.compact())
      } else if (this.typetransfer == 2) {
        const rootNamespaceName = this.namespaceForm.get('namespaceRoot').value;
        this.registersubamespaceTransaction = this.proximaxProvider.registersubNamespaceTransaction(
          rootNamespaceName,
          this.namespaceName,
          this.walletService.currentAccount.network
        );
        this.fee = this.transactionService.amountFormatterSimple(this.registersubamespaceTransaction.maxFee.compact())
      }
    }
  }

  changeInputType(inputType) {
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
  createNamespace() {
    if (this.namespaceForm.valid && !this.blockBtnSend) {
      // console.log('this.calculateRentalFee', this.calculateRentalFee);
      const validateAmount = this.transactionService.validateBuildSelectAccountBalance(this.amountAccount, Number(this.fee), Number(this.calculateRentalFee.replace(',', '')));
      // console.log('validateAmount', validateAmount);

      if (validateAmount) {
        this.blockBtnSend = true;
        const common = {
          password: this.namespaceForm.get('password').value,
          privateKey: ''
        }
        if (this.walletService.decrypt(common)) {
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
      } else {
        this.sharedService.showError('', 'Insufficient balance');
      }
    }
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
  getNamespaces() {
    this.subscription.push(this.namespaceService.getNamespaceChanged().subscribe(
      async namespaceInfo => {
        this.namespace = [];
        this.namespaceInfo = [];
        if (namespaceInfo !== null && namespaceInfo !== undefined) {
          for (let data of namespaceInfo) {
            // console.log('data---> ', data)
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
            label: 'New root Namespace',
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
   * @memberof CreateNamespaceComponent
   */
  getBlock$() {
    this.dataBridgeService.getBlock().subscribe(
      async response => {
        this.block = response
      }
    );
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

  /**
   *
   *
   * @param {(string | (string | number)[])} control
   * @returns
   * @memberof CreateNamespaceComponent
   */
  getInput(control: string | (string | number)[]) {
    return this.namespaceForm.get(control);
  }

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

  limitDuration(e) {
    // console.log();
    if (isNaN(parseInt(e.target.value))) {
      e.target.value = ''
    } else {
      if (parseInt(e.target.value) > 365) {
        e.target.value = '365'
      } else if (parseInt(e.target.value) < 1) {
        e.target.value = ''
      }
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
    if (this.typetransfer == 1) {
      signedTransaction = account.sign(this.registerRootNamespaceTransaction, generationHash); //Update-sdk-dragon
    } else if (this.typetransfer == 2) {
      signedTransaction = account.sign(this.registersubamespaceTransaction, generationHash); //Update-sdk-dragon
    }

    return signedTransaction;
  }

  /**
   *
   *
   * @memberof CreateNamespaceComponent
   */
  subscribeValueChange() {
    // Duration ValueChange
    this.namespaceForm.get('duration').valueChanges.subscribe(
      next => {
        if (next <= 365) {
          if (next !== null && next !== undefined && String(next) !== '0' && next !== '') {
            if (this.showDuration) {
              this.durationByBlock = this.transactionService.calculateDurationforDay(next).toString();
              this.validateRentalFee(this.rentalFee * parseFloat(this.durationByBlock));
              // console.log(this.durationByBlock);
            }
          } else {
            this.calculateRentalFee = '0.000000';
          }
        } else {
          this.durationByBlock = this.transactionService.calculateDurationforDay(365).toString();
          this.validateRentalFee(this.rentalFee * parseFloat(this.durationByBlock));
        }

        this.duration = parseFloat(this.durationByBlock);
        // console.log(this.duration);
        this.builder();
      }
    );

    // namespaceRoot ValueChange
    this.namespaceForm.get('namespaceRoot').valueChanges.subscribe(namespaceRoot => {
      if (namespaceRoot === null || namespaceRoot === undefined) {
        this.namespaceForm.get('namespaceRoot').setValue('1');
      } else {
        // console.log('namespaceRoot', namespaceRoot);
        if (namespaceRoot === '' || namespaceRoot === '1') {
          this.lengthNamespace = this.configurationForm.namespaceName.maxLength;
          this.namespaceForm.get('duration').setValidators([Validators.required]);
          this.showDuration = true;
          this.typetransfer = 1;
          this.durationByBlock = this.transactionService.calculateDurationforDay(this.namespaceForm.get('duration').value).toString();
          this.validateRentalFee(this.rentalFee * parseFloat(this.durationByBlock));
        } else {
          this.lengthNamespace = this.configurationForm.subNamespaceName.maxLength;
          this.namespaceForm.get('duration').patchValue('');
          this.namespaceForm.get('duration').clearValidators();
          this.namespaceForm.get('duration').updateValueAndValidity();
          this.showDuration = false;
          this.typetransfer = 2;
          this.durationByBlock = '0';
          this.calculateRentalFee = '10.000000';
          this.validateRentalFee(parseFloat(this.calculateRentalFee));
        }
        this.builder()
      }
    });

    // NamespaceName ValueChange
    this.namespaceForm.get('name').valueChanges.subscribe(name => {
      const formatter = name.replace(/[^a-z0-9]/gi, '').trim();
      if (formatter !== name) {
        this.namespaceForm.get('name').setValue(formatter);
      }

      // console.log(formatter);
      this.namespaceName = formatter;
      this.builder()
    })
  }

  /**
   *
   *
   * @param {string} namespace
   * @param {*} [isParent]
   * @returns
   * @memberof CreateNamespaceComponent
   */
  validateNamespace(namespace: string, isParent?: any) {
    // Test if correct length and if name starts with hyphens
    if (!isParent ? namespace.length > 16 : namespace.length > 64 || /^([_-])/.test(namespace)) {
      return false;
    }

    let pattern = /^[A-Za-z0-9.\-_]*$/;
    // Test if has special chars or space excluding hyphens
    if (pattern.test(namespace) == false) {
      this.validateForm = false;
      return false;
    } else {
      this.validateForm = true;
      return true;
    }
  }


}
