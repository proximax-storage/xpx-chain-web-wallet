import { Component, OnInit } from '@angular/core';
import { PublicAccount, Account, Address } from 'tsjs-xpx-chain-sdk';
import { environment } from 'src/environments/environment';
import { WalletService } from 'src/app/wallet/services/wallet.service';
import { FormBuilder, FormGroup, Validators, AbstractControl, FormControl, } from '@angular/forms';
import { ConfigurationForm, SharedService } from 'src/app/shared/services/shared.service';
import { AppConfig } from 'src/app/config/app.config';
import { CreatePollStorageService } from 'src/app/servicesModule/services/create-poll-storage.service';

@Component({
  selector: 'app-create-poll',
  templateUrl: './create-poll.component.html',
  styleUrls: ['./create-poll.component.css']
})
export class CreatePollComponent implements OnInit {
  endDate: any;
  index: any;
  desciption: any;
  name: any;
  validateformDateEnd: boolean;
  form: FormGroup;
  showList: boolean;
  publicAddress: string;
  errorDateStart: string;
  errorDateEnd: string;
  minDate: Date;
  boxOtherAccount = [];
  // createPollForm: FormGroup;
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  thirdFormGroup: FormGroup;
  quarterFormGroup: FormGroup;
  configurationForm: ConfigurationForm = {};
  account: Account;
  btnBlock: boolean;
  Poll: PollInterface;
  option: optionsPoll[] = [];
  listaBlanca: any[] = [];

  routes = {
    backToService: `/${AppConfig.routes.service}`
  };

  voteType: any = [{
    value: 1,
    label: 'Public',
    selected: true,
  }, {
    value: 2,
    label: 'White list',
    selected: false,
  }];

  constructor(
    private fb: FormBuilder,
    private sharedService: SharedService,
    private walletService: WalletService,
    private createPollStorageService: CreatePollStorageService

  ) {
    this.configurationForm = this.sharedService.configurationForm;
    this.publicAddress = environment.pollsContent.address_public_test
    this.btnBlock = false;
    this.showList = false;
  }

  ngOnInit() {
    // this.JSONOptions();
    this.createForms();
  }

