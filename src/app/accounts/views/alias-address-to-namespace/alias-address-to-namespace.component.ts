import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { AliasActionType, Address, NamespaceId, MosaicId, SignedTransaction, TransactionHttp, Account } from 'tsjs-xpx-chain-sdk';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppConfig } from '../../../config/app.config';
import { ProximaxProvider } from '../../../shared/services/proximax.provider';
import { NamespacesService, NamespaceStorageInterface, AddressAliasTransactionInterface } from '../../../servicesModule/services/namespaces.service';
import { DataBridgeService } from '../../../shared/services/data-bridge.service';
import { SharedService, ConfigurationForm } from '../../../shared/services/shared.service';
import { WalletService, AccountsInterface } from '../../../wallet/services/wallet.service';
import { HeaderServicesInterface, ServicesModuleService } from '../../../servicesModule/services/services-module.service';
import { TransactionsService } from '../../../transactions/services/transactions.service';
import { environment } from '../../../../environments/environment';
import { NodeService } from '../../../servicesModule/services/node.service';

@Component({
  selector: 'app-alias-address-to-namespace',
  templateUrl: './alias-address-to-namespace.component.html',
  styleUrls: ['./alias-address-to-namespace.component.css']
})
export class AliasAddressToNamespaceComponent implements OnInit, OnDestroy {
  paramsHeader: HeaderServicesInterface = {
    moduleName: 'Accounts',
    componentName: 'Link to Namespace'
  };
  arrayNamespaceStorage: NamespaceStorageInterface[] = [];
  backToService = `/${AppConfig.routes.service}`;
  blockSend = false;
  configurationForm: ConfigurationForm = {};
  disabledAddressBook = false;
  LinkToNamespaceForm: FormGroup;
  loading = false;
  namespaceSelect: Array<object> = [];
  isValidBlockchain = false;
  validFormat = false;
  transactionSigned = [];
  transactionReady: SignedTransaction[] = [];
  typeAction: any = [{
    value: AliasActionType.Link,
    label: 'Link',
    selected: true,
    disabled: false
  }, {
    value: AliasActionType.Unlink,
    label: 'Unlink',
    selected: false,
    disabled: false
  }];
  subscription: Subscription[] = [];
  showContacts = false;
  listContacts: any = [];
  namespaceId: NamespaceId;
  address: any;
  addressAliasTransaction: any;
  fee = '0.000000';
  amountAccount: number;
  mosaicstoHex: any;
  passwordMain = 'password';

