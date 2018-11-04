import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl, FormControl, FormArray, ValidatorFn } from "@angular/forms";

import { WalletService } from '../../../../shared/services/wallet.service';
import { NemProvider } from '../../../../shared/services/nem.provider';
import { SharedService } from '../../../../shared';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Address, UInt64, Account } from 'nem2-sdk';
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
  createpollForm: FormGroup;
  keyObject = Object.keys;
  optionsData: any;
  whiteListData: any
  messageWhiteLis: string;
  messageOptions: string;
  options: Array<any>
  accountPrin: string = 'SBGFBK-22DHGH-JW5MD6-M6BJ43-Y26ABU-IQRKP5-WNXG';
  privateKey: string = '01E4B2794BD5EAC9A2A20C1F8380EF79EBB7F369A5A6040291DB3875867F4727';
  constructor(
    private fb: FormBuilder,
    private walletService: WalletService,
    private nemProvider: NemProvider,
    private sharedService: SharedService,


  ) {
    // this.indexAccount = this.nemProvider.generateNewAccount(this.walletService.network).address.plain();
    this.optionsStorage = [{ value: '', label: 'select ' }, { value: '1', label: 'POI ' }, { value: '2', label: 'white List ' }]
  }

  ngOnInit() {
    this.createForm();

  }


  createForm() {
    this.options = [{ value: 'YES' }, { value: 'NO' }]
    this.optionsData = this.options.map((value, index) => new FormControl(value.value, Validators.required, ))
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

        console.log("entre aqui")
        this.validateformWhiteLis = false
        this.messageWhiteLis = ''

      } else if (this.whiteList) {
        console.log("entre aqui true")
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
    // console.log(String(name))

    // console.log(this.createpollForm.get(param).get(String(name)).getError('required'))

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

    console.log("validateformOptions", this.validateformOptions)
    console.log("validateformWhiteLis", this.validateformWhiteLis)
    console.log("validateformDate", this.validateformDate)
    this.validateform = (!this.validateformOptions && !this.validateformWhiteLis && !this.validateformDate) ? false : true;
    console.log(this.validateform)

    console.log("this.createpollForm.valid", this.createpollForm.valid)
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

    // console.log("dormoati de fecha",doe );
    let optionsForm = this.createpollForm.get('options').value
    this.keyObject(this.createpollForm.get('options').value).forEach(element => {
      strings.push(optionsForm[element])

      let accountPoll: Account;
      accountPoll = this.nemProvider.generateNewAccount(this.walletService.network)
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
    accountPoll = this.nemProvider.generateNewAccount(this.walletService.network)
    let datapoll: Datapoll = {}
    if (this.createpollForm.get('whiteList').value.length > 0) {
      let datapoll: Datapoll = {
        options: OptionsRoot,
        description: DescriptionRoot,
        formData: FormDataRoot,
        whiteList: WhiteList
      }
      Object.keys(datapoll).forEach(element => {
        this.sendaccountPoll(datapoll[element], accountPoll.address.plain(), common.privateKey);
      });
    } else {
      let datapoll: Datapoll = {
        options: OptionsRoot,
        description: DescriptionRoot,
        formData: FormDataRoot
      }
      Object.keys(datapoll).forEach(element => {
        this.sendaccountPoll(datapoll[element], accountPoll.address.plain(), common.privateKey);
      });
    }


    // console.log(this.nemProvider.generateNewAccount(this.walletService.network).privateKey)
    // this..sendaccountPoll(element, datapoll, accountPoll,common);
    // console.log("accountPoll",datapoll)

    // const orderedAddresses = Object.keys(addressLink).map((option) => addressLink[option]);

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
    this.sendaccountPoll(PollRoot, this.accountPrin, this.privateKey);
  }
  sendaccountPoll(message: any, address, privateKey) {
    this.blockUI.start('Loading...'); // Start blocking
    let transferTransaction: any
    transferTransaction = this.nemProvider.sendTransaction(this.walletService.network, address, JSON.stringify(message))
    transferTransaction.fee = UInt64.fromUint(0);
 
    const account = Account.createFromPrivateKey(privateKey, this.walletService.network);
    const signedTransaction = account.sign(transferTransaction);

    this.blockUI.stop(); // Stop blocking
    if (this.getMessageLength(signedTransaction, message)) {

      this.blockUI.start('Loading...'); // Start blocking

      this.nemProvider.announce(signedTransaction).subscribe(
        x => {
          this.blockUI.stop(); // Stop blocking
          console.log("exis=", x)
          this.createpollForm.reset()
          this.createpollForm.get('type').patchValue('1')
          this.createpollForm.get('indexAccount').patchValue(this.accountPrin)
          
        
          this.sharedService.showSuccess('success', 'poll created')
        },
        err => {
          this.blockUI.stop(); // Stop blocking
          this.sharedService.showError('Error', '¡unexpected error!');
          console.error(err)
        });
    } else {

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
