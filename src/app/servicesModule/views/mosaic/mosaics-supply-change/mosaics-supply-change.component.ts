import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { MosaicSupplyType, UInt64, SignedTransaction, MosaicId } from 'tsjs-xpx-chain-sdk';
import { ProximaxProvider } from '../../../../shared/services/proximax.provider';
import { SharedService, ConfigurationForm } from '../../../../shared/services/shared.service';
import { MosaicService, MosaicsStorage } from '../../../../servicesModule/services/mosaic.service';
import { DataBridgeService } from '../../../../shared/services/data-bridge.service';
import { WalletService } from '../../../../wallet/services/wallet.service';
import { TransactionsService } from '../../../../transfer/services/transactions.service';
import { AppConfig } from '../../../../config/app.config';


@Component({
  selector: 'app-mosaics-supply-change',
  templateUrl: './mosaics-supply-change.component.html',
  styleUrls: ['./mosaics-supply-change.component.css']
})
export class MosaicsSupplyChangeComponent implements OnInit {

  @BlockUI() blockUI: NgBlockUI;
  currentBlock: number = 0;
  formMosaicSupplyChange: FormGroup;
  parentMosaic: any = [{
    value: '1',
    label: 'Select or enter here',
    selected: false,
    disabled: true
  }];

  mosaicSupplyType: any = [{
    value: MosaicSupplyType.Increase,
    label: 'Increase',
    selected: false,
    disabled: false
  }, {
    value: MosaicSupplyType.Decrease,
    label: 'Decrease',
    selected: false,
    disabled: false
  }];
  ;
  mosaicsInfo: any[];
  divisibility: number = 0;
  duration: string = '() 0 days';
  supply: string = '0';
  blockButton: boolean = false;
  levyMutable: boolean = false;
  supplyMutable: boolean = false;
  transferable: boolean = false;
  transactionSigned: SignedTransaction[] = [];
  transactionReady: SignedTransaction[] = [];
  subscriptions = ['transactionStatus'];
  configurationForm: ConfigurationForm = {};
  moduleName = 'Mosaics';
  componentName = 'MODIFY SUPPLY';
  backToService = `/${AppConfig.routes.service}`;
  subscribe = ['block'];

  /**
   * Initialize dependencies and properties
   *
   * @params {services, dependencies} - Angular services to inject
   */
  constructor(
    private fb: FormBuilder,
    private proximaxProvider: ProximaxProvider,
    private sharedService: SharedService,
    private walletService: WalletService,
    private mosaicService: MosaicService,
    private transactionService: TransactionsService,
    private dataBridge: DataBridgeService
  ) { }


