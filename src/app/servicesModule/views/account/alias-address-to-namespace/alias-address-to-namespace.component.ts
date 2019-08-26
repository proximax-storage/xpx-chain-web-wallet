import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { AliasActionType, Address, NamespaceId, LinkAction } from 'tsjs-xpx-chain-sdk';
import { Router } from '@angular/router';
import { NgBlockUI, BlockUI } from 'ng-block-ui';
import { AppConfig } from '../../../../config/app.config';
import { ProximaxProvider } from '../../../../shared/services/proximax.provider';
import { NamespacesService, NamespaceStorageInterface, AddressAliasTransactionInterface } from '../../../../servicesModule/services/namespaces.service';
import { DataBridgeService } from 'src/app/shared/services/data-bridge.service';
import { SharedService, ConfigurationForm } from 'src/app/shared/services/shared.service';
import { WalletService } from 'src/app/wallet/services/wallet.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-alias-address-to-namespace',
  templateUrl: './alias-address-to-namespace.component.html',
  styleUrls: ['./alias-address-to-namespace.component.css']
})
export class AliasAddressToNamespaceComponent implements OnInit {

  arrayNamespaceStorage: NamespaceStorageInterface[] = [];
  moduleName = 'Accounts';
  componentName = 'LINK TO NAMESPACE';
  backToService = `/${AppConfig.routes.service}`;
  configurationForm: ConfigurationForm = {};
  blockSend: boolean = false;
  LinkToNamespaceForm: FormGroup;
  loading = false;
  namespaceSelect: Array<object> = [
    {
      value: '1',
      label: 'Select or enter namespace',
      selected: true,
      disabled: true
    }
  ];
  subscribe = ['transactionStatus'];
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

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private sharedService: SharedService,
    private namespaceService: NamespacesService,
    private walletService: WalletService,
    private proximaxProvider: ProximaxProvider,
    private dataBridge: DataBridgeService
  ) { }

  ngOnInit() {
    this.configurationForm = this.sharedService.configurationForm;
    this.createForm();
    // this.getNameNamespace();
    this.getNamespaces();
    const address = this.walletService.currentAccount.address;
    this.LinkToNamespaceForm.get('address').patchValue(address);
  }

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
    console.log('--arrayNamespaceStorage--', this.arrayNamespaceStorage);
    const namespaceSelect = [];
    this.loading = true;
    if (this.arrayNamespaceStorage && this.arrayNamespaceStorage.length > 0) {
      for (let namespaceStorage of this.arrayNamespaceStorage) {
        if (namespaceStorage.namespaceInfo) {
          console.log('INFO ---> ', namespaceStorage, '\n\n');
          let isLinked = false;
          let disabled = false;
          let name = await this.namespaceService.getNameParentNamespace(namespaceStorage);
          const type = namespaceStorage.namespaceInfo.alias.type;
          if (type === 2) {
            isLinked = true;
            disabled = (this.LinkToNamespaceForm.get('typeAction').value === 0) ? true : false;
            name = `${name}- (Linked to address)`;
          } else if (type === 1) {
            isLinked = true;
            disabled = true;
            name = `${name}- (Linked to mosaic)`;
          } else {
            disabled = (this.LinkToNamespaceForm.get('typeAction').value === 1) ? true : false;
          }

          namespaceSelect.push({
            label: `${name}`,
            value: `${name}`,
            selected: false,
            disabled: disabled
          });
        }
      };
    }

    this.namespaceSelect = namespaceSelect.sort(function (a: any, b: any) {
      return a.label === b.label ? 0 : +(a.label > b.label) || -1;
    });

    this.loading = false;
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
    this.namespaceService.getNamespaceChanged().subscribe(
      async (arrayNamespaceStorage: NamespaceStorageInterface[]) => {
        this.arrayNamespaceStorage = arrayNamespaceStorage;
        this.buildSelectNamespace();
      }
    );
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
    this.subscribe['transactionStatus'] = this.dataBridge.getTransactionStatus().subscribe(
      statusTransaction => {
        if (statusTransaction !== null && statusTransaction !== undefined && this.transactionSigned !== null) {
          const statusTransactionHash = (statusTransaction['type'] === 'error') ? statusTransaction['data'].hash : statusTransaction['data'].transactionInfo.hash;
          const match = statusTransactionHash === this.transactionSigned.hash;
          if (statusTransaction['type'] === 'confirmed' && match) {
            this.transactionSigned = null;
            this.sharedService.showSuccess('', 'Transaction confirmed');
          } else if (statusTransaction['type'] === 'unconfirmed' && match) {
            this.transactionSigned = null;
            this.sharedService.showInfo('', 'Transaction unconfirmed');
          } else if (match) {
            this.transactionSigned = null;
            this.sharedService.showWarning('', statusTransaction['data'].status.split('_').join(' '));
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
      this.blockSend = true;
      const common = {
        password: this.LinkToNamespaceForm.get('password').value,
        privateKey: ''
      }

      if (this.walletService.decrypt(common)) {
        const action = this.LinkToNamespaceForm.get('typeAction').value;
        const namespaceId = new NamespaceId(this.LinkToNamespaceForm.get('namespace').value);
        const address = Address.createFromRawAddress(this.LinkToNamespaceForm.get('address').value);
        console.log('address', address);

        const params: AddressAliasTransactionInterface = {
          aliasActionType: action,
          namespaceId: namespaceId,
          address: address,
          common: common
        };

        this.transactionSigned = this.namespaceService.addressAliasTransaction(params);
        this.proximaxProvider.announce(this.transactionSigned).subscribe(
          next => {
            this.blockSend = false;
            this.clearForm();
            if (this.subscribe['transactionStatus'] === undefined || this.subscribe['transactionStatus'] === null) {
              this.getTransactionStatus();
            }
          }
        );

      } else {
        this.LinkToNamespaceForm.get('password').patchValue('');
        this.blockSend = false;
      }
    }
  }
}
