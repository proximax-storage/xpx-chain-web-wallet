import { Component, OnInit } from '@angular/core';
import { AppConfig } from '../../../../config/app.config';
import { HeaderServicesInterface } from '../../../services/services-module.service';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { ConfigurationForm, SharedService } from '../../../../shared/services/shared.service';
import { Subscription } from 'rxjs';
import { WalletService, AccountsInterface, AccountsInfoInterface } from '../../../../wallet/services/wallet.service';
import { environment } from 'src/environments/environment';
import { MosaicService } from '../../../../servicesModule/services/mosaic.service';
import { TransactionsService } from '../../../../transactions/services/transactions.service';
import { ProximaxProvider } from '../../../../shared/services/proximax.provider';
import { AccountInfo, UInt64 } from 'tsjs-xpx-chain-sdk';
import { DataBridgeService } from '../../../../shared/services/data-bridge.service';

@Component({
  selector: 'app-create-gift',
  templateUrl: './create-gift.component.html',
  styleUrls: ['./create-gift.component.css']
})
export class CreateGiftComponent implements OnInit {
  accountInfo: AccountsInfoInterface = null;
  accountValid: boolean;
  allMosaics = [];
  selectOtherMosaics = [];
  configurationForm: ConfigurationForm;
  currentAccounts: any = [];
  createGift: FormGroup;
  subscribeAccount = null;
  paramsHeader: HeaderServicesInterface = {
    moduleName: 'Sirius Gift',
    componentName: 'Generate',
    // extraButton: 'Create a New Account',
    // routerExtraButton: `/${AppConfig.routes.selectTypeCreationAccount}`

  };
  optionsXPX = {
    prefix: '',
    thousands: ',',
    decimal: '.',
    precision: '6'
  };
  reloadBtn: boolean;
  isMultisig: boolean;
  notBalance: boolean;
  passwordMain = 'password';
  charRest: number;
  messageMaxLength: number;
  subscription: Subscription[] = [];
  fee: any = '0.037250';
  currentBlock: number;
  valueValidateAccount: validateBuildAccount
  blockSendButton: boolean;
  haveBalance: boolean;
  balanceXpx: string;
  constructor(private fb: FormBuilder,
    private sharedService: SharedService,
    private walletService: WalletService,
    private mosaicServices: MosaicService,
    private transactionService: TransactionsService,
    private proximaxProvider: ProximaxProvider,
    private dataBridge: DataBridgeService,
  ) {
    this.charRest = 0;
    this.currentBlock = 0;
    this.messageMaxLength = 20;
    this.reloadBtn = false;
    this.blockSendButton = false;
    this.accountValid = false;
    this.notBalance = false;
    this.isMultisig = false;
    this.haveBalance = false;
    this.balanceXpx = '0.000000'
  }

  ngOnInit() {
    this.configurationForm = this.sharedService.configurationForm;
    this.createForm();
    this.subscribeValue();
    this.getAccountInfo();
    // Find Current Block
    this.subscription.push(this.dataBridge.getBlock().subscribe(next => {
      this.currentBlock = next;
    }));
  }

  /**
  * @memberof CreateGiftComponent
  */
  ngOnDestroy(): void {
    this.subscription.forEach(subscription => {
      subscription.unsubscribe();
    });
  }

