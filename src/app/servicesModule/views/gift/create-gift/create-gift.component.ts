import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { AppConfig } from '../../../../config/app.config';
import { HeaderServicesInterface } from '../../../services/services-module.service';
import { FormGroup, FormBuilder, Validators, AbstractControl, FormControl } from '@angular/forms';
import { ConfigurationForm, SharedService } from '../../../../shared/services/shared.service';
import { Subscription } from 'rxjs';
import { WalletService, AccountsInterface, AccountsInfoInterface } from '../../../../wallet/services/wallet.service';
import { environment } from 'src/environments/environment';
import { MosaicService, MosaicsStorage } from '../../../../servicesModule/services/mosaic.service';
import { TransactionsService } from '../../../../transactions/services/transactions.service';
import { ProximaxProvider } from '../../../../shared/services/proximax.provider';
import {
  AccountInfo,
  UInt64,
  AggregateTransaction,
  Deadline,
  InnerTransaction,
  TransferTransaction,
  PlainMessage,
  Mosaic,
  MosaicId,
  Address,
  Account,
  SignedTransaction,
  Transaction,
  TransactionHttp
} from 'tsjs-xpx-chain-sdk';
import { DataBridgeService } from '../../../../shared/services/data-bridge.service';
import * as JSZip from 'jszip';
import * as qrcode from 'qrcode-generator';
import { GiftService } from '../../../services/gift.service';
import { saveAs } from 'file-saver';
import { NodeService } from '../../../../servicesModule/services/node.service';
@Component({
  selector: 'app-create-gift',
  templateUrl: './create-gift.component.html',
  styleUrls: ['./create-gift.component.css']
})
export class CreateGiftComponent implements OnInit, OnDestroy {
  @ViewChild('fileInput', { static: false }) myInputVariable: ElementRef;
  @ViewChild('fileInputtwo', { static: false }) myInputVariabletwo: ElementRef;
  accounts: any = [];
  cosignatorie: any = null;
  listCosignatorie: any = [];
  disabledAllField = false;
  searching = true;
  insufficientBalance = false;
  disabledBtnAddMosaic = false;
  boxOtherMosaics = [];
  errorOtherMosaics = false;
  incrementMosaics = 0;
  transactionHttp: TransactionHttp = null;
  showMosaic = true;
  showDescrip = true;
  showSequence = true;
  accountInfo: AccountsInfoInterface = null;
  accountValid: boolean;
  allMosaics = [];
  showCanva = false;
  showImg = true;
  showImgtwo = true;
  showViewsConfirm = false;
  checked = false;
  dataURL: any;
  dataURLTwo: any;
  imgBackground;
  imgBackgroundtwo;
  cantCard = 0;
  descrip: string;
  selectOtherMosaics = [];
  configurationForm: ConfigurationForm;
  transactionSigned: SignedTransaction[] = [];
  transactionReady: SignedTransaction[] = [];
  currentAccounts: any = [];
  createGift: FormGroup;
  subscribeAccount = null;
  sender: AccountsInterface = null;
  paramsHeader: HeaderServicesInterface = {
    moduleName: 'Sirius Gift',
    componentName: 'Generate Gift Card',
    // extraButton: 'Create a New Account',
    // routerExtraButton: `/${AppConfig.routes.selectTypeCreationAccount}`

  };
  msgLockfungCosignatorie = '';
  optionsXPX = {
    prefix: '',
    thousands: ',',
    decimal: '.',
    precision: '6'
  };
  reloadBtn: boolean;
  realAmount: number;
  isMultisig: boolean;
  notBalance: boolean;
  passwordMain = 'password';
  charRest: number;
  messageMaxLength: number;
  mosaicXpx: { id: string, name: string; divisibility: number } = null;
  subscription: Subscription[] = [];
  fee: any = '0.053250';
  feeCosignatory: any = 10044500;
  feeCover = 111000;
  currentBlock: number;
  fileToUpload: any;
  ourFile: File;
  ourFiletwo: File;
  // valueValidateAccount: validateBuildAccount
  blockSendButton: boolean;
  haveBalance: boolean;
  balanceXpx: string;
  save: boolean;
  limit = 100;
  accountList: Account[] = [];
  aggregateTransaction: Transaction;
  constructor(
    private fb: FormBuilder,
    private sharedService: SharedService,
    private walletService: WalletService,
    private mosaicServices: MosaicService,
    private transactionService: TransactionsService,
    private proximaxProvider: ProximaxProvider,
    private dataBridge: DataBridgeService,
    private giftService: GiftService,
    private nodeService: NodeService
  ) {
    this.realAmount = 0;
    this.charRest = 0;
    this.currentBlock = 0;
    this.messageMaxLength = 10;
    this.reloadBtn = false;
    this.blockSendButton = false;
    this.accountValid = false;
    this.notBalance = false;
    this.isMultisig = false;
    this.haveBalance = false;
    this.save = false;
    this.balanceXpx = '0.000000';
  }

  ngOnInit() {
    this.configurationForm = this.sharedService.configurationForm;
    this.createForm();
    this.transactionHttp = new TransactionHttp(environment.protocol + '://' + `${this.nodeService.getNodeSelected()}`); // change
    this.validateSave();

    this.subscribeValue();
    this.getAccountInfo();
    setTimeout(() => {
      this.drawExample();
    }, 3000);

    this.imgBackground = this.sharedService.walletGitf();
    const amount = this.transactionService.getDataPart(this.amountFormatterSimple(this.feeCosignatory), 6);
    const formatterAmount = `<span class="fs-085rem">${amount.part1}</span><span class="fs-07rem">${amount.part2}</span>`;
    this.msgLockfungCosignatorie = `Cosignatory has sufficient balance (${formatterAmount} XPX) to cover LockFund Fee`;
    // Find Current Block
    this.subscription.push(this.dataBridge.getBlock().subscribe(next => {
      this.currentBlock = next;
    }));
    // Mosaic by default
    this.mosaicXpx = {
      id: environment.mosaicXpxInfo.id,
      name: environment.mosaicXpxInfo.name,
      divisibility: environment.mosaicXpxInfo.divisibility
    };

    // Build the accounts with which I will transfer
    this.walletService.currentWallet.accounts.forEach((element: AccountsInterface) => {
      this.accounts.push({
        label: element.name,
        active: element.default,
        value: element
      });

      if (element.default) {
        this.findCosignatories(element);
      }
    });

  }

  /**
   *
   *
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
    // Form create multisignature default
    this.createGift = this.fb.group({
      amountXpx: ['', [
        Validators.maxLength(this.configurationForm.amount.maxLength)
      ]],

      showMosaic: [true, [Validators.requiredTrue]],
      showDescrip: [true, [Validators.requiredTrue]],
      showSequence: [true, [Validators.requiredTrue]],
      cosignatorie: [null],
      message: ['', [Validators.required,
      Validators.maxLength(10)
      ]],
      cantCard: ['', [
        Validators.required, Validators.minLength(1),
        Validators.maxLength(this.limit)
      ]],
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
      this.createGift.get('amountXpx').reset();
    }, 10);
    // this.convertAccountMultsignForm.get('selectAccount').patchValue('ACCOUNT-2');
  }

  /**
   *
   *
   * @memberof CreateGiftComponent
   */
  pushedOtherMosaics() {
    if (this.selectOtherMosaics.length > 0) {
      if (this.boxOtherMosaics.length === 0) {
        this.boxOtherMosaics.push({
          id: '',
          balance: '',
          beforeValue: '',
          amount: '',
          errorBalance: false,
          amountToBeSent: 0,
          random: Math.floor(Math.random() * 1455654),
          selectOtherMosaics: this.selectOtherMosaics,
          config: null
        });
        this.createGift.get('amountXpx').patchValue('', { emitEvent: false, onlySelf: false });
        this.createGift.get('amountXpx').disable();
      }
    }

  }

