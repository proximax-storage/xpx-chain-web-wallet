
import { Component, OnInit } from '@angular/core';
import {
  Account,
  PublicAccount,
  ModifyMultisigAccountTransaction,
  Deadline,
  MultisigCosignatoryModification,
  UInt64,
  Address,
  MultisigCosignatoryModificationType,
  HashLockTransaction,
  TransactionHttp,
  SignedTransaction,
  AggregateTransaction,
  AccountInfo,
  Mosaic,
  MosaicId,
  MultisigAccountInfo
} from 'tsjs-xpx-chain-sdk';
import { Subscription } from 'rxjs';
import { AppConfig } from '../../../../config/app.config';
import { SharedService, ConfigurationForm } from '../../../../shared/services/shared.service';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { WalletService, AccountsInfoInterface, AccountsInterface } from '../../../../wallet/services/wallet.service';
import { environment } from '../../../../../environments/environment';
import { ServicesModuleService, HeaderServicesInterface } from '../../../../servicesModule/services/services-module.service';
import { ProximaxProvider } from '../../../../shared/services/proximax.provider';
import { NodeService } from '../../../../servicesModule/services/node.service';
import { DataBridgeService } from '../../../../shared/services/data-bridge.service';
import { TransactionsService, TransactionsInterface } from '../../../../transactions/services/transactions.service';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-convert-account-multisign',
  templateUrl: './convert-account-multisign.component.html',
  styleUrls: ['./convert-account-multisign.component.css']
})
export class ConvertAccountMultisignComponent implements OnInit {

  convertAccountMultsignForm: FormGroup;
  configurationForm: ConfigurationForm = {};
  publicAccountToConvert: PublicAccount;
  routes = {
    backToService: `/${AppConfig.routes.service}`,
    createNewAccount: `/${AppConfig.routes.selectTypeCreationAccount}`,
    viewDetails: `/${AppConfig.routes.account}/`
  };
  subscribe: Subscription[] = [];
  minApprovaMaxLength: number = 1;
  minApprovaMinLength: number = 1;
  currentAccounts: any = [];
  currentAccountToConvert: AccountsInterface;
  subscribeAccount = null;
  accountInfo: AccountsInfoInterface = null;
  accountToConvertSign: Account;
  accountValid: boolean;
  mdbBtnAddCosignatory: boolean;
  cosignatoryList: CosignatoryList[] = [];
  transactionHttp: TransactionHttp
  listContact: ContactsListInterface[] = [];
  passwordMain: string = 'password'
  showContacts: boolean;
  isMultisig: boolean;
  searchContact: boolean;
  blockSend: boolean;
  notBalance: boolean;
  disable: boolean;
  fee: any = '0.000000'
  feeLockfund: number = 10000000;

  feeTransaction: number = 44500;
  totalFee: number = 0;
  blockBtnSend: boolean = false;
  paramsHeader: HeaderServicesInterface = {
    moduleName: 'Accounts > Multisign',
    componentName: 'Convert to Multisig Account'
  };
  subscribeContact: Subscription[] = [];
  convertIntoMultisig: ModifyMultisigAccountTransaction;
  aggregateTransaction: AggregateTransaction;

  constructor(
    private fb: FormBuilder,
    private sharedService: SharedService,
    private walletService: WalletService,
    private serviceModuleService: ServicesModuleService,
    private proximaxProvider: ProximaxProvider,
    private nodeService: NodeService,
    private transactionService: TransactionsService,
    private dataBridge: DataBridgeService,
    private activateRoute: ActivatedRoute,
  ) {
    this.totalFee = this.feeTransaction + this.feeLockfund;
    this.currentAccounts = [];
    this.configurationForm = this.sharedService.configurationForm;
    this.accountValid = false;
    this.mdbBtnAddCosignatory = true;
    this.showContacts = false;
    this.cosignatoryList = [];
    this.isMultisig = false;
    this.blockSend = false;
    this.notBalance = false;
    this.transactionHttp = new TransactionHttp(environment.protocol + "://" + `${this.nodeService.getNodeSelected()}`);
  }

