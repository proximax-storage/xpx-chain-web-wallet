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
import { AccountInfo, UInt64, AggregateTransaction, Deadline, InnerTransaction, TransferTransaction, PlainMessage, Mosaic, MosaicId, Address, Account, SignedTransaction, Transaction } from 'tsjs-xpx-chain-sdk';
import { DataBridgeService } from '../../../../shared/services/data-bridge.service';
import * as JSZip from 'jszip';
import * as qrcode from 'qrcode-generator';
import { GiftService } from '../../../services/gift.service';
import { saveAs } from 'file-saver';
@Component({
  selector: 'app-create-gift',
  templateUrl: './create-gift.component.html',
  styleUrls: ['./create-gift.component.css']
})
export class CreateGiftComponent implements OnInit {
  accountInfo: AccountsInfoInterface = null;
  accountValid: boolean;
  allMosaics = [];
  showCanva = false
  dataURL: any;
  imgBackground;
  descrip: string
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
  feeCover: number = 41750
  currentBlock: number;
  valueValidateAccount: validateBuildAccount
  blockSendButton: boolean;
  haveBalance: boolean;
  balanceXpx: string;
  save: boolean;
  limit: number = 20
  accountList: Account[] = [];
  aggregateTransaction: Transaction;
  constructor(private fb: FormBuilder,
    private sharedService: SharedService,
    private walletService: WalletService,
    private mosaicServices: MosaicService,
    private transactionService: TransactionsService,
    private proximaxProvider: ProximaxProvider,
    private dataBridge: DataBridgeService,
    private giftService: GiftService
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
    this.balanceXpx = '0.000000'
  }

