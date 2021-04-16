import { Component, OnInit, ViewChild } from '@angular/core';
import { PublicAccount, Account, Address, PlainMessage, AggregateTransaction, InnerTransaction, TransferTransaction, DefaultMaxFee, FeeCalculationStrategy } from 'tsjs-xpx-chain-sdk';
import { MdbStepperComponent } from 'ng-uikit-pro-standard';
import { Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { WalletService, AccountsInterface } from '../../../wallet/services/wallet.service';
import { FormBuilder, FormGroup, Validators, AbstractControl, FormControl, } from '@angular/forms';
import { ConfigurationForm, SharedService } from '../../../shared/services/shared.service';
import { AppConfig } from '../../../config/app.config';
import { DataBridgeService } from '../../../shared/services/data-bridge.service';
import { CreatePollStorageService } from '../../../servicesModule/services/create-poll-storage.service';
import { ProximaxProvider } from '../../../shared/services/proximax.provider';
import { ServicesModuleService } from '../../../servicesModule/services/services-module.service';
import { TransactionsService } from '../../../transactions/services/transactions.service';

@Component({
  selector: 'app-create-poll',
  templateUrl: './create-poll.component.html',
  styleUrls: ['./create-poll.component.css']
})
export class CreatePollComponent implements OnInit {
  @ViewChild('stepper', { static: true }) stepper: MdbStepperComponent
  type: any;
  invalidMoment: any;
  isMultiple: any;
  isPrivate: any;
  endDate: any;
  index: any;
  description: any;
  name: any;
  validateformDateEnd: boolean;
  form: FormGroup;
  showList: boolean;
  passwordMain: string = 'password';
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
  account: PublicAccount;
  btnBlock: boolean;
  Poll: PollInterface;
  option: optionsPoll[] = [];
  listaBlanca: any[] = [];
  listContacts: any = [];
  showContacts = false;
  subscription: Subscription[] = [];
  fee:number = 0.000000;
  displayFee: string = '0.000000'; 
  transferTransactions: InnerTransaction[] = [];
  pollId = Math.floor(Math.random() * 1455654).toString();
  startDate = new Date();
  createdDate = new Date();
  firstTransfer: TransferTransaction;
  aggregateHash: string = '0'.repeat(64);

  routes = {
    backToService: `/${AppConfig.routes.service}`
  };

  voteType: any = [
    {
      value: 1,
      label: 'Open',
      selected: true,
    },
    {
      value: 0,
      label: 'Whitelist',
      selected: false,
    }
  ];
  privateKeyAccount: string;
  vestedBalance: { part1: string; part2: string; };
  amountAccount: number;
  insufficientBalance: boolean;
  aggregateTransaction: AggregateTransaction;

  constructor(
    private fb: FormBuilder,
    private sharedService: SharedService,
    private walletService: WalletService,
    private createPollStorageService: CreatePollStorageService,
    private proximaxProvider: ProximaxProvider,
    private serviceModuleService: ServicesModuleService,
    private transactionService: TransactionsService,
    private dataBridge: DataBridgeService
  ) {
    this.configurationForm = this.sharedService.configurationForm;
    this.btnBlock = false;
    this.showList = false;

  }

  ngOnInit() {
    const today = new Date();
    this.minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), today.getHours(), today.getMinutes());
    this.invalidMoment = this.minDate.setHours(this.minDate.getHours() + 1)
    this.listContacts = this.validateAccountListContact();
    this.createForms();
    this.calculateFee();
    this.balance();
  }


  balance() {
    this.subscription.push(this.transactionService.getBalance$().subscribe(
      next => this.vestedBalance = this.transactionService.getDataPart(next, 6),
      error => this.vestedBalance = {
        part1: '0',
        part2: '000000'
      }
    ));
    let vestedBalance = this.vestedBalance.part1.concat(this.vestedBalance.part2).replace(/,/g,'');
    this.amountAccount = Number(vestedBalance);
    if(this.amountAccount < this.fee){
      //this.firstFormGroup.disable();
      this.insufficientBalance = true;
    }

  }


  booksAddress(): ContactsListInterface[] {
    const data = []
    const bookAddress: ContactsListInterface[] = this.serviceModuleService.getBooksAddress();
    if (bookAddress !== undefined && bookAddress !== null) {
      for (let x of bookAddress) {
        data.push(x);
      }
      return data;
    }
  }


  /**
 *
 *
 * @param {*} event
 * @memberof CreateTransferComponent
 */
  selectContact(event: { label: string, value: string }) {
    if (event !== undefined && event.value !== '') {
      this.thirdFormGroup.get('address').patchValue(event.value);
    }
  }

  changeInputType(inputType) {
    let newType = this.sharedService.changeInputType(inputType)
    this.passwordMain = newType;
  }

  createForms() {
    this.firstFormGroup = new FormGroup({
      title: new FormControl('', [Validators.required]),
      isPrivate: new FormControl(false),
      message: new FormControl('', [Validators.required]),
      PollEndDate: new FormControl('', [Validators.required])
    });

    this.secondFormGroup = new FormGroup({
      isMultiple: new FormControl(false, [Validators.required]),
      option: new FormControl(''),
      options: new FormControl('', [Validators.required])
    });

    this.thirdFormGroup = new FormGroup({
      voteType: new FormControl(1),
      contact: new FormControl(''),
      address: new FormControl('')
    });

    this.quarterFormGroup = new FormGroup({
      password: new FormControl('', Validators.required)
    });
  }

  initOptionsDate() {
  }

  get1() {
    this.name = this.firstFormGroup.get('title').value;
    this.description = this.firstFormGroup.get('message').value;
    this.isPrivate = this.firstFormGroup.get('isPrivate').value;
    this.endDate = new Date(this.firstFormGroup.get('PollEndDate').value);
    if(this.endDate.toString() === "Invalid Date"){
      this.endDate = new Date();
      this.endDate.setUTCDate(this.endDate.getUTCDate() + 1);
    }
    if (!this.isPrivate){
      this.account = PublicAccount.createFromPublicKey(environment.pollsContent.public_key, this.walletService.currentAccount.network);
    }else {
      this.account = Account.generateNewAccount(this.walletService.currentAccount.network).publicAccount;
    }

    this.publicAddress = this.account.address.pretty()




    /*this.account = (this.isPrivate) ? Account.generateNewAccount(this.walletService.currentAccount.network) :
      PublicAccount.createFromPublicKey(environment.pollsContent.public_key, this.walletService.currentAccount.network);
    this.publicAddress = this.account.address.pretty();*/
    // this.privateKeyAccount = this.isPrivate?this.account.privateKey.toString():''
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
    if (this.option.length === 0) {
      this.secondFormGroup.patchValue({
        options: ''
      })
    }
    this.calculateFee();
  }

  deleteAccount(item) {
    this.listaBlanca = this.listaBlanca.filter(white => white.address != item.address);
    this.calculateFee();
  }

  selectType($event: Event) {
    const type: any = $event;
    if (type !== null && type !== undefined) {
      if (type.value === 0) {
        this.showList = true;
        this.thirdFormGroup.get('address').setValidators([Validators.minLength(40), Validators.maxLength(46)])
        this.thirdFormGroup.get('address').updateValueAndValidity({ emitEvent: false, onlySelf: true });
        // this.thirdFormGroup.status
        // aqui
      } else {

        this.thirdFormGroup.get('address').setValidators(null);
        this.thirdFormGroup.get('address').updateValueAndValidity({ emitEvent: false, onlySelf: true });
        this.showList = false;
        this.showContacts = false;
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

  generateOptios(nameParam: string) {
    const existe = this.option.find(option => option.name === nameParam);
    if (existe === undefined) {
      let publicAccountGenerate: PublicAccount = Account.generateNewAccount(this.walletService.currentAccount.network).publicAccount;
      this.option.push({ name: nameParam, publicAccount: publicAccountGenerate })
      this.secondFormGroup.patchValue({
        options: this.option
      })

      this.calculateFee();
    } else {
      this.sharedService.showError('', 'Option already added');
    }
  }

  addAddress() {
    if (this.thirdFormGroup.get('address').valid && this.thirdFormGroup.get('address').value != '') {
      let address = this.thirdFormGroup.get('address').value.toUpperCase()
      const currentAccount = Object.assign({}, this.walletService.getCurrentAccount());

      if (!this.proximaxProvider.verifyNetworkAddressEqualsNetwork(
        this.proximaxProvider.createFromRawAddress(currentAccount.address).plain(), address)
      ) {
        this.sharedService.showError('', 'Invalid account address');

      } else {

        if (this.listaBlanca.length > 0) {
          const existe = this.listaBlanca.find(list => list.plain().trim() === address.split('-').join('').trim());
          if (existe != undefined) {
            this.sharedService.showError('', 'accounts already added');
            this.cleanThirForm();
          } else {
            this.listaBlanca.push(Address.createFromRawAddress(address))
            this.calculateFee();
            this.cleanThirForm();
          }
        } else {
          this.listaBlanca.push(Address.createFromRawAddress(address))
          this.calculateFee();
          this.cleanThirForm();
        }
      }
    }
  }

  cleanThirForm() {
    this.thirdFormGroup.patchValue({
      address: '',
      contact: ''
    })
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
    } else {
      this.btnBlock = false;
    }
  }

  async preparepoll(common) {
    this.btnBlock = true;
    
    this.prepareAggregateTransactions();
    
    const generationHash = this.dataBridge.blockInfo.generationHash;
    const signingAccount = Account.createFromPrivateKey(common.privateKey, this.walletService.currentAccount.network);
    const signedAggregateTransaction = signingAccount.sign(this.aggregateTransaction, generationHash);

    this.aggregateHash = signedAggregateTransaction.hash;
    this.prepareFirstTransaction();

    const signedTransferTransaction = signingAccount.sign(this.firstTransfer, generationHash);

    this.proximaxProvider.announce(signedTransferTransaction).subscribe(
      msg => {
        this.proximaxProvider.announce(signedAggregateTransaction).subscribe(
          msg=>{
            this.btnBlock = false;
            this.stepper.resetAll()
            this.listaBlanca = [];
            this.option = [];
            this.createForms();
        },
        err => {
          this.btnBlock = false;
        });
      },
      err => {
        this.btnBlock = false;
      }
    );
  }

  calculateFee(){
    this.get1();
    this.get2();
    this.get3();

    this.prepareAggregateTransactions();
    this.prepareFirstTransaction();

    let aggregateAbsoluteFee = FeeCalculationStrategy.MiddleFeeCalculationStrategy * AggregateTransaction.calculateSize(this.aggregateTransaction.innerTransactions); 
    let firstTransferAbsoluteFee = this.firstTransfer.maxFee.compact();

    if(aggregateAbsoluteFee > DefaultMaxFee){
      aggregateAbsoluteFee = DefaultMaxFee;
    }
    
    this.fee = this.transactionService.amountFormatterSimpleReturnNumber(aggregateAbsoluteFee) + this.transactionService.amountFormatterSimpleReturnNumber(firstTransferAbsoluteFee);

    this.displayFee = this.transactionService.amountFormatterSimple(aggregateAbsoluteFee + firstTransferAbsoluteFee);

    this.balance();
  }

  prepareAggregateTransactions(){
    this.Poll = this.getPollContent();

    const pollString = JSON.stringify(this.Poll);

    let buf = Buffer.from(pollString);

    let maximumSizePerTx = 1023;

    let txNumToSpill = Math.ceil(buf.byteLength/maximumSizePerTx);
    this.transferTransactions = [];

    for(var i = 0; i < txNumToSpill; i++){
      var bufChunk = buf.slice(i * maximumSizePerTx, (i + 1) * maximumSizePerTx);
      var bufChunkHex = bufChunk.toString('hex');
      this.transferTransactions.push(this.proximaxProvider.buildTransferTransactionDirectHexMessage(this.walletService.currentAccount.network, this.account.address, bufChunkHex).toAggregate(this.walletService.currentAccount.publicAccount));
    }

    this.aggregateTransaction = this.proximaxProvider.buildAggregateTransactionComplete(
      this.walletService.currentAccount.network,
      this.transferTransactions
    );
  }

  prepareFirstTransaction(){

    const pollBriefContent = this.getPollBriefContentSimply();

    this.firstTransfer = this.proximaxProvider.buildTransferTransaction(this.walletService.currentAccount.network, this.account.address, PlainMessage.create(JSON.stringify(pollBriefContent)));
  }

  getPollBriefContentSimply() : object{
    const pollBriefContent = {
      name: this.name,
      type: 'poll',
      hash: this.aggregateHash
    };

    return pollBriefContent;
  }

  getPollContent(): PollInterface{
    return {
      name: this.name,
      description: this.description,
      id:this.pollId,
      type: this.type,
      isPrivate: this.isPrivate,
      isMultiple: this.isMultiple,
      options: this.option,
      whiteList: this.listaBlanca,
      startDate: this.startDate,
      endDate: this.endDate,
      createdDate: this.createdDate,
      quantityOption: this.option.length
    };
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

  formtDate(format: string | number | Date) {
    const datefmt = new Date(format);
    const day = (datefmt.getDate() < 10) ? `0${datefmt.getDate()}` : datefmt.getDate();
    const month = (datefmt.getMonth() + 1 < 10) ? `0${datefmt.getMonth() + 1}` : datefmt.getMonth() + 1;
    const hours = (datefmt.getHours() < 10) ? `0${datefmt.getHours()}` : datefmt.getHours();
    const minutes = (datefmt.getMinutes() < 10) ? `0${datefmt.getMinutes()}` : datefmt.getMinutes();
    const seconds = (datefmt.getSeconds() < 10) ? `0${datefmt.getSeconds()}` : datefmt.getSeconds();
    return `${datefmt.getFullYear()}-${month}-${day}  ${hours}:${minutes}:${seconds}`;
  }

  /**
    *
    */
  validateAccountListContact(): ContactsListInterface[] {
    let listContactReturn: ContactsListInterface[] = []
    const listContactfilter = this.booksAddress()
    for (let element of listContactfilter) {
      const account = this.walletService.filterAccountWallet(element.label);
      let isMultisig: boolean = false;
      if (account)
        isMultisig = this.isMultisign(account)
      listContactReturn.push({
        label: element.label,
        value: element.value,
        walletContact: element.walletContact,
        isMultisig: isMultisig,
        disabled: Boolean(isMultisig && element.walletContact)
      })
    }
    return listContactReturn

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

}

/**
 * poll JSON
 * @param name - name poll
 * @param description - description poll
 * @param id - identifier
 * @param type - 0 = white list , 1 = public,
 * @param startDate - poll start date
 * @param endDate - poll end date
 * @param createdDate - poll creation date
 * @param quantityOption - number of voting options
 *
*/
export interface PollInterface {
  name: string;
  description: string;
  id: string;
  type: number;
  isPrivate: boolean,
  isMultiple: boolean,
  options: optionsPoll[];
  whiteList: Object[];
  blackList?: Object[];
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
interface ContactsListInterface {
  label: string;
  value: string;
  walletContact: boolean;
  isMultisig: boolean;
  disabled: boolean;
}