  ngOnInit() {
    this.createForm();
    this.getAccounts();
    // this.listContact = this.booksAddress();
    this.subscribeValueChange();
    this.load();
  }

  /**
   *
   *
   * @memberof ConvertAccountMultisignComponent
   */
  ngOnDestroy(): void {
    this.subscribe.forEach(subscription => {
      subscription.unsubscribe();
    });
  }


  /**
   *
   *
   * @memberof ConvertAccountMultisignComponent
   */
  load() {
    this.subscribe.push(this.walletService.getAccountsInfo$().subscribe(
      next => {
        this.getAccounts();
      }
    ));

  }

  changeInputType(inputType) {
    let newType = this.sharedService.changeInputType(inputType)
    this.passwordMain = newType;
  }

  /**
   *
   *
   * @memberof ConvertAccountMultisignComponent
   */
  createForm() {
    //Form create multisignature default
    this.convertAccountMultsignForm = this.fb.group({
      selectAccount: ['', [
        Validators.required
      ]],
      cosignatory: ['', [
        Validators.pattern('^(0x|0X)?[a-fA-F0-9]+$')
      ]],
      contact: [''],
      minApprovalDelta: [1, [
        Validators.required, Validators.minLength(1),
        Validators.maxLength(1)]
      ],
      minRemovalDelta: [1, [
        Validators.required, Validators.minLength(1),
        Validators.maxLength(1)]
      ],
      password: ['', [
        Validators.required,
        Validators.minLength(this.configurationForm.passwordWallet.minLength),
        Validators.maxLength(this.configurationForm.passwordWallet.maxLength)
      ]],
    });

    // this.convertAccountMultsignForm.get('selectAccount').patchValue('ACCOUNT-2');
  }
  /**
 *
 *
 * @param {string} [nameInput='']
 * @param {string} [nameControl='']
 * @param {string} [nameValidation='']
 * @returns
 * @memberof CreateMultiSignatureComponent
 */
  validateInput(nameInput: string = '', nameControl: string = '', nameValidation: string = '') {
    let validation: AbstractControl = null;
    if (nameInput !== '' && nameControl !== '') {
      validation = this.convertAccountMultsignForm.controls[nameControl].get(nameInput);
    } else if (nameInput === '' && nameControl !== '' && nameValidation !== '') {
      validation = this.convertAccountMultsignForm.controls[nameControl].getError(nameValidation);
    } else if (nameInput !== '') {
      validation = this.convertAccountMultsignForm.get(nameInput);
    }
    return validation;
  }

  preventNumbers(e) {

    if (e.keyCode >= 48 && e.keyCode <= 57) {
      // we have a number
      return false;
    }
  }
  /**
   *
   * Get accounts wallet
   * @memberof ConvertAccountMultisignComponent
   */
  getAccounts(transactionsParam: TransactionsInterface = undefined) {
    const currentWallet = Object.assign({}, this.walletService.currentWallet);
    if (currentWallet && Object.keys(currentWallet).length > 0) {
      this.subscribe.push(this.transactionService.getAggregateBondedTransactions$().subscribe((transactions: TransactionsInterface[]) => {
        this.currentAccounts = [];
        this.disable = false;

        if (transactionsParam) {
          transactions.push(transactionsParam)
        }
        if (transactions.length > 0) {
          for (let element of currentWallet.accounts) {
            for (let index = 0; index < transactions.length; index++) {
              // if (transactions[index].data.type === 16961) {
              for (let i = 0; i < transactions[index].data['innerTransactions'].length; i++) {
                this.disable = (transactions[index].data['innerTransactions'][i].signer.publicKey === element.publicAccount.publicKey);
                if (this.disable)
                  break
              }

              // this.disable = (transactions[index].data['innerTransactions'][i].signer.publicKey  === element.publicAccount.publicKey);
              if (this.disable)
                break
              // }
            }
            this.buildSelectAccount(element, this.disable)
          }
        } else {


          for (let element of currentWallet.accounts) {
            this.buildSelectAccount(element)
          }
        }
        if (this.activateRoute.snapshot.paramMap.get('name') !== null) {
          if (this.currentAccounts.length > 0) {
            const valueSelect = this.currentAccounts.filter(x => x.label === this.activateRoute.snapshot.paramMap.get('name'));
            if (valueSelect) {
              // this.convertAccountMultsignForm.controls['selectAccount'].patchValue(valueSelect[0]);
              this.selectAccount(null, this.activateRoute.snapshot.paramMap.get('name'))
            }
          }
        }
      }))
    }
  }

