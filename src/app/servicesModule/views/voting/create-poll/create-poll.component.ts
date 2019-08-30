import { Component, OnInit } from '@angular/core';
import { PublicAccount, Account } from 'tsjs-xpx-chain-sdk';
import { environment } from 'src/environments/environment';
import { WalletService } from 'src/app/wallet/services/wallet.service';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ConfigurationForm, SharedService } from 'src/app/shared/services/shared.service';
import { AppConfig } from 'src/app/config/app.config';
import { CreatePollStorageService } from 'src/app/servicesModule/services/create-poll-storage.service';
@Component({
  selector: 'app-create-poll',
  templateUrl: './create-poll.component.html',
  styleUrls: ['./create-poll.component.css']
})
export class CreatePollComponent implements OnInit {
  createPollForm: FormGroup;
  configurationForm: ConfigurationForm = {};
  account: Account;
  btnBlock: boolean;
  Poll: PollInterface;
  option: optionsPoll[] = [];
  routes = {
    backToService: `/${AppConfig.routes.service}`
  };
  constructor(
    private fb: FormBuilder,
    private sharedService: SharedService,
    private walletService: WalletService,
    private createPollStorageService: CreatePollStorageService

  ) {
    this.configurationForm = this.sharedService.configurationForm;
    this.btnBlock = false;
  }

  ngOnInit() {
    this.createForm();
    this.JSONOptions();
  }

  /**
   *
   *
   * @memberof CreatePollComponent
   */
  createForm() {
    //Form create multisignature default
    this.createPollForm = this.fb.group({
      password: ['', [
        Validators.required,
        Validators.minLength(this.configurationForm.passwordWallet.minLength),
        Validators.maxLength(this.configurationForm.passwordWallet.maxLength)
      ]
      ],
    });
    // this.validatorsCosignatory();
    // this.changeformStatus()
  }
  JSONOptions() {

    const namesOptions = ["pizza", "hamburguesa", "pollo", "pasticho"];
    this.Poll = null;
    for (let element of namesOptions) {
      this.generateOptios(element);
    }


  }
  generateOptios(nameParam: string) {
    let publicAccountGenerate: PublicAccount = Account.generateNewAccount(this.walletService.currentAccount.network).publicAccount;
    this.option.push({ name: nameParam, publicAccount: publicAccountGenerate })

  }

  sendPoll() {
    const common = {
      password: this.createPollForm.get('password').value,
      privateKey: ''
    }
    if (this.createPollForm.valid && !this.btnBlock) {
      if (this.walletService.decrypt(common)) {
        this.preparepoll(common);
      }

    }
  }


  async preparepoll(common) {
    this.account = Account.createFromPrivateKey(environment.pollsContent.private_key, this.walletService.currentAccount.network);
    this.Poll = {
      name: 'poll-5',
      desciption: 'test-3',
      id: 5,
      type: 0,
      options: this.option,
      startDate: new Date(),
      endDate: new Date(),
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
  validateInput(nameInput: string = '', nameControl: string = '', nameValidation: string = '') {
    let validation: AbstractControl = null;
    if (nameInput !== '' && nameControl !== '') {
      validation = this.createPollForm.controls[nameControl].get(nameInput);
    } else if (nameInput === '' && nameControl !== '' && nameValidation !== '') {
      validation = this.createPollForm.controls[nameControl].getError(nameValidation);
    } else if (nameInput !== '') {
      validation = this.createPollForm.get(nameInput);
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
  clearForm(custom?: string | (string | number)[], formControl?: string | number) {
    if (custom !== undefined) {
      if (formControl !== undefined) {
        this.createPollForm.controls[formControl].get(custom).reset({ emitEvent: false, onlySelf: true });
        return;
      }
      this.createPollForm.get(custom).reset({ emitEvent: false, onlySelf: true });
      return;
    }
    this.createPollForm.reset({ emitEvent: false, onlySelf: true });
    return;
  }

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
  id: number;
  type: number;
  options: optionsPoll[];
  witheList?: Object[];
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

