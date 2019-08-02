import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { AliasActionType, Address, NamespaceId } from 'tsjs-xpx-chain-sdk';
import { Router } from '@angular/router';
import { NgBlockUI, BlockUI } from 'ng-block-ui';
import { NamespacesService } from '../../../../servicesModule/services/namespaces.service';
import { AppConfig } from '../../../../config/app.config';
import { ProximaxProvider } from '../../../../shared/services/proximax.provider';
import { DataBridgeService } from 'src/app/shared/services/data-bridge.service';
import { SharedService, ConfigurationForm } from 'src/app/shared/services/shared.service';
import { WalletService } from 'src/app/wallet/services/wallet.service';

@Component({
  selector: 'app-alias-address-to-namespace',
  templateUrl: './alias-address-to-namespace.component.html',
  styleUrls: ['./alias-address-to-namespace.component.css']
})
export class AliasAddressToNamespaceComponent implements OnInit {

  @BlockUI() blockUI: NgBlockUI;
  moduleName = 'Accounts';
  componentName = 'Alias to Namespace';
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
  }

  createForm() {
    this.LinkToNamespaceForm = this.fb.group({
      namespace: ['1', [Validators.required]],
      address: ['', [Validators.required, Validators.minLength(40), Validators.maxLength(46)]],
      password: ['', [Validators.required, Validators.minLength(this.configurationForm.passwordWallet.minLength),
        Validators.maxLength(this.configurationForm.passwordWallet.maxLength)]]
    });
  }

  clearForm() {
    this.LinkToNamespaceForm.get('namespace').patchValue('1');
    this.LinkToNamespaceForm.get('address').patchValue('');
    this.LinkToNamespaceForm.get('password').patchValue('');
  }

  getNameNamespace() {
    this.namespaceService.searchNamespaceFromAccountStorage$().then(
      async namespaceStorage => {
        const namespaceSelect = this.namespaceSelect.slice(0);
        if (namespaceStorage !== undefined && namespaceStorage.length > 0) {
          for (let data of namespaceStorage) {
            if (data.NamespaceInfo.depth === 1) {
              namespaceSelect.push({
                value: `${data.namespaceName.name}`,
                label: `${data.namespaceName.name}`,
                selected: false,
                disabled: false
              });
            }
          }
        }

        this.namespaceSelect = namespaceSelect;
      }
    ).catch(error => {
      this.blockUI.stop();
      this.router.navigate([AppConfig.routes.home]);
      this.sharedService.showError('', 'Please check your connection and try again');
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
        this.transactionSigned = this.namespaceService.addressAliasTransaction(AliasActionType.Link, namespaceId, address, common);
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
