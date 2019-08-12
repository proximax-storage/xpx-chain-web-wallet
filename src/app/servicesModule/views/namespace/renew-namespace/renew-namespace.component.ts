import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { SignedTransaction, MosaicId } from 'tsjs-xpx-chain-sdk';
import { NamespacesService } from '../../../../servicesModule/services/namespaces.service';
import { AppConfig } from '../../../../config/app.config';
import { DataBridgeService } from '../../../../shared/services/data-bridge.service';
import { ProximaxProvider } from '../../../../shared/services/proximax.provider';
import { MosaicService } from '../../../../servicesModule/services/mosaic.service';
import { SharedService, ConfigurationForm } from 'src/app/shared/services/shared.service';
import { WalletService } from 'src/app/wallet/services/wallet.service';
import { TransactionsService } from 'src/app/transfer/services/transactions.service';

@Component({
  selector: 'app-renew-namespace',
  templateUrl: './renew-namespace.component.html',
  styleUrls: ['./renew-namespace.component.css']
})
export class RenewNamespaceComponent implements OnInit {

  moduleName = 'Namespaces & Sub-Namespaces';
  componentName = 'EXTEND DURATION';
  backToService = `/${AppConfig.routes.service}`;
  renewNamespaceForm: FormGroup;
  configurationForm: ConfigurationForm = {};
  arrayselect: Array<object> = [
    {
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
  namespaceChangeInfo: any = [];
  startHeight: number = 0;
  endHeight: number = 0;
  block: number = 0;
  blockBtnSend: boolean = false;
  fee = '';
  titleInformation = 'Namespace Information';
  subscriptions = ['block'];

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
    this.getNameNamespace();
    const duration = this.renewNamespaceForm.get('duration').value;
    this.durationByBlock = this.transactionService.calculateDurationforDay(duration).toString();
    this.validateRentalFee(this.rentalFee * duration);
    this.renewNamespaceForm.get('duration').valueChanges.subscribe(next => {
      if (next !== null && next !== undefined && String(next) !== '0') {
        this.durationByBlock = this.transactionService.calculateDurationforDay(next).toString();
        this.validateRentalFee(this.rentalFee * parseFloat(this.durationByBlock));
      } else {
        this.calculateRentalFee = '0.000000';
        this.durationByBlock = '0';
        this.renewNamespaceForm.get('duration').patchValue('');
      }
    });

    // namespaceRoot ValueChange
    this.renewNamespaceForm.get('namespaceRoot').valueChanges.subscribe(namespaceRoot => {
      if (namespaceRoot === null || namespaceRoot === undefined) {
        this.renewNamespaceForm.get('namespaceRoot').setValue('');
      } else {
        this.durationByBlock = this.transactionService.calculateDurationforDay(this.renewNamespaceForm.get('duration').value).toString();
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
   * @memberof RenewNamespaceComponent
   */
  createForm() {
    // Form Renew Namespace
    this.renewNamespaceForm = this.fb.group({
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
   * @memberof RenewNamespaceComponent
   */
  clearForm() {
    this.renewNamespaceForm.get('namespaceRoot').patchValue('');
    this.renewNamespaceForm.get('duration').patchValue('');
    this.renewNamespaceForm.get('password').patchValue('');
  }

  /**
   *
   *
   * @memberof RenewNamespaceComponent
   */
  destroySubscription() {
    this.subscriptions.forEach(element => {
      if (this.subscriptions[element] !== undefined) {
        this.subscriptions[element].unsubscribe();
      }
    });
  }

  /**
   *
   *
   * @memberof RenewNamespaceComponent
   */
  getNameNamespace() {
    this.namespaceService.searchNamespaceFromAccountStorage$().then(
      async dataNamespace => {
        if (dataNamespace !== undefined && dataNamespace.length > 0) {
          const arrayselect = [];
          for (let namespaceRoot of dataNamespace) {
            if (namespaceRoot.NamespaceInfo.depth === 1) {
              arrayselect.push({
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
      }).catch(error => {
        this.router.navigate([AppConfig.routes.home]);
        this.sharedService.showError('', 'Please check your connection and try again');
      });
  }

  /**
   *
   *
   * @param {*} namespace
   * @memberof RenewNamespaceComponent
   */
  optionSelected(namespace: any) {
    namespace = (namespace === undefined) ? 1 : namespace.value;
    this.namespaceChangeInfo = this.arrayselect.filter((book: any) => (book.name === namespace));
    if (this.namespaceChangeInfo.length > 0) {
      this.subscriptions['block'] = this.dataBridgeService.getBlock().subscribe(
        next => this.block = next
      );
      this.startHeight = this.namespaceChangeInfo[0].dataNamespace.NamespaceInfo.startHeight.lower;
      this.endHeight = this.namespaceChangeInfo[0].dataNamespace.NamespaceInfo.endHeight.lower;
    }
  }

  /**
   *
   *
   * @memberof RenewNamespaceComponent
   */
  resetForm() {
    this.renewNamespaceForm.get('namespaceRoot').patchValue('1');
    this.renewNamespaceForm.get('duration').patchValue('');
    this.renewNamespaceForm.get('password').patchValue('');
  }

  /**
   *
   *
   * @memberof RenewNamespaceComponent
   */
  renovateNamespace() {
    if (this.renewNamespaceForm.valid && !this.blockBtnSend) {
      this.blockBtnSend = true;
      const common = {
        password: this.renewNamespaceForm.get('password').value,
        privateKey: ''
      }
      if (this.walletService.decrypt(common)) {
        this.proximaxProvider.announce(this.signedTransaction(common)).subscribe(
          () => {
            this.blockBtnSend = false;
            this.resetForm();
            this.sharedService.showSuccess('', 'Transaction sent')
          }, () => {
            this.blockBtnSend = false;
            this.resetForm();
            this.sharedService.showError('', 'An unexpected error has occurred');
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
   * @param {string} [nameInput='']
   * @param {string} [nameControl='']
   * @param {string} [nameValidation='']
   * @returns
   * @memberof CreateNamespaceComponent
   */
  validateInput(nameInput: string = '', nameControl: string = '', nameValidation: string = '') {
    let validation: AbstractControl = null;
    if (nameInput !== '' && nameControl !== '') {
      validation = this.renewNamespaceForm.controls[nameControl].get(nameInput);
    } else if (nameInput === '' && nameControl !== '' && nameValidation !== '') {
      validation = this.renewNamespaceForm.controls[nameControl].getError(nameValidation);
    } else if (nameInput !== '') {
      validation = this.renewNamespaceForm.get(nameInput);
    }
    return validation;
  }


  /**
   *
   *
   * @param {*} common
   * @returns {SignedTransaction}
   * @memberof RenewNamespaceComponent
   */
  signedTransaction(common: any): SignedTransaction {
    const account = this.proximaxProvider.getAccountFromPrivateKey(common.privateKey, this.walletService.currentAccount.network);
    const namespaceRootToRenovate: string = this.renewNamespaceForm.get('namespaceRoot').value;
    // const duration: number = parseFloat(this.durationByBlock);
    const duration: number = parseFloat(this.durationByBlock);
    const registernamespaceRootTransaction = this.proximaxProvider.registerRootNamespaceTransaction(namespaceRootToRenovate, this.walletService.currentAccount.network, duration);
    const signedTransaction = account.sign(registernamespaceRootTransaction);
    return signedTransaction;
  }

  /**
   *
   *
   * @param {*} amount
   * @param {MosaicsStorage} mosaic
   * @memberof CreateNamespaceComponent
   */
  validateRentalFee(amount: number) {
    console.log('This is a test', amount);
    const accountInfo = this.walletService.filterAccountInfo();
    if (accountInfo !== undefined && accountInfo !== null && Object.keys(accountInfo).length > 0) {
      if (accountInfo.accountInfo.mosaics.length > 0) {
        const filtered = accountInfo.accountInfo.mosaics.find(element => {
          return element.id.toHex() === new MosaicId(this.proximaxProvider.mosaicXpx.mosaicId).toHex();
        });

        const invalidBalance = filtered.amount.compact() < amount;
        const mosaic = this.mosaicServices.filterMosaic(filtered.id);
        this.calculateRentalFee = this.transactionService.amountFormatter(amount, mosaic.mosaicInfo);
        if (invalidBalance && !this.insufficientBalance) {
          this.insufficientBalance = true;
          this.renewNamespaceForm.controls['password'].disable();
        } else if (!invalidBalance && this.insufficientBalance) {
          this.insufficientBalance = false;
          this.renewNamespaceForm.controls['password'].enable();
        }
      } else {
        this.insufficientBalance = true;
        this.renewNamespaceForm.controls['password'].disable();
      }
    }
  }

}