  ngOnInit() {
    this.validateSave()
    this.configurationForm = this.sharedService.configurationForm;
    this.createForm();
    this.subscribeValue();
    this.getAccountInfo();
    this.imgBackground = this.sharedService.walletGitf();
    this.draw('', 'hello', '100,000,000000');
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
      this.createGift.get('amountXpx').reset()
    }, 10);
    // this.convertAccountMultsignForm.get('selectAccount').patchValue('ACCOUNT-2');
  }
  validateSave() {
    console.log('this.giftService.typeDonwnload', this.giftService.getTypeDonwnload)
    if (this.giftService.typeDonwnload) {
      this.save = true
    } else {
      this.save = false
    }



  }
  /**
 *
 *
 * @param {*} e
 * @memberof CreateNamespaceComponent
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
        this.createGift.get('cantCard').patchValue(this.limit.toString())
        // tslint:disable-next-line: radix
      } else if (parseInt(e.target.value) < 1) {
        e.target.value = '';
        this.createGift.get('cantCard').setValue('');
      }
    }
  }


  draw(imgQR: string, des: string, amount: any) {
    return new Promise((resolve, reject) => {
      const canvas: any = document.getElementById('idCanvas');
      const context = canvas.getContext('2d');

      const imageObj = new Image();
      const imageObj2 = new Image(30, 46);
      imageObj2.src = imgQR;

      imageObj.onload = (e) => {
        context.drawImage(imageObj, 0, 0);
        context.font = '17px Open Sans';
        context.fillStyle = 'black';
        context.fillText(amount + ' XPX', 40, 208);
        // context.font = 'bold 20px Sans';
        // context.fillText('XPX', 28 + context.measureText(amount).width, 206);
        context.font = '16px Sans';
        context.fillText(des, 40, 276);
        // context.putImageData(imgData, 10, 70);
        imageObj2.width = 12;
        imageObj2.height = 12;
        context.drawImage(imageObj2, 343, 79, 130, 130);
        const canvas: any = document.getElementById('idCanvas');
        this.dataURL = canvas.toDataURL('image/jpeg', 1.0);
        resolve(this.dataURL)
      };
      imageObj.setAttribute('crossOrigin', 'anonymous');
      imageObj.src = this.imgBackground;
      imageObj.onerror = reject
    })


  }

  /**
    * @memberof CreateGiftComponent
    */
  subscribeValue() {
    this.subscription.push(this.createGift.get('message').valueChanges.subscribe(val => {
      if (val && val !== '') {
        this.charRest = val.length;
        this.descrip = val

        // this.calculateFee(val.length);
      } else {
        this.charRest = 0;
        this.descrip = ''
        // this.calculateFee(0);
      }
    }));
    this.subscription.push(this.createGift.get('cantCard').valueChanges.subscribe(val => {
      setTimeout(() => {
        if (!isNaN(parseInt(val))) {
          if (parseInt(val) <= this.limit && parseInt(val) >= 1)
            this.builder();
        }
      }, 100);

      //   this.createGift.get('cantCard').patchValue('', { emitEvent: true, onlySelf: true })
      // } else {
      //   // tslint:disable-next-line: radix
      //   if (parseInt(val) > 20) {
      //     this.createGift.get('cantCard').patchValue('20', { emitEvent: true, onlySelf: true })
      //     // tslint:disable-next-line: radix
      //   } else if (parseInt(val) < 1) {
      //     this.createGift.get('cantCard').patchValue('', { emitEvent: true, onlySelf: true });
      //   }
      // }
      // console.log(parseInt(val))
      // if (parseInt(val) > 1000) {
      //   this.createGift.get('cantCard').setValue('', { emitEvent: true, onlySelf: true })
      // }


    }));
    this.subscription.push(this.createGift.get('amountXpx').valueChanges.subscribe(val => {
      this.builder();
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



  validateAccount(name: string, account: AccountsInterface) {
    this.accountInfo = this.walletService.filterAccountInfo(name);
    this.sender = null
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
    this.sender = account
    this.builder()
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
    if (this.walletService.currentWallet)
      if (this.walletService.currentWallet.accounts.length > 0) {
        this.currentAccounts = [];
        for (let element of this.walletService.currentWallet.accounts) {
          this.buildSelectAccount(element)
        }
        // if (this.currentAccounts) {
        //   const currentAccountDef = this.currentAccounts.find(item => item.default)
        //   if (currentAccountDef) {
        //     this.createGift.get('selectAccount').setValue(currentAccountDef)
        //   } else {
        //     this.createGift.get('selectAccount').setValue(this.currentAccounts[0])
        //   }
        // }
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
    this.subscribeAccount = this.walletService.getAccountsInfo$().subscribe(
      async accountInfo => {
        this.validateAccount(event.value.name, event.value)
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
    if (accountFiltered) {
      if (!this.isMultisign(param)) {
        console.log('paramparam', param.default)
        this.currentAccounts.push({
          label: param.name,
          value: param,
          disabledItem: validateBuildAccount.disabledItem,
          info: validateBuildAccount.info,
          default: param.default
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
        this.createGift.controls[formControl].get(custom).reset('', {
          emitEvent: false
        });
        this.fee = '0.037250';
        return;
      }

      this.charRest = 0;
      this.createGift.get(custom).reset('', {
        emitEvent: false
      });
      this.fee = '0.037250';
      return;
    }

    this.charRest = 0;
    this.createGift.reset('', {
      emitEvent: false
    });
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

  sum(n1, n2) {
    return (parseInt(n1) + parseInt(n2));
  }
  /**
   *
   *
   * @returns
   * @memberof CreateTransferComponent
   */
  validateMosaicsToSend(idMosaic: string) {
    let mosaics = {};
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
      mosaics = {
        id: idMosaic,
        amount: realAmount
      };
    }

    return mosaics;
  }

  /**
     *
     *
     * @memberof CreateTransferComponent
     */
  sendTransfer() {
    // console.log('send')
    if (this.createGift.valid && (!this.blockSendButton)) {
      this.reloadBtn = true;
      this.blockSendButton = true;
      // console.log('feeeee', this.fee)
      // console.log(this.balanceXpx.split(',').join(''))
      // console.log(this.aggregateTransaction.innerTransactions[0]['mosaics'][0]['amount'].compact())
      // console.log(this.amountFormatterSimple(this.aggregateTransaction.innerTransactions[0]['mosaics'][0]['amount'].compact()))
      if (this.transactionService.validateBuildSelectAccountBalance(Number(this.balanceXpx.split(',').join('')), Number(this.fee), Number(this.createGift.get('amountXpx').value))) {
        const common: any = { password: this.createGift.get('password').value };
        this.transactionSigned = []
        if (this.walletService.decrypt(common, this.sender)) {
          const account: Account = Account.createFromPrivateKey(common.privateKey, this.sender.network)

          const signedTransaction = account.sign(
            this.aggregateTransaction,
            this.dataBridge.blockInfo.generationHash
          )
          this.transactionSigned.push(signedTransaction);
          this.clearForm();
          // this.reloadBtn = false;
          // this.blockSendButton = false;
          // this.builGitf()
          this.transactionService.buildTransactionHttp().announce(signedTransaction).subscribe(
            async () => {
              this.getTransactionStatus();
              this.dataBridge.setTimeOutValidateTransaction(signedTransaction.hash);
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
      } else {
        this.reloadBtn = false;
        this.blockSendButton = false;
        this.sharedService.showError('', 'Insufficient Balance');
      }
    }
  }

  amountFormatterSimple(amount): string {
    return this.transactionService.amountFormatterSimple(amount)
  }
  dataURItoBlob(dataURI) {
    // Convert Base64 to raw binary data held in a string.
    var byteString = atob(dataURI.split(',')[1]);
    // Separate the MIME component.
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
    // Write the bytes of the string to an ArrayBuffer.
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    // Write the ArrayBuffer to a BLOB and you're done.
    var bb = new Blob([ab]);

    return bb;
  }
  async builGitf() {
    this.giftService.setTypeDonwnload = null
    this.giftService.setImgFileData = null
    this.giftService.setZipFileData = null
    console.log('builGitf builGitf')
    const zip = new JSZip();
    // console.log(this.accountList)
    let count = 0
    let imgZip: any = null

    if (this.accountList.length == 1) {
      const data = this.giftService.serializeData(this.realAmount, this.accountList[0].privateKey, this.descrip);
      // console.log('desceriazlizacion ', this.giftService.unSerialize(data))
      const qr = qrcode(10, 'H');
      qr.addData(data);
      qr.make();
      imgZip = await this.draw(qr.createDataURL(), this.descrip, this.amountFormatterSimple(this.realAmount))
      saveAs(new Blob([this.dataURItoBlob(imgZip)], { type: "image/jpeg" }), "Gitf Card Sirius.jpeg")
      this.giftService.setTypeDonwnload = 'image/jpeg'
      this.giftService.setImgFileData = this.dataURItoBlob(imgZip);
      this.validateSave()
      return
    }
    for (let item of this.accountList) {
      count++;
      const nameImg = `Gitf Card Sirius (${count}).jpeg`;
      const data = this.giftService.serializeData(this.realAmount, item.privateKey, this.descrip);
      console.log('desceriazlizacion ', this.giftService.unSerialize(data))
      const qr = qrcode(10, 'H');
      qr.addData(data);
      qr.make();
      imgZip = await this.draw(qr.createDataURL(), this.descrip, this.amountFormatterSimple(this.realAmount))
      zip.file(nameImg, this.dataURItoBlob(imgZip), { comment: 'image/jpeg' })
    }
    if (Object.keys(zip.files).length > 0) {
      zip.generateAsync({
        type: "blob"
      }).then(async (content: any) => {
        const fileName = `Gift Card Sirius.zip`;
        saveAs(content, fileName);
        this.giftService.setTypeDonwnload = 'zip'
        this.giftService.setZipFileData = content;
        this.validateSave()
      });
    }




  }

  donwnload() {
    console.log('giftServicegiftService', this.giftService.getImgFileData)
    if (this.giftService.getTypeDonwnload === 'image/jpeg') {
      saveAs(new Blob([this.giftService.getImgFileData], { type: "image/jpeg" }), "Gitf Card Sirius (copy).jpeg")
    } else {
      const fileName = `Gift Card Sirius (copy).zip`;
      saveAs(this.giftService.getZipFileData, fileName);
    }

  }

  /**
  *
  *
  * @memberof CreateTransferComponent
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
                this.builGitf()
                this.reloadBtn = false;
                this.blockSendButton = false;
              } else if (statusTransaction['type'] === 'aggregateBondedAdded' && match) {
                this.reloadBtn = false;
                this.blockSendButton = false;
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
  aggregateTransactionFunc(): Transaction {
    this.realAmount = 0;
    let innerTransaction: InnerTransaction[] = []
    let aggregateTransaction: Transaction = null
    const cantCard: number = parseInt(this.createGift.get('cantCard').value)
    const array = new Array(cantCard)
    this.accountList = []
    const network = (this.sender) ? this.sender.network : this.walletService.currentAccount.network
    const mosaicsToSend: any = this.validateMosaicsToSend(this.mosaicXpx.id);
    this.realAmount = Number(mosaicsToSend.amount)

    if (cantCard === 1) {
      const account: Account = Account.generateNewAccount(network)
      aggregateTransaction = TransferTransaction.create(
        Deadline.create(environment.deadlineTransfer.deadline, environment.deadlineTransfer.chronoUnit),
        account.address,
        [new Mosaic(new MosaicId(mosaicsToSend.id), UInt64.fromUint(Number(this.sum(mosaicsToSend.amount, this.feeCover))))],
        PlainMessage.create(''),
        network);
      this.accountList.push(account)
      return aggregateTransaction
    }
    if (cantCard > 1) {
      for (let index = 0; index < cantCard; index++) {
        const account: Account = Account.generateNewAccount(network)
        const transferTransaction = TransferTransaction.create(
          Deadline.create(environment.deadlineTransfer.deadline, environment.deadlineTransfer.chronoUnit),
          account.address,
          [new Mosaic(new MosaicId(mosaicsToSend.id), UInt64.fromUint(Number(this.sum(mosaicsToSend.amount, this.feeCover))))],
          PlainMessage.create(''),
          network);
        innerTransaction.push(transferTransaction.toAggregate(this.sender.publicAccount))
        this.accountList.push(account)
      }
      return aggregateTransaction = AggregateTransaction.createComplete(
        Deadline.create(environment.deadlineTransfer.deadline, environment.deadlineTransfer.chronoUnit),
        innerTransaction,
        this.sender.network,
        []
      )
    }

  }
  builder() {
    const cantCard: number = parseInt(this.createGift.get('cantCard').value)
    console.log('cantCard', cantCard)
    if (!this.sender)
      return
    if (!this.createGift.get('cantCard').value)
      return
    this.aggregateTransaction = this.aggregateTransactionFunc()
    let feeAgregate = Number(this.transactionService.amountFormatterSimple(this.sum(this.aggregateTransaction.maxFee.compact(), this.feeCover)));
    this.fee = feeAgregate.toFixed(6);
  }
}

interface validateBuildAccount {
  disabledItem: boolean,
  info: string,

}
