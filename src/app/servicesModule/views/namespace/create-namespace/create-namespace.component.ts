import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from "@angular/forms";
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Router } from '@angular/router';
import { SignedTransaction, MosaicId } from 'tsjs-xpx-chain-sdk';

import { AppConfig } from '../../../../config/app.config';
import { DataBridgeService } from '../../../../shared/services/data-bridge.service';
import { MosaicService } from '../../../../servicesModule/services/mosaic.service';
import { WalletService, AccountsInterface } from '../../../../wallet/services/wallet.service';
import { ProximaxProvider } from '../../../../shared/services/proximax.provider';
import { SharedService, ConfigurationForm } from '../../../../shared/services/shared.service';
import { NamespacesService, NamespaceStorageInterface } from '../../../../servicesModule/services/namespaces.service';
import { TransactionsService } from '../../../../transfer/services/transactions.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-create-namespace',
  templateUrl: './create-namespace.component.html',
  styleUrls: ['./create-namespace.component.css']
})
export class CreateNamespaceComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;

  configurationForm: ConfigurationForm = {};
  moduleName = 'Namespaces & Sub-Namespaces';
  componentName = 'REGISTER';
  backToService = `/${AppConfig.routes.service}`;
  /*********************************** */
  arrayselect: Array<object> = [
    {
      value: '1',
      label: 'New root Namespace',
      selected: true,
      disabled: true
    }
  ];

  block: number = null;
  durationByBlock = '5760';
  endHeight: number;
  fee: string;
  feeType: string = 'XPX';
  insufficientBalance = false;
  labelNamespace: string = '';
  namespaceChangeInfo: any;
  namespaceInfo: Array<object> = [];
  namespaceForm: FormGroup;
  namespace: Array<object> = [
    {
      value: '1',
      label: '(New root Namespace)',
      selected: true,
      disabled: false
    }
  ];

  status: boolean = true;
  startHeight: number;
  statusButtonNamespace: boolean = true;
  showDuration: boolean = true;

  transactionSigned: SignedTransaction[] = [];
  transactionReady: SignedTransaction[] = [];
  typetransfer: number = 1;
  validateForm: boolean = false;
  blockBtnSend: boolean = false;
  calculateRentalFee: any = '0.000000';
  rentalFee = 100000;
  subscription: Subscription[] = [];
  transactionStatus: boolean = false;

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
    this.configurationForm = this.sharedService.configurationForm;
    this.createForm();
    this.getNamespaces();
    const duration = this.namespaceForm.get('duration').value;
    this.fee = `0.000000 ${this.feeType}`;
    this.durationByBlock = this.transactionService.calculateDurationforDay(duration).toString();
    this.validateRentalFee(this.rentalFee * parseFloat(this.durationByBlock));
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
   * @param {*} subNamespace
   * @param {boolean} status
   * @param {number} depth
   * @returns
   * @memberof CreateNamespaceComponent
   */
  async getSubNivelNamespace(subNamespace: NamespaceStorageInterface, status: boolean, depth: number) {
    const sts = status ? false : true;
    let disabled = false;
    let name = '';
    if (subNamespace.namespaceName.parentId !== undefined) {
      if (depth === 2) {
        //Assign level 2
        const level2 = subNamespace.namespaceName.name;
        //Search level 1
        const level1: NamespaceStorageInterface[] = await this.namespaceService.getNamespaceFromId([
          this.namespaceService.getNamespaceId([
            subNamespace.namespaceName.parentId.id.lower,
            subNamespace.namespaceName.parentId.id.higher
          ])
        ]);

        name = `${level1[0].namespaceName.name}.${level2}`;
      } else if (depth === 3) {
        disabled = true;
        //Assign el level3
        const level3 = subNamespace.namespaceName.name;
        //search level 2
        const level2: NamespaceStorageInterface[] = await this.namespaceService.getNamespaceFromId(
          [this.proximaxProvider.getNamespaceId([subNamespace.namespaceName.parentId.id.lower, subNamespace.namespaceName.parentId.id.higher])]
        );

        //search level 1
        const level1: NamespaceStorageInterface[] = await this.namespaceService.getNamespaceFromId(
          [this.proximaxProvider.getNamespaceId([level2[0].namespaceName.parentId.id.lower, level2[0].namespaceName.parentId.id.higher])]
        );
        name = `${level1[0].namespaceName.name}.${level2[0].namespaceName.name}.${level3}`;
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
      name: ['', [Validators.required, Validators.minLength(this.configurationForm.namespaceName.minLength), Validators.maxLength(this.configurationForm.namespaceName.maxLength)]],
      namespaceRoot: ['1'],
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
   * @memberof CreateNamespaceComponent
   */
  clearForm() {
    this.namespaceForm.get('name').patchValue('');
    this.namespaceForm.get('namespaceRoot').patchValue('1');
    this.namespaceForm.get('duration').patchValue('');
    this.namespaceForm.get('password').patchValue('');
  }

  /**
   *
   *
   * @memberof CreateNamespaceComponent
   */
  createNamespace() {
    // console.log('this.namespaceForm.valid', this.namespaceForm.valid);
    // console.log('validateForm', this.validateForm);
    // console.log('this.blockBtnSend', this.blockBtnSend);
    if (this.namespaceForm.valid && this.validateForm && !this.blockBtnSend) {
      this.blockBtnSend = true;
      const common = {
        password: this.namespaceForm.get('password').value,
        privateKey: ''
      }
      if (this.walletService.decrypt(common)) {
        const signedTransaction = this.signedTransaction(common);
        this.transactionSigned.push(signedTransaction);
        this.dataBridge.setTransactionStatus(null);
        this.proximaxProvider.announce(signedTransaction).subscribe(
          () => {
            if (!this.transactionStatus) {
              this.getTransactionStatus();
            }
            this.blockBtnSend = false;
            this.resetForm();
            this.setTimeOutValidate(signedTransaction.hash);
          }, () => {
            this.blockBtnSend = false;
            this.resetForm()
            this.sharedService.showError('', 'Error connecting to the node');
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
        this.namespace = [{
          value: '1',
          label: '(New root Namespace)',
          selected: true,
          disabled: false
        }];

        if (namespaceInfo !== null && namespaceInfo !== undefined) {
          for (let data of namespaceInfo) {
            if (data.namespaceInfo.depth === 1) {
              await this.getRootNamespace(data, data.namespaceInfo.active);
            } else {
              await this.getSubNivelNamespace(data, data.namespaceInfo.active, data.namespaceInfo.depth);
            }
          }

          this.arrayselect = this.namespace.sort(function (a: any, b: any) {
            return a.label === b.label ? 0 : +(a.label > b.label) || -1;
          });
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
        if (statusTransaction !== null && statusTransaction !== undefined && this.transactionSigned !== null) {
          for (let element of this.transactionSigned) {
            const statusTransactionHash = (statusTransaction['type'] === 'error') ? statusTransaction['data'].hash : statusTransaction['data'].transactionInfo.hash;
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

  /**
   *
   *
   * @memberof CreateNamespaceComponent
   */
  resetForm() {
    this.namespaceForm.get('name').patchValue('');
    this.namespaceForm.get('duration').patchValue(1);
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
    const account = this.proximaxProvider.getAccountFromPrivateKey(common.privateKey, this.walletService.currentAccount.network);
    const namespaceName: string = this.namespaceForm.get('name').value;
    const duration: number = parseFloat(this.durationByBlock);
    // const duration: number = 20;
    if (this.typetransfer == 1) {
      const registerRootNamespaceTransaction = this.proximaxProvider.registerRootNamespaceTransaction(namespaceName, this.walletService.currentAccount.network, duration)
      const signedTransaction = account.sign(registerRootNamespaceTransaction);
      return signedTransaction;
    } else if (this.typetransfer == 2) {
      const rootNamespaceName = this.namespaceForm.get('namespaceRoot').value;
      const subnamespaceName = this.namespaceForm.get('name').value;
      const registersubamespaceTransaction = this.proximaxProvider.registersubNamespaceTransaction(rootNamespaceName, subnamespaceName, this.walletService.currentAccount.network)
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
            this.durationByBlock = this.transactionService.calculateDurationforDay(next).toString();
            this.validateRentalFee(this.rentalFee * parseFloat(this.durationByBlock));
          }
        } else {
          this.calculateRentalFee = '0.000000';
          this.durationByBlock = '0';
          this.namespaceForm.get('duration').patchValue('');
        }
      }
    );

    // namespaceRoot ValueChange
    this.namespaceForm.get('namespaceRoot').valueChanges.subscribe(namespaceRoot => {
      if (namespaceRoot === null || namespaceRoot === undefined) {
        this.namespaceForm.get('namespaceRoot').setValue('');
      } else {
        if (namespaceRoot === '' || namespaceRoot === '1') {
          this.namespaceForm.get('duration').setValidators([Validators.required]);
          this.showDuration = true;
          this.typetransfer = 1;
          this.durationByBlock = this.transactionService.calculateDurationforDay(this.namespaceForm.get('duration').value).toString();
          this.validateRentalFee(this.rentalFee * parseFloat(this.durationByBlock));
        } else {
          this.namespaceForm.get('duration').clearValidators();
          this.namespaceForm.get('duration').updateValueAndValidity();
          this.showDuration = false;
          this.typetransfer = 2;
          this.calculateRentalFee = '10.000000';
          this.validateRentalFee(parseFloat(this.calculateRentalFee));
        }
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
  async validateRentalFee(amount: number) {
    const accountInfo = this.walletService.filterAccountInfo();
    // console.log(accountInfo);
    if (
      accountInfo && accountInfo.accountInfo &&
      accountInfo.accountInfo.mosaics && accountInfo.accountInfo.mosaics.length > 0
    ) {
      const filtered = accountInfo.accountInfo.mosaics.find(element => {
        return element.id.toHex() === new MosaicId(this.proximaxProvider.mosaicXpx.mosaicId).toHex();
      });

      if (this.namespaceForm.get('namespaceRoot').value === '' || this.namespaceForm.get('namespaceRoot').value === '1') {
        if (filtered) {
          const invalidBalance = filtered.amount.compact() < amount;
          const mosaic = await this.mosaicServices.filterMosaics([filtered.id]);
          if (mosaic && mosaic[0].mosaicInfo) {
            this.calculateRentalFee = this.transactionService.amountFormatter(amount, mosaic[0].mosaicInfo);
          } else {
            this.sharedService.showWarning('', 'Your account is being updated, please wait');
            this.router.navigate([`/${AppConfig.routes.service}`]);
          }

          if (invalidBalance && !this.insufficientBalance) {
            this.insufficientBalance = true;
            // this.namespaceForm.controls['name'].disable();
            // this.namespaceForm.controls['password'].disable();
          } else if (!invalidBalance && this.insufficientBalance) {
            this.insufficientBalance = false;
            // this.namespaceForm.controls['name'].enable();
            // this.namespaceForm.controls['password'].enable();
          }
        } /*else {
          this.sharedService.showWarning('', 'You do not have enough balance in the default account');
          this.router.navigate([`/${AppConfig.routes.service}`]);
        }*/
      } else {
        this.calculateRentalFee = '10.000000';
        this.insufficientBalance = false;
        this.namespaceForm.controls['name'].enable();
        this.namespaceForm.controls['password'].enable();
      }
    }/* else {
      this.sharedService.showWarning('', 'You do not have enough balance in the default account');
      this.router.navigate([`/${AppConfig.routes.service}`]);
    }*/
  }
}