  /**
   *
   *
   * @param {*} mosaicSelected
   * @param {number} position
   * @memberof CreateGiftComponent
   */
  otherMosaicsChange(mosaicSelected: any, position: number) {
    if (mosaicSelected !== undefined) {
      if (this.boxOtherMosaics[position].beforeValue === '' || !this.boxOtherMosaics[position].beforeValue) {
        this.otherMosaicsBuild(mosaicSelected, position);
      } else {
        if (this.boxOtherMosaics[position].beforeValue !== '' && this.boxOtherMosaics[position].beforeValue === mosaicSelected.label) {
          const currentMosaic = this.boxOtherMosaics[position].selectOtherMosaics.find(elm => elm.label === mosaicSelected.label);
          const otherMosaics = this.boxOtherMosaics[position].selectOtherMosaics.filter(elm => elm.label !== mosaicSelected.label);
          currentMosaic.disabled = false;
          otherMosaics.push(currentMosaic);
          const i = this.boxOtherMosaics.indexOf(this.boxOtherMosaics[position]);
          if (i !== -1) {
            this.boxOtherMosaics.map(element => {
              return element.selectOtherMosaics = otherMosaics;
            });
            this.boxOtherMosaics.splice(i, 1);
          }
          if (this.boxOtherMosaics.length === 0) {
            this.errorOtherMosaics = false;
            this.createGift.get('amountXpx').enable();
            this.createGift.get('amountXpx').patchValue('', { emitEvent: false, onlySelf: false });
          }
        } else {
          const currentMosaic = this.boxOtherMosaics[position].selectOtherMosaics.find(elm => elm.label === this.boxOtherMosaics[position].beforeValue);
          const otherMosaics = this.boxOtherMosaics[position].selectOtherMosaics.filter(elm => elm.label !== this.boxOtherMosaics[position].beforeValue);
          currentMosaic.disabled = false;
          otherMosaics.push(currentMosaic);
          this.boxOtherMosaics[position].selectOtherMosaics = otherMosaics;
          this.otherMosaicsBuild(mosaicSelected, position);
        }
      }
    } else {
      this.createGift.get('amountXpx').enable();
      this.createGift.get('amountXpx').patchValue('', { emitEvent: false, onlySelf: false });
      const i = this.boxOtherMosaics.indexOf(this.boxOtherMosaics[position]);
      if (i !== -1) {
        this.boxOtherMosaics.splice(i, 1);
      }
      if (this.boxOtherMosaics.length === 0) {
        this.createGift.get('amountXpx').enable();
        this.createGift.get('amountXpx').patchValue('', { emitEvent: false, onlySelf: false });
      }
    }
  }

  /**
   *
   *
   * @param {*} mosaicSelected
   * @param {number} position
   * @memberof CreateTransferComponent
   */
  otherMosaicsBuild(mosaicSelected: any, position: number) {
    this.boxOtherMosaics[position].amount = '';
    this.boxOtherMosaics[position].balance = mosaicSelected.balance;
    this.boxOtherMosaics[position].config = mosaicSelected.config;
    this.boxOtherMosaics[position].errorBalance = false;
    this.boxOtherMosaics[position].id = mosaicSelected.value;
    this.boxOtherMosaics[position].beforeValue = mosaicSelected.label;
    const currentMosaic = this.boxOtherMosaics[position].selectOtherMosaics.find(elm => elm.label === mosaicSelected.label);
    const otherMosaics = this.boxOtherMosaics[position].selectOtherMosaics.filter(elm => elm.label !== mosaicSelected.label);
    currentMosaic.disabled = true;
    otherMosaics.push(currentMosaic);
    this.boxOtherMosaics.map(element => {
      return element.selectOtherMosaics = otherMosaics;
    });
  }

  /**
   *
   *
   * @param {*} amount
   * @param {MosaicsStorage} mosaic
   * @memberof CreateTransferComponent
   */
  validateAmountToTransfer(amount: string, mosaic: MosaicsStorage, position: number) {
    let validateAmount = false;
    const accountInfo = this.walletService.filterAccountInfo(this.sender.name);
    if (accountInfo !== undefined && accountInfo !== null && Object.keys(accountInfo).length > 0) {
      if (accountInfo.accountInfo.mosaics.length > 0) {
        const filtered = accountInfo.accountInfo.mosaics.find(element => {
          return element.id.toHex() === new MosaicId(mosaic.idMosaic).toHex();
        });

        if (filtered !== undefined && filtered !== null) {
          const arrAmount = amount.toString().replace(/,/g, '').split('.');
          let decimal;
          let realAmount;

          if (mosaic.mosaicInfo['properties'].divisibility > 0) {
            if (arrAmount.length < 2) {
              decimal = this.addZeros(mosaic.mosaicInfo['properties'].divisibility);
            } else {
              const arrDecimals = arrAmount[1].split('');
              decimal = this.addZeros(mosaic.mosaicInfo['properties'].divisibility - arrDecimals.length, arrAmount[1]);
            }

            realAmount = `${arrAmount[0]}${decimal}`;
          } else {
            realAmount = arrAmount[0];
          }

          const invalidBalance = Number(realAmount) > filtered.amount.compact();
          if (invalidBalance && !this.boxOtherMosaics[position].errorBalance) {
            this.boxOtherMosaics[position].errorBalance = true;
            this.errorOtherMosaics = true;
          } else if (!invalidBalance && this.boxOtherMosaics[position].errorBalance) {
            this.boxOtherMosaics[position].errorBalance = false;
            this.errorOtherMosaics = false;
          }
        } else {
          validateAmount = true;
        }
      } else {
        validateAmount = true;
      }
    } else {
      validateAmount = true;
    }

    if (validateAmount) {
      if (Number(amount) >= 0) {
        this.boxOtherMosaics[position].errorBalance = true;
        this.errorOtherMosaics = true;
      } else if ((Number(amount) === 0 || amount === '') && this.boxOtherMosaics[position].errorBalance) {
        this.boxOtherMosaics[position].errorBalance = false;
      }
    }
  }

  /**
   *
   *
   * @param {string} amount
   * @param {(string | [])} mosaicId
   * @param {number} position
   * @memberof CreateGiftComponent
   */
  async amountOtherMosaicChanged(amount: string, mosaicId: string | [], position: number) {
    if (amount !== null && amount !== undefined) {
      const mosaic = await this.mosaicServices.filterMosaics([new MosaicId(mosaicId)]);
      const a = Number(amount);

      this.boxOtherMosaics[position].amountToBeSent = String((mosaic !== null) ? this.transactionService.amountFormatter(a, mosaic[0].mosaicInfo) : a);
      this.validateAmountToTransfer(amount, mosaic[0], position);
    } else {
      this.boxOtherMosaics[position].amountToBeSent = '0';
    }
  }

  /**
   *
   *
   * @param {*} $event
   * @memberof CreateTransferComponent
   */
  selectCosignatorie($event: any) {
    if ($event) {
      this.cosignatorie = $event.value;
    } else {
      this.cosignatorie = null;
    }
  }

  /**
   *
   *
   * @param {number} position
   * @memberof CreateTransferComponent
   */
  deleteMoreMosaic(position: number) {
    const otherMosaics = [];
    Object.keys(this.boxOtherMosaics).forEach(element => {
      if (Number(element) !== position) {
        otherMosaics.push(this.boxOtherMosaics[Number(element)]);
      }
    });
    this.boxOtherMosaics = otherMosaics;
  }

