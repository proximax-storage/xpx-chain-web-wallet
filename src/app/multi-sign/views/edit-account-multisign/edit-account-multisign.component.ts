import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  PublicAccount,
  TransactionHttp,
  Address,
  AccountInfo,
  Deadline,
  MultisigCosignatoryModification,
  NetworkType,
  UInt64,
  Account,
  AggregateTransaction,
  ModifyMultisigAccountTransaction,
  MultisigCosignatoryModificationType,
  SignedTransaction,
  MultisigAccountInfo,
  TransactionType
} from 'tsjs-xpx-chain-sdk';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountsInterface, AccountsInfoInterface, WalletService } from '../../../wallet/services/wallet.service';
import { MultiSignService, TypeTx } from '../../service/multi-sign.service';
import { ServicesModuleService, HeaderServicesInterface } from '../../../servicesModule/services/services-module.service';
import { ProximaxProvider } from '../../../shared/services/proximax.provider';
import { NodeService } from '../../../servicesModule/services/node.service';
import { TransactionsService, TransactionsInterface } from '../../../transactions/services/transactions.service';
import { DataBridgeService } from '../../../shared/services/data-bridge.service';
import { environment } from '../../../../environments/environment';
import { AppConfig } from '../../../config/app.config';
import { ConfigurationForm, SharedService } from '../../../shared/services/shared.service';


@Component({
  selector: 'app-edit-account-multisign',
  templateUrl: './edit-account-multisign.component.html',
  styleUrls: ['./edit-account-multisign.component.css']
})
export class EditAccountMultisignComponent implements OnInit, OnDestroy {

  accountInfo: AccountsInfoInterface = null;
  accountEditSign: Account;
  accountToConvertSign: Account;
  accountValid: boolean;
  aggregateTransaction: AggregateTransaction;
  ban: any;
  blockSend: boolean;
  configurationForm: ConfigurationForm = {};
  currentAccount: any;
  currentAccountToConvert: AccountsInterface;
  cosignatoryList: CosignatoryList[] = [];
  consginerFirmList: ConsginerFirmList[] = [];
  consginerFirmName: string;
  consginerFirmAccount: ConsginerFirmList;
  consginerFirmAccountList: ConsginerFirmList[] = [];
  disable: boolean;
  editAccountMultsignForm: FormGroup;
  feeTransaction = 44500;
  feeLockfund = 10000000;
  fee: number;
  infoBalance: InfoBalance;
  isDisabledList: boolean;
  isMultisig: boolean;
  listContact: ContactsListInterface[] = [];
  limitSelect: number = 0
  minApprovaMaxLength = 1;
  minApprovaMinLength = 1;
  minRemoveMaxLength = 1;
  minRemoveMinLength = 1;
  mdbBtnAddCosignatory: boolean;
  otherCosignatorieList: ConsginerFirmList[] = [];
  otherConsginerFirmAccountList: ConsginerFirmList[] = [];
  publicAccountEdit: PublicAccount;
  publicAccountToConvert: PublicAccount;
  paramsHeader: HeaderServicesInterface = {
    componentName: 'Edit Account Multisig',
    moduleName: 'Accounts > Multisign'
  };
  routes = {
    backToService: `/${AppConfig.routes.service}`,
    convertToAccount: `/${AppConfig.routes.convertToAccountMultisign}`,
    editAccount: `/${AppConfig.routes.editAccountMultisign}/`
  };
  searchContact: boolean;
  showConsginerFirmList: boolean;
  showContacts: boolean;
  showLockfund: boolean;
  showSignCosignatory: boolean;
  signCosignatory: ConsginerFirmList;
  signType: number = 0
  subscribe: Subscription[] = [];
  subscribeAccount: Subscription[] = [];
  subscribeAccountContat: Subscription;
  subscribeAggregateBonded: Subscription[] = [];
  totalFee = 0;
  transactionHttp: TransactionHttp;
  typeTx: TypeTx;
  valueValidateAccount: validateBuildAccount = {
    disabledItem: false,
    disabledPartial: false,
    info: '',
    subInfo: ''
  };

  constructor(
    private activateRoute: ActivatedRoute,
    private fb: FormBuilder,
    private sharedService: SharedService,
    private walletService: WalletService,
    private multiSignService: MultiSignService,
    private serviceModuleService: ServicesModuleService,
    private proximaxProvider: ProximaxProvider,
    private nodeService: NodeService,
    private transactionService: TransactionsService,
    private dataBridge: DataBridgeService,
    private router: Router,
  ) {
    this.accountValid = false;
    this.ban = false;
    this.configurationForm = this.sharedService.configurationForm;
    this.cosignatoryList = [];
    this.infoBalance = {
      disabled: false,
      info: ''
    }
    this.isMultisig = false;
    this.isDisabledList = false;
    this.mdbBtnAddCosignatory = true;
    this.showConsginerFirmList = false;
    this.showContacts = false;
    this.showLockfund = true;
    this.showSignCosignatory = false
    this.totalFee = this.feeTransaction;
    this.transactionHttp = new TransactionHttp(environment.protocol + '://' + `${this.nodeService.getNodeSelected()}`);
    this.typeTx = { type: 1, transactionType: TransactionType.AGGREGATE_BONDED };
  }

  ngOnInit() {
    this.createForm();
    this.selectCosignatorieSign();
    this.selectOtherCosignatorieSign()
    this.booksAddress();
    this.subscribeValueChange();
    this.changeformStatus();
    this.selectAccount(this.activateRoute.snapshot.paramMap.get('name'));
    this.builder();
  }

