import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { MosaicSupplyType, UInt64 } from 'tsjs-xpx-chain-sdk';
import { ProximaxProvider } from '../../../../shared/services/proximax.provider';
import { WalletService } from '../../../../shared/services/wallet.service';
import { SharedService } from '../../../../shared/services/shared.service';
import { MosaicService } from '../../../../servicesModule/services/mosaic.service';
import { MosaicsStorage } from '../../../../servicesModule/interfaces/mosaics-namespaces.interface';
import { TransactionsService } from '../../../../transactions/service/transactions.service';

@Component({
  selector: 'app-mosaic-supply-change',
  templateUrl: './mosaic-supply-change.component.html',
  styleUrls: ['./mosaic-supply-change.component.scss']
})
export class MosaicSupplyChange implements OnInit {
  @BlockUI() blockUI: NgBlockUI;
  formMosaicSupplyChange: FormGroup;
  parentMosaic: any = [{
    value: '1',
    label: 'Select mosaic',
    selected: true,
    disabled: true
  }];

  mosaicSupplyType: any = [{
    value: MosaicSupplyType.Increase,
    label: 'Increase',
    selected: true,
    disabled: false
  }, {
    value: MosaicSupplyType.Decrease,
    label: 'Decrease',
    selected: false,
    disabled: false
  }];

  mosaicsInfoSelected: MosaicsStorage = null;
  mosaicsInfo: any[];
  divisibility: number = 0;
  duration: string = '0 days';
  supply: string = '0';
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
    private mosaicService: MosaicService,
    private transactionService: TransactionsService
  ) { }
  async ngOnInit() {
    // this.searchMosaics();
    this.createForm();
    const data = await this.mosaicService.searchMosaicsFromAccountStorage$();
    // console.log(data);
    const mosaicsSelect = this.parentMosaic.slice(0);
    data.forEach(element => {
      const nameMosaic = (element.mosaicNames.names.length > 0) ? element.mosaicNames.names[0] : this.proximaxProvider.getMosaicId(element.id).toHex();
      const addressOwner = this.proximaxProvider.createAddressFromPublicKey(
        element.mosaicInfo.owner.publicKey,
        element.mosaicInfo.owner.address['networkType']
      );
      const isOwner = (addressOwner.pretty() === this.walletService.address.pretty()) ? true : false;
      if (isOwner && element.mosaicInfo['properties']['supplyMutable']) {
        mosaicsSelect.push({
          value: element.id,
          label: nameMosaic,
          selected: false,
          disabled: false
        });
      }
    });

    this.parentMosaic = mosaicsSelect;
  }

  /**
   * Create form namespace
   *
   * @memberof CreateMosaicComponent
   */
  createForm() {
    this.formMosaicSupplyChange = this.fb.group({
      parentMosaic: ['1', Validators.required],
      mosaicSupplyType: [MosaicSupplyType.Increase, Validators.required],
      deltaSupply: ['2000000', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(30)]],
    });
  }


  optionSelected(mosaic: any) {
    if (mosaic !== undefined) {
      this.mosaicsInfoSelected = this.mosaicService.filterMosaic(this.proximaxProvider.getMosaicId(mosaic['value']));
      // console.log(this.mosaicsInfoSelected);
      if (this.mosaicsInfoSelected !== null || this.mosaicsInfoSelected !== undefined) {
        this.divisibility = this.mosaicsInfoSelected.mosaicInfo['properties'].divisibility;
        this.levyMutable = this.mosaicsInfoSelected.mosaicInfo['properties'].levyMutable;
        this.supplyMutable = this.mosaicsInfoSelected.mosaicInfo['properties'].supplyMutable;
        this.transferable = this.mosaicsInfoSelected.mosaicInfo['properties'].transferable;
        this.supply = this.transactionService.amountFormatter(
          new UInt64([
            this.mosaicsInfoSelected.mosaicInfo.supply['lower'],
            this.mosaicsInfoSelected.mosaicInfo.supply['higher']
          ]), this.mosaicsInfoSelected.mosaicInfo
        );
        this.duration = this.transactionService.calculateDuration(
          new UInt64([
            this.mosaicsInfoSelected.mosaicInfo['properties']['duration']['lower'],
            this.mosaicsInfoSelected.mosaicInfo.supply['higher']
          ])
        );
        return;
      }
    }

    this.divisibility = 0;
    this.duration = '0 days';
    this.supply = '0';
    this.levyMutable = false;
    this.supplyMutable = false;
    this.transferable = false;
    // console.log('------------- this.supply ---------', this.supply);
    // console.log('------------- this.divisibility ---------', this.divisibility);
    // console.log('------------- this.duration ---------', this.duration);
    // console.log('------------- this.levyMutable ---------', this.levyMutable);
    // console.log('------------- this.supplyMutable ---------', this.supplyMutable);
    // console.log('------------- this.transferable ---------', this.transferable);
    return;
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

  get input() { return this.formMosaicSupplyChange.get('password'); }

  send() {
    if (this.formMosaicSupplyChange.valid) {
      const common = {
        password: this.formMosaicSupplyChange.get('password').value,
        privateKey: ''
      }
      if (this.walletService.decrypt(common)) {
        const account = this.proximaxProvider.getAccountFromPrivateKey(common.privateKey, this.walletService.network);
        const mosaicSupplyChangeTransaction = this.proximaxProvider.mosaicSupplyChangeTransaction(
          this.formMosaicSupplyChange.get('parentMosaic').value,
          this.formMosaicSupplyChange.get('deltaSupply').value,
          this.formMosaicSupplyChange.get('mosaicSupplyType').value,
          this.walletService.network
        )
        const signedTransaction = account.sign(mosaicSupplyChangeTransaction);
        this.proximaxProvider.announce(signedTransaction).subscribe(
          x => {
            this.clearForm()
            this.blockUI.stop(); // Stop blocking
            this.sharedService.showSuccess('success', 'create Supply sent')
          },
          err => {
            this.clearForm()
            this.blockUI.stop(); // Stop blocking
            // console.error(err)
            this.sharedService.showError('', 'An unexpected error has occurred');
          });
      }
    }
  }

  clearForm() {
    this.mosaicsInfoSelected = null;
    this.formMosaicSupplyChange.get('password').patchValue('');
    this.formMosaicSupplyChange.get('deltaSupply').patchValue('');
    this.formMosaicSupplyChange.get('parentMosaic').patchValue(MosaicSupplyType.Increase);
  }

}
