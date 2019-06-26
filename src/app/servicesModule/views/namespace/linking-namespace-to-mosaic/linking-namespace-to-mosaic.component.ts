import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Router } from '@angular/router';
import { NamespaceId, MosaicId } from 'tsjs-xpx-chain-sdk';
import { AppConfig } from '../../../../config/app.config';
import { SharedService, WalletService } from '../../../../shared';
import { MosaicService } from '../../../../servicesModule/services/mosaic.service';
import { ProximaxProvider } from '../../../../shared/services/proximax.provider';
import { NamespaceStorage } from '../../../../servicesModule/interfaces/mosaics-namespaces.interface';
import { NamespacesService } from '../../../../servicesModule/services/namespaces.service';


@Component({
  selector: 'app-linking-namespace-to-mosaic',
  templateUrl: './linking-namespace-to-mosaic.component.html',
  styleUrls: ['./linking-namespace-to-mosaic.component.scss']
})
export class LinkingNamespaceToMosaicComponent implements OnInit {

  @BlockUI() blockUI: NgBlockUI;
  linkingNamespaceToMosaic: FormGroup;
  blockSend: boolean = false;
  mosaicSelect: Array<object> = [
    {
      value: '1',
      label: 'Select mosaics',
      selected: true,
      disabled: true
    }
  ];
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
    private mosaicService: MosaicService,
    private proximaxProvider: ProximaxProvider,
    private walletService: WalletService
  ) { }

  ngOnInit() {
    this.createForm();
    this.getNameNamespace();
    this.getMosaic();
  }

  /**
   *
   *
   * @memberof LinkingNamespaceToMosaicComponent
   */
  createForm() {
    this.linkingNamespaceToMosaic = this.fb.group({
      namespace: ['1', [Validators.required]],
      mosaic: ['1', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(30)]]
    });
  }

  /**
   *
   *
   * @memberof LinkingNamespaceToMosaicComponent
   */
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
            } else {
              let name = '';
              if (data.NamespaceInfo.depth === 2) {
                //Assign level 2
                const level2 = data.namespaceName.name;
                //Search level 1
                const level1: NamespaceStorage = await this.namespaceService.getNamespaceFromId(
                  this.proximaxProvider.getNamespaceId([data.namespaceName.parentId.id.lower, data.namespaceName.parentId.id.higher])
                );

                name = `${level1.namespaceName.name}.${level2}`;
                namespaceSelect.push({
                  value: `${name}`,
                  label: `${name}`,
                  selected: false,
                  disabled: false
                });
              } else if (data.NamespaceInfo.depth === 3) {
                //Assign el level3
                const level3 = data.namespaceName.name;
                //search level 2
                const level2: NamespaceStorage = await this.namespaceService.getNamespaceFromId(
                  this.proximaxProvider.getNamespaceId([data.namespaceName.parentId.id.lower, data.namespaceName.parentId.id.higher])
                );

                //search level 1
                const level1: NamespaceStorage = await this.namespaceService.getNamespaceFromId(
                  this.proximaxProvider.getNamespaceId([level2.namespaceName.parentId.id.lower, level2.namespaceName.parentId.id.higher])
                );
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
   * @memberof LinkingNamespaceToMosaicComponent
   */
  async getMosaic() {
    const data = await this.mosaicService.searchMosaicsFromAccountStorage$();
    // console.log(data);
    const mosaicsSelect = this.mosaicSelect.slice(0);
    data.forEach(element => {
      const nameMosaic = (element.mosaicNames.names.length > 0) ? element.mosaicNames.names[0] : this.proximaxProvider.getMosaicId(element.id).toHex();
      const addressOwner = this.proximaxProvider.createAddressFromPublicKey(
        element.mosaicInfo.owner.publicKey,
        element.mosaicInfo.owner.address['networkType']
      );
      const isOwner = (addressOwner.pretty() === this.walletService.address.pretty()) ? true : false;
      if (isOwner) {
        mosaicsSelect.push({
          value: element.id,
          label: nameMosaic,
          selected: false,
          disabled: false
        });
      }
    });

    this.mosaicSelect = mosaicsSelect;
  }

  /**
   *
   *
   * @param {(string | (string | number)[])} param
   * @param {string} [name='']
   * @returns
   * @memberof LinkingNamespaceToMosaicComponent
   */
  getError(param: string | (string | number)[], name: string = '') {
    if (this.linkingNamespaceToMosaic.get(param).getError('required')) {
      return `This field is required`;
    } else if (this.linkingNamespaceToMosaic.get(param).getError('minlength')) {
      return `This field must contain minimum ${this.linkingNamespaceToMosaic.get(param).getError('minlength').requiredLength} characters`;
    } else if (this.linkingNamespaceToMosaic.get(param).getError('maxlength')) {
      return `This field must contain maximum ${this.linkingNamespaceToMosaic.get(param).getError('maxlength').requiredLength} characters`;
    } else {
      return ``;
    }
  }

  get input() { return this.linkingNamespaceToMosaic.get('password'); }

  resetForm() {
    this.linkingNamespaceToMosaic.get('namespace').patchValue('1');
    this.linkingNamespaceToMosaic.get('mosaic').patchValue('1');
    this.linkingNamespaceToMosaic.get('password').patchValue('');
  }

  send() {
    if (this.linkingNamespaceToMosaic.valid && !this.blockSend) {
      this.blockSend = true;
      const common = {
        password: this.linkingNamespaceToMosaic.get('password').value,
        privateKey: ''
      }
      if (this.walletService.decrypt(common)) {
        const account = this.proximaxProvider.getAccountFromPrivateKey(common.privateKey, this.walletService.network);
        const namespaceId = new NamespaceId(this.linkingNamespaceToMosaic.get('namespace').value);
        const mosaicId = new MosaicId(this.linkingNamespaceToMosaic.get('mosaic').value);
        const mosaicSupplyChangeTransaction = this.proximaxProvider.linkingNamespaceToMosaic(0, namespaceId, mosaicId, this.walletService.network);
        const signedTransaction = account.sign(mosaicSupplyChangeTransaction);
        this.proximaxProvider.announce(signedTransaction).subscribe(
          x => {
            this.blockSend = false;
            this.resetForm();
            this.blockUI.stop(); // Stop blocking
            this.sharedService.showSuccess('success', 'Transaction sent');
            this.mosaicService.resetMosaicsStorage();
            this.namespaceService.resetNamespaceStorage();
          },
          err => {
            this.blockSend = false;
            this.resetForm();
            this.blockUI.stop(); // Stop blocking
            this.sharedService.showError('', 'An unexpected error has occurred');
          });
      } else {
        this.blockSend = false;
      }
    }
  }

}
