import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { AliasActionType, Address, NamespaceId } from 'tsjs-xpx-chain-sdk';
import { Router } from '@angular/router';
import { NgBlockUI, BlockUI } from 'ng-block-ui';
import { NamespacesService } from '../../../../servicesModule/services/namespaces.service';
import { AppConfig } from '../../../../config/app.config';
import { SharedService, WalletService } from '../../../../shared';

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

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private sharedService: SharedService,
    private namespaceService: NamespacesService,
    private walletService: WalletService
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
        this.namespaceService.addressAliasTransaction(AliasActionType.Link, namespaceId, address, common);
        this.blockSend = false;
        this.resetForm();
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
