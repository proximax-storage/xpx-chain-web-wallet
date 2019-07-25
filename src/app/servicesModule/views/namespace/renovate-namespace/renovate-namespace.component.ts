import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { SignedTransaction, MosaicId } from 'tsjs-xpx-chain-sdk';
import { NamespacesService } from '../../../../servicesModule/services/namespaces.service';
import { AppConfig } from '../../../../config/app.config';
import { SharedService, WalletService } from '../../../../shared';
import { DataBridgeService } from '../../../../shared/services/data-bridge.service';
import { ProximaxProvider } from '../../../../shared/services/proximax.provider';
import { TransactionsService } from 'src/app/transactions/service/transactions.service';
import { MosaicService } from '../../../../servicesModule/services/mosaic.service';

@Component({
  selector: 'app-renovate-namespace',
  templateUrl: './renovate-namespace.component.html',
  styleUrls: ['./renovate-namespace.component.scss']
})
export class RenovateNamespaceComponent implements OnInit {

  renovateNamespaceForm: FormGroup;
  namespaceSelect: Array<object> = [];
  namespaceInfo: any = [{
    value: '0',
    label: 'Select root namespace',
    selected: false,
    disabled: true
  }];
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
    this.fee = `0.000000 ${this.feeType}`;
    this.createForm();
    this.getNameNamespace();
    const duration = this.renovateNamespaceForm.get('duration').value;
    this.durationByBlock = this.transactionService.calculateDurationforDay(duration).toString();
    this.validateRentalFee(this.rentalFee * duration);
    this.renovateNamespaceForm.get('duration').valueChanges.subscribe(next => {
      this.validateRentalFee(this.rentalFee * next);
      this.durationByBlock = this.transactionService.calculateDurationforDay(next).toString();
    });

    // namespaceRoot ValueChange
    this.renovateNamespaceForm.get('rootNamespace').valueChanges.subscribe(rootNamespace => {
      if (rootNamespace === null || rootNamespace === undefined) {
        this.renovateNamespaceForm.get('rootNamespace').setValue('1');
      } else {
        this.validateRentalFee(this.rentalFee * this.renovateNamespaceForm.get('duration').value);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroySubscription();
  }

  /**
   *
   *
   * @memberof RenovateNamespaceComponent
   */
  createForm() {
    // Form Renew Namespace
    this.renovateNamespaceForm = this.fb.group({
      rootNamespace: ['', [Validators.required]],
      duration: [''],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(30)]],
    });
  }

  /**
   *
   *
   * @memberof RenovateNamespaceComponent
   */
  clearForm() {
    this.renovateNamespaceForm.get('rootNamespace').patchValue('');
    this.renovateNamespaceForm.get('duration').patchValue('');
    this.renovateNamespaceForm.get('password').patchValue('');
  }

  /**
   *
   *
   * @memberof RenovateNamespaceComponent
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
   * @param {(string | (string | number)[])} control
   * @param {*} [typeForm]
   * @param {(string | number)} [formControl]
   * @returns
   * @memberof RenovateNamespaceComponent
   */
  getError(control: string | (string | number)[], typeForm?: any, formControl?: string | number) {
    const form = this.renovateNamespaceForm;
    if (formControl === undefined) {
      if (form.get(control).getError('required')) {
        return `This field is required`;
      } else if (form.get(control).getError('minlength')) {
        return `This field must contain minimum ${form.get(control).getError('minlength').requiredLength} characters`;
      } else if (form.get(control).getError('maxlength')) {
        return `This field must contain maximum ${form.get(control).getError('maxlength').requiredLength} characters`;
      } else {
        return `Invalid data`;
      }
    } else {
      if (form.controls[formControl].get(control).getError('required')) {
        return `This field is required`;
      } else if (form.controls[formControl].get(control).getError('minlength')) {
        return `This field must contain minimum ${form.controls[formControl].get(control).getError('minlength').requiredLength} characters`;
      } else if (form.controls[formControl].get(control).getError('maxlength')) {
        return `This field must contain maximum ${form.controls[formControl].get(control).getError('maxlength').requiredLength} characters`;
      } else if (form.controls[formControl].getError('noMatch')) {
        return `Password doesn't match`;
      } else {
        return `Invalid data`;
      }
    }
  }