  /**
   * @memberof CreateGiftComponent
   */
  createForm() {
    //Form create multisignature default
    this.createGift = this.fb.group({
      selectAccount: ['', [
        Validators.required
      ]],
      amountXpx: ['', [
        Validators.maxLength(this.configurationForm.amount.maxLength)
      ]],
      message: ['', [
        Validators.maxLength(20)
      ]],
      cantCard: ['', [Validators.compose([
        Validators.required, Validators.minLength(1),
        Validators.maxLength(1000)])]
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(this.configurationForm.passwordWallet.minLength),
          Validators.maxLength(this.configurationForm.passwordWallet.maxLength)
        ]
      ]
    });
    setTimeout(() => {
      this.createGift.get('amountXpx').reset()
    }, 10);
    // this.convertAccountMultsignForm.get('selectAccount').patchValue('ACCOUNT-2');
  }

  /**
    * @memberof CreateGiftComponent
    */
  subscribeValue() {
    this.subscription.push(this.createGift.get('message').valueChanges.subscribe(val => {
      if (val && val !== '') {
        this.charRest = val.length;
        // this.calculateFee(val.length);
      } else {
        this.charRest = 0;
        // this.calculateFee(0);
      }
    }));
    this.subscription.push(this.createGift.get('cantCard').valueChanges.subscribe(val => {
      if (val > 1000) {
        this.createGift.get('cantCard').patchValue(1, { emitEvent: true, onlySelf: true })
      }
    }));
  }

  /**
    * Build with mosaics
    *
    * @param {AccountInfo} accountInfo
    * @memberof CreateGiftComponent
    */
  async buildCurrentAccountInfo(accountInfo: AccountInfo) {
    const mosaicsSelect: any = [];
    if (accountInfo !== undefined && accountInfo !== null) {
      if (accountInfo.mosaics.length > 0) {
        const mosaics = await this.mosaicServices.filterMosaics(accountInfo.mosaics.map(n => n.id));
        // console.log('mosaics', mosaics);

        if (mosaics.length > 0) {
          for (const mosaic of mosaics) {
            const configInput = {
              prefix: '',
              thousands: ',',
              decimal: '.',
              precision: '0'
            };

            const currentMosaic = accountInfo.mosaics.find(element => element.id.toHex() === this.proximaxProvider.getMosaicId(mosaic.idMosaic).toHex());
            let amount = '';
            let expired = false;
            let nameExpired = '';
            // console.log(mosaic)
            if ('mosaicInfo' in mosaic) {
              amount = this.transactionService.amountFormatter(currentMosaic.amount, mosaic.mosaicInfo);
              const durationMosaic = new UInt64([
                mosaic.mosaicInfo['properties']['duration']['lower'],
                mosaic.mosaicInfo['properties']['duration']['higher']
              ]);

              configInput.precision = mosaic.mosaicInfo['properties']['divisibility'];

              const createdBlock = new UInt64([
                mosaic.mosaicInfo.height.lower,
                mosaic.mosaicInfo.height.higher
              ]);

              if (durationMosaic.compact() > 0) {
                // console.log(durationMosaic.compact());
                if (this.currentBlock >= durationMosaic.compact() + createdBlock.compact()) {
                  expired = true;
                  nameExpired = ' - Expired';
                }
              }
            } else {
              amount = this.transactionService.amountFormatterSimple(currentMosaic.amount.compact());
              nameExpired = ' - Expired';
              expired = true;
            }

            const x = this.proximaxProvider.getMosaicId(mosaic.idMosaic).id.toHex() !== environment.mosaicXpxInfo.id;
            if (x) {
              const nameMosaic = (mosaic.mosaicNames.names.length > 0) ? mosaic.mosaicNames.names[0].name : this.proximaxProvider.getMosaicId(mosaic.idMosaic).toHex();
              mosaicsSelect.push({
                label: `${nameMosaic}${nameExpired} > Balance: ${amount}`,
                value: mosaic.idMosaic,
                balance: amount,
                expired: false,
                selected: false,
                disabled: expired,
                config: configInput
              });
            } else {
              this.haveBalance = true;
              this.balanceXpx = amount;
            }
          }


          this.allMosaics = mosaicsSelect;
          this.selectOtherMosaics = mosaicsSelect;
          // console.log(this.allMosaics);
          // console.log(this.selectOtherMosaics);
        }
      }
    }

    return;
  }

  /**
    *
    *
    * @param {*} quantity
    * @returns
    * @memberof CreateGiftComponent
    */
  getQuantity(quantity: string) {
    return this.sharedService.amountFormat(quantity);
  }
  /**
   * @param {string} [nameInput='']
   * @param {string} [nameControl='']
   * @param {string} [nameValidation='']
   * @returns
   * @memberof CreateGiftComponent
   */
  validateInput(nameInput: string = '', nameControl: string = '', nameValidation: string = '') {
    let validation: AbstractControl = null;
    if (nameInput !== '' && nameControl !== '') {
      validation = this.createGift.controls[nameControl].get(nameInput);
    } else if (nameInput === '' && nameControl !== '' && nameValidation !== '') {
      validation = this.createGift.controls[nameControl].getError(nameValidation);
    } else if (nameInput !== '') {
      validation = this.createGift.get(nameInput);
    }
    return validation;
  }



  validateAccount(name: string) {
    this.accountInfo = this.walletService.filterAccountInfo(name);

    if (this.valueValidateAccount.disabledItem) {
      this.disabledForm('selectAccount', true);
      return
    }
    this.accountValid = (
      this.accountInfo !== null &&
      this.accountInfo !== undefined && this.accountInfo.accountInfo !== null);
    if (this.subscribeAccount) {
      this.subscribeAccount.unsubscribe();
    }
    //Validate Account
    if (!this.accountValid)
      return this.sharedService.showError('', 'Account to convert is not valid');
    this.buildCurrentAccountInfo(this.accountInfo.accountInfo);
    //Validate Multisign
    this.isMultisig = (this.accountInfo.multisigInfo !== null && this.accountInfo.multisigInfo !== undefined && this.accountInfo.multisigInfo.isMultisig());
    if (this.isMultisig)
      return this.sharedService.showError('', 'Is Multisig');

    //Validate Balance
    if (!this.accountInfo.accountInfo.mosaics.find(next => next.id.toHex() === environment.mosaicXpxInfo.id)) {
      this.notBalance = true;
      return this.sharedService.showError('', 'Insufficient balance');
    } else {
      this.notBalance = false;
    }


    // this.publicAccountToConvert = PublicAccount.createFromPublicKey(this.currentAccountToConvert.publicAccount.publicKey, this.currentAccountToConvert.network)
    //  this.mdbBtnAddCosignatory = false;
    // if (this.activateRoute.snapshot.paramMap.get('name') !== null) {
    //   if (this.currentAccounts.length > 0) {
    //     const valueSelect = this.currentAccounts.filter(x => x.label === this.activateRoute.snapshot.paramMap.get('name'));
    //     if (valueSelect) {
    //       this.convertAccountMultsignForm.controls['selectAccount'].patchValue(valueSelect[0]);
    //     }
    //   }
    // }
  }

  /**
   * @param {*} inputType
   * @memberof CreateTransferComponent
   */
  changeInputType(inputType: any) {
    const newType = this.sharedService.changeInputType(inputType);
    this.passwordMain = newType;
  }

  /**
  *
  * Get accounts wallet
  * @memberof CreateGiftComponent
  */
  getAccounts() {

    if (this.walletService.currentWallet.accounts.length > 0) {
      this.currentAccounts = [];
      for (let element of this.walletService.currentWallet.accounts) {
        this.buildSelectAccount(element)
      }
    }
  }
  selectAccount($event: Event) {
    const event: any = $event;
    this.createGift.enable({ emitEvent: false, onlySelf: true });
    if (event !== null) {
      this.valueValidateAccount = {
        disabledItem: event.disabledItem,
        info: event.info
      }
    }
    console.log('this.valueValidateAccount', this.valueValidateAccount)

    this.subscribeAccount = this.walletService.getAccountsInfo$().subscribe(
      async accountInfo => {

        this.validateAccount(event.value.name)
      }).unsubscribe();
  }

  /**
* @memberof CreateGiftComponent
*/
  disabledForm(noIncluye: string, accion: boolean) {
    for (let x in this.createGift.value) {
      if (x !== noIncluye) {
        if (accion) {
          this.createGift.get(x).disable()
        } else {
          this.createGift.get(x).enable()
        }

      }
    }
  }

  buildSelectAccount(param: AccountsInterface) {
    const accountFiltered = this.walletService.filterAccountInfo(param.name);
    const validateBuildAccount: validateBuildAccount = this.validateBuildSelectAccount(accountFiltered)
    console.log('name', param.name)
    console.log('validateBuildAccount', validateBuildAccount)

    if (accountFiltered) {
      if (!this.isMultisign(param)) {
        this.currentAccounts.push({
          label: param.name,
          value: param,
          disabledItem: validateBuildAccount.disabledItem,
          info: validateBuildAccount.info,
        });
        // if (this.activateRoute.snapshot.paramMap.get('name') !== null)

      }
    }
  }
  /**
     * Checks if the account is a multisig account.
     * @returns {boolean}
     */
  isMultisign(accounts: AccountsInterface): boolean {
    return Boolean(accounts.isMultisign !== undefined && accounts.isMultisign !== null && this.isMultisigValidate(accounts.isMultisign.minRemoval, accounts.isMultisign.minApproval));
  }
  /**
     * Checks if the account is a multisig account.
     * @returns {boolean}
     */
  isMultisigValidate(minRemoval: number, minApprova: number) {
    return minRemoval !== 0 && minApprova !== 0;
  }

  validateBuildSelectAccount(accountFiltered: AccountsInfoInterface): validateBuildAccount {
    const disabled: boolean = (
      accountFiltered !== null &&
      accountFiltered !== undefined && accountFiltered.accountInfo !== null)
    if (!disabled)
      return { disabledItem: true, info: 'Insufficient Balance' }
    if (!accountFiltered.accountInfo.mosaics.find(next => next.id.toHex() === environment.mosaicXpxInfo.id))
      return { disabledItem: true, info: 'Insufficient Balance', }
    const mosaicXPX = accountFiltered.accountInfo.mosaics.find(next => next.id.toHex() === environment.mosaicXpxInfo.id).amount.compact();
    if (!this.validateBuildSelectAccountBalance(mosaicXPX))
      return { disabledItem: true, info: 'Insufficient Balance' }
    return { disabledItem: false, info: '' }
  }

  validateBuildSelectAccountBalance(balanceAccount: number): boolean {
    return (balanceAccount >= this.fee)
  }

  /**
   * @param {(string | (string | number)[])} [custom]
   * @param {(string | number)} [formControl]
   * @returns
   * @memberof CreateGiftComponent
   */
  clearForm(custom?: string | (string | number)[], formControl?: string | number) {
    if (custom !== undefined) {
      if (formControl !== undefined) {
        this.charRest = 0;
        this.createGift.controls[formControl].get(custom).reset();
        this.fee = '0.037250';
        return;
      }

      this.charRest = 0;
      this.createGift.get(custom).reset();
      this.fee = '0.037250';
      return;
    }

    this.charRest = 0;
    this.createGift.reset();
    this.fee = '0.037250';
    return;
  }
  getAccountInfo() {
    this.subscription.push(this.walletService.getAccountsInfo$().subscribe(
      next => {
        this.getAccounts();
      }
    ));
  }

  /**
     *
     *
     * @memberof CreateTransferComponent
     */
  sendTransfer() {
    console.log('send')
    if (this.createGift.valid && (!this.blockSendButton)) {
      console.log('createGift', this.createGift)
      console.log('balanceXpx', this.balanceXpx)
      this.reloadBtn = true;
      this.blockSendButton = true;


    }
  }
}

interface validateBuildAccount {
  disabledItem: boolean,
  info: string,

}
