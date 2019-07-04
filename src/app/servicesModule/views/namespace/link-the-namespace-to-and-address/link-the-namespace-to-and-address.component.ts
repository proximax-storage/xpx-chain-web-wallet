import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { AliasActionType, Address, NamespaceId } from 'tsjs-xpx-chain-sdk';
import { Router } from '@angular/router';
import { NgBlockUI, BlockUI } from 'ng-block-ui';
import { NamespacesService } from '../../../../servicesModule/services/namespaces.service';
import { AppConfig } from '../../../../config/app.config';
import { SharedService, WalletService } from '../../../../shared';
import { ProximaxProvider } from '../../../../shared/services/proximax.provider';
import { DataBridgeService } from 'src/app/shared/services/data-bridge.service';

@Component({
  selector: 'app-link-the-namespace-to-and-address',
  templateUrl: './link-the-namespace-to-and-address.component.html',
  styleUrls: ['./link-the-namespace-to-and-address.component.scss']
})
export class LinkTheNamespaceToAndAddressComponent implements OnInit {

  @BlockUI() blockUI: NgBlockUI;
  blockSend: boolean = false;
  LinkTheNamespaceToAndAddressForm: FormGroup;
  namespaceSelect: Array<object> = [
    {
      value: '1',
      label: 'Select namespaces',
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
    this.createForm();
    this.getNameNamespace();
  }

  createForm() {
    this.LinkTheNamespaceToAndAddressForm = this.fb.group({
      namespace: ['1', [Validators.required]],
      address: ['', [Validators.required, Validators.minLength(40), Validators.maxLength(46)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(30)]]
    });
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

  getError(param: string | (string | number)[], name: string = '') {
    if (this.LinkTheNamespaceToAndAddressForm.get(param).getError('required')) {
      return `This field is required`;
    } else if (this.LinkTheNamespaceToAndAddressForm.get(param).getError('minlength')) {
      return `This field must contain minimum ${this.LinkTheNamespaceToAndAddressForm.get(param).getError('minlength').requiredLength} characters`;
    } else if (this.LinkTheNamespaceToAndAddressForm.get(param).getError('maxlength')) {
      return `This field must contain maximum ${this.LinkTheNamespaceToAndAddressForm.get(param).getError('maxlength').requiredLength} characters`;
    } else {
      return ``;
    }
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
    if (this.LinkTheNamespaceToAndAddressForm.valid && !this.blockSend) {
      this.blockSend = true;
      const common = {
        password: this.LinkTheNamespaceToAndAddressForm.get('password').value,
        privateKey: ''
      }

      if (this.walletService.decrypt(common)) {
        const namespaceId = new NamespaceId(this.LinkTheNamespaceToAndAddressForm.get('namespace').value);
        const address = Address.createFromRawAddress(this.LinkTheNamespaceToAndAddressForm.get('address').value);
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
        this.LinkTheNamespaceToAndAddressForm.get('password').patchValue('');
        this.blockSend = false;
      }
    }
  }

  resetForm() {
    this.LinkTheNamespaceToAndAddressForm.get('namespace').patchValue('');
    this.LinkTheNamespaceToAndAddressForm.get('address').patchValue('');
    this.LinkTheNamespaceToAndAddressForm.get('password').patchValue('');
  }

}
