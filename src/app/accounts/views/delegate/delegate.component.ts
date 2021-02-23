import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ModalDirective } from 'ng-uikit-pro-standard';
import { FormGroup, Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { Address, SignedTransaction, TransactionHttp, Account, LinkAction, AccountLinkTransaction } from 'tsjs-xpx-chain-sdk';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppConfig } from '../../../config/app.config';
import { ProximaxProvider } from '../../../shared/services/proximax.provider';
import { DataBridgeService } from '../../../shared/services/data-bridge.service';
import { SharedService, ConfigurationForm } from '../../../shared/services/shared.service';
import { WalletService, AccountsInterface } from '../../../wallet/services/wallet.service';
import { HeaderServicesInterface, ServicesModuleService } from '../../../servicesModule/services/services-module.service';
import { environment } from '../../../../environments/environment';
import { NodeService } from '../../../servicesModule/services/node.service';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-delegate',
  templateUrl: './delegate.component.html',
  styleUrls: ['./delegate.component.css']
})
export class DelegateComponent implements OnInit, OnDestroy {
  paramsHeader: HeaderServicesInterface = {
    moduleName: 'Accounts',
    componentName: 'Delegate'
  };
  backToService = `/${AppConfig.routes.service}`;
  isLinked: boolean = null;
  blockSend = false;
  configurationForm: ConfigurationForm = {};
  delegateForm: FormGroup;
  privateKeyForm: FormGroup;
  loading = false;
  isValidBlockchain = false;
  validFormat = false;
  transactionSigned = [];
  transactionReady: SignedTransaction[] = [];
  subscribe: Subscription[] = [];
  fee = '0.000000';
  amountAccount: number;
  passwordMain = 'password';
  searching = false;
  linkedAccountKey = '';
  linkedAccountPrivateKey = '';
  currentLinkAction:LinkAction;
  transactionStatus: boolean = false;
  isSendingTx = false;
  signedTransaction: SignedTransaction;
  btnDisabled = false;

  signer: AccountsInterface = null;
  typeTx = 1; // 1 simple, 2 multisig
  isMultisigAccount = false;
  transactionHttp: TransactionHttp = null;
  apiUrl: string = "";
  linkingAccountType: string = "";
  linkingAccountKey = '';
  isAccountSelect = false;
  isInputPrivateKey = false;
  pvkMain: string = "password"; 

