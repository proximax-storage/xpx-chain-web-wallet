import { Component, OnInit } from '@angular/core';
import { PublicAccount, Account, Address } from 'tsjs-xpx-chain-sdk';
import { environment } from 'src/environments/environment';
import { WalletService } from 'src/app/wallet/services/wallet.service';
import { FormBuilder, FormGroup, Validators, AbstractControl, FormControl, } from '@angular/forms';
import { ConfigurationForm, SharedService } from 'src/app/shared/services/shared.service';
import { AppConfig } from 'src/app/config/app.config';
import { CreatePollStorageService } from 'src/app/servicesModule/services/create-poll-storage.service';
import { stringify } from '@angular/compiler/src/util';
import { ProximaxProvider } from '../../../../shared/services/proximax.provider';

@Component({
  selector: 'app-create-poll',
  templateUrl: './create-poll.component.html',
  styleUrls: ['./create-poll.component.css']
})
export class CreatePollComponent implements OnInit {
  type: any;
  invalidMoment: any;
  isMultiple: any;
  isPrivate: any;
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

  voteType: any = [
    {
      value: 1,
      label: 'Public',
      selected: true,
    },
    {
      value: 0,
      label: 'White list',
      selected: false,
    }
  ];

  constructor(
    private fb: FormBuilder,
    private sharedService: SharedService,
    private walletService: WalletService,
    private createPollStorageService: CreatePollStorageService,
    private proximaxProvider: ProximaxProvider
  ) {
    this.configurationForm = this.sharedService.configurationForm;
    this.btnBlock = false;
    this.showList = false;
  }

  ngOnInit() {
    const today = new Date();
    this.minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), today.getHours(), today.getMinutes());
    this.invalidMoment = this.minDate.setHours(this.minDate.getHours() + 24)
    this.createForms();
  }

  createForms() {
    this.firstFormGroup = new FormGroup({
      tittle: new FormControl('', [Validators.required]),
      isPrivate: new FormControl(false),
      message: new FormControl('', [Validators.required]),
      PollEndDate: new FormControl('', [Validators.required])
    });

    this.secondFormGroup = new FormGroup({
      isMultiple: new FormControl(false, [Validators.required]),
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
  }

  get1() {
    this.name = this.firstFormGroup.get('tittle').value
    this.desciption = this.firstFormGroup.get('message').value
    this.isPrivate = this.firstFormGroup.get('isPrivate').value
    this.endDate = new Date(this.firstFormGroup.get('PollEndDate').value)
    this.account = (this.isPrivate) ? Account.generateNewAccount(this.walletService.currentAccount.network) :
      Account.createFromPrivateKey(environment.pollsContent.private_key, this.walletService.currentAccount.network);
    this.publicAddress = this.account.address.pretty();
  }

  get2() {
    this.isMultiple = this.secondFormGroup.get('isMultiple').value
  }

  get3() {
    this.type = this.thirdFormGroup.get('voteType').value
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
      if (type.value === 0) {
        this.showList = true;
      } else {
        this.showList = false;
        this.cleanThirForm();
        this.listaBlanca = [];
      }
    }
  }

  addOptions() {
    if (this.secondFormGroup.get('option').valid && this.secondFormGroup.get('option').value != '') {
      let options = this.secondFormGroup.get('option').value
      this.generateOptios(options);
      this.secondFormGroup.patchValue({
        option: ''
      })
    }
  }

  // pushedOtherAccount() {
  //   if (this.boxOtherAccount.length === 0) {
  //     this.boxOtherAccount.push({
  //       id: Math.floor(Math.random() * 1455654),
  //       balance: '',
  //     });
  //   } else {
  //     let x = false;
  //     this.boxOtherAccount.forEach(element => {
  //       if (element.id === '') {
  //         this.sharedService.showWarning('', 'You must select a mosaic and place the quantity');
  //         x = true;
  //       } else if (element.amount === '' || Number(element.amount) === 0) {
  //         this.sharedService.showWarning('', 'The quantity of mosaics is missing');
  //         x = true;
  //       }
  //     });

  //     if (!x) {
  //       this.boxOtherAccount.push({
  //         id: Math.floor(Math.random() * 1455654),
  //         balance: '',
  //       });
  //     }
  //   }
  // }

  addAddress() {
    if (this.thirdFormGroup.get('address').valid && this.thirdFormGroup.get('address').value != '') {
      let address = this.thirdFormGroup.get('address').value.toUpperCase()
      const currentAccount = Object.assign({}, this.walletService.getCurrentAccount());

      if (!this.proximaxProvider.verifyNetworkAddressEqualsNetwork(
        this.proximaxProvider.createFromRawAddress(currentAccount.address).plain(), address)
      ) {
        this.sharedService.showError('', 'Recipient Address Network unsupported');

      } else {

        if (this.listaBlanca.length > 0) {
          const existe = this.listaBlanca.find(list => list.plain().trim() === address.split('-').join('').trim());
          if (existe != undefined) {
            this.sharedService.showError('', 'account exists');
            this.cleanThirForm();
          } else {
            this.listaBlanca.push(Address.createFromRawAddress(address))
            this.cleanThirForm();
          }
        } else {
          this.listaBlanca.push(Address.createFromRawAddress(address))
          this.cleanThirForm();
        }
      }
    }
  }

  cleanThirForm() {
    this.thirdFormGroup.patchValue({
      address: ''
    })
  }

  generateOptios(nameParam: string) {

    const existe = this.option.find(option => option.name === nameParam);
    if (existe === undefined) {
      let publicAccountGenerate: PublicAccount = Account.generateNewAccount(this.walletService.currentAccount.network).publicAccount;
      this.option.push({ name: nameParam, publicAccount: publicAccountGenerate })
    } else {
      this.sharedService.showError('', 'option exists');
    }
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
    // this.account = Account.createFromPrivateKey(environment.pollsContent.private_key, this.walletService.currentAccount.network);

    // const direccionesAgregadas = [
    //   'VCGPXB-2A7T4I-W5MQCX-FQY4UQ-W5JNU5-F55HGK-HBUN',
    //   'VDG4WG-FS7EQJ-KFQKXM-4IUCQG-PXUW5H-DJVIJB-OXJG'
    // ]
    // const listaBlanca = []

    // for (let element of direccionesAgregadas) {
    //   listaBlanca.push(Address.createFromRawAddress(element))
    // }


    // const endDate = new Date()
    // endDate.setHours(endDate.getHours() + 2)
    this.Poll = {
      name: this.name,
      desciption: this.desciption,
      id: Math.floor(Math.random() * 1455654).toString(),
      type: this.type,
      isPrivate: this.isPrivate,
      isMultiple: this.isMultiple,
      options: this.option,
      witheList: this.listaBlanca,
      startDate: new Date(),
      endDate: this.endDate,
      createdDate: new Date(),
      quantityOption: this.option.length
    }
    // console.log('this.Poll ', JSON.stringify(this.Poll)  )

    const nameFile = `voting-ProximaxSirius-${new Date()}`;
    const fileObject: FileInterface = {
      name: nameFile,
      content: this.Poll,
      type: 'application/json',
      extension: 'json',
    };
    const descripcion = 'poll';


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
  isPrivate: boolean,
  isMultiple: boolean,
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

