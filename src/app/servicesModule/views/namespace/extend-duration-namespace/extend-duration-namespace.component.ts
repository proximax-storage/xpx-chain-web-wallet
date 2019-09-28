import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { SignedTransaction, MosaicId, NamespaceInfo } from 'tsjs-xpx-chain-sdk';
import { NamespacesService, NamespaceStorageInterface } from '../../../services/namespaces.service';
import { AppConfig } from '../../../../config/app.config';
import { DataBridgeService } from '../../../../shared/services/data-bridge.service';
import { ProximaxProvider } from '../../../../shared/services/proximax.provider';
import { MosaicService } from '../../../services/mosaic.service';
import { SharedService, ConfigurationForm } from '../../../../shared/services/shared.service';
import { WalletService } from '../../../../wallet/services/wallet.service';
import { TransactionsService } from '../../../../transactions/services/transactions.service';
import { Subscription } from 'rxjs';
import { HeaderServicesInterface } from '../../../services/services-module.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-extend-duration-namespace',
  templateUrl: './extend-duration-namespace.component.html',
  styleUrls: ['./extend-duration-namespace.component.css']
})
export class ExtendDurationNamespaceComponent implements OnInit {
  paramsHeader: HeaderServicesInterface = {
    moduleName: 'Namespaces & Sub-Namespaces',
    componentName: 'Extend Duration'
  };
  extendDurationNamespaceForm: FormGroup;
  configurationForm: ConfigurationForm = {};
  arrayselect: Array<object> = [
    {
      id: null,
      value: '1',
      label: 'New root Namespace',
      selected: true,
      disabled: true
    }
  ];
  namespaceSelect: Array<object> = [];
  calculateRentalFee: any = '0.000000';
  rentalFee = 100000;
  durationByBlock = '0';
  insufficientBalance = false;
  insufficientBalanceDuration = false;
  namespaceChangeInfo: NamespaceStorageInterface = null;
  startHeight: number = 0;
  endHeight: number = 0;
  block: number = 0;
  blockBtnSend: boolean = false;
  fee = '';
  titleInformation = 'Namespace Information';
  transactionSigned: SignedTransaction[] = [];
  transactionReady: SignedTransaction[] = [];
  subscription: Subscription[] = [];
  namespaceInfo: NamespaceStorageInterface[] = [];
  statusTransaction: boolean = false;
  extendNamespaceRootTransaction: any;
  amountAccount: number;
  namespaceRootToExtend: any;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private sharedService: SharedService,
    private namespaceService: NamespacesService,
    private dataBridgeService: DataBridgeService,
    private walletService: WalletService,
    private proximaxProvider: ProximaxProvider,
    private transactionService: TransactionsService,
    private mosaicServices: MosaicService
  ) { }

  ngOnInit() {
    this.configurationForm = this.sharedService.configurationForm;
    this.fee = '0.000000';
    this.createForm();
    this.getNamespaces();
    this.amountAccount = this.walletService.getAmountAccount();
    const duration = this.extendDurationNamespaceForm.get('duration').value;
    this.durationByBlock = this.transactionService.calculateDurationforDay(duration).toString();
    this.subscription.push(this.dataBridgeService.getBlock().subscribe(
      next => this.block = next
    ));

    this.validateRentalFee(this.rentalFee * duration);
    this.extendDurationNamespaceForm.get('duration').valueChanges.subscribe(next => {
      if(next <= 365){
      if (next !== null && next !== undefined && String(next) !== '0') {
        this.durationByBlock = this.transactionService.calculateDurationforDay(next).toString();
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



  ngOnDestroy(): void {
    this.destroySubscription();
  }

  /**
   *
   *
   * @memberof ExtendDurationNamespaceComponent
   */
  builder() {
    const namespaceRootToExtend: string = this.extendDurationNamespaceForm.get('namespaceRoot').value;
    const duration: number = parseFloat(this.durationByBlock);
    if(namespaceRootToExtend === undefined || namespaceRootToExtend === '' ){
      this.namespaceRootToExtend = 'p';
    } else {
      this.namespaceRootToExtend = this.extendDurationNamespaceForm.get('namespaceRoot').value;
    }
    this.extendNamespaceRootTransaction = this.proximaxProvider.registerRootNamespaceTransaction(this.namespaceRootToExtend, this.walletService.currentAccount.network, duration);
    this.fee = this.transactionService.amountFormatterSimple(this.extendNamespaceRootTransaction.maxFee.compact())
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
    this.extendDurationNamespaceForm.reset({
      namespaceRoot: '',
      duration: '',
      password: ''
    }, { emitEvent: false }
    );


    if (this.extendDurationNamespaceForm.disabled) {
      this.extendDurationNamespaceForm.enable();
    }

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
      const validateAmount = this.transactionService.validateBuildSelectAccountBalance(this.amountAccount, Number(this.fee), Number(this.calculateRentalFee))
      if (validateAmount) {
        this.blockBtnSend = true;
        const common = {
          password: this.extendDurationNamespaceForm.get('password').value,
          privateKey: ''
        }
        if (this.walletService.decrypt(common)) {
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
      } else {
        this.sharedService.showError('', 'insufficient balance');
      }
    }
  }


  /**
   *
   *
   * @memberof ExtendDurationNamespaceComponent
   */
  getTransactionStatus() {
    // console.log('--getTransactionStatus---');

    // Get transaction status
    this.subscription.push(this.dataBridgeService.getTransactionStatus().subscribe(
      statusTransaction => {
        // console.log(statusTransaction);

        if (statusTransaction !== null && statusTransaction !== undefined && this.transactionSigned !== null) {
          for (let element of this.transactionSigned) {
            const statusTransactionHash = statusTransaction['data'].hash;
            // console.log('---statusTransactionHash---', statusTransactionHash);
            // console.log('----element----', element);

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
  getNamespaces() {
    this.subscription.push(this.namespaceService.getNamespaceChanged().subscribe(
      async namespaceInfo => {
        this.namespaceInfo = namespaceInfo;

        if (namespaceInfo !== undefined && namespaceInfo !== null && namespaceInfo.length > 0) {
          const arrayselect = [];
          for (let namespaceRoot of namespaceInfo) {
            if (namespaceRoot.namespaceInfo.depth === 1) {
              arrayselect.push({
                id: `${this.proximaxProvider.getNamespaceId(namespaceRoot.id).toHex()}`,
                value: `${namespaceRoot.namespaceName.name}`,
                label: `${namespaceRoot.namespaceName.name}`,
                selected: false,
                disabled: false
              });

              this.arrayselect.push({
                name: `${namespaceRoot.namespaceName.name}`,
                dataNamespace: namespaceRoot
              });
            }
          }

          this.arrayselect = arrayselect;
        }
      }, error => {
        this.router.navigate([AppConfig.routes.home]);
        this.sharedService.showError('', 'Check your connection and try again');
      }
    ));

  }

  limitDuration(e) {
    console.log();
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
   * @param {*} namespace
   * @memberof ExtendDurationNamespaceComponent
   */
  optionSelected($event: any) {
    if ($event && $event.value !== '1') {
      this.namespaceChangeInfo = this.namespaceInfo.find(book =>
        this.proximaxProvider.getNamespaceId(book.id).toHex() ===
        $event.id
      );
      if (this.namespaceChangeInfo) {
        this.startHeight = this.namespaceChangeInfo.namespaceInfo.startHeight.lower;
        this.endHeight = this.namespaceChangeInfo.namespaceInfo.endHeight.lower;
      }
      this.builder();
    } else {
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
   * @param {*} common
   * @returns {SignedTransaction}
   * @memberof ExtendDurationNamespaceComponent
   */
  signedTransaction(common: any): SignedTransaction {
    const account = this.proximaxProvider.getAccountFromPrivateKey(common.privateKey, this.walletService.currentAccount.network);
    // const namespaceRootToExtend: string = this.extendDurationNamespaceForm.get('namespaceRoot').value;
    // const duration: number = parseFloat(this.durationByBlock);
    // const duration: number = parseFloat(this.durationByBlock);
    // const extendNamespaceRootTransaction = this.proximaxProvider.registerRootNamespaceTransaction(namespaceRootToExtend, this.walletService.currentAccount.network, duration);
    const generationHash = this.dataBridgeService.blockInfo.generationHash;
    const signedTransaction = account.sign(this.extendNamespaceRootTransaction, generationHash);  //Update-sdk-dragon
    return signedTransaction;
  }

  /**
   *
   *
   * @param {*} amount
   * @param {MosaicsStorage} mosaic
   * @memberof ExtendDurationNamespaceComponent
   */
  async validateRentalFee(amount: number) {
    const accountInfo = this.walletService.filterAccountInfo();
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