  @ViewChild('modalAccountSelect', { static: true }) modalAccountSelect: ModalDirective;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private sharedService: SharedService,
    private walletService: WalletService,
    private proximaxProvider: ProximaxProvider,
    private dataBridge: DataBridgeService,
    private serviceModuleService: ServicesModuleService,
    private nodeService: NodeService,
    private http : HttpClient
  ) { }

  ngOnInit() {
    this.apiUrl = environment.protocol + '://' + `${this.nodeService.getNodeSelected()}`;
    this.transactionHttp = new TransactionHttp(this.apiUrl);
    this.configurationForm = this.sharedService.configurationForm;
    //this.subscribe();
    this.checkIsMultisigAccount();
    this.checkLinkedAccountKey();
    this.createForm();
    this.delegateForm.enable();
    this.privateKeyForm.enable();
  }

  ngOnDestroy(): void {
    // this.subscribeAccount.unsubscribe();
    this.subscribe.forEach(subscription => {
      subscription.unsubscribe();
    });
  }

  copyMessage(message: string) {
    this.sharedService.showSuccess('', `${message} copied`);
  }

  selectNewAccount(){

    var newAccount = this.proximaxProvider.generateNewAccount(this.walletService.currentAccount.network);

    this.linkingAccountKey = newAccount.publicKey;
    this.linkedAccountPrivateKey = newAccount.privateKey;

    this.modalAccountSelect.hide();
    this.linkingAccountType = "New Account";
  }

  async selectFromPrivateKey(){

    var privateKey = this.privateKeyForm.get('privateKey').value;

    var linkingAccount = this.proximaxProvider.getAccountFromPrivateKey(privateKey, this.walletService.currentAccount.network);

    try {
      //var accountInfo = await this.proximaxProvider.getAccountInfo(linkingAccount.address).toPromise();
      const accountInfo = await this.directGetAccountInfo(linkingAccount.address.plain());

      if(accountInfo.account.accountType !== 3){
        this.sharedService.showError('', `You must use an empty account with no funds or transactions`);
        return;
      }

    } catch (error) {
      
    }

    this.linkingAccountKey = linkingAccount.publicKey;
    this.linkedAccountPrivateKey = linkingAccount.privateKey;

    this.linkingAccountType = "From Private Key";
    this.modalAccountSelect.hide();
  }

  displayAccountSelect(){
    this.isAccountSelect = true;
    this.isInputPrivateKey = false;
    this.modalAccountSelect.show();
  }

  displayAccountPrivateKeySelect(){
    this.isAccountSelect = false;
    this.isInputPrivateKey = true;
  }

  linkDelegate(){

    if(this.linkingAccountKey === ""){
      this.sharedService.showError('', `Please select linking account`);
      return;
    }

    if (this.delegateForm.valid) {
      const common = {
        password: this.delegateForm.get('password').value,
        privateKey: ''
      }
      if (this.walletService.decrypt(common)) {
        if (!this.blockSend) {
          this.sendAccountLinkTransaction(common, LinkAction.Link);
        }
      }

    } else {
      this.sharedService.showError('', `Enter wallet password`);
    }
  }

  unlinkDelegate(){

    if (this.delegateForm.valid) {
      const common = {
        password: this.delegateForm.get('password').value,
        privateKey: ''
      }
      if (this.walletService.decrypt(common)) {
        if (!this.blockSend) {
          this.sendAccountLinkTransaction(common, LinkAction.Unlink);
        }
      }

    } else {
      this.sharedService.showError('', `Enter wallet password`);
    }

  }

  sendAccountLinkTransaction(common: any, linkAction: LinkAction) {
    this.clearForm();
    this.clearPrivateKeyForm();
    this.blockSend = true;
    this.btnDisabled = true;
    this.isSendingTx = true;
    this.currentLinkAction = linkAction;

    let accountLinkTransaction: AccountLinkTransaction;

    if(linkAction === LinkAction.Link){

      accountLinkTransaction = this.proximaxProvider.buildAccountLinkTransaction(this.walletService.currentAccount.network, this.linkingAccountKey, LinkAction.Link);
    }else{
      accountLinkTransaction = this.proximaxProvider.buildAccountLinkTransaction(this.walletService.currentAccount.network, this.linkedAccountKey, LinkAction.Unlink);
    }

    var txFee = accountLinkTransaction.maxFee.compact();
    var xpxAmount = this.walletService.getAmountAccount(this.walletService.currentAccount.address);

    if(txFee > xpxAmount){
      this.sharedService.showError('', "Insufficient balance on this account");
    }

    const generationHash = this.dataBridge.blockInfo.generationHash;
    const accountsign: Account = Account.createFromPrivateKey(common.privateKey, this.walletService.currentAccount.network);
       
    this.signedTransaction = accountsign.sign(accountLinkTransaction, generationHash);

    this.announceTransaction(this.signedTransaction);
  }

  announceTransaction(signedTransaction: SignedTransaction) {
    this.transactionHttp.announce(signedTransaction).subscribe(
      async () => {
          this.isSendingTx = false;
          this.getTransactionStatus(signedTransaction)
      },
      err => {
        this.isSendingTx = false;
        this.blockSend = false;
        this.btnDisabled = false;
        this.sharedService.showError('', err);
      });
  }

  /**
   *
   *
   * @memberof DelegateComponent
   */
  getTransactionStatus(signedTransaction: SignedTransaction) {
    // Get transaction status
    this.subscribe['transactionStatus'] = this.dataBridge.getTransactionStatus().subscribe(
      statusTransaction => {
        if (statusTransaction !== null && statusTransaction !== undefined && signedTransaction !== null) {
          const match = statusTransaction['hash'] === signedTransaction.hash;
          if (statusTransaction['type'] === 'confirmed' && match) {
            this.transactionConfirmed();
            signedTransaction = null;
            this.subscribe['transactionStatus'].unsubscribe();
          } else if (statusTransaction['type'] === 'unconfirmed' && match) {
            this.blockSend = false;
            // signedTransaction = null;

          } else if (statusTransaction['type'] === 'status' && match) {
            this.btnDisabled = false;
            this.blockSend = false;
            signedTransaction = null;
            this.subscribe['transactionStatus'].unsubscribe();
          } else if (match) {
            this.blockSend = false;
            signedTransaction = null;
          }
        }
      }
    );
  }

  transactionConfirmed(){
    this.isLinked = this.currentLinkAction === LinkAction.Link ? true : false;

    if(this.currentLinkAction === LinkAction.Unlink){
      this.linkedAccountPrivateKey = "";
      this.linkedAccountKey = "";
      this.linkingAccountType = "None selected";
    }
    else{
      this.linkedAccountKey = this.linkingAccountKey;
      this.linkingAccountKey = "";
      this.linkingAccountType = "None selected";
    }
    
    this.btnDisabled = false;
    this.blockSend = false;
  }

  changeInputType(inputType: string) {
    const newType = this.sharedService.changeInputType(inputType);

    this.pvkMain = newType;
  }


  /**
   *
   *
   * @memberof DelegateComponent
   */
  async checkLinkedAccountKey() {
    const address = this.walletService.currentAccount.address;

    try {
      
      //const accountInfo = await this.proximaxProvider.getAccountInfo(address).toPromise();
      const accountInfo = await this.directGetAccountInfo(address);
      this.linkedAccountKey = accountInfo.account.linkedAccountKey;
      
      if(this.linkedAccountKey == "0".repeat(64)){
        this.isLinked = false;
        this.linkingAccountType = "None selected";
      }
      else{
        this.isLinked = true;
      }

    } catch (e) { 
      this.isLinked = false;
      this.linkingAccountType = "None selected";
    }
  }

  /**
   *
   *
   * @memberof DelegateComponent
   */
  async checkIsMultisigAccount() {
    const address = Address.createFromRawAddress(this.walletService.currentAccount.address);

    try {
      const accountMultisigInfo = await this.proximaxProvider.getMultisigAccountInfo(address).toPromise();

      this.isMultisigAccount = accountMultisigInfo.isMultisig();
    } catch (e) { 
      console.error(e);
      this.isMultisigAccount = false;
    }
  }

  async directGetAccountInfo(address: string): Promise<any>{
    const url = `${this.apiUrl}/account/${address}`;

    return this.http.get(url).toPromise();
  }

  /**
   *
   *
   * @memberof DelegateComponent
   */
  createForm() {
    this.delegateForm = this.fb.group({
      password: ['', [
        Validators.required,
        Validators.minLength(this.configurationForm.passwordWallet.minLength),
        Validators.maxLength(this.configurationForm.passwordWallet.maxLength)
      ]]
    });

    this.privateKeyForm = this.fb.group({
      privateKey: ['', [
        Validators.required,
        Validators.minLength(this.configurationForm.privateKey.minLength),
        Validators.maxLength(this.configurationForm.privateKey.maxLength),
        Validators.pattern('^(0x|0X)?[a-fA-F0-9]+$')
      ]]
    });
  
  }


  /**
   *
   *
   * @memberof DelegateComponent
   */
  clearForm() {
    this.delegateForm.get('password').enable();
    this.delegateForm.reset({
      password: ''
    }, {
      emitEvent: false
    });
  }

  /**
   *
   *
   * @memberof DelegateComponent
   */
  clearPrivateKeyForm() {
    this.privateKeyForm.get('privateKey').enable();
    this.privateKeyForm.reset({
      privateKey: ''
    }, {
      emitEvent: false
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
      validation = this.delegateForm.controls[nameControl].get(nameInput);
    } else if (nameInput === '' && nameControl !== '' && nameValidation !== '') {
      validation = this.delegateForm.controls[nameControl].getError(nameValidation);
    } else if (nameInput !== '') {
      validation = this.delegateForm.get(nameInput);
    }
    return validation;
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
  validatePrivateKeyInput(nameInput: string = '', nameControl: string = '', nameValidation: string = '') {
    let validation: AbstractControl = null;
    if (nameInput !== '' && nameControl !== '') {
      validation = this.privateKeyForm.controls[nameControl].get(nameInput);
    } else if (nameInput === '' && nameControl !== '' && nameValidation !== '') {
      validation = this.privateKeyForm.controls[nameControl].getError(nameValidation);
    } else if (nameInput !== '') {
      validation = this.privateKeyForm.get(nameInput);
    }
    return validation;
  }

}