  /**
   *
   * @param element
   */
  findCosignatories(element: AccountsInterface) {
    this.cosignatorie = null;
    this.listCosignatorie = [];
    this.disabledAllField = false;
    if (element.isMultisign && element.isMultisign.cosignatories && element.isMultisign.cosignatories.length > 0) {
      if (element.isMultisign.cosignatories.length === 1) {
        const address = this.proximaxProvider.createFromRawAddress(element.isMultisign.cosignatories[0].address['address']);
        const cosignatorieAccount: AccountsInterface = this.walletService.filterAccountWallet('', null, address.pretty());
        if (cosignatorieAccount) {
          const accountFiltered: AccountsInfoInterface = this.walletService.filterAccountInfo(cosignatorieAccount.name);
          const infValidate = this.transactionService.validateBalanceCosignatorie(accountFiltered, Number(this.feeCosignatory)).infValidate;
          this.cosignatorie = cosignatorieAccount;
          this.listCosignatorie = [{
            label: cosignatorieAccount.name,
            value: cosignatorieAccount,
            selected: true,
            disabled: infValidate[0].disabled,
            info: infValidate[0].info
          }];

        } else {
          this.disabledAllField = true;
          this.createGift.disable();
        }
        return;
      } else {
        const listCosignatorie = [];
        element.isMultisign.cosignatories.forEach(cosignatorie => {
          const address = this.proximaxProvider.createFromRawAddress(cosignatorie.address['address']);
          const cosignatorieAccount: AccountsInterface = this.walletService.filterAccountWallet('', null, address.pretty());
          if (cosignatorieAccount) {
            const accountFiltered: AccountsInfoInterface = this.walletService.filterAccountInfo(cosignatorieAccount.name);
            const infValidate = this.transactionService.validateBalanceCosignatorie(accountFiltered, Number(this.feeCosignatory)).infValidate;
            listCosignatorie.push({
              label: cosignatorieAccount.name,
              value: cosignatorieAccount,
              selected: true,
              disabled: infValidate[0].disabled,
              info: infValidate[0].info
            });
          }
        });

        if (listCosignatorie && listCosignatorie.length > 0) {
          this.listCosignatorie = listCosignatorie;
          if (listCosignatorie.length === 1) {
            this.cosignatorie = listCosignatorie[0].value;
          }
        } else {
          this.disabledAllField = true;
          this.createGift.disable();
        }

        return;
      }
    }
  }

  /**
   *
   *
   * @param {AccountsInterface} accountToSend
   * @memberof CreateGiftComponent
   */
  async changeSender(accountToSend: AccountsInterface) {
    if (accountToSend) {
      this.sender = accountToSend;
      this.findCosignatories(accountToSend);
      if (this.createGift.disabled && !this.disabledAllField) {
        this.createGift.enable();
      }

      this.clearForm();
      console.log('lolo', accountToSend);
      this.reset();
      this.accounts.forEach(element => {
        if (accountToSend.name === element.value.name) {
          element.active = true;
        } else {
          element.active = false;
        }
      });

      this.charRest = 0; // this.configurationForm.message.maxLength;
      const accountFiltered = this.walletService.filterAccountInfo(this.sender.name);
      if (accountFiltered) {
        await this.buildCurrentAccountInfo(accountFiltered.accountInfo);
      }
      if (!this.haveBalance) {
        this.insufficientBalance = true;
        this.createGift.controls['amountXpx'].disable();
      } else if (!this.disabledAllField) {
        this.insufficientBalance = false;
        this.createGift.controls['amountXpx'].enable();
      }
    }
  }

  /**
   *
   *
   * @memberof CreateGiftComponent
   */
  reset() {
    console.log('reset reset');
    this.haveBalance = false;
    this.disabledBtnAddMosaic = false;
    this.selectOtherMosaics = [];
    this.haveBalance = false;
    this.allMosaics = [];
    this.balanceXpx = '0.000000';
    this.boxOtherMosaics = [];
    this.blockSendButton = false;
    this.reloadBtn = false;
    console.log('listo 2');
    this.charRest = this.configurationForm.message.maxLength;
    this.disabledBtnAddMosaic = false;
    this.errorOtherMosaics = false;
    this.incrementMosaics = 0;
    // this.invalidRecipient = false;
    this.insufficientBalance = false;
    // this.msgErrorUnsupported = '';
    // this.msgErrorUnsupportedContact = '';
    this.optionsXPX = {
      prefix: '',
      thousands: ',',
      decimal: '.',
      precision: '6'
    };
    this.selectOtherMosaics = [];
  }

  /**
   *
   *
   * @memberof CreateGiftComponent
   */
  validateSave() {
    console.log('this.giftService.typeDonwnload', this.giftService.getTypeDonwnload);
    if (this.giftService.typeDonwnload) {
      this.save = true;
    } else {
      this.save = false;
    }
  }

  /**
   *
   *
   * @param {*} e
   * @memberof CreateGiftComponent
   */
  limitDuration(e: any) {
    // tslint:disable-next-line: radix
    if (isNaN(parseInt(e.target.value))) {
      e.target.value = '';
      this.createGift.get('cantCard').setValue('');
    } else {
      // tslint:disable-next-line: radix
      if (parseInt(e.target.value) > this.limit) {
        e.target.value = this.limit.toString();
        this.createGift.get('cantCard').patchValue(this.limit.toString());
        // tslint:disable-next-line: radix
      } else if (parseInt(e.target.value) < 1) {
        e.target.value = '';
        this.createGift.get('cantCard').setValue('');
      }
    }
  }

  /**
   *
   *
   * @param {*} value
   * @memberof CreateGiftComponent
   */
  resetInput(value) {
    if (value === 'one') {
      setTimeout(() => {
        this.myInputVariable.nativeElement.value = null;
      }, 100);
    } else if (value === 'two') {
      setTimeout(() => {
        this.myInputVariabletwo.nativeElement.value = null;
      }, 100);
    } else {
      setTimeout(() => {
        this.myInputVariable.nativeElement.value = null;
        this.myInputVariabletwo.nativeElement.value = null;
      }, 100);
    }
    // this.showViewsConfirm = false;
    // this.banFormImg = false;
  }

  /**
   *
   *
   * @param {*} value
   * @memberof CreateGiftComponent
   */
  deleteOurFile(value) {
    if (value === 'one') {
      this.ourFile = null;
      this.showImg = true;
      this.imgBackground = this.sharedService.walletGitf();
      this.drawExample();
      // this.giftDecode = null

    } else {
      this.ourFiletwo = null;
      this.showImgtwo = true;
      this.imgBackgroundtwo = null;
    }
    this.resetInput(value);
  }

  /**
   *
   *
   * @param {File} file
   * @param {*} $event
   * @param {*} type
   * @returns
   * @memberof CreateGiftComponent
   */
  fileChange(file: File, $event, type) {
    this.fileToUpload = '';
    if (file && file[0]) {
      if (file[0].type !== 'image/jpeg') {
        return this.sharedService.showError('', 'Invalid format');
      }

      if (type === 'one') {
        this.imgBackground = this.sharedService.walletGitf();
        const reader = new FileReader();
        this.ourFile = file[0];
        reader.readAsDataURL(this.ourFile);
        reader.onload = () => {
          this.fileToUpload = reader.result;
          this.imgBackground = this.fileToUpload;
          this.drawExample();
          this.drawExampletwo();
          this.showImg = false;
        };
      } else {
        this.imgBackgroundtwo = null;
        const reader = new FileReader();
        this.ourFiletwo = file[0];
        reader.readAsDataURL(this.ourFiletwo);
        reader.onload = () => {
          this.imgBackgroundtwo = reader.result;
          this.drawExampletwo();
          this.showImgtwo = false;
        };
      }
    }
  }

  /**
   *
   *
   * @memberof CreateGiftComponent
   */
  showImgFun() {
    this.drawExample();
    if (!this.showImgtwo) {
      this.drawExampletwo();
    }
  }

  /**
   *
   *
   * @memberof CreateGiftComponent
   */
  updateShowMosaic() {
    console.log(this.createGift.get('showMosaic').value);
    // this.showMosaic  =! this.showMosaic
    // this.drawExample()
  }

  /**
   *
   *
   * @returns
   * @memberof CreateGiftComponent
   */
  async drawExampletwo() {
    let imgZip: any = null;
    const qr = qrcode(10, 'H');
    qr.addData('0000000000000001942110B5FF15C06141A14322E7A3054D5B1227215B7836224F106471C1AAF2ED4FF17E357254D4513000000003B8EEEB4A');
    qr.make();
    const img = await this.drawIMG(qr.createDataURL(), 'descrip...', '100,000.000000', this.imgBackground, 'xpx', 'B256A6');
    imgZip = await this.drawPDF(img, this.imgBackgroundtwo);
    return new Promise(async (resolve, reject) => {
      const canvas: any = document.getElementById('idCanvastwo');
      const context = canvas.getContext('2d');
      const imageObj = new Image(100, 100);
      imageObj.setAttribute('crossOrigin', 'anonymous');
      imageObj.src = imgZip;
      imageObj.onerror = reject;
      imageObj.onload = (e) => {
        // context.drawImage(imageObj, 0, 0, 130, 200);
        context.drawImage(imageObj, 0, 0, 230, 330);
        // const canvas: any = document.getElementById('idCanvas');
        const dataURLTwo = canvas.toDataURL('image/jpeg', 1.0);
        resolve(dataURLTwo);
      };
    });
  }

