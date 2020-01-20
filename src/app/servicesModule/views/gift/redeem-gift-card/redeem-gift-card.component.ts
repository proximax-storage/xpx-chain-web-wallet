import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { HeaderServicesInterface } from '../../../services/services-module.service';
import { ConfigurationForm, SharedService } from '../../../../shared/services/shared.service';
import { WalletService, AccountsInterface, AccountsInfoInterface } from '../../../../wallet/services/wallet.service';
import { GiftService, DataDececode, RecipientData } from '../../../services/gift.service';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Receipt } from 'tsjs-xpx-chain-sdk';
@Component({
  selector: 'app-redeem-gift-card',
  templateUrl: './redeem-gift-card.component.html',
  styleUrls: ['./redeem-gift-card.component.css']
})

export class RedeemGiftCardComponent implements OnInit {
  @ViewChild('fileInput', { static: false }) myInputVariable: ElementRef;
  isProcessing = false;
  reloadBtn = false;
  blockSendButton = false
  paramsHeader: HeaderServicesInterface = {
    moduleName: 'Sirius Gift',
    componentName: 'Redeem Gift Card',
  };
  recipient: RecipientData;
  showViewsConfirm = false;
  redeemGift: FormGroup;
  banFormImg = false;
  currentAccounts: any = [];
  showQRCode = false;
  subscription: Subscription[] = [];
  fileToUpload: any;
  elementType = 'url';
  ourFile: File;
  giftDecode: DataDececode;
  constructor(
    private fb: FormBuilder,
    private sharedService: SharedService,
    private giftService: GiftService,
    private walletService: WalletService) { }

  ngOnInit() {
    this.createForm();
    this.getAccountInfo();
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
    this.redeemGift = this.fb.group({
      selectAccount: ['', [
        Validators.required
      ]],
      // amountXpx: ['', [
      //   Validators.maxLength(this.configurationForm.amount.maxLength)
      // ]],


    });


    // this.convertAccountMultsignForm.get('selectAccount').patchValue('ACCOUNT-2');
  }

  /**
   * @param {(string | (string | number)[])} [custom]
   * @param {(string | number)} [formControl]
   * @returns
   * @memberof CreateGiftComponent
   */
  clearForm(custom?: string | (string | number)[], formControl?: string | number) {
    this.deleteOurFile()

    if (custom !== undefined) {
      this.redeemGift = null;
      if (formControl !== undefined) {
        this.redeemGift.controls[formControl].get(custom).reset();
        return;
      }
      this.redeemGift.get(custom).reset();
      return;
    }

    this.redeemGift.reset();
    return;
  }
  resetInput() {
    this.showViewsConfirm = false;
    this.banFormImg = false;
    setTimeout(() => {
      this.myInputVariable.nativeElement.value = null;
    }, 100);

  }
  /**
   * Method to take the selected file
   * @param {File} files file array
   * @param {Event} $event get the html element
   */
  fileChange(file: File, $event) {
    this.fileToUpload = ''
    if (file && file[0]) {
      if (file[0].type !== 'image/jpeg')
        return this.sharedService.showError('', 'Invalid format');
      this.ourFile = file[0]
      const reader = new FileReader();
      reader.readAsDataURL(this.ourFile);
      reader.onload = () => {
        this.fileToUpload = reader.result
        this.resetInput()
      };
    }
  }
  deleteOurFile() {
    this.ourFile = null
    this.giftDecode = null
    this.resetInput()
  }
  render(e) {
    if (!e.result)
      return this.sharedService.showError('', 'Failed Load File');
    this.giftDecode = this.giftService.unSerialize(e.result)
    if (this.giftDecode) {
      this.banFormImg = true;
    } else {
      this.banFormImg = false;
      return this.sharedService.showError('', 'Failed Load File');
    }
  }

  /**
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
      }


  }
  cancelGift(event) {
    if (event === 'status') {
      this.clearForm()
    }
    this.showViewsConfirm = false;
  }
  acceptGift(event) {

    this.clearForm()
    this.showViewsConfirm = false;
  }

  getAccountInfo() {
    this.subscription.push(this.walletService.getAccountsInfo$().subscribe(
      next => {
        this.getAccounts();
      }
    ));
  }

  buildSelectAccount(param: AccountsInterface) {
    this.currentAccounts.push({
      label: param.name,
      value: { publicAccount: param.publicAccount, name: param.name },
    });
  }

  selectAccount($event: Event) {
    const event: any = $event;
    this.recipient = null;
    if (event !== null) {
      this.recipient = event.value
      // console.log(this.recipient)

    }
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
      validation = this.redeemGift.controls[nameControl].get(nameInput);
    } else if (nameInput === '' && nameControl !== '' && nameValidation !== '') {
      validation = this.redeemGift.controls[nameControl].getError(nameValidation);
    } else if (nameInput !== '') {
      validation = this.redeemGift.get(nameInput);
    }
    return validation;
  }


  sendTransfer() {
    if (!this.giftDecode)
      return this.sharedService.showError('', 'Failed Load File');
    if (this.banFormImg && this.redeemGift.valid) {
      this.showViewsConfirm = true;
      // console.log('recipient', this.recipient)
      // console.log('this.giftDecode', this.giftDecode)

    }


  }
}
