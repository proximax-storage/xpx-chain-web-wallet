import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from "@angular/forms";
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
  createpollForm: FormGroup;
  keyObject = Object.keys;
  indexAccount: string = 'SBGFBK-22DHGH-JW5MD6-M6BJ43-Y26ABU-IQRKP5-WNXG';
  constructor(
    private fb: FormBuilder,
    private walletService: WalletService,
    private nemProvider: NemProvider,
    private sharedService: SharedService,


  ) {
    // this.indexAccount = this.nemProvider.generateNewAccount(this.walletService.network).address.plain();
    this.optionsStorage = [{ value: '', label: 'select ' }, { value: '1', label: 'POI ' }, { value: '2', label: 'white List ' }]
  }

  // ** LIST POLL*** ADDRESS/MIJIN_TEST = SBGFBK-22DHGH-JW5MD6-M6BJ43-Y26ABU-IQRKP5-WNXG - private key = 01E4B2794BD5EAC9A2A20C1F8380EF79EBB7F369A5A6040291DB3875867F4727
  // **          *** ADDRESS/MIJIN_TEST = SCRRD2-4QDLMH-DZU36T-72S6B5-QVSGYZ-L5SFFC-VIZ3 - private key = 67F5E7625B82AD0BC0E0C9DFB732CB6622F26EBBE802F41E7F072426F1DF0449
  // **          *** ADDRESS/MIJIN_TEST = SB7YXI-UUSNPQ-EHLMQV-WAH6FD-GSLSJV-MBTCKV-2ZHZ - private key = AFFFB3B792F17E03767131825B39EA9D35015751C5DF70F3CF23B41F8139F08D
  //**           *** ADDRESS/MIJIN_TEST = SCV3RF-NBBVUV-GMGVR7-TVLAQO-EJIOVV-YMC7E6-2QYC - private key = 7BEEB5FF68414280999D8AE70D9E8373E5CB350EBF304309A8DE1C9A75FA2AAB
  ngOnInit() {
    this.createForm();

  }


  createForm() {
    this.createpollForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      indexAccount: [{ value: this.indexAccount, disabled: true }, [Validators.required, Validators.maxLength(30)]],
      datepoll: ['', Validators.required],
      choice: [''],
      type: [{ value: '1', disabled: false }, Validators.required],
      options: this.fb.group({
        optionsPoll1: ['YES', Validators.required],
        optionsPoll2: ['NO', Validators.required],
      }),
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(30)]],
    });

    this.createpollForm.get('datepoll').valueChanges.subscribe(
      doe => {
        if (new Date(doe).getTime() <= Date.now()) {
          this.errorDate = "fecha no valida "
          this.validateform = true;

        } else {
          this.errorDate = ""
          this.validateform = false;
        }
      });



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
    if (this.createpollForm.get(param).get(name).getError('required')) {
      return `This field is required`;
    } else if (this.createpollForm.get(param).get(name).getError('minlength')) {
      return `This field must contain minimum ${this.createpollForm.get(param).get(name).getError('minlength').requiredLength} characters`;
    } else if (this.createpollForm.get(param).get(name).getError('maxlength')) {
      return `This field must contain maximum ${this.createpollForm.get(param).get(name).getError('maxlength').requiredLength} characters`;
    }
  }

  create() {
    this.createpollForm.valid
    // //  && this.validateform
    // console.log(this.createpollForm.value)




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
    let obj: any = {}
    let Link = []

    const doe = new Date(this.createpollForm.get('datepoll').value).getTime()

    // console.log("dormoati de fecha",doe );
    let optionsForm = this.createpollForm.get('options').value
    this.keyObject(this.createpollForm.get('options').value).forEach(element => {
      strings.push(optionsForm[element])
      obj[optionsForm[element]] = this.indexAccount = this.nemProvider.generateNewAccount(this.walletService.network).address.plain();
    })

    const OptionsRoot: OptionsRoot = {
      options: {
        strings: strings,
        link: obj
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
    let datapoll: Datapoll = {
      options: OptionsRoot,
      description: DescriptionRoot,
      formData: FormDataRoot
    }
    let accountPoll = this.nemProvider.generateNewAccount(this.walletService.network).address.plain()
    // this..sendaccountPoll(element, datapoll, accountPoll,common);
    Object.keys(datapoll).forEach(element => {
      this.sendaccountPoll(datapoll[element], accountPoll, common);
    });
    // const orderedAddresses = Object.keys(addressLink).map((option) => addressLink[option]);

    const PollRoot: PollRoot = {
      poll: {
        title: this.createpollForm.get('title').value,
        doe: doe,
        type: this.createpollForm.get('type').value,
        address: accountPoll
      }
    }
     this.sendaccountPoll(PollRoot, this.indexAccount, common);
  }
  sendaccountPoll(mensaje: any, address, common) {
    this.blockUI.start('Loading...'); // Start blocking
    let transferTransaction: any
    transferTransaction = this.nemProvider.sendTransaction(this.walletService.network, address, JSON.stringify(mensaje))
    transferTransaction.fee = UInt64.fromUint(0);
    const account = Account.createFromPrivateKey(common.privateKey, this.walletService.network);
    const signedTransaction = account.sign(transferTransaction);
    this.nemProvider.announce(signedTransaction).subscribe(
      x => {
        this.blockUI.stop(); // Stop blocking
        console.log("exis=", x)
        this.createpollForm.reset();
        this.sharedService.showSuccess('success', 'poll created')
      },
      err => {
        this.sharedService.showError('Error', '¡unexpected error!');
        console.error(err)
      });
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
}



interface OptionsRoot {
  options: Options
}


interface Options {
  strings: string[];
  link: any;
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

