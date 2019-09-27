import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { AliasActionType, Address, NamespaceId, LinkAction, RawAddress, Convert } from 'tsjs-xpx-chain-sdk';
import { Router } from '@angular/router';
import { NgBlockUI, BlockUI } from 'ng-block-ui';
import { AppConfig } from '../../../../config/app.config';
import { ProximaxProvider } from '../../../../shared/services/proximax.provider';
import { NamespacesService, NamespaceStorageInterface, AddressAliasTransactionInterface } from '../../../../servicesModule/services/namespaces.service';
import { DataBridgeService } from 'src/app/shared/services/data-bridge.service';
import { SharedService, ConfigurationForm } from 'src/app/shared/services/shared.service';
import { WalletService } from 'src/app/wallet/services/wallet.service';
import { Subscription } from 'rxjs';
import { HeaderServicesInterface, ServicesModuleService } from '../../../services/services-module.service';
import { TransactionsService } from 'src/app/transactions/services/transactions.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-alias-address-to-namespace',
  templateUrl: './alias-address-to-namespace.component.html',
  styleUrls: ['./alias-address-to-namespace.component.css']
})
export class AliasAddressToNamespaceComponent implements OnInit {
  paramsHeader: HeaderServicesInterface = {
    moduleName: 'Accounts',
    componentName: 'Link to namespace'
  };
  arrayNamespaceStorage: NamespaceStorageInterface[] = [];
  backToService = `/${AppConfig.routes.service}`;
  blockSend: boolean = false;
  configurationForm: ConfigurationForm = {};
  disabledAddressBook: boolean = false;
  LinkToNamespaceForm: FormGroup;
  loading = false;
  namespaceSelect: Array<object> = [];
  notValid = false;
  transactionSigned: any;
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
  action: any;
  namespaceId: NamespaceId;
  address: any;
  addressAliasTransaction: any;
  fee: string;
  amountAccount: number;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private sharedService: SharedService,
    private namespaceService: NamespacesService,
    private walletService: WalletService,
    private proximaxProvider: ProximaxProvider,
    private dataBridge: DataBridgeService,
    private serviceModuleService: ServicesModuleService,
    private transactionService: TransactionsService
  ) { }

  ngOnInit() {
    this.configurationForm = this.sharedService.configurationForm;
    this.createForm();
    this.getNamespaces();
    this.booksAddress();
    this.amountAccount = this.walletService.getAmountAccount();
    this.LinkToNamespaceForm.get('address').valueChanges.subscribe(
      x => {
        if (x) {
          this.accountValidate(x);
        }
      }
    );

    this.LinkToNamespaceForm.get('typeAction').valueChanges.subscribe(el => {
      // console.log(el);

      this.disabledAddressBook = (el === 1);
      this.showContacts = (el === 1) ? false : this.showContacts;
    });

    this.LinkToNamespaceForm.get('namespace').valueChanges.subscribe(next => {
      if (this.disabledAddressBook) {
        const namespaceUnlink = this.namespaceSelect.find(el => el['value'] === next);
        this.LinkToNamespaceForm.get('address').setValue(namespaceUnlink['address']);
      }

    });

    const address = this.walletService.currentAccount.address;
    this.LinkToNamespaceForm.get('address').patchValue(address);
    this.address =  Address.createFromRawAddress(address);
    this.builder();
  }

  ngOnDestroy(): void {
    this.subscription.forEach(subscription => {
      subscription.unsubscribe();
    });
  }


  /**
   *
   *
   * @param {string} address
   * @returns
   * @memberof AliasAddressToNamespaceComponent
   */
  accountValidate(address: string) {
    if (address !== '') {
      const addressTrimAndUpperCase = address.trim().toUpperCase().replace(/-/g, '');
      if (addressTrimAndUpperCase.length === 40) {
        const b = this.proximaxProvider.createFromRawAddress(address);
        const filtered = this.walletService.filterAccountInfo(b.pretty(), true);
        if (filtered) {
          if (filtered.accountInfo.publicKey === '0000000000000000000000000000000000000000000000000000000000000000') {
            this.notValid = true;
            return;
          }
        }
      }
    }

    this.notValid = false;
    return;
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
      for (let x of bookAddress) {
        data.push(x);
      }
      this.listContacts = data;
    }
  }

  /**
   *
   *
   * @param {NamespaceStorageInterface[]} arrayNamespaceStorage
   * @memberof AliasAddressToNamespaceComponent
   */
  async buildSelectNamespace($event = null) {
    if ($event !== null) {
      // this.LinkToNamespaceForm.get('namespace').setValue('1');
      /* this.LinkToNamespaceForm.get('address').enable();
       this.LinkToNamespaceForm.get('namespace').enable();
       this.LinkToNamespaceForm.get('password').enable();*/

      // console.log('--arrayNamespaceStorage--', this.arrayNamespaceStorage);
      const namespaceSelect = [];
      this.loading = true;
      if (this.arrayNamespaceStorage && this.arrayNamespaceStorage.length > 0) {
        for (let namespaceStorage of this.arrayNamespaceStorage) {
          if (namespaceStorage.namespaceInfo) {
            // console.log('INFO ---> ', namespaceStorage, '\n\n');
            let address: string = '';
            let isLinked = false;
            let disabled = false;
            let label = namespaceStorage.namespaceName.name;//await this.namespaceService.getNameParentNamespace(namespaceStorage);
            const name = label;
            const type = namespaceStorage.namespaceInfo.alias.type;
            if (type === 2) {
              isLinked = true;
              disabled = (this.LinkToNamespaceForm.get('typeAction').value === 0) ? true : false;
              label = `${label} - (Linked to address)`;
              address = this.proximaxProvider.createAddressFromEncode(namespaceStorage.namespaceInfo.alias.address).plain();
            } else if (type === 1) {
              isLinked = true;
              disabled = true;
              label = `${label} - (Linked to mosaic)`;
            } else {
              disabled = (this.LinkToNamespaceForm.get('typeAction').value === 1) ? true : false;
            }

            namespaceSelect.push({
              label: `${label}`,
              value: `${name}`,
              selected: false,
              disabled: disabled,
              address: address
            });
          }
        };
      }

      if (namespaceSelect.length > 0) {
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
   * @memberof AliasAddressToNamespaceComponent
   */
  createForm() {
    this.LinkToNamespaceForm = this.fb.group({
      address: ['', [
        Validators.required,
        Validators.minLength(this.configurationForm.address.minLength),
        Validators.maxLength(this.configurationForm.address.maxLength)
      ]],
      namespace: ['', [Validators.required]],
      password: ['', [
        Validators.required,
        Validators.minLength(this.configurationForm.passwordWallet.minLength),
        Validators.maxLength(this.configurationForm.passwordWallet.maxLength)
      ]],
      typeAction: [AliasActionType.Link, [
        Validators.required
      ]]
    });
  }

  captureaddress($event) {
    this.LinkToNamespaceForm.get('address').valueChanges.subscribe(
      value => {
        this.address = Address.createFromRawAddress(value);
        this.builder();
      });
  }
  captureAction() {
    const action = this.LinkToNamespaceForm.get('typeAction').value;
    this.action = action;
    this.builder();
  }

  captureNamespace() {
    const namespaceId = new NamespaceId(this.LinkToNamespaceForm.get('namespace').value);
    this.namespaceId = namespaceId;
    this.builder();
  }

  builder() {
    const params: AddressAliasTransactionInterface = {
      aliasActionType: this.action,
      namespaceId: this.namespaceId,
      address: this.address
    };

    this.addressAliasTransaction = this.namespaceService.addressAliasTransaction(params);
    this.fee = this.transactionService.amountFormatterSimple(this.addressAliasTransaction.maxFee.compact());


  }

  /**
   *
   *
   * @memberof AliasAddressToNamespaceComponent
   */
  clearForm() {
    const valueAddress = this.LinkToNamespaceForm.get('address').value;
    this.LinkToNamespaceForm.reset({
      namespace: '',
      password: ''
    }, {
      emitEvent: false
    }
    );

    this.LinkToNamespaceForm.get('address').setValue(valueAddress, { emitEvent: false });
  }


  /**
   *
   *
   * @memberof AliasAddressToNamespaceComponent
   */
  getNamespaces() {
    this.subscription.push(this.namespaceService.getNamespaceChanged().subscribe(
      async (arrayNamespaceStorage: NamespaceStorageInterface[]) => {
        console.log('LO QUE ME LLEGA ---> ', arrayNamespaceStorage);
        this.arrayNamespaceStorage = arrayNamespaceStorage;
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
          for (let data of namespaceInfo) {
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
                //Assign level 2
                const level2 = data.namespaceName.name;
                //Search level 1
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
                //Assign el level3
                const level3 = data.namespaceName.name;
                //search level 2
                const level2: NamespaceStorageInterface[] = await this.namespaceService.getNamespaceFromId(
                  [this.proximaxProvider.getNamespaceId([data.namespaceName.parentId.id.lower, data.namespaceName.parentId.id.higher])]
                );

                //search level 1
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
  getTransactionStatus() {
    this.subscription['transactionStatus'] = this.dataBridge.getTransactionStatus().subscribe(
      statusTransaction => {
        if (statusTransaction !== null && statusTransaction !== undefined && this.transactionSigned !== null) {
          const match = statusTransaction['hash'] === this.transactionSigned.hash;
          if (statusTransaction['type'] === 'confirmed' && match) {
            this.transactionSigned = null;
          } else if (statusTransaction['type'] === 'unconfirmed' && match) {
            this.transactionSigned = null;
          } else if (match) {
            this.transactionSigned = null;
          }
        }
      }
    );
  }

  /**
   *
   *
   * @memberof AliasAddressToNamespaceComponent
   */
  async sendTransaction() {
    if (this.LinkToNamespaceForm.valid && !this.blockSend) {
      const validateAmount = this.transactionService.validateBuildSelectAccountBalance(this.amountAccount, Number(this.fee), 0)
      if (validateAmount) {
        this.blockSend = true;
        const common = {
          password: this.LinkToNamespaceForm.get('password').value,
          privateKey: ''
        }

        if (this.walletService.decrypt(common)) {
          // const action = this.LinkToNamespaceForm.get('typeAction').value;
          // console.log(this.LinkToNamespaceForm.get('namespace').value);

          // const namespaceId = new NamespaceId(this.LinkToNamespaceForm.get('namespace').value);
          // const address = Address.createFromRawAddress(this.LinkToNamespaceForm.get('address').value);
          // console.log('address', address);

          // const params: AddressAliasTransactionInterface = {
          //   aliasActionType: action,
          //   namespaceId: namespaceId,
          //   address: address,
          //   common: common
          // };

          //this.transactionSigned = this.namespaceService.addressAliasTransaction(params);
          const account = this.proximaxProvider.getAccountFromPrivateKey(common.privateKey, this.walletService.currentAccount.network);
          const generationHash = this.dataBridge.blockInfo.generationHash;
          this.transactionSigned = account.sign(this.addressAliasTransaction, generationHash); //Update-sdk-dragon
          this.proximaxProvider.announce(this.transactionSigned).subscribe(
            next => {
              this.blockSend = false;
              this.clearForm();
              /*if (this.subscription['transactionStatus'] === undefined || this.subscription['transactionStatus'] === null) {
                this.getTransactionStatus();
              }*/
            }
          );

        } else {
          this.LinkToNamespaceForm.get('password').patchValue('');
          this.blockSend = false;
        }
      } else {
        this.sharedService.showError('', 'insufficient balance');
      }
    }
  }

  /**
   *
   *
   * @param {*} event
   * @memberof CreateTransferComponent
   */
  selectContact(event: { label: string, value: string }) {
    if (event !== undefined && event.value !== '') {
      this.LinkToNamespaceForm.get('address').patchValue(event.value);
      this.address =  Address.createFromRawAddress(event.value);
    }
  }
}
