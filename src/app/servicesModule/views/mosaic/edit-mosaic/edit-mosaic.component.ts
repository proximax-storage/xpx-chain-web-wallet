import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, Form } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { AccountInfo, QueryParams, NamespaceName, MosaicId } from 'proximax-nem2-sdk';
import { ProximaxProvider } from '../../../../shared/services/proximax.provider';
import { WalletService } from '../../../../shared/services/wallet.service';
import { MosaicService } from '../../../services/mosaic.service';
import { SharedService } from '../../../../shared/services/shared.service';
import { AppConfig } from '../../../../config/app.config';
import { BlockUI, NgBlockUI } from 'ng-block-ui';

@Component({
  selector: 'app-edit-mosaic',
  templateUrl: './edit-mosaic.component.html',
  styleUrls: ['./edit-mosaic.component.scss']
})
export class EditMosaicComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;
  formMosaicSupplyChange: FormGroup;
  parentMosaic: any = [{
    value: '1',
    label: 'Select mosaic',
    selected: true,
    disabled: true
  }];

  mosaicSupplyType: any = [{
    value: '1',
    label: 'Increase',
    selected: true,
    disabled: false
  }, {
    value: '0',
    label: 'Decrease',
    selected: false,
    disabled: false
  }];

  misaicsInfoSelect: any;
  mosaicsInfo: any[];
  divisibility: number = 0;
  duration: number = 0;
  levyMutable: boolean = false;
  supplyMutable: boolean = false;
  transferable: boolean = false;


  /**
   * Initialize dependencies and properties
   *
   * @params {services, dependencies} - Angular services to inject
   */
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private proximaxProvider: ProximaxProvider,
    private sharedService: SharedService,
    private walletService: WalletService,
  ) { }
  ngOnInit() {
    this.searchMosaics();
    this.createForm();
  }

  /**
   * Create form namespace
   *
   * @memberof CreateMosaicComponent
   */
  createForm() {
    this.formMosaicSupplyChange = this.fb.group({
      parentMosaic: ['1', Validators.required],
      mosaicSupplyType: ['1', Validators.required],
      supply: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(30)]],
    });
  }

  async searchMosaics() {
    this.blockUI.start('Processing...');
    const mosaicsInfo = [];
    const mosaicsId = [];
    this.mosaicsInfo = []
    for (let namespaceInfo of this.route.snapshot.data['dataNamespace']) {
      await this.nemProvider.getInfoMosaicFromNamespacePromise(namespaceInfo.id).then(
        async mosaicInfo => {
          if (Object.keys(mosaicInfo).length > 0) {
            for (let element of Object.keys(mosaicInfo)) {
              mosaicsId.push(mosaicInfo[element].mosaicId);
              mosaicsInfo.push(mosaicInfo[element]);
            }
          }
        }, error => {
          console.log("error ----> ", error);
          this.sharedService.showError('', error);
        }
      );
    }
    if (mosaicsInfo.length > 0) {
      const response = await this.getMosaicName(mosaicsId, mosaicsInfo)
      this.parentMosaic = response;
      this.blockUI.stop();
    } else {
      this.router.navigate([AppConfig.routes.createMosaic]);
      this.sharedService.showInfo('', 'You must create a mosaic');
      this.blockUI.stop();
    }
  }

  /**
  *
  * @param mosaicsId
  * @param mosaicsInfo
  *
  */
  async getMosaicName(mosaicsId, mosaicsInfo) {
    const response = [{
      value: '1',
      label: 'Select parent namespace',
      selected: true,
      disabled: true
    }];
    const promise = new Promise((resolve, reject) => {
      this.nemProvider.mosaicHttp.getMosaicsName(mosaicsId).subscribe(
        async mosaicsName => {
          for (let x of mosaicsName) {
            const namespac: any = await this.getNamespaceName(x.namespaceId)
            response.push({
              label: `${namespac[0].name}:${x.name}`,
              value: `${namespac[0].name}:${x.name}`,
              selected: false,
              disabled: false
            });

            mosaicsInfo.forEach(element => {
              if (element.mosaicId.id.lower == x.mosaicId.id.lower) {
                this.mosaicsInfo.push({ value: `${namespac[0].name}:${x.name}`, mosaicsinfo: element })
              }
            });
          }
          resolve(response);
        }, error => {
          console.error("Has ocurred a error", error);
          this.router.navigate([AppConfig.routes.home]);
          this.sharedService.showError('', error);
          reject(error);
        });
    });
    return await promise;
  }

  /**
  *
  * @param param
  * @param formControl
  */
  async getNamespaceName(namespaceId) {
    const promise = new Promise((resolve, reject) => {
      this.nemProvider.namespaceHttp.getNamespacesName([namespaceId]).pipe(first()).subscribe(
        namespaceName => {
          resolve(namespaceName);
        }, error => {
          console.error("Has ocurred a error", error);
          this.router.navigate([AppConfig.routes.home]);
          this.sharedService.showError('', error);
          reject(error);
        });
    });
    return await promise;
  }

  /**
 *Change of selection option
 *
 * @param {*} namespace
 * @memberof EditMosaicComponent
 */
  optionSelected(namespace: any) {
    this.misaicsInfoSelect = this.mosaicsInfo.filter((book: any) => (book.value === namespace.value))
    this.divisibility = this.misaicsInfoSelect[0].mosaicsinfo.properties.divisibility
    this.duration = this.misaicsInfoSelect[0].mosaicsinfo.properties.duration.lower
    this.levyMutable = this.misaicsInfoSelect[0].mosaicsinfo.properties.levyMutable
    this.supplyMutable = this.misaicsInfoSelect[0].mosaicsinfo.properties.supplyMutable
    this.transferable = this.misaicsInfoSelect[0].mosaicsinfo.properties.transferable
  }

  /**
   *
   * @param param
   * @param formControl
   */
  getError(param: string | (string | number)[], formControl?: any) {
    if (this.formMosaicSupplyChange.get(param).getError('required')) {
      return `This field is required`;
    } else if (this.formMosaicSupplyChange.get(param).getError('minlength')) {
      return `This field must contain minimum ${this.formMosaicSupplyChange.get(param).getError('minlength').requiredLength} characters`;
    } else if (this.formMosaicSupplyChange.get(param).getError('maxlength')) {
      return `This field must contain maximum ${this.formMosaicSupplyChange.get(param).getError('maxlength').requiredLength} characters`;
    }
  }

  send() {
    if (this.formMosaicSupplyChange.valid) {
      const common = {
        password: this.formMosaicSupplyChange.get('password').value,
        privateKey: ''
      }
      if (this.walletService.decrypt(common)) {
        const account = this.nemProvider.getAccountFromPrivateKey(common.privateKey, this.walletService.network);
        const mosaicSupplyChangeTransaction = this.nemProvider.mosaicSupplyChangeTransaction(
          this.formMosaicSupplyChange.get('parentMosaic').value,
          this.formMosaicSupplyChange.get('supply').value,
          this.formMosaicSupplyChange.get('mosaicSupplyType').value,
          this.walletService.network
        )
        const signedTransaction = account.sign(mosaicSupplyChangeTransaction);
        this.nemProvider.announce(signedTransaction).subscribe(
          x => {
            this.resectForm()
            this.blockUI.stop(); // Stop blocking
            this.sharedService.showSuccess('success', 'create Supply sent')
          },
          err => {
            this.resectForm()
            this.blockUI.stop(); // Stop blocking
            console.error(err)
            this.sharedService.showError('Error', '¡unexpected error!');
          });

      }

    }

  }

  resectForm() {
    this.formMosaicSupplyChange.get('password').patchValue('')
    this.formMosaicSupplyChange.get('supply').patchValue('')
    this.formMosaicSupplyChange.get('parentMosaic').patchValue('1')
  }

}