  /**
   *
   * @memberof EditAccountMultisignComponent
   */
  ngOnDestroy(): void {
    this.unsubscribe(this.subscribeAggregateBonded);
    this.unsubscribe(this.subscribeAccount);
  }

  /**
   *
   *
   * @memberof EditAccountMultisignComponent
   *  @param {SignedTransaction} signedTransaction  - Signed transaction.
   */
  announceAggregateBonded(signedTransaction: SignedTransaction) {
    this.transactionHttp.announceAggregateBonded(signedTransaction).subscribe(
      async () => {
        this.getTransactionStatus(signedTransaction);
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
   * @memberof EditAccountMultisignComponent
   *  @param {SignedTransaction} signedTransaction  - Signed transaction.
   */
  announceAggregateComplete(signedTransaction: SignedTransaction) {
    this.transactionHttp.announce(signedTransaction).subscribe(
      async () => {
        this.getTransactionStatus(signedTransaction);
      },
      err => {
        this.sharedService.showError('', err);
        this.clearForm();
        this.blockSend = false;
      });
  }

  /**
   *
   * @memberof EditAccountMultisignComponent
   *  @param {String} amount  -
   */
  amountFormatterSimple(amount): string {
    return this.transactionService.amountFormatterSimple(amount);
  }

  /**
   * Add cosignatory to the board
   * @memberof CreateMultiSignatureComponent
   */

  async addCosignatory() {
    if (this.editAccountMultsignForm.get('cosignatory').valid) {
      this.showContacts = false;
      this.searchContact = true;
      const cosignatory: PublicAccount = PublicAccount.createFromPublicKey(
        this.editAccountMultsignForm.get('cosignatory').value,
        this.walletService.currentAccount.network
      );

      let isMultisig: MultisigAccountInfo = null;
      let valueIsMultisig = false;
      try {
        isMultisig = await this.proximaxProvider.getMultisigAccountInfo(cosignatory.address).toPromise();
      } catch (error) {
        isMultisig = null;
      }
      this.searchContact = false;
      if (isMultisig) {
        valueIsMultisig = isMultisig.isMultisig();
      }

      if (valueIsMultisig) {
        return this.sharedService.showWarning('', 'Account is Multisig');
      }
      // Cosignatory needs a public key
      // if (!this.cosignatoryPubKey) return this._Alert.cosignatoryhasNoPubKey();

      // Multisig cannot be cosignatory
      if (this.publicAccountToConvert.address.plain() === cosignatory.address.plain()) {
        return this.sharedService.showError('', 'A multisig account cannot be set as cosignatory');
      }
      // Check presence in cosignatory List array
      if (!Boolean(this.cosignatoryList.find(item => { return item.publicAccount.address.plain() === cosignatory.address.plain(); }))) {

        this.cosignatoryList.push({ publicAccount: cosignatory, action: 'Add', type: 1, disableItem: false, id: cosignatory.address });
        this.setCosignatoryList(this.cosignatoryList, false);
        this.editAccountMultsignForm.get('cosignatory').patchValue('');
      } else {
        this.sharedService.showError('', 'Cosignatory is already present in modification list');
      }
      this.builder();
    }
  }

  /**
   *
   * @returns {ContactsListInterface[]}
   * @memberof EditAccountMultisignComponent
   */
  booksAddress(): ContactsListInterface[] {
    const data = [];
    const bookAddress: ContactsListInterface[] = this.serviceModuleService.getBooksAddress();
    if (bookAddress !== undefined && bookAddress !== null) {
      for (const x of bookAddress) {
        data.push(x);
      }
      return data;
    }
  }

  /**
   *
   * @param {AccountsInterface[]} accounts  -
   * @returns {ConsginerFirmList[]}
   * @memberof EditAccountMultisignComponent
   */
  buildCosignerList(accounts: AccountsInterface[]): ConsginerFirmList[] {
    let list: ConsginerFirmList[] = []
    for (let index = 0; index < accounts.length; index++) {
      const publicAccount: PublicAccount = PublicAccount.createFromPublicKey(accounts[index].publicAccount.publicKey, accounts[index].network);
      if (this.accountInfo.multisigInfo.hasCosigner(publicAccount)) {
        const accountFiltered: AccountsInfoInterface = this.walletService.filterAccountInfo(accounts[index].name);
        const infValidate = this.transactionService.validateBalanceCosignatorie(accountFiltered, Number(this.feeTransaction)).infValidate;
        list.push({
          label: accounts[index].name,
          value: accounts[index].address,
          disabled: infValidate[0].disabled,
          info: infValidate[0].info,
          account: accounts[index]
        });
      }
    }

    return list
  }

  pushOtherConsginerFirmList(id: []): ConsginerFirmList[] {

    const value: ConsginerFirmList[] = [];
    if (id) {
      id.forEach((v, index) => {
        this.otherCosignatorieList.forEach(item => {
          if (v === item.value) {
            value.push(item);
          }
        });

      });
    }
    return value;
  }


  /**
   *
   * @memberof EditAccountMultisignComponent
   */
  builder() {
    this.infoBalance = { disabled: false, info: '' }
    if (!this.consginerFirmAccount)
      return
    const consginerFirmAccountList = this.updateConsginerFirmList([this.consginerFirmAccount], this.otherConsginerFirmAccountList)
    console.debug('consginer Firm Account List:', consginerFirmAccountList)
    this.typeTx = this.multiSignService.typeSignTxEdit(this.getCosignatoryListFilter(1, 2), this.accountInfo.multisigInfo, consginerFirmAccountList, this.walletService.currentWallet.accounts, this.signType)
    if (this.typeTx.transactionType === TransactionType.AGGREGATE_BONDED) {
      this.totalFee = this.feeTransaction + this.feeLockfund;
      this.showLockfund = true
      const cosignatorySign = this.consginerFirmAccount
      if (cosignatorySign) {
        this.infoBalance = this.validateBalanceCosignatorySign(cosignatorySign.account, this.totalFee)
      }
    } else {
      this.totalFee = this.feeTransaction
      this.showLockfund = false
    }
    const innerTransaction = [{
      signer: this.currentAccountToConvert.publicAccount, tx: this.modifyMultisigAccountTransaction()
    }]
    this.aggregateTransaction = this.multiSignService.aggregateTransactionType(innerTransaction, this.typeTx, this.currentAccountToConvert)
    this.fee = this.aggregateTransaction.maxFee.compact();
  }

  /**
   *
   * @memberof EditAccountMultisignComponent
   *  @param {any} value  -
   */
  cleanArray(value: any) {
    const newArray = new Array();
    for (let i = 0, j = value.length; i < j; i++) {
      if (value[i]) {
        newArray.push(value[i]);
      }
    }
    return newArray;
  }

  /**
   *
   * @memberof EditAccountMultisignComponent
   */
  createForm() {
    // Form create multisignature default
    this.editAccountMultsignForm = this.fb.group({
      cosignatory: [''],
      cosignatorieSign: [''],
      otherCosignatorie: [''],
      contact: [''],
      minApprovalDelta: [1, [
        Validators.required, Validators.minLength(this.minApprovaMinLength),
        Validators.maxLength(this.minApprovaMaxLength)]],
      minRemovalDelta: [1, [
        Validators.required, Validators.minLength(this.minRemoveMaxLength),
        Validators.maxLength(this.minRemoveMaxLength)]],
      password: ['', [
        Validators.required,
        Validators.minLength(this.configurationForm.passwordWallet.minLength),
        Validators.maxLength(this.configurationForm.passwordWallet.maxLength)
      ]
      ],
    });
  }

  /**
  * @memberof EditAccountMultisignComponent
  */
  changeformStatus() {
    this.editAccountMultsignForm.statusChanges.subscribe(res => {
      this.validatorsCosignatory();
    });
  }

  /**
   * Clean select content - defined empty by default
   * @param {any} item
   * @memberof EditAccountMultisignComponent
   */
  clearItemSelect(item: any) {

  }

  /**
   * @param {boolean} transactionReady -
   * @memberof EditAccountMultisignComponent
   */
  clearForm(transactionReady: boolean = false) {
    if (transactionReady) {
      this.isDisabledList = true;
      this.editAccountMultsignForm.disable();
      this.isDisabledList = true;
      this.publicAccountToConvert = undefined;
      this.mdbBtnAddCosignatory = true;
    }
    if (!transactionReady) {
      this.setValueForm('edit', true, 3);
    }
    this.showContacts = false;
    this.editAccountMultsignForm.reset({
      cosignatory: '',
      cosignatorieSign: '',
      otherCosignatorie: '',
      contact: '',
      minApprovalDelta: 1,
      minRemovalDelta: 1,
      password: ''
    }, {
        emitEvent: false
      }
    );
  }

  /**
  * Delete cosignatory to the cosignatory List
  * @memberof CreateMultiSignatureComponent
  * @param {Address} id  - Address in cosignatory.
  * @param {Boolean} disableItem
  * @param {number} type
  */
  deleteCosignatory(id: Address, disableItem: boolean, type: number) {
    if (!disableItem) {
      const cosignatoryList = this.cosignatoryList.filter(item => item.id.plain() !== id.plain());
      this.setCosignatoryList(cosignatoryList, true);
    } else {
      this.cosignatoryList.filter(item => item.action === 'edit').map((item: CosignatoryList) => {
        item.type = 3;
      });
      this.cosignatoryList.filter(item => item.id.plain() === id.plain()).map((item: CosignatoryList) => {
        item.type = (type === 3) ? 2 : 3;
      });

      this.setCosignatoryList(this.cosignatoryList, true);
    }
    this.builder();
    this.validatorsCosignatory()
  }

  /**
   *
   *
   * @memberof EditAccountMultisignComponent
   */
  editIntoMultisigTransaction() {
    if (this.editAccountMultsignForm.valid && this.cosignatoryList.length > 0 && !this.blockSend) {
      console.debug('entron entro')
      if (this.infoBalance.disabled)
        return this.sharedService.showWarning('LockFund', this.infoBalance.info);
      this.blockSend = true;
      let common: any = { password: this.editAccountMultsignForm.get('password').value };
      if (this.walletService.decrypt(common, this.consginerFirmAccount.account)) {
        const accountToConvertSign = Account.createFromPrivateKey(common.privateKey, this.consginerFirmAccount.account.network);
        let myCosigners: AccountsInterface[] = []
        let otherCosigners: AccountsInterface[] = []
        if (this.signType === 1) {
          myCosigners = this.multiSignService.myCosigners(this.getCosignatoryListFilter(1, 2), this.walletService.currentWallet.accounts).filter(item => item.address !== this.consginerFirmAccount.account.address)
        } else {
          myCosigners = this.otherConsginerFirmAccountList.map(key => key.account)
          otherCosigners = this.filterArrayUnic(this.multiSignService.myCosigners(this.getCosignatoryListFilter(1, 1), this.walletService.currentWallet.accounts).filter(item => item.address !== this.consginerFirmAccount.account.address), myCosigners, 'address')

        }
        const AccountMyCosigners: Account[] = [];
        if (myCosigners.length > 0) {
          for (let item of myCosigners) {
            if (this.walletService.decrypt(common, item)) {
              AccountMyCosigners.push(Account.createFromPrivateKey(common.privateKey, item.network))
            }
          }
        }
        if (otherCosigners.length > 0) {
          for (let item of otherCosigners) {
            if (this.walletService.decrypt(common, item)) {
              AccountMyCosigners.push(Account.createFromPrivateKey(common.privateKey, item.network))
            }
          }
        }
        common = '';
        console.debug('consginerFirmAccount', this.consginerFirmAccount)
        console.debug('AccountMyCosigners', AccountMyCosigners)
        console.debug('accountToConvertSign', accountToConvertSign)
        console.debug('typeCosi', this.signType)
        console.debug('this.typeTx.transactionType', this.typeTx.transactionType)
        const signedTransaction = this.multiSignService.signedTransaction(
          accountToConvertSign,
          this.aggregateTransaction,
          this.dataBridge.blockInfo.generationHash,
          AccountMyCosigners)

        if (this.typeTx.transactionType === TransactionType.AGGREGATE_BONDED) {
          const hashLockSigned = this.transactionService.buildHashLockTransaction(signedTransaction, accountToConvertSign, this.dataBridge.blockInfo.generationHash)
          this.hashLock(hashLockSigned, signedTransaction)
        } else {
          this.announceAggregateComplete(signedTransaction)
        }

        // setTimeout(() => {
        //   this.blockSend = false;
        // }, 1000);

      } else {
        this.blockSend = false;
      }
    }
  }
  /**
   * Array of duplicated filters
   * @memberof CreateMultiSignatureComponent
   * @param {Array<object>} value1  - Address in cosignatory.
   * @param {Array<object>} value2
   * @param {string} key
   */
  filterArrayUnic(value1: any, value2: any, key: string) {
    let newArray = new Array();
    for (let item of value1) {
      let ban = false
      for (let i of value2) {
        if (i[key] == item[key]) {
          ban = true
          break
        }
      }
      if (!ban)
        newArray.push(item)
    }
    return newArray
  }

  // TransactionType.MODIFY_MULTISIG_ACCOUNT
  getAggregateBondedTransactionsValidate() {
    this.subscribeAggregateBonded.push(this.transactionService.getAggregateBondedTransactions$().subscribe((transactions: TransactionsInterface[]) => {
      let value = false;
      this.valueValidateAccount = {
        disabledItem: false,
        disabledPartial: false,
        info: null,
        subInfo: null
      };

      for (let index = 0; index < transactions.length; index++) {
        for (let i = 0; i < transactions[index].data['innerTransactions'].length; i++) {
          value = (transactions[index].data['innerTransactions'][i].signer.publicKey === this.currentAccountToConvert.publicAccount.publicKey);
          if (value) {
            this.valueValidateAccount = {
              disabledItem: value,
              disabledPartial: value,
              info: 'Partial',
              subInfo: `You cannot edit an account that has a partial transaction pending (<i title="partially" style="padding-right: 0px;"
            class="fa fa-bell color-light-orange"></i>).`
            };
            break;
          }
        }
        if (value) {
          break;
        }
      }
      this.validateAccount(this.activateRoute.snapshot.paramMap.get('name'), this.valueValidateAccount);
    }));

  }
  /**
  *
  *
  * @param {number} type
  * @param {number} orType
  * @returns {CosignatoryList[]}
  * @memberof EditAccountMultisignComponent
  */
  getCosignatoryListFilter(type: number, orType: number): CosignatoryList[] {
    return this.cosignatoryList.filter(item => item.type === type || item.type === orType);

  }

  /**
   * Get cosignatory list add and remove
   * @memberof CreateMultiSignatureComponent
   * @return {CosignatoryList} list cosignatory
   */
  getCosignatoryList(): CosignatoryList[] {
    return this.cosignatoryList;
  }

  getColor(type) {
    switch (type) {
      case 1:
        return 'green';
      case 2:
        return 'red';
      case 3:
        return 'gray';
    }
  }

  getColorCosignatory(type) {
    switch (type) {
      case true:
        return 'white';
      case false:
        return 'gray';
    }
  }
  /**
   *
   *
   * @memberof CreateMultiSignatureComponent
   *  @param {SignedTransaction} signedTransaction  - Signed transaction.
   */
  getTransactionStatushashLock(signedTransactionHashLock: SignedTransaction, signedTransactionBonded: SignedTransaction) {
    // Get transaction status
    this.subscribe['transactionStatus'] = this.dataBridge.getTransactionStatus().subscribe(
      statusTransaction => {
        if (statusTransaction !== null && statusTransaction !== undefined && signedTransactionHashLock !== null) {
          const match = statusTransaction['hash'] === signedTransactionHashLock.hash;
          if (statusTransaction['type'] === 'confirmed' && match) {
            setTimeout(() => {
              this.announceAggregateBonded(signedTransactionBonded);
              signedTransactionHashLock = null;
            }, environment.delayBetweenLockFundABT);
          } else if (statusTransaction['type'] === 'unconfirmed' && match) {
          } else if (match) {
            this.clearForm();
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
   * @param {SignedTransaction} signedTransaction
   * @memberof EditAccountMultisignComponent
   */
  getTransactionStatus(signedTransaction: SignedTransaction) {
    // Get transaction status
    this.subscribe['transactionStatus'] = this.dataBridge.getTransactionStatus().subscribe(
      statusTransaction => {
        // this.blockSend = false;
        if (statusTransaction !== null && statusTransaction !== undefined && signedTransaction !== null) {
          const match = statusTransaction['hash'] === signedTransaction.hash;
          if (match) {
            this.clearForm(true);
            this.blockSend = false;
          }
          // CONFIRMED
          if (statusTransaction['type'] === 'confirmed' && match) {
            signedTransaction = null;
          }
          // UNCONFIRMED
          else if (statusTransaction['type'] === 'unconfirmed' && match) {
            this.transactionService.searchAccountsInfo([this.currentAccountToConvert]);
            signedTransaction = null;
          }
          // AGGREGATE BONDED ADDED
          else if (statusTransaction['type'] === 'aggregateBondedAdded' && match) {
            this.transactionService.searchAccountsInfo([this.currentAccountToConvert]);
            signedTransaction = null;
          }
          // MATCH
          else if (match) {
            this.clearForm();
            this.blockSend = false;
            signedTransaction = null;
          }
        }
      }
    );
  }

  // @param {LockFundsTransaction} lockFundsTransaction  - lock funds transaction.
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
    this.transactionHttp
      .announce(hashLockTransactionSigned)
      .subscribe(
        async () => {
          this.getTransactionStatushashLock(hashLockTransactionSigned, signedTransaction);
          // this.blockSend = false;
        },
        err => {
          this.clearForm();
          this.blockSend = false;
          this.sharedService.showError('', err);
        });

  }

  hasCosigner(): boolean {
    let isCosigner = false;
    let consigner: number = 0
    for (let index = 0; index < this.walletService.currentWallet.accounts.length; index++) {
      const publicAccount: PublicAccount = PublicAccount.createFromPublicKey(this.walletService.currentWallet.accounts[index].publicAccount.publicKey, this.walletService.currentWallet.accounts[index].network);
      if (this.accountInfo.multisigInfo.hasCosigner(publicAccount)) {
        consigner++
      }
    }
    if (consigner == 1) {
      this.showConsginerFirmList = false;
      this.editAccountMultsignForm.controls['cosignatorieSign'].setValidators(null);
    }
    if (consigner > 1) {
      this.showConsginerFirmList = true;
      this.editAccountMultsignForm.controls['cosignatorieSign'].setValidators([Validators.required]);
    }
    this.editAccountMultsignForm.controls['cosignatorieSign'].updateValueAndValidity({ emitEvent: false, onlySelf: true });
    isCosigner = (consigner > 0) ? true : false

    if (!isCosigner) {
      this.valueValidateAccount = {
        disabledItem: true,
        disabledPartial: false,
        info: '',
        subInfo: `Requires a valid cosigner to edit this account.`
      };
    }
    return isCosigner;
  }

  /**
   *
   *
   * @param {number} minRemoval
   * @param {number} minApprova
   * @returns
   * @memberof EditAccountMultisignComponent
   */
  isMultisigValidate(minRemoval: number, minApprova: number) {
    return minRemoval !== 0 && minApprova !== 0;
  }

  /**
   *
   *
   * @param {AccountsInterface} accounts
   * @returns {boolean}
   * @memberof EditAccountMultisignComponent
   */
  isMultisign(accounts: AccountsInterface): boolean {
    return Boolean(
      accounts.isMultisign !== undefined && accounts.isMultisign !== null &&
      this.isMultisigValidate(accounts.isMultisign.minRemoval, accounts.isMultisign.minApproval)
    );
  }

  iswalletContact(label: string): boolean {
    const value: boolean[] = this.listContact.filter(item => item.label === label).map((item: ContactsListInterface) => {
      return item.walletContact;
    });
    return value[0];
  }

  modifyMultisigAccountTransaction(): ModifyMultisigAccountTransaction {
    let modifyobject: Modifyobject;
    const valor = this.multiSignService.calcMinDelta(
      this.accountInfo.multisigInfo.minApproval,
      this.accountInfo.multisigInfo.minRemoval,
      this.editAccountMultsignForm.get('minApprovalDelta').value,
      this.editAccountMultsignForm.get('minRemovalDelta').value
    );
    modifyobject = {
      deadline: Deadline.create(environment.deadlineTransfer.deadline, environment.deadlineTransfer.chronoUnit),
      minApprovalDelta: valor['minApprovalDelta'],
      minRemovalDelta: valor['minRemovalDelta'],
      modifications: this.multisigCosignatoryModification(this.getCosignatoryListFilter(1, 2)),
      networkType: this.currentAccountToConvert.network
    };

    return this.proximaxProvider.buildModifyMultisigAccountTransaction(
      modifyobject.minApprovalDelta,
      modifyobject.minRemovalDelta,
      modifyobject.modifications,
      modifyobject.networkType
    );

  }

  /**
  *
  *
  * @param {CosignatoryList[]} cosignatoryList
  * @returns {MultisigCosignatoryModification[]}
  * @memberof EditAccountMultisignComponent
  */
  multisigCosignatoryModification(cosignatoryList: CosignatoryList[]): MultisigCosignatoryModification[] {
    const cosignatory = [];
    if (cosignatoryList.length > 0) {
      // tslint:disable-next-line: prefer-for-of
      for (let index = 0; index < cosignatoryList.length; index++) {
        const element = cosignatoryList[index];
        const type: MultisigCosignatoryModificationType = (cosignatoryList[index].type === 1) ?
          MultisigCosignatoryModificationType.Add : MultisigCosignatoryModificationType.Remove;
        cosignatory.push(
          new MultisigCosignatoryModification(
            type,
            cosignatoryList[index].publicAccount,
          )
        );
      }

    }
    return cosignatory;
  }

  /**
  *
  *
  * @param {*} e
  * @returns
  * @memberof EditAccountMultisignComponent
  */
  preventNumbers(e) {
    if (e.keyCode >= 48 && e.keyCode <= 57) {
      // we have a number
      return false;
    }
  }

  /**
   *
   *
   * @param {string} name
   * @memberof EditAccountMultisignComponent
   */
  selectAccount(name: string) {
    this.listContact = this.booksAddress();
    this.currentAccountToConvert = this.walletService.filterAccountWallet(name);
    this.listContact = this.validateAccountListContact();

    this.booksAddress().filter(item => item.label !== this.currentAccountToConvert.name);
    this.subscribeAccount.push(this.walletService.getAccountsInfo$().subscribe(
      async accountInfo => {
        this.getAggregateBondedTransactionsValidate();

      }));
    // this.clearData();
  }

  updateConsginerFirmList(array1: ConsginerFirmList[], array2: ConsginerFirmList[]): ConsginerFirmList[] {
    const value: ConsginerFirmList[] = [];
    for (let item of array1) {
      value.push(item)
    }
    for (let item of array2) {
      value.push(item)
    }
    return value
  }

  builderOtherCosignatorie(id) {
    if (id) {
      this.otherCosignatorieList = this.consginerFirmList.filter(item => item.value !== id)
    }
  }

  /**
   *
   * @memberof EditAccountMultisignComponent
   */
  selectCosignatorieSign() {
    this.editAccountMultsignForm.get('cosignatorieSign').valueChanges.subscribe(
      id => {
        this.showSignCosignatory = false;
        this.editAccountMultsignForm.get('otherCosignatorie').setValue('', {
          emitEvent: false
        })
        // this.consginerFirmAccountList = this.pushConsginerFirmList(id)
        const signCosignatory = this.consginerFirmList.find(item => item.value === id)
        if (signCosignatory) {
          this.showSignCosignatory = true;
          this.consginerFirmAccount = signCosignatory;
        }
        this.builderOtherCosignatorie(id)
        this.builder()
      }
    );
  }

  /**
   *
   * @memberof EditAccountMultisignComponent
   */
  selectOtherCosignatorieSign() {
    this.editAccountMultsignForm.get('otherCosignatorie').valueChanges.subscribe(
      id => {
        this.otherConsginerFirmAccountList = []
        this.otherConsginerFirmAccountList = this.pushOtherConsginerFirmList(id)
        this.builder()
      }
    );
  }

  setValueForm(action: string, disableItem: boolean, type: number) {
    const consignatarioList: CosignatoryList[] = [];
    for (const element of this.accountInfo.multisigInfo.cosignatories) {
      consignatarioList.push({ publicAccount: element, action: action, type: type, disableItem: disableItem, id: element.address });
    }
    this.editAccountMultsignForm.get('minApprovalDelta').patchValue(this.accountInfo.multisigInfo.minApproval, { emitEvent: false, onlySelf: true });
    this.editAccountMultsignForm.get('minRemovalDelta').patchValue(this.accountInfo.multisigInfo.minRemoval, { emitEvent: false, onlySelf: true });
    this.setCosignatoryList(consignatarioList, false);
  }

  /**
  *
  *
  * @param {CosignatoryList[]} cosignatoryListParam
  * @param {boolean} validDelta
  * @memberof EditAccountMultisignComponent
  */
  setCosignatoryList(cosignatoryListParam: CosignatoryList[], validDelta: boolean) {
    this.cosignatoryList = cosignatoryListParam;
    this.validatorsMinApprovalDelta();
    this.validatorsMinRemovalDelta();
    this.validatorsCosignatory();

  }

  /**
   *
   *
   * @memberof EditAccountMultisignComponent
   */
  subscribeValueChange() {
    // Cosignatory ValueChange
    this.editAccountMultsignForm.get('cosignatory').valueChanges.subscribe(
      next => {
        if (next !== null && next !== undefined) {

        }
        this.validatorsCosignatory();
      }
    );
    this.editAccountMultsignForm.get('minApprovalDelta').valueChanges.subscribe(
      next => {
        this.builder();
      }
    );
    this.editAccountMultsignForm.get('minRemovalDelta').valueChanges.subscribe(
      next => {
        this.builder();
      }
    );
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
   * @param {string} [nameInput='']
   * @param {string} [nameControl='']
   * @param {string} [nameValidation='']
   * @returns
   * @memberof EditAccountMultisignComponent
   */
  validateInput(nameInput: string = '', nameControl: string = '', nameValidation: string = '') {
    let validation: AbstractControl = null;
    if (nameInput !== '' && nameControl !== '') {
      validation = this.editAccountMultsignForm.controls[nameControl].get(nameInput);
    } else if (nameInput === '' && nameControl !== '' && nameValidation !== '') {
      validation = this.editAccountMultsignForm.controls[nameControl].getError(nameValidation);
    } else if (nameInput !== '') {
      validation = this.editAccountMultsignForm.get(nameInput);
    }
    return validation;
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
    if (this.cosignatoryList.length > 0 && (this.editAccountMultsignForm.get('cosignatory').value === null
      || this.editAccountMultsignForm.get('cosignatory').value === undefined
      || this.editAccountMultsignForm.get('cosignatory').value === '')) {
      this.editAccountMultsignForm.controls['cosignatory'].setValidators(null);
    } else {
      this.editAccountMultsignForm.controls['cosignatory'].setValidators(validators);
    }
    this.editAccountMultsignForm.controls['cosignatory'].updateValueAndValidity({ emitEvent: false });
  }

  /**
  *
  *
  * @returns {ContactsListInterface[]}
  * @memberof EditAccountMultisignComponent
  */
  validateAccountListContact(): ContactsListInterface[] {
    const listContactReturn: ContactsListInterface[] = [];
    const listContactfilter = this.booksAddress().filter(item => item.label !== this.currentAccountToConvert.name);
    for (const element of listContactfilter) {
      const account = this.walletService.filterAccountWallet(element.label);
      let isMultisig = false;
      if (account) {
        isMultisig = this.isMultisign(account);
      }

      listContactReturn.push({
        label: element.label,
        value: element.value,
        walletContact: element.walletContact,
        isMultisig,
        disabled: Boolean(isMultisig && element.walletContact)
      });
    }

    return listContactReturn;
  }

  /**
   *
   * @param name
   */
  validateAccount(name: string, validateBuildAccount: validateBuildAccount) {
    this.isMultisig = false;
    this.mdbBtnAddCosignatory = true;
    this.accountInfo = this.walletService.filterAccountInfo(name);
    this.accountValid = (
      this.accountInfo !== null &&
      this.accountInfo !== undefined && this.accountInfo.accountInfo !== null);

    this.unsubscribe(this.subscribeAccount);
    // Validate Account
    if (!this.accountValid) {
      this.validateInfoisMultisig(this.accountValid);
      return;
    }
    // Validate Multisign
    this.isMultisig = (this.accountInfo.multisigInfo !== null && this.accountInfo.multisigInfo !== undefined && this.accountInfo.multisigInfo.isMultisig());
    this.validateInfoisMultisig(this.isMultisig);
    // Validate Balance
    if (!this.accountInfo.accountInfo.mosaics.find(next => next.id.toHex() === environment.mosaicXpxInfo.id)) {
      return this.sharedService.showError('', 'Insufficient Balance');
    }
    //validate actual  consginerFirmList
    if (this.hasCosigner() && !validateBuildAccount.disabledItem) {
      this.consginerFirmList = []
      this.consginerFirmList = this.buildCosignerList(this.walletService.currentWallet.accounts)
      if (this.consginerFirmList.length === 1) {
        this.signType = 1;
        this.consginerFirmAccount = this.consginerFirmList[0]
      } else {
        this.signType = 2;
      }
      this.limitSelect = this.validateLimitSelect(this.accountInfo.multisigInfo)
      this.publicAccountToConvert = PublicAccount.createFromPublicKey(this.currentAccountToConvert.publicAccount.publicKey, this.currentAccountToConvert.network);
      this.mdbBtnAddCosignatory = false;
      this.setValueForm('edit', true, 3);
      this.editAccountMultsignForm.enable();
      this.isDisabledList = false;
    } else {
      this.mdbBtnAddCosignatory = true;
      this.setValueForm('view', true, 3);
      this.editAccountMultsignForm.disable();
      this.isDisabledList = true;
    }
  }

  /**
  *
  *
  * @param {MultisigAccountInfo} accountInfoMultisign
  * @memberof EditAccountMultisignComponent
  */
  validateLimitSelect(accountInfoMultisign: MultisigAccountInfo): number {
    if (accountInfoMultisign.minApproval >= accountInfoMultisign.minRemoval) {
      return accountInfoMultisign.minApproval
    } else {
      return accountInfoMultisign.minRemoval
    }
  }

  /**
  *
  *
  * @param {boolean} isMultisig
  * @memberof EditAccountMultisignComponent
  */
  validateInfoisMultisig(isMultisig: boolean) {
    if (!isMultisig) {
      this.sharedService.showError('', 'Not is multisig');
      this.router.navigate([`/${AppConfig.routes.MultiSign}`]);
    }
  }

  /**
   *
   *
   * @param {number} balanceAccount
   * @returns {boolean}
   * @memberof EditAccountMultisignComponent
   */
  validateBuildSelectAccountBalance(balanceAccount: number): boolean {
    const totalFee = this.feeLockfund + this.feeTransaction;
    return (balanceAccount >= this.totalFee);

  }
  /**
   *
   *
   * @param {AccountsInterface} accounts
   * @returns {boolean}
   * @memberof EditAccountMultisignComponent
   */
  validateBalanceCosignatorySign(accounts: AccountsInterface, totalFee: number): InfoBalance {
    return this.transactionService.validateBalanceCosignatorie(this.walletService.filterAccountInfo(accounts.name), totalFee).infValidate[0]
  }

  /**
   *
   *
   * @param {*} event
   * @memberof CreateMultiSignatureComponent
   */
  async selectContact(event: { label: string, value: string }) {
    this.editAccountMultsignForm.get('cosignatory').patchValue('', { emitEvent: false, onlySelf: true });
    // this.editAccountMultsignForm.get('contact').patchValue('', { emitEvent: false, onlySelf: true });
    if (event !== undefined && event.value !== '') {
      if (!this.iswalletContact(event.label)) {
        this.searchContact = true;
        this.editAccountMultsignForm.get('cosignatory').patchValue('', { emitEvent: false, onlySelf: true });
        this.proximaxProvider.getAccountInfo(Address.createFromRawAddress(event.value)).subscribe((res: AccountInfo) => {
          this.searchContact = false;
          if (res.publicKeyHeight.toHex() === '0000000000000000') {
            this.sharedService.showWarning('', 'Cosignatory does not have a public key');

            this.editAccountMultsignForm.get('cosignatory').patchValue('', { emitEvent: false, onlySelf: true });
            this.editAccountMultsignForm.get('contact').patchValue('', { emitEvent: false, onlySelf: true });
            // this.showContacts = false;
          } else {
            this.editAccountMultsignForm.get('cosignatory').patchValue(res.publicKey, { emitEvent: true });
            this.editAccountMultsignForm.get('contact').patchValue('', { emitEvent: false, onlySelf: true });
          }
        }, err => {
          this.editAccountMultsignForm.get('contact').patchValue('', { emitEvent: false, onlySelf: true });
          this.searchContact = false;
          this.sharedService.showWarning('', 'Address is not valid');
        });
      } else {
        const account = this.walletService.filterAccountWallet(event.label)
        this.editAccountMultsignForm.get('cosignatory').patchValue(account.publicAccount.publicKey, { emitEvent: true });
        this.editAccountMultsignForm.get('contact').patchValue('', { emitEvent: false, onlySelf: true });
      }
      this.builder();
    }
  }

  /**
   * Change the form validator (minApprovalDelta)
   * @memberof CreateMultiSignatureComponent
   */
  validatorsMinApprovalDelta() {

    this.minApprovaMaxLength = (this.getCosignatoryListFilter(1, 3).length > 0) ? this.getCosignatoryListFilter(1, 3).length : 0;
    const minLength = (this.getCosignatoryListFilter(1, 3).length > 0) ? 1 : 0;
    this.minApprovaMinLength = minLength;

    const validators = [Validators.required,
    Validators.minLength(minLength),
    Validators.maxLength(this.minApprovaMaxLength)];

    while (this.editAccountMultsignForm.get('minApprovalDelta').value > this.minApprovaMaxLength) {
      this.editAccountMultsignForm.get('minApprovalDelta').patchValue(this.editAccountMultsignForm.get('minApprovalDelta').value - 1, { emitEvent: false, onlySelf: true });
    }
    this.editAccountMultsignForm.controls['minApprovalDelta'].setValidators(validators);
    this.editAccountMultsignForm.controls['minApprovalDelta'].updateValueAndValidity({ emitEvent: false, onlySelf: true });
  }

  /**
   *
   *
   * @memberof EditAccountMultisignComponent1/3/2020, 2:59:04 PM - UTC
   */
  validatorsMinRemovalDelta() {
    this.minRemoveMaxLength = (this.getCosignatoryListFilter(1, 3).length > 0) ? this.getCosignatoryListFilter(1, 3).length : 0;
    const minLength = (this.getCosignatoryListFilter(1, 3).length > 0) ? 1 : 0;
    this.minRemoveMinLength = minLength;
    const validators = [Validators.required,
    Validators.minLength(this.minRemoveMinLength),
    Validators.maxLength(this.minRemoveMaxLength)];

    while (this.editAccountMultsignForm.get('minRemovalDelta').value > this.minRemoveMaxLength) {
      this.editAccountMultsignForm.get('minRemovalDelta').patchValue(this.editAccountMultsignForm.get('minRemovalDelta').value - 1, { emitEvent: false, onlySelf: true });
    }

    this.editAccountMultsignForm.controls['minRemovalDelta'].setValidators(validators);
    this.editAccountMultsignForm.controls['minRemovalDelta'].updateValueAndValidity({ emitEvent: false, onlySelf: true });
  }
}

/**
 * Interface to enlist the cosigner in a select
 * @param label - Label of select .
 * @param value  - Select identifier.
 * @param disabled - Select state
 * @param info - Information to show.
 * @param account - selected account.
 * @param signatory - Indicator, true = tx signature, false = not signed
*/
export interface ConsginerFirmList {
  label: string;
  value: any;
  disabled: boolean;
  info: string;
  account: AccountsInterface
}

/**
 * Create a modify multisig account transaction object
 * @param deadline - The deadline to include the transaction.
 * @param minApprovalDelta  - The min approval relative change.
 * @param minRemovalDelta - The min removal relative change.
 * @param modifications - The array of modifications.
 * @param networkType - The network type.
 * @param maxFee - (Optional) Max fee defined by the sender

*/
export interface Modifyobject {
  deadline: Deadline;
  minApprovalDelta: number;
  minRemovalDelta: number;
  modifications: MultisigCosignatoryModification[];
  networkType: NetworkType;
  maxFee?: UInt64;
}
export interface InfoBalance {
  disabled: Boolean,
  info: string
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
  type: number;
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
interface validateBuildAccount {
  disabledItem: boolean;
  disabledPartial: boolean;
  info: string;
  subInfo: string;

}
