import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormBuilder, AbstractControl } from '@angular/forms';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Router } from '@angular/router';
import { NamespaceId, MosaicId } from 'tsjs-xpx-chain-sdk';
import { AppConfig } from '../../../../config/app.config';
import { MosaicService } from '../../../../servicesModule/services/mosaic.service';
import { ProximaxProvider } from '../../../../shared/services/proximax.provider';
import { NamespacesService, NamespaceStorageInterface } from '../../../../servicesModule/services/namespaces.service';
import { DataBridgeService } from '../../../../shared/services/data-bridge.service';
import { SharedService, ConfigurationForm } from '../../../../shared/services/shared.service';
import { WalletService } from '../../../../wallet/services/wallet.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-alias-mosaics-to-namespace',
  templateUrl: './alias-mosaics-to-namespace.component.html',
  styleUrls: ['./alias-mosaics-to-namespace.component.css']
})
export class AliasMosaicsToNamespaceComponent implements OnInit {

  @BlockUI() blockUI: NgBlockUI;
  moduleName = 'Mosaics';
  componentName = 'LINK TO NAMESPACE';
  backToService = `/${AppConfig.routes.service}`;
  configurationForm: ConfigurationForm = {};
  linkingNamespaceToMosaic: FormGroup;
  blockSend: boolean = false;
  mosaicSelect: Array<object> = [
    {
      value: '1',
      label: 'Enter here',
      selected: true,
      disabled: true
    }
  ];
  namespaceSelect: Array<object> = [
    {
      value: '1',
      label: 'Enter here',
      selected: true,
      disabled: true
    }
  ];
  transactionSigned: any;
  subscribe = ['transactionStatus'];
  subscription: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private sharedService: SharedService,
    private namespaceService: NamespacesService,
    private mosaicService: MosaicService,
    private proximaxProvider: ProximaxProvider,
    private walletService: WalletService,
    private dataBridge: DataBridgeService
  ) { }

  ngOnInit() {
    this.configurationForm = this.sharedService.configurationForm;
    this.createForm();
    this.getNameNamespace();
    this.getMosaic();
  }

  ngOnDestroy(): void {
    this.subscription.forEach(subscription => {
      // console.log(subscription);
      subscription.unsubscribe();
    });
  }

  /**
   *
   *
   * @memberof LinkingNamespaceToMosaicComponent
   */
  createForm() {
    this.linkingNamespaceToMosaic = this.fb.group({
      namespace: ['', [Validators.required]],
      mosaic: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(30)]]
    });
  }

  clearForm() {
    this.linkingNamespaceToMosaic.get('namespace').patchValue('1');
    this.linkingNamespaceToMosaic.get('mosaic').patchValue('1');
    this.linkingNamespaceToMosaic.get('password').patchValue('');
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

      const currentAccount = Object.assign({}, this.walletService.getCurrentAccount());
      const isOwner = (
        addressOwner.pretty() ===
        this.proximaxProvider.createFromRawAddress(currentAccount.address).pretty()
      ) ? true : false;

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

  getTransactionStatus() {
    this.subscribe['transactionStatus'] = this.dataBridge.getTransactionStatus().subscribe(
      statusTransaction => {
        if (statusTransaction !== null && statusTransaction !== undefined && this.transactionSigned !== null) {
          const statusTransactionHash = (statusTransaction['type'] === 'error') ? statusTransaction['data'].hash : statusTransaction['data'].transactionInfo.hash;
          const match = statusTransactionHash === this.transactionSigned.hash;
          if (statusTransaction['type'] === 'confirmed' && match) {
            this.transactionSigned = null;
            this.sharedService.showSuccess('', 'Transaction confirmed');
            this.mosaicService.resetMosaicsStorage();
            this.namespaceService.resetNamespaceStorage();
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
   * @param {string} [nameInput='']
   * @param {string} [nameControl='']
   * @param {string} [nameValidation='']
   * @returns
   * @memberof AliasMosaicsToNamespaceComponent
   */
  validateInput(nameInput: string = '', nameControl: string = '', nameValidation: string = '') {
    let validation: AbstractControl = null;
    if (nameInput !== '' && nameControl !== '') {
      validation = this.linkingNamespaceToMosaic.controls[nameControl].get(nameInput);
    } else if (nameInput === '' && nameControl !== '' && nameValidation !== '') {
      validation = this.linkingNamespaceToMosaic.controls[nameControl].getError(nameValidation);
    } else if (nameInput !== '') {
      validation = this.linkingNamespaceToMosaic.get(nameInput);
    }
    return validation;
  }


  get input() { return this.linkingNamespaceToMosaic.get('password'); }

  resetForm() {
    this.linkingNamespaceToMosaic.get('namespace').patchValue('1');
    this.linkingNamespaceToMosaic.get('mosaic').patchValue('1');
    this.linkingNamespaceToMosaic.get('password').patchValue('');
  }

  send() {
    /* const namespaceValue = this.linkingNamespaceToMosaic.get('namespace').value;
     const mosaicValue = this.linkingNamespaceToMosaic.get('mosaic').value;*/
    if (this.linkingNamespaceToMosaic.valid && !this.blockSend) {
      this.blockSend = true;
      const common = {
        password: this.linkingNamespaceToMosaic.get('password').value,
        privateKey: ''
      }

      if (this.walletService.decrypt(common)) {
        const account = this.proximaxProvider.getAccountFromPrivateKey(common.privateKey, this.walletService.currentAccount.network);
        const namespaceId = new NamespaceId(this.linkingNamespaceToMosaic.get('namespace').value);
        const mosaicId = new MosaicId(this.linkingNamespaceToMosaic.get('mosaic').value);
        const mosaicSupplyChangeTransaction = this.proximaxProvider.linkingNamespaceToMosaic(0, namespaceId, mosaicId, this.walletService.currentAccount.network);
        const signedTransaction = account.sign(mosaicSupplyChangeTransaction);
        this.transactionSigned = signedTransaction;
        this.proximaxProvider.announce(signedTransaction).subscribe(
          x => {
            this.blockSend = false;
            this.resetForm();
            this.blockUI.stop(); // Stop blocking
            // this.sharedService.showSuccess('success', 'Transaction sent');
            if (this.subscribe['transactionStatus'] === undefined || this.subscribe['transactionStatus'] === null) {
              this.getTransactionStatus();
            }
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