  /**
   *
   *
   * @returns
   * @memberof CreateGiftComponent
   */
  async drawExample() {
    let imgZip: any = null;
    const qr = qrcode(10, 'H');
    qr.addData('0000000000000001942110B5FF15C06141A14322E7A3054D5B1227215B7836224F106471C1AAF2ED4FF17E357254D4513000000003B8EEEB4A');
    qr.make();
    imgZip = await this.drawIMG(qr.createDataURL(), 'descrip...', '100,000.000000', this.imgBackground, 'xpx', 'B256A6');
    return new Promise((resolve, reject) => {
      const canvas: any = document.getElementById('idCanvas');
      const context = canvas.getContext('2d');
      const imageObj = new Image(100, 100);
      imageObj.setAttribute('crossOrigin', 'anonymous');
      imageObj.src = imgZip;
      imageObj.onerror = reject;
      imageObj.onload = (e) => {
        context.drawImage(imageObj, 0, 0, 300, 200);
        const dataURL = canvas.toDataURL('image/jpeg', 1.0);
        resolve(dataURL);
      };
    });
  }

  /**
   *
   *
   * @param {string} imgQR
   * @param {string} des
   * @param {*} amount
   * @param {*} imageBase64
   * @param {*} mosaic
   * @param {*} code
   * @returns
   * @memberof CreateGiftComponent
   */
  drawIMG(imgQR: string, des: string, amount: any, imageBase64, mosaic, code) {
    return new Promise((resolve, reject) => {
      const canvas: any = document.getElementById('image');
      const context = canvas.getContext('2d');
      const imageObj = new Image();
      const imageObj2 = new Image(30, 46);
      imageObj2.src = imgQR;
      imageObj.setAttribute('crossOrigin', 'anonymous');
      imageObj.src = imageBase64;
      imageObj.onload = (e) => {
        context.drawImage(imageObj, 0, 0, 502, 326);
        if (this.showSequence) {
          context.font = '14px Sans';
          context.fillText(code, 380, 61);
        }
        if (this.showDescrip) {
          context.font = '16px Sans';
          context.fillText(des, 40, 208);
        }
        if (this.showMosaic) {
          context.font = '15px Open Sans';
          context.fillStyle = 'black';
          context.fillText(mosaic, 78, 246);
          context.font = '17px Open Sans';
          context.fillStyle = 'black';
          context.fillText(amount, 40, 276);
        }
        imageObj2.width = 12;
        imageObj2.height = 12;
        context.drawImage(imageObj2, 343, 77, 130, 130);
        const c: any = document.getElementById('image');
        const dataURL = c.toDataURL('image/jpeg', 1.0);
        resolve(dataURL);
      };
      imageObj.onerror = reject;
    });
  }

  /**
   *
   *
   * @param {*} imageGift
   * @param {*} imagePdf
   * @returns
   * @memberof CreateGiftComponent
   */
  drawPDF(imageGift, imagePdf) {
    return new Promise(async (resolve, reject) => {
      const canvas: any = document.getElementById('pdf');
      const context = canvas.getContext('2d');

      const imageObj = new Image();
      const imageObj2 = new Image(30, 46);
      // const img: any = await this.drawExample();
      imageObj2.src = imageGift;

      imageObj.setAttribute('crossOrigin', 'anonymous');
      // imageObj.src = this.imgBackgroundtwo;
      imageObj.src = imagePdf;
      imageObj.onerror = reject;

      imageObj.onload = (e) => {
        // context.drawImage(imageObj, 0, 0, 130, 200);
        context.drawImage(imageObj, 0, 0, 989, 1280);
        imageObj2.width = 12;
        imageObj2.height = 12;
        context.drawImage(imageObj2, 537, 516, 385, 250);
        const c: any = document.getElementById('pdf');
        const dataURL = c.toDataURL('image/jpeg', 1.0);
        resolve(dataURL);
      };
    });

  }

  /**
   *
   *
   * @memberof CreateGiftComponent
   */
  subscribeValue() {

    // value CHECK custom card
    this.subscription.push(this.createGift.get('showMosaic').valueChanges.subscribe(val => {
      if (val !== null && val !== undefined) {
        this.showMosaic = val;
      }

    }));
    this.subscription.push(this.createGift.get('showDescrip').valueChanges.subscribe(val => {
      if (val !== null && val !== undefined) {
        this.showDescrip = val;
      }
    }));
    this.subscription.push(this.createGift.get('showSequence').valueChanges.subscribe(val => {
      if (val !== null && val !== undefined) {
        this.showSequence = val;
      }
    }));
    //
    this.subscription.push(this.createGift.get('message').valueChanges.subscribe(val => {
      if (val && val !== '') {
        this.charRest = val.length;
        this.descrip = val;

        // this.calculateFee(val.length);
      } else {
        this.charRest = 0;
        this.descrip = '';
        // this.calculateFee(0);
      }
    }));
    this.subscription.push(this.createGift.get('cantCard').valueChanges.subscribe(val => {
      setTimeout(() => {
        // tslint:disable-next-line: radix
        if (!isNaN(parseInt(val))) {
          // tslint:disable-next-line: radix
          if (parseInt(val) <= this.limit && parseInt(val) >= 1) {
            this.builder();
          }
        }
      }, 100);
    }));
    this.subscription.push(this.createGift.get('amountXpx').valueChanges.subscribe(value => {

      if (value !== null && value !== undefined) {
        const a = Number(value);
        let validateAmount = false;
        if (this.sender) {
          const accountInfo = this.walletService.filterAccountInfo(this.sender.name);
          // console.log('Account INfo- ---->', accountInfo);
          if (accountInfo !== undefined && accountInfo !== null && Object.keys(accountInfo).length > 0) {
            if (accountInfo.accountInfo.mosaics.length > 0) {
              const filtered = accountInfo.accountInfo.mosaics.find(element => {
                return element.id.toHex() === new MosaicId(environment.mosaicXpxInfo.id).toHex();
              });

              const arrAmount = value.toString().replace(/,/g, '').split('.');
              let decimal;
              let realAmount;

              if (arrAmount.length < 2) {
                decimal = this.addZeros(environment.mosaicXpxInfo.divisibility);
              } else {
                const arrDecimals = arrAmount[1].split('');
                decimal = this.addZeros(environment.mosaicXpxInfo.divisibility - arrDecimals.length, arrAmount[1]);
              }

              realAmount = `${arrAmount[0]}${decimal}`;
              if (filtered !== undefined && filtered !== null) {
                const invalidBalance = filtered.amount.compact() < Number(realAmount);
                if (invalidBalance && !this.insufficientBalance) {
                  this.insufficientBalance = true;
                  this.blockSendButton = true;
                } else if (!invalidBalance && this.insufficientBalance) {
                  this.insufficientBalance = false;
                  this.blockSendButton = false;
                }
              } else {
                validateAmount = true;
              }
            } else {
              validateAmount = true;
            }
          } else {
            validateAmount = true;
          }
        }

        if (validateAmount) {
          if (Number(value) > 0) {
            this.insufficientBalance = true;
            this.blockSendButton = true;
          } else if ((Number(value) === 0 || value === '') && this.insufficientBalance) {
            this.insufficientBalance = false;
          }
        }
      }
      // this.builder();
    }));
  }

  /**
   *
   *
   * @param {AccountInfo} accountInfo
   * @returns
   * @memberof CreateGiftComponent
   */
  async buildCurrentAccountInfo(accountInfo: AccountInfo) {
    const mosaicsSelect: any = [];
    if (accountInfo !== undefined && accountInfo !== null) {
      if (accountInfo.mosaics.length > 0) {
        const mosaics = await this.mosaicServices.filterMosaics(accountInfo.mosaics.map(n => n.id));
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
        }
      }
    }

