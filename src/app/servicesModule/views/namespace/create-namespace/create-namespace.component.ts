import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { ActivatedRoute, Router } from '@angular/router';
import { SignedTransaction, NamespaceId, UInt64, MosaicId } from 'tsjs-xpx-chain-sdk';
import { first } from 'rxjs/operators';

import { AppConfig } from '../../../../config/app.config';
import { DataBridgeService } from '../../../../shared/services/data-bridge.service';
import { WalletService, SharedService } from '../../../../shared';
import { ProximaxProvider } from '../../../../shared/services/proximax.provider';
import { NamespaceStorage } from '../../../../servicesModule/interfaces/mosaics-namespaces.interface';
import { NamespacesService } from '../../../../servicesModule/services/namespaces.service';
import { TransactionsService } from '../../../../transactions/service/transactions.service';
import { MosaicService } from '../../../../servicesModule/services/mosaic.service';

@Component({
  selector: 'app-create-namespace',
  templateUrl: './create-namespace.component.html',
  styleUrls: ['./create-namespace.component.scss']
})
export class CreateNamespaceComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;

  arrayselect: Array<object> = [
    {
      value: '1',
      label: '.(New root Namespace)',
      selected: true,
      disabled: false
    }
  ];

  block: number = null;
  durationByBlock = '0 days, 0 Hrs, 0 Minutes, 0 Seconds';
  endHeight: number;
  fee: string;
  feeType: string = 'XPX';
  insufficientBalance = false;
  inputBlocked = false;
  labelNamespace: string = '';
  namespaceChangeInfo: any;
  namespaceInfo: Array<object> = [];
  namespaceForm: FormGroup;
  namespace: Array<object> = [
    {
      value: '1',
      label: '.(New root Namespace)',
      selected: true,
      disabled: false
    }
  ];

  status: boolean = true;
  startHeight: number;
  statusButtonNamespace: boolean = true;
  showDuration: boolean = true;
  transactionSigned: SignedTransaction = null;
  typetransfer: number = 1;
  validateForm: boolean = false;
  blockBtnSend: boolean = false;
  calculateRentalFee: any = '0.000000';
  rentalFee = 100000;
  maskData = '0*';
  subscribe = ['accountInfo', 'transactionStatus'];

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
    this.createForm();
    this.getNameNamespace();

    const duration = this.namespaceForm.get('duration').value;
    this.fee = `0.000000 ${this.feeType}`
    this.durationByBlock = this.transactionService.calculateDuration(UInt64.fromUint(duration));
    this.validateRentalFee(this.rentalFee * duration);
    this.subscribeValueChange();
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
   * @param {*} subNamespace
   * @param {boolean} status
   * @param {number} depth
   * @returns
   * @memberof CreateNamespaceComponent
   */
  async getSubNivelNamespace(subNamespace: NamespaceStorage, status: boolean, depth: number) {
    const sts = status ? false : true;
    let disabled = false;
    let name = '';
    if (subNamespace.namespaceName.parentId !== undefined) {
      if (depth === 2) {
        //Assign level 2
        const level2 = subNamespace.namespaceName.name;
        //Search level 1
        const level1: NamespaceStorage = await this.namespaceService.getNamespaceFromId(
          this.proximaxProvider.getNamespaceId([subNamespace.namespaceName.parentId.id.lower, subNamespace.namespaceName.parentId.id.higher])
        );

        name = `${level1.namespaceName.name}.${level2}`;
      } else if (depth === 3) {
        disabled = true;
        //Assign el level3
        const level3 = subNamespace.namespaceName.name;
        //search level 2
        const level2: NamespaceStorage = await this.namespaceService.getNamespaceFromId(
          this.proximaxProvider.getNamespaceId([subNamespace.namespaceName.parentId.id.lower, subNamespace.namespaceName.parentId.id.higher])
        );

        //search level 1
        const level1: NamespaceStorage = await this.namespaceService.getNamespaceFromId(
          this.proximaxProvider.getNamespaceId([level2.namespaceName.parentId.id.lower, level2.namespaceName.parentId.id.higher])
        );
        name = `${level1.namespaceName.name}.${level2.namespaceName.name}.${level3}`;
      }

      this.namespace.push({
        value: name,
        label: name,
        selected: sts,
        disabled: disabled
      });

      this.namespaceInfo.push({
        name: name,
        dataNamespace: subNamespace
      });

      return;
    }

    return;
  }

  /**
   *
   *
   * @memberof CreateNamespaceComponent
   */
  createForm() {
    //Form namespace default
    this.namespaceForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(64)]],
      namespaceRoot: ['1'],
      duration: [1, [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(30)]],
    });
  }

  /**
   *
   *
   * @memberof CreateNamespaceComponent
   */
  createNamespace() {
    if (this.namespaceForm.valid && this.validateForm && !this.blockBtnSend && !this.inputBlocked) {
      this.blockBtnSend = true;
      const common = {
        password: this.namespaceForm.get('password').value,
        privateKey: ''
      }
      if (this.walletService.decrypt(common)) {
        const signedTransaction = this.signedTransaction(common);
        this.transactionSigned = signedTransaction;
        this.dataBridge.setTransactionStatus(null);
        this.proximaxProvider.announce(signedTransaction).subscribe(
          () => {
            this.getTransactionStatus();
            this.blockBtnSend = false;
            this.resetForm()
          }, () => {
            this.blockBtnSend = false;
            this.resetForm()
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
   * @memberof CreateNamespaceComponent
   */
  getNameNamespace() {
    this.subscribe['accountInfo'] = this.namespaceService.getNamespaceFromAccountAsync().subscribe(
      namespaceInfo => {
        if (namespaceInfo !== null && namespaceInfo !== undefined) {
          this.namespaceService.searchNamespaceFromAccountStorage$().then(
            async namespaceStorage => {
              if (namespaceStorage !== undefined && namespaceStorage.length > 0) {
                this.blockUI.start('Loading...');
                for (let data of namespaceStorage) {
                  if (data.NamespaceInfo.depth === 1) {
                    await this.getRootNamespace(data, data.NamespaceInfo.active);
                  } else {
                    await this.getSubNivelNamespace(data, data.NamespaceInfo.active, data.NamespaceInfo.depth);
                  }
                }

                this.blockUI.stop();
                this.arrayselect = this.namespace.sort(function (a: any, b: any) {
                  return a.label === b.label ? 0 : +(a.label > b.label) || -1;
                });
              }
            }).catch(error => {
              // console.log(error);
              this.blockUI.stop();
              this.router.navigate([AppConfig.routes.home]);
              this.sharedService.showError('', 'Check your connection and try again');
            });
        }
      },
      error => {
        // console.log(error);
        this.blockUI.stop();
        this.router.navigate([AppConfig.routes.home]);
        this.sharedService.showError('', 'Check your connection and try again');
      }
    );
  }

  /**
   *
   *
   * @param {*} rootNamespace
   * @param {boolean} status
   * @returns
   * @memberof CreateNamespaceComponent
   */
  getRootNamespace(rootNamespace: any, status: boolean) {
    const sts = status ? false : true;
    this.namespace.push({
      value: `${rootNamespace.namespaceName.name}`,
      label: `${rootNamespace.namespaceName.name}`,
      selected: sts,
      disabled: false
    });

    this.namespaceInfo.push({
      name: `${rootNamespace.namespaceName.name}`,
      dataNamespace: rootNamespace
    });

    return;
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
   * @param param
   * @param formControl
   */
  getError(control: string | (string | number)[], typeForm?: any, formControl?: string | number) {
    const form = (typeForm === undefined) ? this.namespaceForm : this.namespaceForm;
    if (formControl === undefined) {
      if (form.get(control).getError('required')) {
        return `This field is required`;
      } else if (form.get(control).getError('minlength')) {
        return `This field must contain minimum ${form.get(control).getError('minlength').requiredLength} characters`;
      } else if (form.get(control).getError('maxlength')) {
        return `This field must contain maximum ${form.get(control).getError('maxlength').requiredLength} characters`;
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
      }
    }
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

  /**
   *
   *
   * @memberof CreateNamespaceComponent
   */
  getTransactionStatus() {
    // Get transaction status
    this.subscribe['transactionStatus'] = this.dataBridge.getTransactionStatus().subscribe(
      statusTransaction => {
        if (statusTransaction !== null && statusTransaction !== undefined && this.transactionSigned !== null) {
          const match = statusTransaction['data'].transactionInfo.hash === this.transactionSigned.hash;
          if (statusTransaction['type'] === 'confirmed' && match) {
            this.transactionSigned = null;
            this.sharedService.showSuccess('', 'Transaction confirmed');
          } else if (statusTransaction['type'] === 'unconfirmed' && match) {
            this.transactionSigned = null;
            this.sharedService.showInfo('', 'Transaction unconfirmed');
          } else if (match) {
            this.transactionSigned = null;
            this.sharedService.showWarning('', statusTransaction['type'].status);
          }
        }
      }
    );
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

    let pattern = /^[a-z0-9.\-_]*$/;
    // Test if has special chars or space excluding hyphens
    if (pattern.test(namespace) == false) {
      this.validateForm = false;
      return false;
    } else {
      this.validateForm = true;
      return true;
    }
  }

  /**
   *
   *
   * @memberof CreateNamespaceComponent
   */
  resetForm() {
    this.namespaceForm.get('name').patchValue('');
    this.namespaceForm.get('duration').patchValue('');
    this.namespaceForm.get('password').patchValue('');
    this.namespaceForm.get('namespaceRoot').patchValue('1');
    this.statusButtonNamespace = true;
  }

  /**
   *
   *
   * @param {*} common
   * @returns {Promise<any>}
   * @memberof CreateNamespaceComponent
   */
  signedTransaction(common: any): SignedTransaction {
    const account = this.proximaxProvider.getAccountFromPrivateKey(common.privateKey, this.walletService.network);
    const namespaceName: string = this.namespaceForm.get('name').value;
    const duration: number = this.namespaceForm.get('duration').value;
    if (this.typetransfer == 1) {
      const registerRootNamespaceTransaction = this.proximaxProvider.registerRootNamespaceTransaction(namespaceName, this.walletService.network, duration)
      const signedTransaction = account.sign(registerRootNamespaceTransaction);
      return signedTransaction;
    } else if (this.typetransfer == 2) {
      const rootNamespaceName = this.namespaceForm.get('namespaceRoot').value;
      const subnamespaceName = this.namespaceForm.get('name').value;
      const registersubamespaceTransaction = this.proximaxProvider.registersubNamespaceTransaction(rootNamespaceName, subnamespaceName, this.walletService.network)
      const signedTransaction = account.sign(registersubamespaceTransaction);
      return signedTransaction;
    }
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
        if (next !== null && next !== undefined && String(next) !== '0') {
          if (this.showDuration) {
            this.durationByBlock = this.transactionService.calculateDuration(UInt64.fromUint(next));
            this.validateRentalFee(this.rentalFee * next);
          }
        } else {
          this.calculateRentalFee = '0.000000';
          this.durationByBlock = '0 days, 0 Hrs, 0 Minutes, 0 Seconds';
          this.namespaceForm.get('duration').patchValue(1);
        }
      }
    );

    // namespaceRoot ValueChange
    this.namespaceForm.get('namespaceRoot').valueChanges.subscribe(namespaceRoot => {
      if (namespaceRoot === null || namespaceRoot === undefined) {
        this.namespaceForm.get('namespaceRoot').setValue('1');
      } else {
        this.showDuration = (namespaceRoot === '1') ? true : false;
        this.typetransfer = (namespaceRoot === '1') ? 1 : 2;
        this.validateRentalFee(this.rentalFee * this.namespaceForm.get('duration').value);
      }
    });

    // NamespaceName ValueChange
    this.namespaceForm.get('name').valueChanges.subscribe(name => {
      if (!this.validateNamespace(name)) return this.sharedService.showError('', 'Name of namespace is invalid')
    })
  }

  /**
   *
   *
   * @param {*} amount
   * @param {MosaicsStorage} mosaic
   * @memberof CreateNamespaceComponent
   */
  validateRentalFee(amount: number) {
    if (this.namespaceForm.get('namespaceRoot').value === '1') {
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
            this.inputBlocked = true;
            this.blockBtnSend = true;
            this.namespaceForm.controls['name'].disable();
            this.namespaceForm.controls['password'].disable();
          } else if (!invalidBalance && this.insufficientBalance) {
            this.insufficientBalance = false;
            this.inputBlocked = false;
            this.blockBtnSend = false;
            this.namespaceForm.controls['name'].enable();
            this.namespaceForm.controls['password'].enable();
          }
        } else {
          this.insufficientBalance = true;
          this.inputBlocked = true;
          this.blockBtnSend = true;
          this.namespaceForm.controls['name'].disable();
          this.namespaceForm.controls['password'].disable();
        }
      }
    } else {
      this.calculateRentalFee = '0.000000';
      this.insufficientBalance = false;
      this.inputBlocked = false;
      this.blockBtnSend = false;
      this.namespaceForm.controls['name'].enable();
      this.namespaceForm.controls['password'].enable();
    }
  }
}