  /**
   *
   *
   * @memberof RenovateNamespaceComponent
   */
  getNameNamespace() {
    this.namespaceService.searchNamespaceFromAccountStorage$().then(
      async dataNamespace => {
        if (dataNamespace !== undefined && dataNamespace.length > 0) {
          const namespaceSelect = [];
          for (let rootNamespace of dataNamespace) {
            if (rootNamespace.NamespaceInfo.depth === 1) {
              namespaceSelect.push({
                value: `${rootNamespace.namespaceName.name}`,
                label: `${rootNamespace.namespaceName.name}`,
                selected: false,
                disabled: false
              });

              this.namespaceInfo.push({
                name: `${rootNamespace.namespaceName.name}`,
                dataNamespace: rootNamespace
              });
            }
          }

          this.namespaceSelect = namespaceSelect;
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
   * @memberof RenovateNamespaceComponent
   */
  optionSelected(namespace: any) {
    namespace = (namespace === undefined) ? 1 : namespace.value;
    this.namespaceChangeInfo = this.namespaceInfo.filter((book: any) => (book.name === namespace));
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
   * @memberof RenovateNamespaceComponent
   */
  resetForm() {
    this.renovateNamespaceForm.get('rootNamespace').patchValue('1');
    this.renovateNamespaceForm.get('duration').patchValue('');
    this.renovateNamespaceForm.get('password').patchValue('');
  }

  /**
   *
   *
   * @memberof RenovateNamespaceComponent
   */
  renovateNamespace() {
    if (this.renovateNamespaceForm.valid && !this.blockBtnSend) {
      this.blockBtnSend = true;
      const common = {
        password: this.renovateNamespaceForm.get('password').value,
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
   * @param {*} common
   * @returns {SignedTransaction}
   * @memberof RenovateNamespaceComponent
   */
  signedTransaction(common: any): SignedTransaction {
    const account = this.proximaxProvider.getAccountFromPrivateKey(common.privateKey, this.walletService.network);
    const rootNamespaceToRenovate: string = this.renovateNamespaceForm.get('rootNamespace').value;
    // const duration: number = parseFloat(this.durationByBlock);
    const duration: number = 20;
    const registerRootNamespaceTransaction = this.proximaxProvider.registerRootNamespaceTransaction(rootNamespaceToRenovate, this.walletService.network, duration);
    const signedTransaction = account.sign(registerRootNamespaceTransaction);
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
    const accountInfo = this.walletService.getAccountInfo();
    if (accountInfo !== undefined && accountInfo !== null && Object.keys(accountInfo).length > 0) {
      if (accountInfo.mosaics.length > 0) {
        const filtered = accountInfo.mosaics.find(element => {
          return element.id.toHex() === new MosaicId(this.proximaxProvider.mosaicXpx.mosaicId).toHex();
        });

        const invalidBalance = filtered.amount.compact() < amount;
        const mosaic = this.mosaicServices.filterMosaic(filtered.id);
        this.calculateRentalFee = this.transactionService.amountFormatter(amount, mosaic.mosaicInfo);
        if (invalidBalance && !this.insufficientBalance) {
          this.insufficientBalance = true;
          this.blockBtnSend = true;
          this.renovateNamespaceForm.controls['password'].disable();
        } else if (!invalidBalance && this.insufficientBalance) {
          this.insufficientBalance = false;
          this.blockBtnSend = false;
          this.renovateNamespaceForm.controls['password'].enable();
        }
      } else {
        this.insufficientBalance = true;
        this.blockBtnSend = true;
        this.renovateNamespaceForm.controls['password'].disable();
      }
    }
  }

}