  buildSelectAccount(param: AccountsInterface, disable: boolean = false) {
    const accountFiltered = this.walletService.filterAccountInfo(param.name);
    let info = ''
    if (!disable) {
      info = this.validateBuildSelectAccount(accountFiltered).info
      disable = this.validateBuildSelectAccount(accountFiltered).disabled;
    }
    if (accountFiltered) {
      if (!this.isMultisign(param)) {
        this.currentAccounts.push({
          label: param.name,
          value: param,
          disabled: disable,
          info: info
        });
        // if (this.activateRoute.snapshot.paramMap.get('name') !== null)

      }
    }
  }
  validateBuildSelectAccountBalance(balanceAccount: number): boolean {
    console.log("Balance:", balanceAccount)
    const totalFee = Number(this.transactionService.amountFormatterSimple(this.feeLockfund)) + this.fee;
    console.log("totalFee :", this.totalFee)
    return (balanceAccount >= this.totalFee)
  }
  validateBuildSelectAccount(accountFiltered: AccountsInfoInterface): { disabled: boolean, info: string } {
    let value = { disabled: false, info: '' }
    const disabled: boolean = (
      accountFiltered !== null &&
      accountFiltered !== undefined && accountFiltered.accountInfo !== null)

    if (!disabled)
      return { disabled: true, info: 'Insufficient balance' }
    if (!accountFiltered.accountInfo.mosaics.find(next => next.id.toHex() === environment.mosaicXpxInfo.id))
      return { disabled: true, info: 'Insufficient balance' }
    console.log('cuenta:', accountFiltered.name)
    const mosaicXPX = accountFiltered.accountInfo.mosaics.find(next => next.id.toHex() === environment.mosaicXpxInfo.id).amount.compact();
    if (!this.validateBuildSelectAccountBalance(mosaicXPX))
      return { disabled: true, info: 'Insufficient balance' }


    return { disabled: false, info: '' }
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

  /**
  *
  *
  * @memberof ConvertAccountMultisignComponent
  */
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


  selectAccount($event: Event, accountName?: string) {
    const event: any = $event;
    const account: any = (event === null) ? this.walletService.filterAccountWallet(accountName) : event.value;
    // const account: AccountsInterface = this.walletService.filterAccountWallet(name)
    this.notBalance = false;
    this.minApprovaMaxLength = 1;
    // this.listContact = this.booksAddress();

    if (account !== null && account !== undefined) {
      this.currentAccountToConvert = account;
      this.listContact = this.validateAccountListContact();
      this.setCosignatoryList([])
      this.builder();
      this.subscribeAccount = this.walletService.getAccountsInfo$().subscribe(
        async accountInfo => {
          this.validateAccount(account.name)
        }).unsubscribe();
    }

  }
  /**
    *
    * @memberof ConvertAccountMultisignComponent
    */
  validateAccountListContact(): ContactsListInterface[] {

    let listContactReturn: ContactsListInterface[] = []

    const listContactfilter = this.booksAddress().filter(item => item.label !== this.currentAccountToConvert.name);

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

  validateAccount(name: string) {
    this.mdbBtnAddCosignatory = true;
    this.accountInfo = this.walletService.filterAccountInfo(name);
    this.accountValid = (
      this.accountInfo !== null &&
      this.accountInfo !== undefined && this.accountInfo.accountInfo !== null);
    if (this.subscribeAccount) {
      this.subscribeAccount.unsubscribe();
    }
    //Validate Account
    if (!this.accountValid)
      return this.sharedService.showError('', 'Account to convert is not valid');

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


    this.publicAccountToConvert = PublicAccount.createFromPublicKey(this.currentAccountToConvert.publicAccount.publicKey, this.currentAccountToConvert.network)
    this.mdbBtnAddCosignatory = false;
    if (this.activateRoute.snapshot.paramMap.get('name') !== null) {
      if (this.currentAccounts.length > 0) {
        const valueSelect = this.currentAccounts.filter(x => x.label === this.activateRoute.snapshot.paramMap.get('name'));
        if (valueSelect) {
          this.convertAccountMultsignForm.controls['selectAccount'].patchValue(valueSelect[0]);
        }
      }
    }
  }


  /**
*
*
* @memberof CreateMultiSignatureComponent
*/
  builder() {
    let convertIntoMultisigTransaction: ModifyMultisigAccountTransaction;
    if (this.currentAccountToConvert !== undefined && this.currentAccountToConvert !== null) {
      convertIntoMultisigTransaction = ModifyMultisigAccountTransaction.create(
        Deadline.create(environment.deadlineTransfer.deadline, environment.deadlineTransfer.chronoUnit),
        this.convertAccountMultsignForm.get('minApprovalDelta').value,
        this.convertAccountMultsignForm.get('minRemovalDelta').value,
        this.multisigCosignatoryModification(this.getCosignatoryList()),
        this.currentAccountToConvert.network);

      this.aggregateTransaction = AggregateTransaction.createBonded(
        Deadline.create(environment.deadlineTransfer.deadline, environment.deadlineTransfer.chronoUnit),
        [convertIntoMultisigTransaction.toAggregate(this.currentAccountToConvert.publicAccount)],
        this.currentAccountToConvert.network);
      let feeAgregate = Number(this.transactionService.amountFormatterSimple(this.aggregateTransaction.maxFee.compact()));
      // let feeLockfund = 0.044500;
      // let totalFee = feeAgregate + feeLockfund;
      // this.fee = totalFee.toFixed(6);
      this.fee = feeAgregate.toFixed(6);
    }
  }

  /**
*
*
* @memberof CreateMultiSignatureComponent
*/
  convertIntoMultisigTransaction() {


    let accountDecrypt: AccountsInterface;

    if (this.convertAccountMultsignForm.valid && !this.blockSend) {

      this.blockSend = true;
      accountDecrypt = this.currentAccountToConvert
      let common: any = { password: this.convertAccountMultsignForm.get("password").value };
      if (this.walletService.decrypt(common, accountDecrypt)) {
        this.accountToConvertSign = Account.createFromPrivateKey(common.privateKey, accountDecrypt.network)
        const generationHash = this.dataBridge.blockInfo.generationHash;
        const signedTransaction = this.accountToConvertSign.sign(this.aggregateTransaction, generationHash)

        /**
        * Create Hash lock transaction
        */
        const hashLockTransaction = HashLockTransaction.create(
          Deadline.create(environment.deadlineTransfer.deadline, environment.deadlineTransfer.chronoUnit),
          new Mosaic(new MosaicId(environment.mosaicXpxInfo.id), UInt64.fromUint(Number(10000000))),
          UInt64.fromUint(480),
          signedTransaction,
          this.currentAccountToConvert.network
        );

        this.hashLock(this.accountToConvertSign.sign(hashLockTransaction, generationHash), signedTransaction)

      } else {
        this.blockSend = false;
      }
    }
  }

  /**
   * Before sending an aggregate bonded transaction, the future
   * multisig account needs to lock at least 10 cat.currency.
   * This transaction is required to prevent network spamming and ensure that the inner
   * transactions are cosigned. After the hash lock transaction has been confirmed,
   * announce the aggregate transaction.
   *
   * @memberof CreateMultiSignatureComponent
   * @param {SignedTransaction} hashLockTransactionSigned  - Hash lock funds transaction.
   * @param {SignedTransaction} signedTransaction  - Signed transaction of Bonded.
   */
  hashLock(hashLockTransactionSigned: SignedTransaction, signedTransaction: SignedTransaction) {
    this.transactionHttp.announce(hashLockTransactionSigned).subscribe(async () => {
      this.getTransactionStatushashLock(hashLockTransactionSigned, signedTransaction)
    }, err => {
      this.clearForm();
      this.blockSend = false;
      // this.sharedService.showError('', err);
    });
  }

  /**
   *
   *
   * @memberof CreateMultiSignatureComponent
   *  @param {SignedTransaction} signedTransaction  - Signed transaction.
   */
  getTransactionStatushashLock(signedTransactionHashLock: SignedTransaction, signedTransactionBonded: SignedTransaction) {
    // Get transaction status
    this.dataBridge.getTransactionStatus().subscribe(
      statusTransaction => {
        if (statusTransaction !== null && statusTransaction !== undefined && signedTransactionHashLock !== null) {
          const match = statusTransaction['hash'] === signedTransactionHashLock.hash;
          if (statusTransaction['type'] === 'confirmed' && match) {
            this.announceAggregateBonded(signedTransactionBonded)
            signedTransactionHashLock = null;
          } else if (statusTransaction['type'] === 'unconfirmed' && match) {
            // signedTransactionHashLock = null;
          } else if (match) {
            this.clearForm()
            this.blockSend = false;
            signedTransactionHashLock = null;
          }
        }
      }
    );
  }
  /**
  *
  *
  * @memberof CreateMultiSignatureComponent
  *  @param {SignedTransaction} signedTransaction  - Signed transaction.
  */
  announceAggregateBonded(signedTransaction: SignedTransaction) {
    this.convertAccountMultsignForm.get('selectAccount').patchValue('', { emitEvent: false, onlySelf: true });
    this.transactionHttp.announceAggregateBonded(signedTransaction).subscribe(
      async () => {
        this.getTransactionStatus(signedTransaction)
      },
      err => {
        this.sharedService.showError('', err);
        this.clearForm();
        this.blockSend = false;
      });

  }
  /**
  *
  *
  * @memberof CreateMultiSignatureComponent
  *  @param {SignedTransaction} signedTransaction  - Signed transaction.
  */
  getTransactionStatus(signedTransaction: SignedTransaction) {
    // Get transaction status
    this.subscribe['transactionStatus'] = this.dataBridge.getTransactionStatus().subscribe(
      statusTransaction => {
        if (statusTransaction !== null && statusTransaction !== undefined && signedTransaction !== null) {
          const match = statusTransaction['hash'] === signedTransaction.hash;
          if (match) {
            this.clearForm();
            this.blockSend = false;
          }
          if (statusTransaction['type'] === 'confirmed' && match) {
            signedTransaction = null;
          } else if (statusTransaction['type'] === 'unconfirmed' && match) {
            this.transactionService.searchAccountsInfo([this.currentAccountToConvert])
            signedTransaction = null;
          } else if (statusTransaction['type'] === 'aggregateBondedAdded' && match) {
            signedTransaction = null;
          } else if (match) {
            this.clearForm();
            this.blockSend = false;
            signedTransaction = null;
          }
        }
      }
    );
  }

  /**
     * With a multisig cosignatory modification a cosignatory is added to or deleted from a multisig account.
     *
     * @memberof CreateMultiSignatureComponent
     * @param {CosignatoryList}  cosignatoryList  - Cosignatory list.
     * @param {MultisigCosignatoryModificationType} type  - type modification.
     */
  multisigCosignatoryModification(cosignatoryList: CosignatoryList[]): MultisigCosignatoryModification[] {
    const cosignatory = []
    if (cosignatoryList.length > 0) {
      for (let index = 0; index < cosignatoryList.length; index++) {
        cosignatory.push(
          new MultisigCosignatoryModification(
            MultisigCosignatoryModificationType.Add,
            cosignatoryList[index].publicAccount,
          )
        )
      }
    }
    return cosignatory
  }

  iswalletContact(label: string): boolean {
    const value: boolean[] = this.listContact.filter(item => item.label === label).map((item: ContactsListInterface) => {
      return item.walletContact
    });
    return value[0];
  }

  unsubscribe(subscribe: Subscription[]) {
    if (subscribe.length > 0) {
      subscribe.forEach(subscription => {
        subscription.unsubscribe();
      });
    }
  }



  /**
  *
  *
  * @param {*} event
  * @memberof CreateMultiSignatureComponent
  */
  async selectContact(event: { label: string, value: string }) {
    this.unsubscribe(this.subscribeContact);
    this.convertAccountMultsignForm.get('cosignatory').patchValue('', { emitEvent: false, onlySelf: true });
    this.searchContact = false;
    if (event !== undefined && event.value !== '') {
      this.convertAccountMultsignForm.get('cosignatory').patchValue('', { emitEvent: false, onlySelf: true });
      if (!this.iswalletContact(event.label)) {
        this.searchContact = true;
        this.subscribeContact.push(this.proximaxProvider.getAccountInfo(Address.createFromRawAddress(event.value)).subscribe(async (res: AccountInfo) => {
          this.unsubscribe(this.subscribeContact);
          this.searchContact = false;
          if (res.publicKeyHeight.toHex() === '0000000000000000') {
            this.sharedService.showWarning('', 'Cosignatory does not have a public key');
            this.convertAccountMultsignForm.get('cosignatory').patchValue('', { emitEvent: false, onlySelf: true });
            this.convertAccountMultsignForm.get('contact').patchValue('', { emitEvent: false, onlySelf: true });
          } else {
            this.convertAccountMultsignForm.get('cosignatory').patchValue(res.publicKey, { emitEvent: true })
            this.convertAccountMultsignForm.get('contact').patchValue('', { emitEvent: false, onlySelf: true });
          }
        }, err => {
          this.convertAccountMultsignForm.get('contact').patchValue('', { emitEvent: false, onlySelf: true });
          this.searchContact = false;
          this.sharedService.showWarning('', 'Address is not valid');
        }));

      } else {
        this.walletService.getAccountsInfo$().subscribe(
          accountInfo => {
            if (accountInfo) {
              const account = this.walletService.filterAccountInfo(event.label);
              const accountValid = (
                account !== null &&
                account !== undefined &&
                account.accountInfo &&
                account.accountInfo.publicKey !== "0000000000000000000000000000000000000000000000000000000000000000"
              );

              if (accountValid) {
                this.convertAccountMultsignForm.get('cosignatory').patchValue(account.accountInfo.publicKey, { emitEvent: true })
                this.convertAccountMultsignForm.get('contact').patchValue('', { emitEvent: false, onlySelf: true });
              } else {
                this.sharedService.showWarning('', 'Cosignatory does not have a public key');
                this.convertAccountMultsignForm.get('contact').patchValue('', { emitEvent: false, onlySelf: true });
              }

            } else {
              this.convertAccountMultsignForm.get('contact').patchValue('', { emitEvent: false, onlySelf: true });
              this.sharedService.showWarning('', 'Address is not valid');

            }
          }
        ).unsubscribe();

      }
    }
  }

  /**
  * @memberof CreateMultiSignatureComponent
  */
  clearForm() {
    this.publicAccountToConvert = undefined;
    this.isMultisig = false;
    this.mdbBtnAddCosignatory = true;
    this.showContacts = false;
    this.setCosignatoryList([])
    this.convertAccountMultsignForm.reset({
      selectAccount: '',
      cosignatory: '',
      contact: '',
      minApprovalDelta: 1,
      minRemovalDelta: 1,
      password: ''
    }, {
        emitEvent: false
      }
    );
  }

  async addCosignatory() {
    if (this.convertAccountMultsignForm.get('cosignatory').valid && this.convertAccountMultsignForm.get('cosignatory').value != '') {
      this.showContacts = false;
      this.searchContact = true;
      const cosignatory: PublicAccount = PublicAccount.createFromPublicKey(
        this.convertAccountMultsignForm.get('cosignatory').value,
        this.walletService.currentAccount.network
      );

      let isMultisig: MultisigAccountInfo = null;
      let valueIsMultisig: boolean = false;
      try {
        isMultisig = await this.proximaxProvider.getMultisigAccountInfo(cosignatory.address).toPromise();
      } catch (error) {
        isMultisig = null
      }
      this.searchContact = false;
      if (isMultisig)
        valueIsMultisig = isMultisig.isMultisig()

      if (valueIsMultisig)
        return this.sharedService.showWarning('', 'Account is Multisig');
      // Cosignatory needs a public key
      // if (!this.cosignatoryPubKey) return this._Alert.cosignatoryhasNoPubKey();

      // Multisig cannot be cosignatory
      if (this.publicAccountToConvert.address.plain() === cosignatory.address.plain())
        return this.sharedService.showError('', 'A multisig account cannot be set as cosignatory');
      // Check presence in cosignatory List array
      if (!Boolean(this.cosignatoryList.find(item => { return item.publicAccount.address.plain() === cosignatory.address.plain() }))) {
        this.cosignatoryList.push({ publicAccount: cosignatory, action: 'Add', type: 1, disableItem: false, id: cosignatory.address });
        this.setCosignatoryList(this.cosignatoryList);
        this.convertAccountMultsignForm.get('cosignatory').patchValue('');
        this.builder();
      } else {
        this.sharedService.showError('', 'Cosignatory is already present in modification list');
      }
    }
  }
  /**
  * Delete cosignatory to the cosignatory List
  * @memberof CreateMultiSignatureComponent
  * @param id  - Address in cosignatory.
  */
  deleteCosignatory(id: Address, disableItem: boolean, type: number) {
    const cosignatoryList = this.cosignatoryList.filter(item => item.id.plain() !== id.plain())
    this.setCosignatoryList(cosignatoryList);
    this.builder();
  }

  /**
  * Set cosignatory list
  * @memberof CreateMultiSignatureComponent
  * @param {CosignatoryList} [cosignatoryListParam] - list cosignatory
  */
  setCosignatoryList(cosignatoryListParam: CosignatoryList[]) {
    this.cosignatoryList = cosignatoryListParam;
    this.validatorsMinApprovalDelta();
    this.validatorsMinRemovalDelta();

  }
  /**
   * Get cosignatory list add and remove
   * @memberof CreateMultiSignatureComponent
   * @return {CosignatoryList} list cosignatory
   */
  getCosignatoryList(): CosignatoryList[] {
    return this.cosignatoryList;
  }

  /**
* Change the form validator (minApprovalDelta)
* @memberof CreateMultiSignatureComponent
*/
  validatorsMinApprovalDelta() {
    const validators = [Validators.required,
    Validators.minLength(1),
    Validators.maxLength(this.getCosignatoryList().length)];
    this.minApprovaMaxLength = 1;
    this.minApprovaMaxLength = this.getCosignatoryList().length
    // if (this.getCosignatoryList().length > 0) {
    //   this.convertAccountMultsignForm.get('minApprovalDelta').patchValue(this.getCosignatoryList().length, { emitEvent: false, onlySelf: true })
    // } else {
    //   this.convertAccountMultsignForm.get('minApprovalDelta').patchValue(1, { emitEvent: false, onlySelf: true })
    // }
    if (this.getCosignatoryList().length > 0) {
      while (this.convertAccountMultsignForm.get('minApprovalDelta').value > this.getCosignatoryList().length) {
        this.convertAccountMultsignForm.get('minApprovalDelta').patchValue(this.convertAccountMultsignForm.get('minApprovalDelta').value - 1, { emitEvent: false, onlySelf: true });
      }
    } else {
      this.convertAccountMultsignForm.get('minApprovalDelta').patchValue(1, { emitEvent: false, onlySelf: true })
    }

    this.convertAccountMultsignForm.controls['minApprovalDelta'].setValidators(validators);
    this.convertAccountMultsignForm.controls['minApprovalDelta'].updateValueAndValidity({ emitEvent: false, onlySelf: true });
  }

  /**
  * Change the form validator (minRemovalDelta)
  * @memberof CreateMultiSignatureComponent
  */
  validatorsMinRemovalDelta() {
    const validators = [Validators.required,
    Validators.minLength(1),
    Validators.maxLength(this.getCosignatoryList().length)];
    this.minApprovaMaxLength = 1;
    this.minApprovaMaxLength = this.getCosignatoryList().length
    // if (this.getCosignatoryList().length > 0) {
    //   const resta = (this.getCosignatoryList().length > 1) ? 1 : 0;
    //   this.convertAccountMultsignForm.get('minRemovalDelta').patchValue(this.getCosignatoryList().length - resta, { emitEvent: false, onlySelf: true })
    // } else {
    //   this.convertAccountMultsignForm.get('minRemovalDelta').patchValue(1, { emitEvent: false, onlySelf: true })
    // }
    if (this.getCosignatoryList().length > 0) {
      while (this.convertAccountMultsignForm.get('minRemovalDelta').value > this.getCosignatoryList().length) {
        this.convertAccountMultsignForm.get('minRemovalDelta').patchValue(this.convertAccountMultsignForm.get('minRemovalDelta').value - 1, { emitEvent: false, onlySelf: true });
      }
    } else {
      this.convertAccountMultsignForm.get('minRemovalDelta').patchValue(1, { emitEvent: false, onlySelf: true })
    }

    this.convertAccountMultsignForm.controls['minRemovalDelta'].setValidators(validators);
    this.convertAccountMultsignForm.controls['minRemovalDelta'].updateValueAndValidity({ emitEvent: false, onlySelf: true });

  }

  /**
  *
  *
  * @memberof CreateNamespaceComponent
  *
  */
  subscribeValueChange() {
    // Cosignatory ValueChange
    this.convertAccountMultsignForm.get('cosignatory').valueChanges.subscribe(
      async next => {
        if (next !== null && next !== undefined) {
        }
        this.validatorsCosignatory();
      }
    );

    // minApprovalDelta ValueChange
    this.convertAccountMultsignForm.get('minApprovalDelta').valueChanges.subscribe(
      minApproval => {
        this.builder();

      }
    );

    // minRemovalDelta ValueChange
    this.convertAccountMultsignForm.get('minRemovalDelta').valueChanges.subscribe(
      minRemoval => {
        this.builder();

      }
    );
  }

  /**
  * Change the form validator (cosignatory)
  * @memberof CreateMultiSignatureComponent
  */
  validatorsCosignatory() {
    const validators = [
      Validators.required,
      Validators.minLength(this.configurationForm.publicKey.minLength),
      Validators.maxLength(this.configurationForm.publicKey.maxLength),
      Validators.pattern('^(0x|0X)?[a-fA-F0-9]+$')];
    if (this.cosignatoryList.length > 0 && (this.convertAccountMultsignForm.get('cosignatory').value === null
      || this.convertAccountMultsignForm.get('cosignatory').value === undefined
      || this.convertAccountMultsignForm.get('cosignatory').value === '')) {
      this.convertAccountMultsignForm.controls['cosignatory'].setValidators(null);
    } else {
      this.convertAccountMultsignForm.controls['cosignatory'].setValidators(validators);
    }
    this.convertAccountMultsignForm.controls['cosignatory'].updateValueAndValidity({ emitEvent: false });
  }
  amountFormatterSimple(amount): string {
    return this.transactionService.amountFormatterSimple(amount)
  }
}
/**
 * cosignatory List
 * @param publicAccount
 * @param action - event (Add or delete)
 * @param type - 1 = Add , 2 = remove , 3 = view
 * @param disableItem - Disable item list
 * @param id - Address in cosignatory
*/
export interface CosignatoryList {
  publicAccount: PublicAccount;
  action: string;
  type: number,
  disableItem: boolean;
  id: Address;
}
interface ContactsListInterface {
  label: string;
  value: string;
  walletContact: boolean;
  isMultisig: boolean;
  disabled: boolean;
}
