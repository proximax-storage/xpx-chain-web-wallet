import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { AliasActionType, Address, NamespaceId } from 'tsjs-xpx-chain-sdk';
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

  @BlockUI() blockUI: NgBlockUI;
  moduleName = 'Accounts';
  componentName = 'LINK TO NAMESPACE';
  backToService = `/${AppConfig.routes.service}`;
  configurationForm: ConfigurationForm = {};
  blockSend: boolean = false;
  LinkToNamespaceForm: FormGroup;
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
    this.getNameNamespace();
    const address = this.walletService.currentAccount.address;
    this.LinkToNamespaceForm.get('address').patchValue(address);
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.subscription.forEach(subscription => {
      // console.log(subscription);
      subscription.unsubscribe();
    });
  }

  createForm() {
    this.LinkToNamespaceForm = this.fb.group({
      namespace: ['', [Validators.required]],
      address: ['', [Validators.required, Validators.minLength(40), Validators.maxLength(46)]],
      password: ['', [Validators.required, Validators.minLength(this.configurationForm.passwordWallet.minLength),
      Validators.maxLength(this.configurationForm.passwordWallet.maxLength)]]
    });
  }

  clearForm() {
    this.LinkToNamespaceForm.get('namespace').patchValue('1');
    this.LinkToNamespaceForm.get('password').patchValue('');
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
                const level1: NamespaceStorageInterface = await this.namespaceService.getNamespaceFromId(
                  [this.proximaxProvider.getNamespaceId([data.namespaceName.parentId.id.lower, data.namespaceName.parentId.id.higher])]
                )[0];

                name = `${level1.namespaceName.name}.${level2}`;
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
                const level2: NamespaceStorageInterface = await this.namespaceService.getNamespaceFromId(
                  [this.proximaxProvider.getNamespaceId([data.namespaceName.parentId.id.lower, data.namespaceName.parentId.id.higher])]
                )[0];

                //search level 1
                const level1: NamespaceStorageInterface = await this.namespaceService.getNamespaceFromId(
                  [this.proximaxProvider.getNamespaceId([level2.namespaceName.parentId.id.lower, level2.namespaceName.parentId.id.higher])]
                )[0];
                name = `${level1.namespaceName.name}.${level2.namespaceName.name}.${level3}`;
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

        this.namespaceSelect = namespaceSelect;
      }, error => {
        this.blockUI.stop();
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

  async send() {
    if (this.LinkToNamespaceForm.valid && !this.blockSend) {
      this.blockSend = true;
      const common = {
        password: this.LinkToNamespaceForm.get('password').value,
        privateKey: ''
      }

      if (this.walletService.decrypt(common)) {
        const namespaceId = new NamespaceId(this.LinkToNamespaceForm.get('namespace').value);
        const address = Address.createFromRawAddress(this.LinkToNamespaceForm.get('address').value);
        const params: AddressAliasTransactionInterface = {
          aliasActionType: AliasActionType.Link,
          namespaceId: namespaceId,
          address: address,
          common: common
        };

        this.transactionSigned = this.namespaceService.addressAliasTransaction(params);
        this.proximaxProvider.announce(this.transactionSigned).subscribe(
          next => {
            this.blockSend = false;
            this.resetForm();
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

  resetForm() {
    this.LinkToNamespaceForm.get('namespace').patchValue('');
    this.LinkToNamespaceForm.get('address').patchValue('');
    this.LinkToNamespaceForm.get('password').patchValue('');
  }

}