    return;
  }

  /**
   *
   *
   * @param {string} quantity
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

  // validateAccount(name: string, account: AccountsInterface) {
  //   this.accountInfo = this.walletService.filterAccountInfo(name);
  //   this.sender = null
  //   if (this.valueValidateAccount.disabledItem) {
  //     this.disabledForm('selectAccount', true);
  //     return
  //   }
  //   this.accountValid = (
  //     this.accountInfo !== null &&
  //     this.accountInfo !== undefined && this.accountInfo.accountInfo !== null);
  //   if (this.subscribeAccount) {
  //     this.subscribeAccount.unsubscribe();
  //   }
  //   //Validate Account
  //   if (!this.accountValid)
  //     return this.sharedService.showError('', 'Account to convert is not valid');
  //   this.buildCurrentAccountInfo(this.accountInfo.accountInfo);
  //   //Validate Multisign
  //   this.isMultisig = (this.accountInfo.multisigInfo !== null && this.accountInfo.multisigInfo !== undefined && this.accountInfo.multisigInfo.isMultisig());
  //   if (this.isMultisig)
  //     return this.sharedService.showError('', 'Is Multisig');
  //   //Validate Balance
  //   if (!this.accountInfo.accountInfo.mosaics.find(next => next.id.toHex() === environment.mosaicXpxInfo.id)) {
  //     this.notBalance = true;
  //     return this.sharedService.showError('', 'Insufficient balance');
  //   } else {
  //     this.notBalance = false;
  //   }
  //   this.sender = account
  //   this.builder()
  // }

  /**
   * @param {*} inputType
   * @memberof CreateTransferComponent
   */
  changeInputType(inputType: any) {
    const newType = this.sharedService.changeInputType(inputType);
    this.passwordMain = newType;
  }

  // /**
  // *
  // * Get accounts wallet
  // * @memberof CreateGiftComponent
  // */
  // getAccounts() {
  //   if (this.walletService.currentWallet)
  //     if (this.walletService.currentWallet.accounts.length > 0) {
  //       this.currentAccounts = [];
  //       for (let element of this.walletService.currentWallet.accounts) {
  //         this.buildSelectAccount(element)
  //       }
  //       // if (this.currentAccounts) {
  //       //   const currentAccountDef = this.currentAccounts.find(item => item.default)
  //       //   if (currentAccountDef) {
  //       //     this.createGift.get('selectAccount').setValue(currentAccountDef)
  //       //   } else {
  //       //     this.createGift.get('selectAccount').setValue(this.currentAccounts[0])
  //       //   }
  //       // }
  //     }
  // }
  // selectAccount($event: Event) {
  //   const event: any = $event;
  //   this.createGift.enable({ emitEvent: false, onlySelf: true });
  //   if (event !== null) {
  //     this.valueValidateAccount = {
  //       disabledItem: event.disabledItem,
  //       info: event.info
  //     }
  //   }
  //   this.subscribeAccount = this.walletService.getAccountsInfo$().subscribe(
  //     async accountInfo => {
  //       console.log('this.walletService.currentAccount', this.walletService.currentAccount)
  //       // this.validateAccount(event.value.name, event.value)
  //       this.searching = false;
  //       this.changeSender(this.walletService.currentAccount);
  //     }).unsubscribe();
  // }


  /**
   *
   *
   * @param {string} noIncluye
   * @param {boolean} accion
   * @memberof CreateGiftComponent
   */
  disabledForm(noIncluye: string, accion: boolean) {
    for (const x in this.createGift.value) {
      if (x !== noIncluye) {
        if (accion) {
          this.createGift.get(x).disable();
        } else {
          this.createGift.get(x).enable();
        }

      }
    }
  }

  /**
   *
   *
   * @param {AccountsInterface} param
   * @memberof CreateGiftComponent
   */
  buildSelectAccount(param: AccountsInterface) {
    const accountFiltered = this.walletService.filterAccountInfo(param.name);
    const validaBuildAccount: ValidateBuildAccount = this.validateBuildSelectAccount(accountFiltered);
    if (accountFiltered) {
      if (!this.isMultisign(param)) {
        this.currentAccounts.push({
          label: param.name,
          value: param,
          disabledItem: validaBuildAccount.disabledItem,
          info: validaBuildAccount.info,
          default: param.default
        });
        // if (this.activateRoute.snapshot.paramMap.get('name') !== null)

      }
    }
  }

  /**
   *
   *
   * @param {AccountsInterface} accounts
   * @returns {boolean}
   * @memberof CreateGiftComponent
   */
  isMultisign(accounts: AccountsInterface): boolean {
    return Boolean(
        accounts.isMultisign !== undefined && accounts.isMultisign !== null &&
        this.isMultisigValidate(accounts.isMultisign.minRemoval, accounts.isMultisign.minApproval
      )
    );
  }

  /**
   *
   *
   * @param {number} minRemoval
   * @param {number} minApprova
   * @returns
   * @memberof CreateGiftComponent
   */
  isMultisigValidate(minRemoval: number, minApprova: number) {
    return minRemoval !== 0 && minApprova !== 0;
  }

  /**
   *
   *
   * @param {AccountsInfoInterface} accountFiltered
   * @returns {ValidateBuildAccount}
   * @memberof CreateGiftComponent
   */
  validateBuildSelectAccount(accountFiltered: AccountsInfoInterface): ValidateBuildAccount {
    const disabled: boolean = (
      accountFiltered !== null &&
      accountFiltered !== undefined && accountFiltered.accountInfo !== null);
    if (!disabled) {
      return { disabledItem: true, info: 'Insufficient Balance' };
    }
    if (!accountFiltered.accountInfo.mosaics.find(next => next.id.toHex() === environment.mosaicXpxInfo.id)) {
      return { disabledItem: true, info: 'Insufficient Balance', };
    }
    const mosaicXPX = accountFiltered.accountInfo.mosaics.find(next => next.id.toHex() === environment.mosaicXpxInfo.id).amount.compact();
    if (!this.validateBuildSelectAccountBalance(mosaicXPX)) {
      return { disabledItem: true, info: 'Insufficient Balance' };
    }
    return { disabledItem: false, info: '' };
  }

  /**
   *
   *
   * @param {number} balanceAccount
   * @returns {boolean}
   * @memberof CreateGiftComponent
   */
  validateBuildSelectAccountBalance(balanceAccount: number): boolean {
    return (balanceAccount >= this.fee);
  }

  /**
   * @param {(string | (string | number)[])} [custom]
   * @param {(string | number)} [formControl]
   * @returns
   * @memberof CreateGiftComponent
   */
  clearForm(custom?: string | (string | number)[], formControl?: string | number) {
    const checked = { showMosaic: true, showDescrip: true, showSequence: true, };
    if (custom !== undefined) {
      if (formControl !== undefined) {
        this.charRest = 0;
        this.createGift.controls[formControl].get(custom).reset(checked, {
          emitEvent: false
        });
        this.fee = '0.037250';
        return;
      }

      this.charRest = 0;
      this.createGift.get(custom).reset(checked, {
        emitEvent: false
      });
      this.fee = '0.037250';
      return;
    }

    this.charRest = 0;
    this.createGift.reset(checked, {
      emitEvent: false
    });
    this.fee = '0.037250';
    return;
  }

  /**
   *
   *
   * @memberof CreateGiftComponent
   */
  getAccountInfo() {
    this.subscription.push(this.walletService.getAccountsInfo$().subscribe(
      next => {
        this.changeSender(this.walletService.currentAccount);
      }
    ));
  }

  /**
   *
   *
   * @param {*} cant
   * @param {string} [amount='0']
   * @returns
   * @memberof CreateTransferComponent
   */
  addZeros(cant: any, amount: string = '0') {
    const x = '0';
    if (amount === '0') {
      for (let index = 0; index < cant - 1; index++) {
        amount += x;
      }
    } else {
      for (let index = 0; index < cant; index++) {
        amount += x;
      }
    }
    return amount;
  }

  /**
   *
   *
   * @param {*} n1
   * @param {*} n2
   * @returns
   * @memberof CreateGiftComponent
   */
  sum(n1, n2) {
    // tslint:disable-next-line: radix
    return (parseInt(n1) + parseInt(n2));
  }

  // /**
  //  *
  //  *
  //  * @returns
  //  * @memberof CreateTransferComponent
  //  */
  // validateMosaicsToSend(idMosaic: string) {
  //   let mosaics = {};
  //   const amountXpx = this.createGift.get('amountXpx').value;

  //   if (amountXpx !== '' && amountXpx !== null && Number(amountXpx) !== 0) {
  //     // console.log(amountXpx);
  //     const arrAmount = amountXpx.toString().replace(/,/g, '').split('.');
  //     let decimal;
  //     let realAmount;

  //     if (arrAmount.length < 2) {
  //       decimal = this.addZeros(environment.mosaicXpxInfo.divisibility);
  //     } else {
  //       const arrDecimals = arrAmount[1].split('');
  //       decimal = this.addZeros(environment.mosaicXpxInfo.divisibility - arrDecimals.length, arrAmount[1]);
  //     }
  //     realAmount = `${arrAmount[0]}${decimal}`;
  //     mosaics = {
  //       id: idMosaic,
  //       amount: realAmount
  //     };
  //   }

  //   return mosaics;
  // }

  /**
   *
   *
   * @returns
   * @memberof CreateTransferComponent
   */
  validateMosaicsToSend() {
    const mosaics = [];
    const amountXpx = this.createGift.get('amountXpx').value;

    if (amountXpx !== '' && amountXpx !== null && Number(amountXpx) !== 0) {
      // console.log(amountXpx);
      const arrAmount = amountXpx.toString().replace(/,/g, '').split('.');
      let decimal;
      let realAmount;

      if (arrAmount.length < 2) {
        decimal = this.addZeros(environment.mosaicXpxInfo.divisibility);
      } else {
        const arrDecimals = arrAmount[1].split('');
        decimal = this.addZeros(environment.mosaicXpxInfo.divisibility - arrDecimals.length, arrAmount[1]);
      }
      realAmount = `${arrAmount[0]}${decimal}`;
      mosaics.push(new Mosaic(
        new MosaicId(this.mosaicXpx.id),
        UInt64.fromUint(Number(this.sum(Number(realAmount), this.feeCover)))
      ));
      this.realAmount = Number(realAmount);
    }

    this.boxOtherMosaics.forEach(element => {
      if (element.id !== '' && element.amount !== '' && Number(element.amount) !== 0) {
        const arrAmount = element.amount.toString().replace(/,/g, '').split('.');
        let decimal;
        let realAmount;

        if (element.config.precision !== undefined && element.config.precision != null && element.config.precision > 0) {
          if (arrAmount.length < 2) {
            decimal = this.addZeros(element.config.precision);
          } else {
            const arrDecimals = arrAmount[1].split('');
            decimal = this.addZeros(element.config.precision - arrDecimals.length, arrAmount[1]);
          }

          realAmount = `${arrAmount[0]}${decimal}`;
        } else {
          realAmount = arrAmount[0];
        }
        mosaics.push(new Mosaic(
          new MosaicId(this.mosaicXpx.id),
          UInt64.fromUint(Number(this.feeCover))
        ));
        mosaics.push(new Mosaic(
          new MosaicId(element.id),
          UInt64.fromUint(Number(realAmount))
        ));
        this.realAmount = Number(realAmount);
      }
    });
    return mosaics;
  }

  /**
   *
   *
   * @param {string} hash
   * @memberof CreateGiftComponent
   */
  getStatusTransaction(hash: string) {

  }


  /**
   *
   *
   * @param {string} hash
   * @memberof CreateGiftComponent
   */
  setTimeOutValidateTransaction(hash: string): void {
    console.log('hash setTimeOutValidateTransaction', hash);
    setTimeout(async () => {
      const exist = (this.transactionReady.find(x => x.hash === hash)) ? true : false;
      // this.subscription['transactionStatus'].unsubscribe()
      if (!exist) {
        this.proximaxProvider.getTransactionStatus(hash).subscribe(status => {
          if (status.status.split('_').join(' ') === 'Success') {
            this.sharedService.showSuccess('', 'Transaction Confirmed');
            this.showViewsConfirmFunc();
          } else {
            this.sharedService.showWarning('', status.status.split('_').join(' '));
          }

          this.reloadBtn = false;
          this.blockSendButton = false;
        }, error => {
          this.sharedService.showWarning(
            '',
            'An error has occurred with your transaction'
          );
          this.reloadBtn = false;
          console.log('listo 3');
          this.blockSendButton = false;
        });

      }
    }, 15000);
    // 10000
  }

  /**
   *
   *
   * @param {*} amount
   * @returns {string}
   * @memberof CreateGiftComponent
   */
  amountFormatterSimple(amount): string {
    return this.transactionService.amountFormatterSimple(amount);
  }

  /**
   *
   *
   * @param {*} dataURI
   * @returns
   * @memberof CreateGiftComponent
   */
  dataURItoBlob(dataURI) {
    // Convert Base64 to raw binary data held in a string.
    const byteString = atob(dataURI.split(',')[1]);
    // Separate the MIME component.
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    // Write the bytes of the string to an ArrayBuffer.
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    // Write the ArrayBuffer to a BLOB and you're done.
    const bb = new Blob([ab]);

    return bb;
  }

  /**
   *
   *
   * @memberof CreateGiftComponent
   */
  showViewsConfirmFunc() {
    console.log('muestro la otra vista');
    console.log('this.showViewsConfirm', this.showViewsConfirm);
    this.showViewsConfirm = this.showViewsConfirm ? false : true;
    console.log('showViewsConfirmFunc', this.showViewsConfirm);
    this.checked = false;
  }

  /**
   *
   *
   * @returns
   * @memberof CreateGiftComponent
   */
  async builGitf() {
    this.giftService.setTypeDonwnload = null;
    this.giftService.setImgFileData = null;
    this.giftService.setZipFileData = null;
    this.giftService.setPdfFileData = null;
    this.giftService.setImgFileData = null;
    console.log('builGitf builGitf');
    const zipIMG = new JSZip();
    const zipPDF = new JSZip();
    let count = 0;

    if (this.accountList.length === 1) {
      const data = this.giftService.serializeData(this.realAmount, this.accountList[0].privateKey, '4ff17e357254d451', '0', 'B256A6');
      console.log('desceriazlizacion ', this.giftService.unSerialize(data));
      const qr = qrcode(10, 'H');
      qr.addData(data);
      qr.make();
      const img = await this.drawIMG(qr.createDataURL(), this.descrip, this.amountFormatterSimple(this.realAmount), this.imgBackground, 'xpx', 'B256A6');
      saveAs(new Blob([this.dataURItoBlob(img)], { type: 'image/jpeg' }), 'Gitf Card Sirius.jpeg');

      if (this.imgBackgroundtwo) {
        const imgPDF: any = await this.drawPDF(img, this.imgBackgroundtwo);
        saveAs(new Blob([imgPDF], { type: 'application/pdf' }), 'Gitf Card Sirius.pdf');
      }

      this.giftService.setTypeDonwnload = 'image/jpeg';
      this.giftService.setImgFileData = this.dataURItoBlob(img);
      this.validateSave();
      return;
    }
    for (const item of this.accountList) {
      count++;
      const nameImg = `Gitf_card_sirius(${count}).jpeg`;
      const namePdf = `Gitf_card_sirius(${count}).pdf`;
      const data = this.giftService.serializeData(this.realAmount, item.privateKey, '4ff17e357254d451', '0', 'cx159875');
      console.log('desceriazlizacion ', this.giftService.unSerialize(data));
      const qr = qrcode(10, 'H');
      qr.addData(data);
      qr.make();
      // generate IMG
      const img = await this.drawIMG(qr.createDataURL(), this.descrip, this.amountFormatterSimple(this.realAmount), this.imgBackground, 'xpx', 'B256A6');
      zipIMG.file(nameImg, this.dataURItoBlob(img), { comment: 'image/jpeg' });
      // generate PDF
      if (this.imgBackgroundtwo) {
        const img = await this.drawIMG(qr.createDataURL(), this.descrip, this.amountFormatterSimple(this.realAmount), this.imgBackground, 'xpx', 'B256A6');
        const imgZipPDF: any = await this.drawPDF(img, this.imgBackgroundtwo);
        zipPDF.file(namePdf, this.giftService.pdfFromImg(imgZipPDF), { comment: 'application/pdf' });
      }

      // imgZip = await this.drawIMG(qr.createDataURL(), this.descrip, this.amountFormatterSimple(this.realAmount), this.imgBackground, 'pxp')
      // zip.file(nameImg, this.dataURItoBlob(imgZip), { comment: 'image/jpeg' })
    }
    // const content = []
    // if (Object.keys(zipIMG.files).length > 0) {
    //   zipIMG.generateAsync({
    //     type: "blob"
    //   }).then(async (content: any) => {
    //     const fileName = `Gift Card Sirius.zip`;
    //     saveAs(content, fileName);
    //     this.giftService.setTypeDonwnload = 'zip'
    //     // content.push(content)
    //     this.giftService.setImgFileData = content
    //     // this.giftService.zipFileData.push(content);
    //     this.validateSave()
    //   });
    // }
    if (Object.keys(zipIMG.files).length > 0) {
      zipPDF.generateAsync({
        type: 'blob'
      }).then(async (content: any) => {
        const fileName = `Gift Card Sirius.zip`;
        saveAs(content, fileName);
        this.giftService.setTypeDonwnload = 'zip';
        this.giftService.setPdfFileData = content;
        // content.push(content)
        // this.giftService.zipFileData.push(content);
        this.validateSave();
      });
    }

    // this.giftService.zipFileData = content

  }

  /**
   *
   *
   * @memberof CreateGiftComponent
   */
  async donwnloadExample() {
    let imgZip: any = null;
    const qr = qrcode(10, 'H');
    qr.addData('0000000000000001942110B5FF15C06141A14322E7A3054D5B1227215B7836224F106471C1AAF2ED4FF17E357254D4513000000003B8EEEB4A');
    qr.make();
    imgZip = await this.drawIMG(qr.createDataURL(), 'hola fili', '100000', this.imgBackground, 'xpx', 'B256A6');
    saveAs(new Blob([this.dataURItoBlob(imgZip)], { type: 'image/jpeg' }), 'Gitf Card Sirius.jpeg');
  }

  /**
   *
   *
   * @memberof CreateGiftComponent
   */
  async donwnloadExamplePDF() {
    const zipIMG = new JSZip();
    const zipPDF = new JSZip();
    const qr = qrcode(10, 'H');
    qr.addData('0000000000000001942110B5FF15C06141A14322E7A3054D5B1227215B7836224F106471C1AAF2ED4FF17E357254D4513000000003B8EEEB4A');
    qr.make();
    const img = await this.drawIMG(qr.createDataURL(), 'hola fili', '100000', this.imgBackground, 'xpx', 'B256A6');
    const imgZipPDF: any = await this.drawPDF(img, this.imgBackgroundtwo);
    zipPDF.file('Gitf_card_sirius.pdf', this.giftService.pdfFromImg(imgZipPDF), { comment: 'application/pdf' });
    zipIMG.file('Gitf_card_sirius.jpeg', this.dataURItoBlob(img), { comment: 'image/jpeg' });

    // if (Object.keys(zip.files).length > 0) {

    //   for (let index = 0; index < zip.files.length; index++) {
    //     console.log('index', index)
    //     const element = zip.files[index];
    //     console.log('element', element)

    //   }
    //   // for(let item in zip.files){
    //   //   console.log('item', zip.files[item].comment)
    //   //   if(zip.files[item].comment =='application/pdf'){
    //   //     dataPDF.push(zip)
    //   //   }else if (zip.files[item].comment =='application/pdf'){

    //   //   }
    //   // }

    // }

    // if (Object.keys(zip.files).length > 0) {
    zipPDF.generateAsync({
      type: 'blob'
    }).then(async (content: any) => {
      const fileName = `Gift Card Sirius.zip`;
      saveAs(content, fileName);
      console.log('content', content);
    });
    // }

    // saveAs(new Blob([this.giftService.pdfFromImg(imgZip)], { type: "pdf" }), "Gitf Card Sirius.pdf")
  }

  /**
   *
   *
   * @memberof CreateGiftComponent
   */
  donwnload() {
    console.log('giftServicegiftService', this.giftService.getImgFileData);
    if (this.giftService.getTypeDonwnload === 'image/jpeg') {
      saveAs(new Blob([this.giftService.getImgFileData], { type: 'image/jpeg' }), 'Gitf Card Sirius (copy).jpeg');
    } else {
      const fileName = `Gift Card Sirius (copy).zip`;
      console.log('getPdfFileData', this.giftService.getPdfFileData);
      saveAs(this.giftService.getPdfFileData, fileName);
    }

  }

  /**
   *
   *
   * @memberof CreateGiftComponent
   */
  getTransactionStatus() {
    // Get transaction status
    if (!this.subscription['transactionStatus']) {
      this.subscription['transactionStatus'] = this.dataBridge.getTransactionStatus().subscribe(
        statusTransaction => {
          if (statusTransaction !== null && statusTransaction !== undefined && this.transactionSigned !== null) {
            for (const element of this.transactionSigned) {
              const match = statusTransaction['hash'] === element.hash;
              if (match) {
                this.transactionReady.push(element);
              }
              if (statusTransaction['type'] === 'confirmed' && match) {
                this.reloadBtn = false;
                this.blockSendButton = false;
                // this.builGitf()

                this.transactionSigned = this.transactionSigned.filter(el => el.hash !== statusTransaction['hash']);
              } else if (statusTransaction['type'] === 'unconfirmed' && match) {
                // this.builGitf()
                this.showViewsConfirmFunc();
                this.reloadBtn = false;
                this.blockSendButton = false;
                this.transactionSigned = null;
              } else if (statusTransaction['type'] === 'aggregateBondedAdded' && match) {
                this.showViewsConfirmFunc();
                this.reloadBtn = false;
                this.blockSendButton = false;
                this.transactionSigned = null;
              } else if (statusTransaction['type'] === 'cosignatureSignedTransaction' && match) {
                this.reloadBtn = false;
                this.blockSendButton = false;
              } else if (statusTransaction['type'] === 'status' && match) {
                this.reloadBtn = false;
                this.blockSendButton = false;
                this.transactionSigned = this.transactionSigned.filter(el => el.hash !== statusTransaction['hash']);
              }
            }
          }
        }
      );
    }
  }

  /**
   *
   *
   * @param {*} message
   * @param {*} network
   * @returns {InnerTransaction}
   * @memberof CreateGiftComponent
   */
  transferTransactionBuildMessage(message, network): InnerTransaction {
    console.log('message:', JSON.stringify(message));
    const account: Account = Account.generateNewAccount(network);
    const transferTransaction = TransferTransaction.create(
      Deadline.create(environment.deadlineTransfer.deadline, environment.deadlineTransfer.chronoUnit),
      account.address,
      [],
      PlainMessage.create(JSON.stringify(message)),
      network);
    return transferTransaction.toAggregate(this.sender.publicAccount);
  }

  /**
   *
   *
   * @param {*} cant
   * @param {*} network
   * @param {Mosaic[]} mosaics
   * @param {number} [corr=0]
   * @returns {InnerTransaction[]}
   * @memberof CreateGiftComponent
   */
  innerTransactionBuild(cant, network, mosaics: Mosaic[], corr = 0): InnerTransaction[] {
    const innerTransaction: InnerTransaction[] = [];
    let indexCor = 0;
    for (let index = 0; index < cant; index++) {
      indexCor = index;
      const account: Account = Account.generateNewAccount(network);
      const transferTransaction = TransferTransaction.create(
        Deadline.create(environment.deadlineTransfer.deadline, environment.deadlineTransfer.chronoUnit),
        account.address,
        mosaics,
        PlainMessage.create(''),
        network);
      console.log('this.sender.publicAccount', this.sender.publicAccount);
      innerTransaction.push(transferTransaction.toAggregate(this.sender.publicAccount));
      this.accountList.push(account);
    }
    const message = {
      type: 'giftCard',
      corr: corr + indexCor
    };
    innerTransaction.push(this.transferTransactionBuildMessage(message, network));
    return innerTransaction;
  }

  /**
   *
   *
   * @returns {AggregateTransaction}
   * @memberof CreateGiftComponent
   */
  aggregateTransactionFunc(): AggregateTransaction {
    let innerTransaction: InnerTransaction[] = [];
    // tslint:disable-next-line: radix
    this.cantCard = parseInt(this.createGift.get('cantCard').value);
    this.accountList = [];
    const network = (this.sender) ? this.sender.network : this.walletService.currentAccount.network;
    const mosaicsToSend: any = this.validateMosaicsToSend();
    innerTransaction = this.innerTransactionBuild(this.cantCard, network, mosaicsToSend);
    if (this.cosignatorie) {
      return AggregateTransaction.createBonded(
        Deadline.create(environment.deadlineTransfer.deadline, environment.deadlineTransfer.chronoUnit),
        innerTransaction,
        this.sender.network,
        []
      );
    }
    return AggregateTransaction.createComplete(
      Deadline.create(environment.deadlineTransfer.deadline, environment.deadlineTransfer.chronoUnit),
      innerTransaction,
      this.sender.network,
      []
    );
    // }
  }

  /**
   *
   *
   * @returns
   * @memberof CreateGiftComponent
   */
  builder() {
    if (!this.sender) {
      return;
    }
    if (!this.createGift.get('cantCard').value) {
      return;
    }
    this.aggregateTransaction = this.aggregateTransactionFunc();
    const feeAgregate = Number(this.transactionService.amountFormatterSimple(this.sum(this.aggregateTransaction.maxFee.compact(), this.feeCover)));
    this.fee = feeAgregate.toFixed(6);
  }

  /**
   *
   *
   * @memberof CreateGiftComponent
   */
  sendTransfer() {
    console.log('send');
    if (this.createGift.valid && (!this.blockSendButton)) {
      this.reloadBtn = true;
      this.blockSendButton = true;
      this.aggregateTransaction = this.aggregateTransactionFunc();
      if (this.transactionService.validateBuildSelectAccountBalance(
        Number(this.balanceXpx.split(',').join('')),
        Number(this.fee),
        Number(this.createGift.get('amountXpx').value)
      )) {
        const common: any = { password: this.createGift.get('password').value };
        const type = (this.cosignatorie) ? true : false;
        const generationHash = this.dataBridge.blockInfo.generationHash;
        switch (type) {
          case true:

            if (this.walletService.decrypt(common, this.cosignatorie)) {
              const account: Account = Account.createFromPrivateKey(common.privateKey, this.sender.network);

              const aggregateSigned = account.sign(
                this.aggregateTransaction,
                this.dataBridge.blockInfo.generationHash
              );
              const hashLockSigned = this.transactionService.buildHashLockTransaction(aggregateSigned, account, generationHash);
              this.clearForm();
              // this.builGitf()

              this.transactionService.buildTransactionHttp().announce(hashLockSigned).subscribe(async () => {
                this.getTransactionStatusHashLock(hashLockSigned, aggregateSigned);
              }, err => { });
            } else {
              this.createGift.get('password').setValue('');
              this.blockSendButton = false;
              this.reloadBtn = false;
              console.log('listo 9');
            }
            break;
          case false:
            console.log('TRANSFIERE ');
            console.log('ACCOUNT SENDER ----> ', this.sender);
            console.log('COSIGNATARIO SELECCIONADO ----> ', this.cosignatorie);
            if (this.walletService.decrypt(common, this.sender)) {
              const account: Account = Account.createFromPrivateKey(common.privateKey, this.sender.network);
              const signedTransaction = account.sign(
                this.aggregateTransaction,
                this.dataBridge.blockInfo.generationHash
              );
              this.transactionSigned.push(signedTransaction);
              this.clearForm();
              // this.reloadBtn = false;
              // this.blockSendButton = false;
              // this.builGitf()
              this.transactionService.buildTransactionHttp().announce(signedTransaction).subscribe(
                async () => {
                  this.getTransactionStatus();
                  this.setTimeOutValidateTransaction(signedTransaction.hash);
                }, err => {
                  this.reloadBtn = false;
                  this.blockSendButton = false;
                  this.sharedService.showError('', err);
                }
              );
            } else {
              this.createGift.get('password').setValue('');
              this.blockSendButton = false;
              this.reloadBtn = false;
            }
            break;
        }
        //   this.transactionSigned = []
        //   if (this.walletService.decrypt(common, this.sender)) {
        //     const account: Account = Account.createFromPrivateKey(common.privateKey, this.sender.network)

        //     const signedTransaction = account.sign(
        //       this.aggregateTransaction,
        //       this.dataBridge.blockInfo.generationHash
        //     )
        //     this.transactionSigned.push(signedTransaction);
        //     this.clearForm();
        //     // this.reloadBtn = false;
        //     // this.blockSendButton = false;
        //     // this.builGitf()
        //     this.transactionService.buildTransactionHttp().announce(signedTransaction).subscribe(
        //       async () => {
        //         this.getTransactionStatus();
        //         this.setTimeOutValidateTransaction(signedTransaction.hash);
        //       }, err => {
        //         this.reloadBtn = false;
        //         this.blockSendButton = false;
        //         this.sharedService.showError('', err);
        //       }
        //     );
        //   } else {
        //     this.createGift.get('password').setValue('');
        //     this.blockSendButton = false;
        //     this.reloadBtn = false;
        //   }
      } else {
        this.reloadBtn = false;
        console.log('listo 10');
        this.blockSendButton = false;
        this.sharedService.showError('', 'Insufficient Balance');
      }

    }

  }

  /**
   *
   *
   * @param {SignedTransaction} signedTransactionHashLock
   * @param {SignedTransaction} signedTransactionBonded
   * @memberof CreateGiftComponent
   */
  getTransactionStatusHashLock(signedTransactionHashLock: SignedTransaction, signedTransactionBonded: SignedTransaction) {
    // Get transaction status
    console.log(' Get transaction status');

    this.subscription['getTransactionStatushashLock'] = this.dataBridge.getTransactionStatus().subscribe(
      statusTransaction => {
        if (statusTransaction !== null && statusTransaction !== undefined && signedTransactionHashLock !== null) {
          const match = statusTransaction['hash'] === signedTransactionHashLock.hash;
          if (statusTransaction['type'] === 'confirmed' && match) {
            // setTimeout(() => {
            this.announceAggregateBonded(signedTransactionBonded);
            signedTransactionHashLock = null;

          } else if (statusTransaction['type'] === 'unconfirmed' && match) {
          } else if (statusTransaction['type'] === 'status' && match) {
            this.reloadBtn = false;
            console.log('aqui 1');
            this.blockSendButton = false;
            this.transactionSigned = this.transactionSigned.filter(el => el.hash !== statusTransaction['hash']);
            signedTransactionHashLock = null;
          }
        }
      }
    );
  }

  /**
   *
   * @param signedTransaction
   */
  announceAggregateBonded(signedTransaction: SignedTransaction) { // change

    this.transactionHttp.announceAggregateBonded(signedTransaction).subscribe(
      async () => {
        this.reloadBtn = true;
        this.blockSendButton = true;
        this.transactionSigned.push(signedTransaction);
        console.log('announceAggregateBondedk');
        this.getTransactionStatus();
        this.setTimeOutValidateTransaction(signedTransaction.hash);
      },
      err => {
        this.sharedService.showError('', err);
      });
  }
}


interface ValidateBuildAccount {
  disabledItem: boolean;
  info: string;

}