  signer: AccountsInterface = null;
  typeTx = 1; // 1 simple, 2 multisig
  insufficientBalanceCosignatory = false;
  cosignatory: AccountsInterface = null;
  showSelectAccount = true;
  isMultisig = false;
  transactionHttp: TransactionHttp = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private sharedService: SharedService,
    private namespaceService: NamespacesService,
    private walletService: WalletService,
    private proximaxProvider: ProximaxProvider,
    private dataBridge: DataBridgeService,
    private serviceModuleService: ServicesModuleService,
    private transactionService: TransactionsService,
    private nodeService: NodeService
  ) { }

  ngOnInit() {
    this.transactionHttp = new TransactionHttp(environment.protocol + '://' + `${this.nodeService.getNodeSelected()}`);
    this.configurationForm = this.sharedService.configurationForm;
    this.createForm();
    this.booksAddress();
    this.subscribe();
  }

  /**
   *
   *
   * @memberof AliasAddressToNamespaceComponent
   */
  ngOnDestroy(): void {
    this.subscription.forEach(subscription => {
      subscription.unsubscribe();
    });
  }

  /**
   *
   *
   * @param {NamespaceStorageInterface[]} arrayNamespaceStorage
   * @memberof AliasAddressToNamespaceComponent
   */
  async buildSelectNamespace($event = null) {
    if ($event !== null) {
      const namespaceSelect = [];
      this.namespaceSelect = [];
      this.loading = true;
      if (this.arrayNamespaceStorage && this.arrayNamespaceStorage.length > 0) {
        for (const namespaceStorage of this.arrayNamespaceStorage) {
          if (namespaceStorage.namespaceInfo) {
            // console.log('INFO ---> ', namespaceStorage, '\n\n');
            let address = '';
            let isLinked = false;
            let disabled = false;
            let label = namespaceStorage.namespaceName.name; // await this.namespaceService.getNameParentNamespace(namespaceStorage);
            const name = label;
            const type = namespaceStorage.namespaceInfo.alias.type;
            
            if (type === 2) {
              isLinked = true;
              disabled = (this.LinkToNamespaceForm.get('typeAction').value === 0) ? true : false;
              //label = `${label} - (Linked to Address)`;
              address = this.proximaxProvider.createFromRawAddress(namespaceStorage.namespaceInfo.alias.address['address']).plain();
              label = `${label} - (Linked to Address) - ${address}`;
              
            } else if (type === 1) {
              this.mosaicstoHex = new MosaicId(namespaceStorage.id);
              isLinked = true;
              disabled = true;
              label = `${label} - (Linked to Mosaic) - ${this.mosaicstoHex.toHex()}`;
            } else {
              disabled = (this.LinkToNamespaceForm.get('typeAction').value === 1) ? true : false;
            }

            namespaceSelect
            .push({
              label: `${label}`,
              value: `${name}`,
              selected: false,
              disabled,
              address
            });
          }
        }
      }

      if (namespaceSelect.length > 0) {
        this.LinkToNamespaceForm.get('address').enable();
        this.LinkToNamespaceForm.get('namespace').enable();
        this.LinkToNamespaceForm.get('password').enable();
        // tslint:disable-next-line: only-arrow-functions
        this.namespaceSelect = namespaceSelect.sort(function (a: any, b: any) {
          return a.label === b.label ? 0 : +(a.label > b.label) || -1;
        });
      } else {
        this.LinkToNamespaceForm.get('address').disable();
        this.LinkToNamespaceForm.get('namespace').disable();
        this.LinkToNamespaceForm.get('password').disable();
      }

      this.loading = false;
    } else {
      this.LinkToNamespaceForm.get('typeAction').setValue(AliasActionType.Link);
    }
  }

  /**
   *
   *
   * @param {SignedTransaction} signedTransaction
   * @memberof AliasAddressToNamespaceComponent
   */
  announceAggregateBonded(signedTransaction: SignedTransaction) { // change
    this.transactionHttp.announceAggregateBonded(signedTransaction).subscribe(
      async () => {
        // this.blockBtnSend = false;
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
   * @memberof CreateTransferComponent
   */
  booksAddress() {
    const data = this.listContacts.slice(0);
    const bookAddress = this.serviceModuleService.getBooksAddress();
    this.listContacts = [];
    if (bookAddress !== undefined && bookAddress !== null) {
      for (const x of bookAddress) {
        data.push(x);
      }
      this.listContacts = data;
    }
  }


  /**
   *
   *
   * @memberof AliasAddressToNamespaceComponent
   */
  builder() {
    const params: AddressAliasTransactionInterface = {
      aliasActionType: this.LinkToNamespaceForm.get('typeAction').value,
      namespaceId: this.namespaceId,
      address: this.address
    };

    this.addressAliasTransaction = this.namespaceService.addressAliasTransaction(params);
    this.fee = this.transactionService.amountFormatterSimple(this.addressAliasTransaction.maxFee.compact());
  }

  /**
   *
   *
   * @param {string} inputType
   * @memberof AliasAddressToNamespaceComponent
   */
  changeInputType(inputType: string) {
    const newType = this.sharedService.changeInputType(inputType);
    this.passwordMain = newType;
  }

  /**
   *
   *
   * @memberof AliasAddressToNamespaceComponent
   */
  createForm() {
    this.LinkToNamespaceForm = this.fb.group({
      address: ['', [
        Validators.required,
        Validators.minLength(this.configurationForm.address.minLength),
        Validators.maxLength(this.configurationForm.address.maxLength)
      ]],
      contact: [''],
      namespace: ['', [Validators.required]],
      password: ['', [
        Validators.required,
        Validators.minLength(this.configurationForm.passwordWallet.minLength),
        Validators.maxLength(this.configurationForm.passwordWallet.maxLength)
      ]],
      typeAction: [
        AliasActionType.Link,
        [Validators.required]
      ]
    });
  }


  /**
   *
   *
   * @memberof AliasAddressToNamespaceComponent
   */
  clearForm() {
    this.LinkToNamespaceForm.get('address').enable();
    this.LinkToNamespaceForm.get('namespace').enable();
    this.LinkToNamespaceForm.get('password').enable();
    this.showContacts = false;
    this.LinkToNamespaceForm.reset({
      address: '',
      namespace: '',
      password: ''
    }, {
      emitEvent: false
    });
  }


  /**
   *
   *
   * @memberof AliasAddressToNamespaceComponent
   */
  getNamespaces(account: AccountsInterface) {
    this.subscription.push(this.namespaceService.getNamespaceChanged().subscribe(
      async (arrayNamespaceStorage: NamespaceStorageInterface[]) => {
        const namespaceInfo = this.namespaceService.filterNamespacesFromAccount(account.publicAccount.publicKey);
        this.arrayNamespaceStorage = namespaceInfo;
        this.buildSelectNamespace(this.LinkToNamespaceForm.get('typeAction').value);
      }
    ));
  }


  /**
   *
   *
   * @memberof LinkingNamespaceToMosaicComponent
   */
  getNameNamespace() {
    this.subscription.push(this.namespaceService.getNamespaceChanged().subscribe(
      async namespaceInfo => {
        const namespaceSelect = this.namespaceSelect.slice(0);
        if (namespaceInfo !== undefined && namespaceInfo.length > 0) {
          for (const data of namespaceInfo) {
            if (data.namespaceInfo.depth === 1) {
              namespaceSelect.push({
                value: `${data.namespaceName.name}`,
                label: `${data.namespaceName.name}`,
                selected: false,
                disabled: false
              });
            } else {
              let name = '';
              if (data.namespaceInfo.depth === 2) {
                // Assign level 2
                const level2 = data.namespaceName.name;
                // Search level 1
                const level1: NamespaceStorageInterface[] = await this.namespaceService.getNamespaceFromId(
                  [this.proximaxProvider.getNamespaceId([data.namespaceName.parentId.id.lower, data.namespaceName.parentId.id.higher])]
                );

                name = `${level1[0].namespaceName.name}.${level2}`;
                namespaceSelect.push({
                  value: `${name}`,
                  label: `${name}`,
                  selected: false,
                  disabled: false
                });
              } else if (data.namespaceInfo.depth === 3) {
                // Assign el level3
                const level3 = data.namespaceName.name;
                // search level 2
                const level2: NamespaceStorageInterface[] = await this.namespaceService.getNamespaceFromId(
                  [this.proximaxProvider.getNamespaceId([data.namespaceName.parentId.id.lower, data.namespaceName.parentId.id.higher])]
                );

                // search level 1
                const level1: NamespaceStorageInterface[] = await this.namespaceService.getNamespaceFromId(
                  [this.proximaxProvider.getNamespaceId([level2[0].namespaceName.parentId.id.lower, level2[0].namespaceName.parentId.id.higher])]
                );
                name = `${level1[0].namespaceName.name}.${level2[0].namespaceName.name}.${level3}`;
                namespaceSelect.push({
                  value: `${name}`,
                  label: `${name}`,
                  selected: false,
                  disabled: false
                });
              }
            }
          }
        }

        // tslint:disable-next-line: only-arrow-functions
        this.namespaceSelect = namespaceSelect.sort(function (a: any, b: any) {
          return a.label === b.label ? 0 : +(a.label > b.label) || -1;
        });
        // this.namespaceSelect = namespaceSelect;
      }, error => {
        this.router.navigate([AppConfig.routes.home]);
        this.sharedService.showError('', 'Please check your connection and try again');
      }));
  }

  /**
   *
   *
   * @memberof AliasAddressToNamespaceComponent
   */
  getTransactionStatus() {
    this.subscription['transactionStatus'] = this.dataBridge.getTransactionStatus().subscribe(
      statusTransaction => {
        if (statusTransaction !== null && statusTransaction !== undefined && this.transactionSigned !== null) {
          for (const element of this.transactionSigned) {
            const match = statusTransaction['hash'] === element.hash;
            if (match) {
              this.blockSend = false;
              this.clearForm();
              this.transactionReady.push(element);
            }
            if (statusTransaction['type'] === 'confirmed' && match) {
              this.transactionSigned = this.transactionSigned.filter(el => el.hash !== statusTransaction['hash']);
            } else if (statusTransaction['type'] === 'unconfirmed' && match) {
            } else if (match) {
              this.transactionSigned = this.transactionSigned.filter(el => el.hash !== statusTransaction['hash']);
            }
          }
          /*const match = statusTransaction['hash'] === this.transactionSigned.hash;
          if (statusTransaction['type'] === 'confirmed' && match) {
            this.transactionSigned = null;
          } else if (statusTransaction['type'] === 'unconfirmed' && match) {
            this.transactionSigned = null;
          } else if (match) {
            this.transactionSigned = null;
          }*/
        }
      }
    );
  }


  /**
   *
   *
   * @param {string} quantity
   * @returns
   * @memberof AliasAddressToNamespaceComponent
   */
  getQuantity(quantity: string) {
    return this.sharedService.amountFormat(quantity);
  }

  /**
   *
   *
   * @param {{ label: string, value: string }} event
   * @memberof AliasAddressToNamespaceComponent
   */
  selectContact(event: { label: string, value: string }) {
    if (event !== undefined && event.value !== '') {
      this.LinkToNamespaceForm.get('address').patchValue(event.value);
      this.address = Address.createFromRawAddress(event.value);
    }
  }

  /**
   *
   *
   * @param {AccountsInterface} account
   * @memberof AliasAddressToNamespaceComponent
   */
  selectAccountDebitFunds(account: AccountsInterface) {
    setTimeout(() => {
      const amountAccount = this.walletService.getAmountAccount(account.address);
      this.amountAccount = Number(this.transactionService.amountFormatterSimple(amountAccount).replace(/,/g, ''));
      this.signer = account;
      this.typeTx = (this.transactionService.validateIsMultisigAccount(this.signer)) ? 2 : 1;
      this.getNamespaces(this.signer);
      // this.filterMosaicByAccount();
      // this.validateBalance();
    });
  }

  /**
   *
   *
   * @param {{ disabledForm: boolean, cosignatory: AccountsInterface }} event
   * @memberof AliasAddressToNamespaceComponent
   */
  selectCosignatory(event: { disabledForm: boolean, cosignatory: AccountsInterface }) {
    if (event) {
      if (event.disabledForm) {
        this.insufficientBalanceCosignatory = true;
        // this.disableForm();
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
   * @memberof AliasAddressToNamespaceComponent
   */
  sendTransaction() {
    if (this.LinkToNamespaceForm.valid && !this.blockSend) {
      const validateAmount = this.transactionService.validateBuildSelectAccountBalance(this.amountAccount, Number(this.fee), 0);
      if (validateAmount) {
        this.blockSend = true;
        const common = {
          password: this.LinkToNamespaceForm.get('password').value,
          privateKey: ''
        };

        const accountToDecrypt = (this.typeTx === 1) ? this.signer : this.cosignatory;
        if (this.walletService.decrypt(common, accountToDecrypt)) {
          if (this.typeTx === 1) {
            const account = this.proximaxProvider.getAccountFromPrivateKey(common.privateKey, this.walletService.currentAccount.network);
            this.sendTxSimple(account);
          } else {
            this.sendAggregateBonded(common.privateKey);
          }
        } else {
          this.LinkToNamespaceForm.get('password').patchValue('');
          this.blockSend = false;
        }
      } else {
        this.sharedService.showError('', 'Insufficient balance');
      }
    }
  }

  /**
   *
   *
   * @param {Account} account
   * @memberof AliasAddressToNamespaceComponent
   */
  sendTxSimple(account: Account) {
    const generationHash = this.dataBridge.blockInfo.generationHash;
    const transactionSigned = account.sign(this.addressAliasTransaction, generationHash); // Update-sdk-dragon
    this.transactionSigned.push(transactionSigned);
    this.proximaxProvider.announce(transactionSigned).subscribe(
      next => {
        this.blockSend = false;
        this.clearForm();
      }
    );
  }

  /**
   *
   *
   * @param {string} pvk
   * @memberof AliasAddressToNamespaceComponent
   */
  sendAggregateBonded(pvk: string) {
    const innerTransaction = [{
      signer: this.signer.publicAccount,
      tx: this.addressAliasTransaction
    }];

    const generationHash = this.dataBridge.blockInfo.generationHash;
    const accountCosignatory = Account.createFromPrivateKey(pvk, this.walletService.currentAccount.network);
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
              this.blockSend = false;
              setTimeout(() => {
                this.announceAggregateBonded(aggregateSigned);
                this.blockSend = false;
                hashLockSigned = null;
              }, environment.delayBetweenLockFundABT);
            } else if (statusTransaction['type'] === 'status' && match) {
              this.blockSend = false;
              this.transactionSigned = this.transactionSigned.filter(el => el.hash !== statusTransaction['hash']);
              hashLockSigned = null;
            }
          }
        }
      );
    }, err => { });
  }

  /**
   *
   *
   * @memberof AliasAddressToNamespaceComponent
   */
  subscribe() {
    // SUBSCRIBE ADDRESS
    this.LinkToNamespaceForm.get('address').valueChanges.subscribe(address => {
      if (address) {
        if (this.proximaxProvider.validateAddress(address)) {
          const filtered = this.walletService.filterAccountInfo(this.proximaxProvider.createFromRawAddress(address).pretty(), true);
          this.validFormat = true;
          if (filtered) {
            if (filtered.accountInfo.publicKey === '0000000000000000000000000000000000000000000000000000000000000000') {
              this.isValidBlockchain = false;
              return;
            } else {
              // if (!this.validateLinkeadAccount(address)) {
              this.address = Address.createFromRawAddress(address);
              this.isValidBlockchain = true;
              this.builder();
              // }
            }
          } else {
            // if (!this.validateLinkeadAccount(address)) {
            this.address = Address.createFromRawAddress(address);
            this.isValidBlockchain = true;
            this.builder();
            // }
          }
        } else {
          this.isValidBlockchain = false;
          this.validFormat = false;
        }
      }

      return;
    });


    // SUBSCRIBE TYPE ACTION
    this.LinkToNamespaceForm.get('typeAction').valueChanges.subscribe(action => {
      this.LinkToNamespaceForm.get('namespace').patchValue('');
      // tslint:disable-next-line: only-arrow-functions
      this.namespaceSelect = this.namespaceSelect.sort(function (a: any, b: any) {
        return a.label === b.label ? 0 : +(a.label > b.label) || -1;
      });
      this.disabledAddressBook = (action === 1);
      this.showContacts = (action === 1) ? false : this.showContacts;
      this.LinkToNamespaceForm.reset({ address: '', namespace: '', password: '', typeAction: action }, { emitEvent: false });
      this.builder();
    });

    // SUBSCRIBE NAMESPACE
    this.LinkToNamespaceForm.get('namespace').valueChanges.subscribe(next => {
      if (next && next !== '') {
        this.LinkToNamespaceForm.get('contact').patchValue('');
        this.LinkToNamespaceForm.get('address').setValue(this.namespaceSelect.find(el => el['value'] === next)['address']);
        this.namespaceId = new NamespaceId(next);
        this.builder();
      }
    });
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
      validation = this.LinkToNamespaceForm.controls[nameControl].get(nameInput);
    } else if (nameInput === '' && nameControl !== '' && nameValidation !== '') {
      validation = this.LinkToNamespaceForm.controls[nameControl].getError(nameValidation);
    } else if (nameInput !== '') {
      validation = this.LinkToNamespaceForm.get(nameInput);
    }
    return validation;
  }

  /**
   *
   *
   * @memberof AliasAddressToNamespaceComponent
   */
  validateLinkeadAccount(account: string) {
    if (this.LinkToNamespaceForm.get('typeAction').value !== 1) {
      const existLinked = this.namespaceSelect.find(el => el['address'] === account);
      if (existLinked && Object.keys(existLinked)) {
        this.LinkToNamespaceForm.get('address').patchValue('');
        this.LinkToNamespaceForm.get('contact').patchValue('');
        this.sharedService.showWarning('', 'This account has already been linked');
        return true;
      }
    }

    return false;
  }
}