  async ngOnInit() {
    this.configurationForm = this.sharedService.configurationForm;
    this.createForm();
    this.subscribe['block'] = await this.dataBridge.getBlock().subscribe(next => this.currentBlock = next);
    const data = await this.mosaicService.searchMosaicsFromAccountStorage$();
    const mosaicsSelect = this.parentMosaic.slice(0);
    // console.log(data);
    data.forEach(element => {
      // console.log(element);

      let expired = false;
      let nameExpired = '';
      if (element.mosaicInfo) {
        const nameMosaic = (element.mosaicNames.names.length > 0) ? element.mosaicNames.names[0] : this.proximaxProvider.getMosaicId(element.id).toHex();
        const addressOwner = this.proximaxProvider.createAddressFromPublicKey(
          element.mosaicInfo.owner.publicKey,
          element.mosaicInfo.owner.address['networkType']
        );

        const currentAccount  = Object.assign({}, this.walletService.getCurrentAccount());
        const isOwner = (addressOwner.pretty() === this.proximaxProvider.createFromRawAddress(currentAccount.address).pretty()) ? true : false;
        const durationMosaic = new UInt64([
          element.mosaicInfo['properties']['duration']['lower'],
          element.mosaicInfo['properties']['duration']['higher']
        ]);

        const createdBlock = new UInt64([
          element.mosaicInfo.height.lower,
          element.mosaicInfo.height.higher
        ]);

        if (durationMosaic.compact() > 0) {
          if (this.currentBlock >= durationMosaic.compact() + createdBlock.compact()) {
            expired = true;
            nameExpired = ' - Expired';
          }
        }
        /* console.log(addressOwner.pretty());
         console.log(this.walletService.address.pretty());
         console.log(element.mosaicInfo['properties']['supplyMutable']);
         console.log(isOwner);
         console.log('-------------------------------------------\n');*/

        if (isOwner && element.mosaicInfo['properties']['supplyMutable']) {
          mosaicsSelect.push({
            value: element.id,
            label: `${nameMosaic}${nameExpired}`,
            selected: false,
            disabled: expired
          });
        }
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
      parentMosaic: ['', Validators.required],
      mosaicSupplyType: [MosaicSupplyType.Increase, Validators.required],
      deltaSupply: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(30)]],
    });
  }

  /**
   *
   *
   * @memberof MosaicSupplyChange
   */
  clearForm() {
    this.formMosaicSupplyChange.get('password').patchValue('');
    this.formMosaicSupplyChange.get('deltaSupply').patchValue('');
    this.formMosaicSupplyChange.get('parentMosaic').patchValue(MosaicSupplyType.Increase);
  }


  /**
   *
   *
   * @param {*} mosaic
   * @returns
   * @memberof MosaicsSupplyChangeComponent
   */
  optionSelected(mosaic: any) {
    if (mosaic !== undefined) {
      const mosaicsInfoSelected: MosaicsStorage = this.mosaicService.filterMosaic(this.proximaxProvider.getMosaicId(mosaic['value']));
      //  console.log(mosaicsInfoSelected);
      if (mosaicsInfoSelected !== null || mosaicsInfoSelected !== undefined) {
        this.divisibility = mosaicsInfoSelected.mosaicInfo['properties'].divisibility;
        this.levyMutable = mosaicsInfoSelected.mosaicInfo['properties'].levyMutable;
        this.supplyMutable = mosaicsInfoSelected.mosaicInfo['properties'].supplyMutable;
        this.transferable = mosaicsInfoSelected.mosaicInfo['properties'].transferable;
        this.supply = this.transactionService.amountFormatter(
          new UInt64([
            mosaicsInfoSelected.mosaicInfo.supply['lower'],
            mosaicsInfoSelected.mosaicInfo.supply['higher']
          ]), mosaicsInfoSelected.mosaicInfo
        );
        const durationBlock = new UInt64([
          mosaicsInfoSelected.mosaicInfo['properties']['duration']['lower'],
          mosaicsInfoSelected.mosaicInfo['properties']['duration']['higher']
        ]);

        const durationDays = this.transactionService.calculateDuration(durationBlock);

        this.duration = `(${durationBlock.compact()}) ${durationDays}`;

        /*console.log('------------- this.supply ---------', this.supply);
        console.log('------------- this.divisibility ---------', this.divisibility);
        console.log('------------- this.duration ---------', this.duration);
        console.log('------------- this.levyMutable ---------', this.levyMutable);
        console.log('------------- this.supplyMutable ---------', this.supplyMutable);
        console.log('------------- this.transferable ---------', this.transferable);*/
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

  /*getTransactionStatus2() {
    // Get transaction status
    this.subscriptions['transactionStatus'] = this.dataBridge.getTransactionStatus().subscribe(
      statusTransaction => {
        if (statusTransaction !== null && statusTransaction !== undefined && this.transactionSigned !== null) {
          for (let element of this.transactionSigned) {
            const statusTransactionHash = (statusTransaction['type'] === 'error') ? statusTransaction['data'].hash : statusTransaction['data'].transactionInfo.hash;
            const match = statusTransactionHash === element.hash;
            if (statusTransaction['type'] === 'confirmed' && match) {
              this.transactionSigned = this.transactionSigned.filter(el => el.hash !== statusTransactionHash);
              this.sharedService.showSuccess('', 'Transaction confirmed');
            } else if (statusTransaction['type'] === 'unconfirmed' && match) {
              this.sharedService.showInfo('', 'Transaction unconfirmed');
            } else if (match) {
              this.transactionSigned = this.transactionSigned.filter(el => el.hash !== statusTransactionHash);
              this.sharedService.showWarning('', statusTransaction['data'].status.split('_').join(' '));
            }
          }
        }
      }
    );
  }*/


  getTransactionStatus() {
    // Get transaction status
    this.subscriptions['transactionStatus'] = this.dataBridge.getTransactionStatus().subscribe(
      statusTransaction => {
        if (statusTransaction !== null && statusTransaction !== undefined && this.transactionSigned !== null) {
          for (let element of this.transactionSigned) {
            const statusTransactionHash = (statusTransaction['type'] === 'error') ? statusTransaction['data'].hash : statusTransaction['data'].transactionInfo.hash;
            const match = statusTransactionHash === element.hash;
            if (match) {
              this.transactionReady.push(element);
            }
            if (statusTransaction['type'] === 'confirmed' && match) {
              this.transactionSigned = this.transactionSigned.filter(el => el.hash !== statusTransactionHash);
              this.sharedService.showSuccess('', 'Transaction confirmed');
            } else if (statusTransaction['type'] === 'unconfirmed' && match) {
              this.sharedService.showInfo('', 'Transaction unconfirmed');
            } else if (match) {
              this.transactionSigned = this.transactionSigned.filter(el => el.hash !== statusTransactionHash);
              this.sharedService.showWarning('', statusTransaction['data'].status.split('_').join(' '));
            }
          }
        }
      }
    );
  }

  /*
    getTransactionStatus() {
      // Get transaction status
      this.subscriptions['transactionStatus'] = this.dataBridge.getTransactionStatus().subscribe(
        statusTransaction => {
          if (statusTransaction !== null && statusTransaction !== undefined && this.transactionSigned !== null) {
            for (let element of this.transactionSigned) {
              const statusTransactionHash = (statusTransaction['type'] === 'error') ? statusTransaction['data'].hash : statusTransaction['data'].transactionInfo.hash;
              const match = statusTransactionHash === element.hash;
              if (statusTransaction['type'] === 'confirmed' && match) {
                this.transactionSigned = this.transactionSigned.filter(el => el.hash !== statusTransactionHash);
                this.sharedService.showSuccess('', 'Transaction confirmed');
              } else if (statusTransaction['type'] === 'unconfirmed' && match) {
                this.sharedService.showInfo('', 'Transaction unconfirmed');
              } else if (match) {
                this.transactionSigned = this.transactionSigned.filter(el => el.hash !== statusTransactionHash);
                this.sharedService.showWarning('', statusTransaction['data'].status.split('_').join(' '));
              }
            }
          }
        }
      );
    }*/

  send() {
    if (this.formMosaicSupplyChange.valid) {
      this.blockButton = true;
      const common = {
        password: this.formMosaicSupplyChange.get('password').value,
        privateKey: ''
      }
      if (this.walletService.decrypt(common)) {
        const account = this.proximaxProvider.getAccountFromPrivateKey(common.privateKey, this.walletService.currentAccount.network);

        const quatityZeros = this.transactionService.addZeros(this.divisibility);
        const mosaicSupply = parseInt(`${this.formMosaicSupplyChange.get('deltaSupply').value}${quatityZeros}`);

        const mosaicSupplyChangeTransaction = this.proximaxProvider.mosaicSupplyChangeTransaction(
          this.formMosaicSupplyChange.get('parentMosaic').value,
          mosaicSupply,
          this.formMosaicSupplyChange.get('mosaicSupplyType').value,
          this.walletService.currentAccount.network
        )

        const signedTransaction = account.sign(mosaicSupplyChangeTransaction);
        this.transactionSigned.push(signedTransaction);
        console.log(signedTransaction);
        console.log(this.transactionSigned);
        this.proximaxProvider.announce(signedTransaction).subscribe(
          x => {
            console.log('Este no es ningun error', x);
            this.blockButton = false;
            this.clearForm()
            this.blockUI.stop();
            if (this.subscriptions['transactionStatus'] === undefined || this.subscriptions['transactionStatus'] === null) {
              this.getTransactionStatus();
            }

            this.setTimeOutValidate(signedTransaction.hash);
          },
          err => {
            console.log('Este es un ERROR', err);
            this.blockButton = false;
            this.clearForm()
            this.blockUI.stop(); // Stop blocking
            // this.sharedService.showError('', 'An unexpected error has occurred');
          });
      }
    }
  }

  setTimeOutValidate(hash: string) {
    setTimeout(() => {
      let exist = false;
      for (let element of this.transactionReady) {
        if (hash === element.hash) {
          exist = true;
        }
      }

      (exist) ? '' : this.sharedService.showWarning('', 'An error has occurred');
    }, 5000);
  }

  validateInput(nameInput: string = '', nameControl: string = '', nameValidation: string = '') {
    let validation: AbstractControl = null;
    if (nameInput !== '' && nameControl !== '') {
      validation = this.formMosaicSupplyChange.controls[nameControl].get(nameInput);
    } else if (nameInput === '' && nameControl !== '' && nameValidation !== '') {
      validation = this.formMosaicSupplyChange.controls[nameControl].getError(nameValidation);
    } else if (nameInput !== '') {
      validation = this.formMosaicSupplyChange.get(nameInput);
    }
    return validation;
  }
}
