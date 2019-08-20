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
import { TransactionsService } from '../../../../transfer/services/transactions.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-extend-duration-namespace',
  templateUrl: './extend-duration-namespace.component.html',
  styleUrls: ['./extend-duration-namespace.component.css']
})
export class ExtendDurationNamespaceComponent implements OnInit {

  moduleName = 'Namespaces & Sub-Namespaces';
  componentName = 'EXTEND DURATION';
  backToService = `/${AppConfig.routes.service}`;
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
  feeType: string = 'XPX';
  durationByBlock = '0';
  insufficientBalance = false;
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
    this.fee = `0.000000 ${this.feeType}`;
    this.createForm();
    this.getNamespaces();
    const duration = this.extendDurationNamespaceForm.get('duration').value;
    this.durationByBlock = this.transactionService.calculateDurationforDay(duration).toString();
    this.subscription.push(this.dataBridgeService.getBlock().subscribe(
      next => this.block = next
    ));

    this.validateRentalFee(this.rentalFee * duration);
    this.extendDurationNamespaceForm.get('duration').valueChanges.subscribe(next => {
      if (next !== null && next !== undefined && String(next) !== '0') {
        this.durationByBlock = this.transactionService.calculateDurationforDay(next).toString();
        this.validateRentalFee(this.rentalFee * parseFloat(this.durationByBlock));
      } else {
        this.calculateRentalFee = '0.000000';
        this.durationByBlock = '0';
        this.extendDurationNamespaceForm.get('duration').patchValue('');
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
    this.extendDurationNamespaceForm.get('namespaceRoot').patchValue('', { emitEvent: false });
    this.extendDurationNamespaceForm.get('duration').patchValue('', { emitEvent: false });
    this.extendDurationNamespaceForm.get('password').patchValue('', { emitEvent: false });
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
            this.blockBtnSend = false;
            this.resetForm();
            this.startHeight = 0;
            this.endHeight = 0;
            if (this.statusTransaction === false) {
              this.statusTransaction = true;
              this.getTransactionStatus();
            }

            this.setTimeOutValidate(signedTransaction.hash);
          }, () => {
            this.blockBtnSend = false;
            this.resetForm();
          }
        );
      } else {
        this.blockBtnSend = false;
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
            const statusTransactionHash = (statusTransaction['type'] === 'error') ? statusTransaction['data'].hash : statusTransaction['data'].transactionInfo.hash;
            // console.log('---statusTransactionHash---', statusTransactionHash);
            // console.log('----element----', element);

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
    } else {
      this.startHeight = 0;
      this.endHeight = 0;
    }
  }

  /**
   *
   *
   * @memberof ExtendDurationNamespaceComponent
   */
  resetForm() {
    this.extendDurationNamespaceForm.get('namespaceRoot').patchValue('1');
    this.extendDurationNamespaceForm.get('duration').patchValue('');
    this.extendDurationNamespaceForm.get('password').patchValue('');
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
    const namespaceRootToExtend: string = this.extendDurationNamespaceForm.get('namespaceRoot').value;
    // const duration: number = parseFloat(this.durationByBlock);
    const duration: number = parseFloat(this.durationByBlock);
    const extendNamespaceRootTransaction = this.proximaxProvider.registerRootNamespaceTransaction(namespaceRootToExtend, this.walletService.currentAccount.network, duration);
    const signedTransaction = account.sign(extendNamespaceRootTransaction);
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
          return element.id.toHex() === new MosaicId(this.proximaxProvider.mosaicXpx.mosaicId).toHex();
        });

        if (filtered) {
          const invalidBalance = filtered.amount.compact() < amount;
          const mosaic = await this.mosaicServices.filterMosaics([filtered.id]);
          this.calculateRentalFee = this.transactionService.amountFormatter(amount, mosaic[0].mosaicInfo);
          if (invalidBalance && !this.insufficientBalance) {
            this.insufficientBalance = true;
            this.extendDurationNamespaceForm.controls['password'].disable();
          } else if (!invalidBalance && this.insufficientBalance) {
            this.insufficientBalance = false;
            this.extendDurationNamespaceForm.controls['password'].enable();
          }
        }/* else {
          this.sharedService.showWarning('', 'You do not have enough balance in the default account');
          this.router.navigate([`/${AppConfig.routes.service}`]);
        }*/
      } else {
        this.insufficientBalance = true;
        this.extendDurationNamespaceForm.controls['password'].disable();
      }
    }/* else {
      this.sharedService.showWarning('', 'You do not have enough balance in the default account');
      this.router.navigate([`/${AppConfig.routes.service}`]);
    }*/
  }

}