  createForms(){
    this.firstFormGroup = new FormGroup({
      tittle: new FormControl('', [Validators.required]),
      poll: new FormControl('', [Validators.required]),
      message: new FormControl('', [Validators.required]),
      PollEndDate: new FormControl('', [Validators.required])
    });

    this.secondFormGroup = new FormGroup({
      option: new FormControl('')
    });

    this.thirdFormGroup = new FormGroup({
      voteType: new FormControl(1),
      address: new FormControl('')
    });

    this.quarterFormGroup = new FormGroup({
      password: new FormControl('', Validators.required)
    });
  }
  initOptionsDate() {

    const today = new Date();
    this.minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), today.getHours(), today.getMinutes());
  }

  get1() {
    this.name = this.firstFormGroup.get('tittle').value
    this.desciption = this.firstFormGroup.get('message').value
    this.index = this.firstFormGroup.get('poll').value
    this.endDate = this.firstFormGroup.get('PollEndDate').value
    // console.log('obtener form 1',  this.name)
  }

  

  copyMessage(message: string) {
    this.sharedService.showSuccess('', `${message} copied`);
  }

  deleteOptions(item) {
    this.option = this.option.filter(option => option != item);
  }

  deleteAccaunt(item) {
    this.listaBlanca = this.listaBlanca.filter(white => white.address != item.address);
  }

  selectType($event: Event) {
    const type: any = $event;
    if (type !== null && type !== undefined) {
      if (type.value === 2) {
        this.showList = true;
      } else {
        this.showList = false;
        this.listaBlanca = [];
      }

    }
  }

  // confirmSelectedChangStart(event) {
  //   const doe = event.value;
  //   this.createPollForm.get('PollEndDate').reset();
  //   const ISOMatch = new Date(doe);
  //   if ((isNaN(new Date(doe).getTime()) || !ISOMatch)) {
  //     this.errorDateStart = 'date not valid';
  //     // this.validateformDateStart = true;
  //   } else {
  //     this.errorDateStart = '';
  //     // this.validateformDateStart = false;
  //     // this.createPollForm.controls.dateStart = ISOMatch;
  //   }
  // }

  confirmSelectedChangEnd(event) {
    const doe = event.value;
    const ISOMatch = new Date(doe);
    if ((isNaN(new Date(doe).getTime()) || !ISOMatch)) {
      this.errorDateEnd = 'date not valid';
      this.validateformDateEnd = true;
      this.firstFormGroup.get('PollEndDate').reset();
    } else if ((new Date(this.firstFormGroup.get('PollStartDate').value).getTime()) >= new Date(doe).getTime()) {
      this.errorDateEnd = 'date does not validate, it has to be greater than the start date';
      this.validateformDateEnd = true;
      this.firstFormGroup.get('PollEndDate').reset();
    } else {
      this.errorDateEnd = '';
      this.validateformDateEnd = false;
      // this.formDate.dateEnd = new Date(doe);
    }
  }

  addOptions() {
    if (this.secondFormGroup.get('option').valid && this.secondFormGroup.get('option').value != '') {
      console.log()
      let options = this.secondFormGroup.get('option').value
      this.generateOptios(options);
      this.secondFormGroup.patchValue({
        option: ''
      })
    }
  }

  pushedOtherAccount() {
    if (this.boxOtherAccount.length === 0) {
      this.boxOtherAccount.push({
        id: Math.floor(Math.random() * 1455654),
        balance: '',
      });
    } else {
      let x = false;
      this.boxOtherAccount.forEach(element => {
        if (element.id === '') {
          this.sharedService.showWarning('', 'You must select a mosaic and place the quantity');
          x = true;
        } else if (element.amount === '' || Number(element.amount) === 0) {
          this.sharedService.showWarning('', 'The quantity of mosaics is missing');
          x = true;
        }
      });

      if (!x) {
        this.boxOtherAccount.push({
          id: Math.floor(Math.random() * 1455654),
          balance: '',
        });
      }
    }
  }

  addAddress() {
    if (this.thirdFormGroup.get('address').valid && this.thirdFormGroup.get('address').value != '') {
      let address = this.thirdFormGroup.get('address').value
      if (this.listaBlanca.length > 0) {
        
        const result = this.listaBlanca.find(element => Address.createFromRawAddress(element.address).plain() === address.split('-').join(''));
        console.log('1',  this.listaBlanca)
        console.log('2',  address.split('-').join(''))
        console.log('1',  result)
        if (result === undefined) {
          this.listaBlanca.push(Address.createFromRawAddress(address))
          this.thirdFormGroup.patchValue({
            address: ''
          })
        } else {
          this.sharedService.showError('', 'account exists');
        }
      }else {
        this.listaBlanca.push(Address.createFromRawAddress(address))
        this.thirdFormGroup.patchValue({
          address: ''
        })
      }
      
      // 
      console.log('adresss new add', this.listaBlanca)
    }
  }

  // JSONOptions() {

  //   const namesOptions = ["nike", "adidas", "converse", "timberlat"];
  //   this.Poll = null;
  //   for (let element of namesOptions) {
  //     this.generateOptios(element);
  //   }


  // }

  generateOptios(nameParam: string) {
    let publicAccountGenerate: PublicAccount = Account.generateNewAccount(this.walletService.currentAccount.network).publicAccount;
    this.option.push({ name: nameParam, publicAccount: publicAccountGenerate })

  }

  sendPoll() {
    const common = {
      password: this.quarterFormGroup.get('password').value,
      privateKey: ''
    }
    if (this.quarterFormGroup.valid && !this.btnBlock) {
      if (this.walletService.decrypt(common)) {
        this.preparepoll(common);
      }

    }
  }


  async preparepoll(common) {
    this.account = Account.createFromPrivateKey(environment.pollsContent.private_key, this.walletService.currentAccount.network);

    const direccionesAgregadas = [
      'VCGPXB-2A7T4I-W5MQCX-FQY4UQ-W5JNU5-F55HGK-HBUN',
      'VDG4WG-FS7EQJ-KFQKXM-4IUCQG-PXUW5H-DJVIJB-OXJG'
    ]
    const listaBlanca = []

    for (let element of direccionesAgregadas) {
      listaBlanca.push(Address.createFromRawAddress(element))
    }


    const endDate = new Date()
    endDate.setHours(endDate.getHours() + 2)
    this.Poll = {
      name: 'marca zapatos nuevos',
      desciption: 'Find out about the best brand by phone based on your experience. evaluate us and we will offer you better services',
      id: '06',
      type: 0,
      options: this.option,
      witheList: listaBlanca,
      startDate: new Date(),
      endDate: endDate,
      createdDate: new Date(),
      quantityOption: this.option.length
    }
    const nameFile = `voting-ProximaxSirius-${new Date()}`;
    const fileObject: FileInterface = {
      name: nameFile,
      content: this.Poll,
      type: 'application/json',
      extension: 'json',
    };
    const descripcion = 'poll';

    console.log('this.Poll ', this.Poll)

    await this.createPollStorageService.sendFileStorage(
      fileObject,
      'poll',
      this.account,
      common.privateKey
    ).then(resp => {
      console.log('resp', resp)

    });
  }
  /**
 *
 *
 * @param {string} [nameInput='']
 * @param {string} [nameControl='']
 * @param {string} [nameValidation='']
 * @returns
 * @memberof CreateNamespaceComponent
 */
  validateInput(nameInput: string = '', form: string = '', nameControl: string = '', nameValidation: string = '') {
    if (form == '1') {
      this.form = this.firstFormGroup;
    } else if (form == '2') {
      this.form = this.secondFormGroup;
    } else if (form == '3') {
      this.form = this.thirdFormGroup;
    } else if (form == '4') {
      this.form = this.quarterFormGroup;
    }
    let validation: AbstractControl = null;
    if (nameInput !== '' && nameControl !== '') {
      validation = this.form.controls[nameControl].get(nameInput);
    } else if (nameInput === '' && nameControl !== '' && nameValidation !== '') {
      validation = this.form.controls[nameControl].getError(nameValidation);
    } else if (nameInput !== '') {
      validation = this.form.get(nameInput);
    }
    return validation;
  }

  /**
   *
   *
   * @param {(string | (string | number)[])} [custom]
   * @param {(string | number)} [formControl]
   * @returns
   * @memberof CreateTransferComponent
   */
  // clearForm(custom?: string | (string | number)[], formControl?: string | number) {
  //   if (custom !== undefined) {
  //     if (formControl !== undefined) {
  //       this.createPollForm.controls[formControl].get(custom).reset({ emitEvent: false, onlySelf: true });
  //       return;
  //     }
  //     this.createPollForm.get(custom).reset({ emitEvent: false, onlySelf: true });
  //     return;
  //   }
  //   this.createPollForm.reset({ emitEvent: false, onlySelf: true });
  //   return;
  // }


}

/**
 * poll JSON
 * @param name - name poll
 * @param desciption - desciption poll
 * @param id - identifier
 * @param type - 0 = withe list , 1 = public, 
 * @param startDate - poll start date
 * @param endDate - poll end date
 * @param createdDate - poll creation date
 * @param quantityOption - number of voting options
 * 
*/
export interface PollInterface {
  name: string;
  desciption: string;
  id: string;
  type: number;
  options: optionsPoll[];
  witheList: Object[];
  blacklist?: Object[];
  startDate: Date;
  endDate: Date;
  createdDate: Date;
  quantityOption: number;
}

export interface optionsPoll {
  name: string;
  publicAccount: PublicAccount
}
export interface FileInterface {
  name: string;
  content: any;
  type: string;
  extension: string;
}

