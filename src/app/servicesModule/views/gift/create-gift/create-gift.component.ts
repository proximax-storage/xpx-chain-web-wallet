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
  TransactionHttp,
  MosaicInfo
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
  dataQR = null;

  // --------------- Je
  porcent = 20;

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
  descrip: any;
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
  reloadBtnCont: boolean
  realAmount: number;
  mosaicPrimary: any;
  isMultisig: boolean;
  notBalance: boolean;
  passwordMain = 'password';
  charRest: number;
  messageMaxLength: number;
  mosaicXpx: { id: string, name: string; divisibility: number } = null;
  subscription: Subscription[] = [];
  fee: any = '0.053250';
  feeCosignatory: any = 10044500;
  feeCover = 0;
  currentBlock: number;
  fileToUpload: any;
  ourFile: File;
  ourFiletwo: File;
  validateRealAmount: boolean = false
  // valueValidateAccount: ValidateBuildAccount
  blockSendButton: boolean;
  haveBalance: boolean;
  balanceXpx: string;
  save: boolean;
  limit = 100;
  accountList: Account[] = [];
  aggregateTransaction: Transaction;

  // --------------- Rj
  mosaicSelected: any;
  assetInsufficientBalance = false;
  assetsOptions = {
    prefix: '',
    thousands: ',',
    decimal: '.',
    precision: '6'
  };

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
    this.reloadBtnCont = false
    this.blockSendButton = false;
    this.accountValid = false;
    this.notBalance = false;
    this.isMultisig = false;
    this.haveBalance = false;
    this.save = false;
    this.balanceXpx = '0.000000';
  }

  ngOnInit() {
    // --------------- Je
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

  changeMosaic(event) {
    this.mosaicSelected = event;
    this.assetsOptions = event.config;
    this.createGift.get('assetAmount').reset();
  }

  /**
   * @memberof CreateGiftComponent
   */
  createForm() {
    // Form create multisignature default
    this.createGift = this.fb.group({
      assetAmount: ['', [
        Validators.maxLength(this.configurationForm.amount.maxLength)
      ]],
      mosaicSelected: [true, [Validators.required]],
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
      this.createGift.get('assetAmount').reset();
    }, 10);
    // this.convertAccountMultsignForm.get('selectAccount').patchValue('ACCOUNT-2');
  }

  /**
   *
   *
   * @param {*} amount
   * @param {MosaicsStorage} mosaic
   * @memberof CreateGiftComponent
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
   * @memberof CreateGiftComponent
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
   * @memberof CreateGiftComponent
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
      if (this.createGift.disabled && !this.disabledAllField && this.allMosaics.length > 0) {
        this.createGift.enable();
      }

      this.clearForm();
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
        this.assetInsufficientBalance = true;
        this.createGift.controls['assetAmount'].disable();
      } else if (!this.disabledAllField) {
        this.assetInsufficientBalance = false;
        this.createGift.controls['assetAmount'].enable();
      }
    }
  }
  reset() {
    this.haveBalance = false;
    this.disabledBtnAddMosaic = false;
    this.selectOtherMosaics = [];
    this.haveBalance = false;
    this.allMosaics = [];
    this.balanceXpx = '0.000000';
    this.boxOtherMosaics = [];
    this.blockSendButton = false;
    this.reloadBtn = false;
    this.charRest = this.configurationForm.message.maxLength;
    this.disabledBtnAddMosaic = false;
    this.errorOtherMosaics = false;
    this.incrementMosaics = 0;
    // this.invalidRecipient = false;
    this.assetInsufficientBalance = false;
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


  validateSave() {
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
   * Method to take the selected file
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
  showImgFun() {
    this.drawExample();
    if (!this.showImgtwo) {
      this.drawExampletwo();
    }
  }
  updateShowMosaic() {
  }
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
        context.drawImage(imageObj, 0, 0, 150, 200);
        // const canvas: any = document.getElementById('idCanvas');
        const dataURLTwo = canvas.toDataURL('image/jpeg', 1.0);
        resolve(dataURLTwo);
      };
    });

  }
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
        context.drawImage(imageObj, 0, 0, 250, 150);
        const dataURL = canvas.toDataURL('image/jpeg', 1.0);
        resolve(dataURL);
      };

    });
  }
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
          // context.font = '15px Open Sans';
          // context.fillStyle = 'black';
          // context.fillText(mosaic, 78, 246);
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

  drawPDF(imageGift, imagePdf) {

    return new Promise(async (resolve, reject) => {
      const canvas: any = document.getElementById('pdf');
      const context = canvas.getContext('2d');

      const imageObj = new Image(989, 1280);
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
        const C: any = document.getElementById('pdf');
        const dataURL = C.toDataURL('image/jpeg', 1.0);
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
    // ------ Rj
    this.subscription.push(this.createGift.get('assetAmount').valueChanges.subscribe(value => {
      this.validateRealAmount = false
      if (value !== null && value !== undefined) {
        const amount = Number(value);
        let validateAmount = false;
        if (this.sender && this.mosaicSelected) {
          const accountInfo = this.walletService.filterAccountInfo(this.sender.name);
          if (accountInfo !== undefined && accountInfo !== null && Object.keys(accountInfo).length > 0) {
            if (accountInfo.accountInfo && accountInfo.accountInfo.mosaics.length > 0) {
              const filtered = accountInfo.accountInfo.mosaics.find(element => {
                return element.id.toHex() === new MosaicId([this.mosaicSelected.value[0], this.mosaicSelected.value[1]]).toHex();
              });
              const arrAmount = value.toString().replace(/,/g, '').split('.');
              let decimal;
              let realAmount;

              if (arrAmount.length < 2) {
                decimal = this.addZeros(this.mosaicSelected.config.precision);
              } else {
                const arrDecimals = arrAmount[1].split('');
                decimal = this.addZeros(this.mosaicSelected.config.precision - arrDecimals.length, arrAmount[1]);
              }

              realAmount = `${arrAmount[0]}${decimal}`;
              if (realAmount > 0) {
                this.validateRealAmount = true
              } else {
                this.validateRealAmount = false
              }
              if (filtered !== undefined && filtered !== null) {
                const invalidBalance = filtered.amount.compact() < Number(realAmount);
                if (invalidBalance && !this.assetInsufficientBalance) {
                  this.assetInsufficientBalance = true;
                  // this.blockSendButton = true;
                } else if (!invalidBalance && this.assetInsufficientBalance) {
                  this.assetInsufficientBalance = false;
                  // this.blockSendButton = false;
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
            this.assetInsufficientBalance = true;
            this.blockSendButton = true;
          } else if ((Number(value) === 0 || value === '') && this.assetInsufficientBalance) {
            this.assetInsufficientBalance = false;
          }
        }

      }
    }));

    //
    this.subscription.push(this.createGift.get('message').valueChanges.subscribe(val => {
      if (val && val !== '') {
        this.charRest = val.length;
        // this.descrip = val;

        // this.calculateFee(val.length);
      } else {
        this.charRest = 0;
        // this.descrip = '';
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

            this.haveBalance = true;
            this.balanceXpx = amount;
            const nameMosaic = (mosaic.mosaicNames.names.length > 0) ? mosaic.mosaicNames.names[0].name : this.proximaxProvider.getMosaicId(mosaic.idMosaic).toHex();
            mosaicsSelect.push({
              label: `${nameMosaic}${nameExpired} > Balance: ${amount}`,
              name: nameMosaic,
              value: mosaic.idMosaic,
              balance: amount,
              expired: false,
              selected: false,
              disabled: expired,
              config: configInput
            });
          }

          this.createGift.enable();
          this.allMosaics = mosaicsSelect;
        } else {
          this.createGift.disable();
        }
      } else {
        this.createGift.disable();
      }
    } else {
      this.createGift.disable();
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


  /**
   * @param {*} inputType
   * @memberof CreateGiftComponent
   */
  changeInputType(inputType: any) {
    const newType = this.sharedService.changeInputType(inputType);
    this.passwordMain = newType;
  }

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

  buildSelectAccount(param: AccountsInterface) {
    const accountFiltered = this.walletService.filterAccountInfo(param.name);
    const validateBuildAccount: ValidateBuildAccount = this.validateBuildSelectAccount(accountFiltered);
    if (accountFiltered) {
      if (!this.isMultisign(param)) {
        this.currentAccounts.push({
          label: param.name,
          value: param,
          disabledItem: validateBuildAccount.disabledItem,
          info: validateBuildAccount.info,
          default: param.default
        });
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
      accounts.isMultisign !== undefined &&
      accounts.isMultisign !== null &&
      this.isMultisigValidate(accounts.isMultisign.minRemoval, accounts.isMultisign.minApproval)
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
    if (custom !== undefined) {
      if (formControl !== undefined) {
        this.charRest = 0;
        this.createGift.controls[formControl].get(custom).reset({
          emitEvent: false
        });
        this.fee = '0.037250';
        return;
      }

      this.charRest = 0;
      this.createGift.get(custom).reset({
        emitEvent: false
      });
      this.fee = '0.037250';
      return;
    }

    this.charRest = 0;
    this.createGift.reset({
      emitEvent: false
    });
    this.fee = '0.037250';
    this.assetInsufficientBalance = false;
    return;
  }
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
   * @memberof CreateGiftComponent
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

  sum(n1, n2) {
    return (parseInt(n1) + parseInt(n2));
  }
  substrFuc(str: string, numSub: number): string {
    let value = null;
    value = str.substr(str.length - numSub, str.length);
    return value;
  }


  /**
   * Rj
   *
   * @returns
   * @memberof CreateGiftComponent
   */
  buildMosaicsToSend() {
    const mosaics = [];
    const assetAmount = this.createGift.get('assetAmount').value;
    if (assetAmount !== '' && assetAmount !== null && Number(assetAmount) !== 0) {
      const arrAmount = assetAmount.toString().replace(/,/g, '').split('.');
      let decimal;
      let realAmount;

      if (
        this.mosaicSelected &&
        this.mosaicSelected.config.precision !== undefined &&
        this.mosaicSelected.config.precision !== null &&
        this.mosaicSelected.config.precision > 0
      ) {
        if (arrAmount.length < 2) {
          decimal = this.addZeros(this.mosaicSelected.config.precision);
        } else {
          const arrDecimals = arrAmount[1].split('');
          decimal = this.addZeros(this.mosaicSelected.config.precision - arrDecimals.length, arrAmount[1]);
        }

        realAmount = `${arrAmount[0]}${decimal}`;
      } else {
        realAmount = arrAmount[0];
      }

      const mosaicID = new MosaicId([this.mosaicSelected.value[0], this.mosaicSelected.value[1]]);
      if (mosaicID.toHex() === this.mosaicXpx.id) {
        mosaics.push(new Mosaic(
          new MosaicId(this.mosaicXpx.id),
          UInt64.fromUint(Number(this.sum(Number(realAmount), this.feeCover)))
        ));
      } else {
        mosaics.push(new Mosaic(
          new MosaicId(this.mosaicXpx.id),
          UInt64.fromUint(Number(this.feeCover))
        ));

        mosaics.push(new Mosaic(
          mosaicID,
          UInt64.fromUint(Number(realAmount))
        ));
      }

      this.realAmount = Number(realAmount);
      this.mosaicPrimary = new MosaicId([this.mosaicSelected.value[0], this.mosaicSelected.value[1]]).toHex();
    }

    return mosaics;
  }

  /**
   *
   *
   * @param {string} hash
   * @memberof CreateGiftComponent
   */
  setTimeOutValidateTransaction(hash: string): void {
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
  amountFormatterSimple(amount, d = 6): string {
    return this.transactionService.amountFormatterSimple(amount, d);
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

  showViewsConfirmFunc(validate = false) {
    this.showViewsConfirm = this.showViewsConfirm ? false : true;
    this.checked = false;
    if (validate) {
      this.drawExample()
      this.drawExampletwo()
    }
  }

  mosaicsInfoSerialize(mosaic: any): { nameMosaic: string, transferable: string, divisibility: number } {
    const data = { nameMosaic: '', transferable: '', divisibility: 0 };
    // const nameMosaic = (mosaic.mosaicNames.names.length > 0) ? mosaic.mosaicNames.names[0].name :
    data.nameMosaic = (mosaic.mosaicNames.names.length > 0) ? mosaic.mosaicNames.names[0].name :
      this.proximaxProvider.getMosaicId(mosaic.idMosaic).toHex();
    data.transferable = (mosaic.mosaicInfo.properties.transferable) ? '1' : '0';
    data.divisibility = mosaic.mosaicInfo.properties.divisibility;
    return data;
  }

  /**
   *
   *
   * @returns
   * @memberof CreateGiftComponent
   */
  async builGitf() {
    this.reloadBtnCont = true
    this.giftService.setTypeDonwnload = null;
    this.giftService.setImgFileData = null;
    this.giftService.setZipFileData = null;
    this.giftService.setPdfFileData = null;
    this.giftService.setImgFileData = null;
    const zipIMG = new JSZip();
    const zipPDF = new JSZip();
    let count = 0;
    const mosaic = await this.mosaicServices.filterMosaics([new MosaicId(this.mosaicPrimary)]);
    const infoMosaic = this.mosaicsInfoSerialize(mosaic[0]);
    if (this.accountList.length === 1) {
      // console.log('account List :::', this.accountList[0].privateKey)
      const data = this.giftService.serializeData(this.realAmount, this.accountList[0].privateKey, this.mosaicPrimary, infoMosaic.transferable, this.substrFuc(this.accountList[0].publicKey, 6));
      const qr = qrcode(10, 'H');
      qr.addData(data);
      qr.make();
      const img = await this.drawIMG(
        qr.createDataURL(),
        this.descrip,
        this.transactionService.amountFormatter(this.realAmount, null, infoMosaic.divisibility),
        this.imgBackground,
        infoMosaic.nameMosaic,
        this.substrFuc(this.accountList[0].publicKey, 6)
      );
      if (this.imgBackgroundtwo) {
        const imgPDF: any = await this.drawPDF(img, this.imgBackgroundtwo);
        saveAs(new Blob([this.giftService.pdfFromImg(imgPDF)], { type: 'application/pdf' }), 'Gitf Card Sirius.pdf');
      } else {
        saveAs(new Blob([this.dataURItoBlob(img)], { type: 'image/jpeg' }), 'Gitf Card Sirius.jpeg');
      }
      this.giftService.setTypeDonwnload = 'image/jpeg';
      // this.giftService.setImgFileData = this.dataURItoBlob(img);
      this.validateSave();
      this.reloadBtnCont = false
      return;
    }
    for (const item of this.accountList) {
      count++;
      const nameImg = `Gitf_card_sirius(${count}).jpeg`;
      const namePdf = `Gitf_card_sirius(${count}).pdf`;
      const data = this.giftService.serializeData(this.realAmount, item.privateKey, this.mosaicPrimary, infoMosaic.transferable, this.substrFuc(item.publicKey, 6));
      const qr = qrcode(10, 'H');
      qr.addData(data);
      qr.make();
      // generate IMG
      const img = await this.drawIMG(
        qr.createDataURL(),
        this.descrip,
        this.transactionService.amountFormatter(this.realAmount, null, infoMosaic.divisibility),
        this.imgBackground,
        infoMosaic.nameMosaic,
        this.substrFuc(item.publicKey, 6)
      );
      zipIMG.file(nameImg, this.dataURItoBlob(img), { comment: 'image/jpeg' });
      // generate PDF
      if (this.imgBackgroundtwo) {
        const imgZipPDF: any = await this.drawPDF(img, this.imgBackgroundtwo);
        zipPDF.file(namePdf, this.giftService.pdfFromImg(imgZipPDF), { comment: 'application/pdf' });
      }
    }
    if (Object.keys(zipPDF.files).length > 0) {
      zipPDF.generateAsync({
        type: 'blob'
      }).then(async (content: any) => {
        const fileName = `Gift_card_sirius_pdf.zip`;
        saveAs(content, fileName);
        this.giftService.setTypeDonwnload = 'zip';
        this.giftService.setPdfFileData = content;
        this.reloadBtnCont = false
        this.validateSave();
      });

    } else if (Object.keys(zipIMG.files).length > 0) {
      zipIMG.generateAsync({
        type: 'blob'
      }).then(async (content: any) => {
        const fileName = `Gift_card_sirius.zip`;
        saveAs(content, fileName);
        this.giftService.setTypeDonwnload = 'zip';
        this.giftService.setImgFileData = content;
        // this.giftService.setImgFileData = content
        this.reloadBtnCont = false
        this.validateSave();
      });
    }

  }

  /**
   *
   *
   * @memberof CreateGiftComponent
   */
  donwnload() {
    if (this.giftService.getTypeDonwnload === 'image/jpeg') {
      saveAs(new Blob([this.giftService.getImgFileData], { type: 'image/jpeg' }), 'Gitf Card Sirius (copy).jpeg');
    } else {
      const fileName = `Gift Card Sirius (copy).zip`;
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
  transferTransactionBuildMessage(message, network): InnerTransaction {
    const account: Account = Account.generateNewAccount(network);
    const transferTransaction = TransferTransaction.create(
      Deadline.create(environment.deadlineTransfer.deadline, environment.deadlineTransfer.chronoUnit),
      account.address,
      [],
      PlainMessage.create(JSON.stringify(message)),
      network);
    return transferTransaction.toAggregate(this.sender.publicAccount);
  }
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
        PlainMessage.create(this.substrFuc(account.publicKey, 6)),
        network);
      innerTransaction.push(transferTransaction.toAggregate(this.sender.publicAccount));
      this.accountList.push(account);
    }
    const message = {
      type: 'giftCard',
      number: corr + indexCor
    };
    innerTransaction.push(this.transferTransactionBuildMessage(message, network));
    return innerTransaction;

  }
  // ------ Je
  aggregateTransactionFunc(maxFee: number): AggregateTransaction {
    const maxFeeValue = (maxFee > 0) ? UInt64.fromUint(maxFee) : null;
    let innerTransaction: InnerTransaction[] = [];
    // tslint:disable-next-line: radix
    this.cantCard = parseInt(this.createGift.get('cantCard').value);
    this.accountList = [];
    const network = (this.sender) ? this.sender.network : this.walletService.currentAccount.network;
    const maxFeeCover = this.calFeeInnerTransactionFunc([new Mosaic(
      new MosaicId(this.mosaicXpx.id),
      UInt64.fromUint(0)
    )]).maxFee.compact();
    this.feeCover = this.calFeeAggregateTransaction(maxFeeCover);
    const mosaicsToSend: any = this.buildMosaicsToSend();
    innerTransaction = this.innerTransactionBuild(this.cantCard, network, mosaicsToSend);
    if (this.cosignatorie) {
      return AggregateTransaction.createBonded(
        Deadline.create(environment.deadlineTransfer.deadline, environment.deadlineTransfer.chronoUnit),
        innerTransaction,
        this.sender.network,
        [],
        maxFeeValue
      );
    }
    return AggregateTransaction.createComplete(
      Deadline.create(environment.deadlineTransfer.deadline, environment.deadlineTransfer.chronoUnit),
      innerTransaction,
      this.sender.network,
      [],
      maxFeeValue
    );
    // }

  }
  // ------ Je
  calFeeInnerTransactionFunc(mosaics: Mosaic[]): AggregateTransaction {
    const network = (this.sender) ? this.sender.network : this.walletService.currentAccount.network;
    const account: Account = Account.generateNewAccount(network);
    const transferTransactionOne = TransferTransaction.create(
      Deadline.create(environment.deadlineTransfer.deadline, environment.deadlineTransfer.chronoUnit),
      account.address,
      mosaics,
      PlainMessage.create(JSON.stringify({ "type": "gift", "msg": "CBFA6831323334353637383938" })),
      network);
    const transferTransactionTwo = TransferTransaction.create(
      Deadline.create(environment.deadlineTransfer.deadline, environment.deadlineTransfer.chronoUnit),
      account.address,
      [],
      PlainMessage.create(JSON.stringify({ "type": "gift", "msg": "CBFA6831323334353637383938" })),
      network);
    return AggregateTransaction.createComplete(
      Deadline.create(environment.deadlineTransfer.deadline, environment.deadlineTransfer.chronoUnit),
      [transferTransactionOne.toAggregate(account.publicAccount), transferTransactionTwo.toAggregate(account.publicAccount)],
      this.sender.network,
      [],
    );


  }
  // ------ Je
  builder() {
    if (!this.sender) {
      return;
    }
    if (!this.createGift.get('cantCard').value) {
      return;
    }
    this.aggregateTransaction = this.aggregateTransactionFunc(0);
    const feeAgregate = Number(this.transactionService.amountFormatterSimple(this.sum(this.aggregateTransaction.maxFee.compact(), this.feeCover)));
    this.fee = feeAgregate.toFixed(6);
  }
  // ------ Je
  calFeeAggregateTransaction(maxFee: number) {
    let valor = 0;
    valor = maxFee * this.porcent / 100;
    return valor + maxFee;
  }


  /**
   *
   *
   * @memberof CreateGiftComponent
   */
  sendTransfer() {
    if (this.createGift.valid && (!this.blockSendButton) && this.mosaicSelected) {
      this.reloadBtn = true;
      this.blockSendButton = true;
      this.transactionSigned = [];
      this.descrip = this.createGift.get('message').value
      const maxFeeCal = this.calFeeAggregateTransaction(this.aggregateTransaction.maxFee.compact());
      this.aggregateTransaction = this.aggregateTransactionFunc(maxFeeCal);
      if (this.transactionService.validateBuildSelectAccountBalance(
        Number(this.balanceXpx.split(',').join('')),
        Number(this.fee),
        0
      )) {
        const common: any = { password: this.createGift.get('password').value };
        const type = (this.cosignatorie) ? true : false;
        //  const type = null
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
            }
            break;
          case false:
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
      } else {
        this.reloadBtn = false;
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
