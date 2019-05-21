import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, FormControl, FormArray, ValidatorFn } from "@angular/forms";

import { WalletService } from '../../../../shared/services/wallet.service';
import { ProximaxProvider } from '../../../../shared/services/proximax.provider';
import { SharedService } from '../../../../shared';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Address, UInt64, Account } from 'tsjs-xpx-catapult-sdk';
@Component({
  selector: 'app-create-poll',
  templateUrl: './create-poll.component.html',
  styleUrls: ['./create-poll.component.scss']
})
export class CreatePollComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;
  optionsStorage: Array<any>;
  account: Account;
  errorDate: string;
  validateform = false;
  validateformOptions = false;
  validateformWhiteLis = false;
  validateformDate = false;
  optionslength = false;
  whiteListlength = false;
  whiteList = false;
  createpollForm: FormGroup | any;
  keyObject = Object.keys;
  optionsData: any;
  whiteListData: any
  messageWhiteLis: string;
  messageOptions: string;
  options: Array<any>
  accountPrin: string = 'VA44CI-NZZ4QD-NT5ILM-ET2AQ2-2QFIQI-VXH25W-LQVH';
  privateKey: string = '6453DE5D725067F04FC013880AE3E8E817B576FA9F0C15FDDE18A883FEACF681';
  constructor(
    private fb: FormBuilder,
    private walletService: WalletService,
    private proximaxProvider: ProximaxProvider,
    private sharedService: SharedService,


  ) {
    // this.indexAccount = this.proximaxProvider.generateNewAccount(this.walletService.network).address.plain();
    this.optionsStorage = [{ value: '', label: 'select ' }, { value: '1', label: 'POI ' }, { value: '2', label: 'white List ' }]
  }

  ngOnInit() {
    this.createForm();

  }


  createForm() {
    this.options = [{ value: 'YES' }, { value: 'NO' }]
    this.optionsData = this.options.map((value, index) => new FormControl(value.value, Validators.required))
    this.createpollForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      indexAccount: [{ value: this.accountPrin, disabled: true }, [Validators.required, Validators.maxLength(30)]],
      datepoll: ['', Validators.required],
      choice: [''],
      type: [{ value: '1', disabled: false }, Validators.required],
      whiteList: new FormArray([]),
      options: new FormArray(this.optionsData),
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(30)]],
    });
    this.createpollForm.get('datepoll').valueChanges.subscribe(
      doe => {
        if (new Date(doe).getTime() <= Date.now()) {
          this.errorDate = "fecha no valida "
          this.validateformDate = true;
        } else {
          this.errorDate = ""
          this.validateformDate = false;
        }
      });

    this.createpollForm.get('type').valueChanges.subscribe(type => {
      this.whiteList = false;
      const control = <FormArray>this.createpollForm.controls['whiteList'];
      if (type == '2') {
        this.whiteList = true;
        control.push(new FormControl('', [Validators.required, Validators.minLength(40), Validators.maxLength(46)]))
      } else {
        this.validateformWhiteLis = false
        this.messageWhiteLis = ''
        this.whiteList = false;
        this.createpollForm.value.whiteList.forEach(element => {
          control.removeAt(this.createpollForm.value.whiteList.indexOf(element))
        });
      }
    })
    this.createpollForm.get('whiteList').valueChanges.subscribe(whiteList => {
      const control = <FormArray>this.createpollForm.controls['whiteList'];

      if (control.length > 0 && this.whiteList) {
        this.validateformWhiteLis = false
        this.messageWhiteLis = ''

      } else if (this.whiteList) {
        this.validateformWhiteLis = true;
        this.messageWhiteLis = 'add at least one address'
      }
    })
    this.createpollForm.get('options').valueChanges.subscribe(options => {
      const control = <FormArray>this.createpollForm.controls['options'];

      if (control.length > 0) {
        this.validateformOptions = false
        this.messageOptions = ''

      } else {
        this.validateformOptions = true;
        this.messageOptions = 'add at least one option'
      }
    })
  }


  addWhitelist(add?: boolean, remove?: boolean) {
    const control = <FormArray>this.createpollForm.controls['whiteList'];
    if (add) {
      control.push(new FormControl('', Validators.required))
    } else {
      const b = this.createpollForm.value.whiteList.pop();
      control.removeAt(this.createpollForm.value.whiteList.indexOf(b))
    }
  }
  removeWhitelist(index) {
    const control = <FormArray>this.createpollForm.controls['whiteList'];
    control.removeAt(index)

  }
  addoptions(add?: boolean, remove?: boolean) {
    const control = <FormArray>this.createpollForm.controls['options'];
    if (add) {
      control.push(new FormControl('', Validators.required))
    } else {
      const b = this.createpollForm.value.options.pop();
      control.removeAt(this.createpollForm.value.options.indexOf(b))
    }
  }
  removeOptions(index) {
    const control = <FormArray>this.createpollForm.controls['options'];
    control.removeAt(index)

  }
  getError(param, formControl?) {
    if (this.createpollForm.get(param).getError('required')) {
      return `This field is required`;
    } else if (this.createpollForm.get(param).getError('minlength')) {
      return `This field must contain minimum ${this.createpollForm.get(param).getError('minlength').requiredLength} characters`;
    } else if (this.createpollForm.get(param).getError('maxlength')) {
      return `This field must contain maximum ${this.createpollForm.get(param).getError('maxlength').requiredLength} characters`;
    }
  }

  /**
  *Get form errors
  *
  * @param {*} param
  * @param {*} name
  * @returns
  * @memberof LoginComponent
  */
  getErrorGroup(param, name) {
    if (this.createpollForm.get(param).get(String(name)).getError('required')) {
      return `This field is required`;
    } else if (this.createpollForm.get(param).get(String(name)).getError('minlength')) {
      return `This field must contain minimum ${this.createpollForm.get(param).get(String(name)).getError('minlength').requiredLength} characters`;
    } else if (this.createpollForm.get(param).get(String(name)).getError('maxlength')) {
      return `This field must contain maximum ${this.createpollForm.get(param).get(String(name)).getError('maxlength').requiredLength} characters`;
    } else {
      return false
    }
  }

  create() {

    this.createpollForm.valid
    this.validateform = (!this.validateformOptions && !this.validateformWhiteLis && !this.validateformDate) ? false : true;
    if (this.createpollForm.valid && !this.validateform) {

      const common = {
        password: this.createpollForm.get('password').value
      }
      if (this.walletService.decrypt(common)) {

        this.preparepoll(common)
      }
    }
  }
  preparepoll(common) {
    const strings = []
    const stringsPubliKey = []
    let obj: any = {}
    let Link = []
    const doe = new Date(this.createpollForm.get('datepoll').value).getTime()

    const WhiteList: WhiteList = {
      whiteList: this.createpollForm.get('whiteList').value
    }
    let optionsForm = this.createpollForm.get('options').value
    this.keyObject(this.createpollForm.get('options').value).forEach(element => {
      strings.push(optionsForm[element])

      let accountPoll: Account;
      accountPoll = this.proximaxProvider.generateNewAccount(this.walletService.network)
      stringsPubliKey.push(accountPoll.publicKey)
      obj[optionsForm[element]] = accountPoll.address.plain();
    })

    const OptionsRoot: OptionsRoot = {
      options: {
        strings: strings,
        link: obj,
        stringsPubliKey: stringsPubliKey
      }
    }
    const FormDataRoot: FormDataRoot = {
      formData: {
        title: this.createpollForm.get('title').value,
        doe: doe,
        type: this.createpollForm.get('type').value,
        multiple: this.createpollForm.get('choice').value,

      }
    }
    //1540695600000
    let DescriptionRoot: DescriptionRoot = {
      description: {
        description: this.createpollForm.get('description').value
      }

    }
    let accountPoll: Account;
    accountPoll = this.proximaxProvider.generateNewAccount(this.walletService.network)
    let datapoll: Datapoll = {}
    if (this.createpollForm.get('whiteList').value.length > 0) {
      let datapoll: Datapoll = {
        options: OptionsRoot,
        description: DescriptionRoot,
        formData: FormDataRoot,
        whiteList: WhiteList
      }
      Object.keys(datapoll).forEach(element => {
        this.sendAccountPoll(datapoll[element], accountPoll.address.plain(), common.privateKey);
      });
    } else {
      let datapoll: Datapoll = {
        options: OptionsRoot,
        description: DescriptionRoot,
        formData: FormDataRoot
      }
      Object.keys(datapoll).forEach(element => {
        this.sendAccountPoll(datapoll[element], accountPoll.address.plain(), common.privateKey);
      });
    }

    const PollRoot: PollRoot = {
      poll: {
        title: this.createpollForm.get('title').value,
        doe: doe,
        type: this.createpollForm.get('type').value,
        address: accountPoll.address.plain(),
        publicKey: accountPoll.publicKey
      }
    }
    const privateKey = {
      password: this.createpollForm.get('password').value
    }
    this.sendAccountPoll(PollRoot, this.accountPrin, this.privateKey);
  }


  sendAccountPoll(message: any, address, privateKey) {
    this.blockUI.start('Loading...'); // Start blocking
    let transferTransaction: any
    transferTransaction = this.proximaxProvider.sendTransaction(this.walletService.network, address, JSON.stringify(message))
    transferTransaction.fee = UInt64.fromUint(0);
    const account = Account.createFromPrivateKey(privateKey, this.walletService.network);
    const signedTransaction = account.sign(transferTransaction);
    this.blockUI.stop(); // Stop blocking
    if (this.getMessageLength(signedTransaction, message)) {
      this.blockUI.start('Loading...'); // Start blocking
      this.proximaxProvider.announce(signedTransaction).subscribe(
        x => {
          this.blockUI.stop(); // Stop blocking
          // console.log("Se envió la transacción....", x)
          this.createpollForm.reset()
          this.createpollForm.get('type').patchValue('1')
          this.createpollForm.get('indexAccount').patchValue(this.accountPrin)
          this.sharedService.showSuccess('success', 'poll created')
        },
        err => {
          this.blockUI.stop(); // Stop blocking
          this.sharedService.showError('Error', '¡unexpected error!');
          // console.error(err)
        });
    }
  }

  getMessageLength(signedTransaction, message) {
    const lengtmessage = signedTransaction.payload.length / 2;
    if (Object.keys(message)[0] === 'options' && lengtmessage > 1024) {

      this.optionslength = true;
      this.sharedService.showError('Error', '¡Too many options / Options too long!');
    } else if (Object.keys(message)[0] === 'whiteList' && lengtmessage > 1024) {
      this.whiteListlength = true;
      this.sharedService.showError('Error', '¡Whitelist too long!');
    }
    return (!this.whiteListlength && !this.optionslength) ? true : false
  }


}

interface PollRoot {
  poll: Poll;
}

interface Poll {
  title: string;
  type: number;
  doe: number;
  address: string;
  publicKey: string,
}

interface OptionsRoot {
  options: Options
}
interface WhiteList {
  whiteList: any
}


interface Options {
  strings: string[];
  link: any;
  stringsPubliKey: any
}


interface DescriptionRoot {
  description: DescriptionRoot;
}

interface Description {
  description: string;
}



interface Datapoll {
  options?: OptionsRoot;
  description?: DescriptionRoot;
  formData?: FormDataRoot;
  whiteList?: WhiteList
}

interface FormData {
  title: string;
  doe: number;
  type: string;
  multiple: string;
}

interface FormDataRoot {
  formData: FormData;

}
// interface Object {
//   value: string;
// }
