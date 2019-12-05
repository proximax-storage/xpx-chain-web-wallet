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
  HashLockTransaction,
  Mosaic,
  MosaicId,
  ModifyMultisigAccountTransaction,
  MultisigCosignatoryModificationType,
  SignedTransaction,
  MultisigAccountInfo
} from 'tsjs-xpx-chain-sdk';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountsInterface, AccountsInfoInterface, WalletService } from '../../../wallet/services/wallet.service';
import { MultiSignService } from '../../../servicesModule/services/multi-sign.service';
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
  editAccountMultsignForm: FormGroup;
  configurationForm: ConfigurationForm = {};
  publicAccountEdit: PublicAccount;
  routes = {
    backToService: `/${AppConfig.routes.service}`,
    convertToAccount: `/${AppConfig.routes.convertToAccountMultisign}`,
    editAccount: `/${AppConfig.routes.editAccountMultisign}/`
  };
  subscribe: Subscription[] = [];
  publicAccountToConvert: PublicAccount;
  minApprovaMaxLength = 1;
  minApprovaMinLength = 1;
  minRemoveMaxLength = 1;
  minRemoveMinLength = 1;
  currentAccount: any;
  currentAccountToConvert: AccountsInterface;
  subscribeAccount: Subscription[] = [];
  accountInfo: AccountsInfoInterface = null;
  accountEditSign: Account;
  accountToConvertSign: Account;
  showConsginerFirmList: boolean;
  accountValid: boolean;
  mdbBtnAddCosignatory: boolean;
  cosignatoryList: CosignatoryList[] = [];
  consginerFirmList: any = [];
  transactionHttp: TransactionHttp;
  listContact: ContactsListInterface[] = [];
  showContacts: boolean;
  isMultisig: boolean;
  searchContact: boolean;
  isDisabledList: boolean;
  blockSend: boolean;
  ban: any;
  consginerFirmName: string;
  consginerFirmAccount: any;
  subscribeAccountContat: Subscription;
  disable: boolean;
  subscribeAggregateBonded: Subscription[] = [];
  paramsHeader: HeaderServicesInterface = {
    moduleName: 'Accounts > Multisign',
    componentName: 'Edit Account Multisig'
  };
  feeTransaction = 44500;
  feeLockfund = 10000000;
  totalFee = 0;
  aggregateTransaction: AggregateTransaction;
  fee: number;
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
    this.totalFee = this.feeTransaction + this.feeLockfund;
    this.showConsginerFirmList = false;
    this.configurationForm = this.sharedService.configurationForm;
    this.accountValid = false;
    this.mdbBtnAddCosignatory = true;
    this.showContacts = false;
    this.cosignatoryList = [];
    this.isMultisig = false;
    this.ban = false;
    this.isDisabledList = false;
    this.transactionHttp = new TransactionHttp(environment.protocol + '://' + `${this.nodeService.getNodeSelected()}`);
  }

  ngOnInit() {
    this.createForm();
    this.booksAddress();
    this.subscribeValueChange();
    this.changeformStatus();
    this.selectAccount(this.activateRoute.snapshot.paramMap.get('name'));
    this.builder();
  }


  /**
   *
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
   */
  createForm() {
    // Form create multisignature default
    this.editAccountMultsignForm = this.fb.group({
      cosignatory: [''],
      cosignatorieSign: [''],
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
   *
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



    if (this.hasCosigner() && !validateBuildAccount.disabledItem) {
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

      // tslint:disable-next-line: prefer-for-of
      for (let index = 0; index < transactions.length; index++) {
        // tslint:disable-next-line: prefer-for-of
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
      // }
      this.validateAccount(this.activateRoute.snapshot.paramMap.get('name'), this.valueValidateAccount);
    }));

  }

  hasCosigner(): boolean {
    let isCosigner = false;
    this.consginerFirmList = [];
    this.consginerFirmName = 'empty';
    this.consginerFirmAccount = null;
    // tslint:disable-next-line: prefer-for-of
    for (let index = 0; index < this.walletService.currentWallet.accounts.length; index++) {
      const publicAccount: PublicAccount = PublicAccount.createFromPublicKey(this.walletService.currentWallet.accounts[index].publicAccount.publicKey,
        this.walletService.currentWallet.accounts[index].publicAccount.address.networkType);
      if (this.accountInfo.multisigInfo.hasCosigner(publicAccount)) {
        // this.consginerFirmName = '';
        this.consginerFirmAccount = this.walletService.currentWallet.accounts[index];

        const accountFiltered: AccountsInfoInterface = this.walletService.filterAccountInfo(this.walletService.currentWallet.accounts[index].name);
        const infValidate = this.transactionService.validateBalanceCosignatorie(accountFiltered, Number(this.totalFee)).infValidate;


        this.consginerFirmList.push({
          label: this.walletService.currentWallet.accounts[index].name,
          value: this.walletService.currentWallet.accounts[index],
          disabled: infValidate[0].disabled,
          info: infValidate[0].info
        });

        isCosigner = this.accountInfo.multisigInfo.hasCosigner(publicAccount);
        // break
      }
      if (this.consginerFirmList.length == 1) {

        isCosigner = (!this.consginerFirmList[0].disabled);

      }

      if (this.consginerFirmList.length > 1) {
        this.showConsginerFirmList = true;
        this.editAccountMultsignForm.controls['cosignatorieSign'].setValidators([Validators.required]);
      } else {
        this.showConsginerFirmList = false;
        this.editAccountMultsignForm.controls['cosignatorieSign'].setValidators(null);
      }
      this.editAccountMultsignForm.controls['cosignatorieSign'].updateValueAndValidity({ emitEvent: false, onlySelf: true });
    }
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
   * @param {*} $event
   * @memberof EditAccountMultisignComponent
   */
  selectCosignatorieSign($event) {
    if ($event) {
      this.consginerFirmAccount = $event.value;
    } else {
      this.consginerFirmAccount = null;
    }
  }


  builder() {
    let convertIntoMultisigTransaction: ModifyMultisigAccountTransaction;
    convertIntoMultisigTransaction = this.modifyMultisigAccountTransaction();
    this.aggregateTransaction = AggregateTransaction.createBonded(
      Deadline.create(environment.deadlineTransfer.deadline, environment.deadlineTransfer.chronoUnit),
      [convertIntoMultisigTransaction.toAggregate(this.currentAccountToConvert.publicAccount)],
      this.currentAccountToConvert.network
    );

    this.fee = this.aggregateTransaction.maxFee.compact();
  }

  /**
   *
   *
   * @memberof EditAccountMultisignComponent
   */
  editIntoMultisigTransaction() {
    if (this.editAccountMultsignForm.valid && this.cosignatoryList.length > 0 && !this.blockSend) {
      this.blockSend = true;
      let common: any = { password: this.editAccountMultsignForm.get('password').value };
      if (this.walletService.decrypt(common, this.consginerFirmAccount)) {
        this.accountToConvertSign = Account.createFromPrivateKey(common.privateKey, this.consginerFirmAccount.network);
        common = '';
        // let convertIntoMultisigTransaction: ModifyMultisigAccountTransaction;
        // convertIntoMultisigTransaction = this.modifyMultisigAccountTransaction();
        // console.log('convertIntoMultisigTransaction', convertIntoMultisigTransaction);

        // const aggregateTransaction = AggregateTransaction.createBonded(
        //   Deadline.create(environment.deadlineTransfer.deadline, environment.deadlineTransfer.chronoUnit),
        //   [convertIntoMultisigTransaction.toAggregate(this.currentAccountToConvert.publicAccount)],
        //   this.currentAccountToConvert.network
        // );

        const generationHash = this.dataBridge.blockInfo.generationHash;
        const signedTransaction = this.accountToConvertSign.sign(this.aggregateTransaction, generationHash);
        const hashLockTransaction = HashLockTransaction.create(
          Deadline.create(environment.deadlineTransfer.deadline, environment.deadlineTransfer.chronoUnit),
          new Mosaic(new MosaicId(environment.mosaicXpxInfo.id), UInt64.fromUint(Number(10000000))),
          UInt64.fromUint(environment.lockFundDuration),
          signedTransaction,
          this.currentAccountToConvert.network
        );
        this.hashLock(this.accountToConvertSign.sign(hashLockTransaction, generationHash), signedTransaction);
      } else {
        this.blockSend = false;
      }
    }
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
    // console.log('modifyobject', modifyobject);

    return ModifyMultisigAccountTransaction.create(
      modifyobject.deadline,
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
   * @memberof CreateMultiSignatureComponent
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
    // this.publicAccountToConvert = undefined;
    // this.isMultisig = false;
    // this.mdbBtnAddCosignatory = true;
    this.showContacts = false;
    this.editAccountMultsignForm.reset({
      cosignatory: '',
      cosignatorieSign: '',
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
  changeformStatus() {
    this.editAccountMultsignForm.statusChanges.subscribe(res => {
      this.validatorsCosignatory();
    }
    );
  }

  iswalletContact(label: string): boolean {
    const value: boolean[] = this.listContact.filter(item => item.label === label).map((item: ContactsListInterface) => {
      return item.walletContact;
    });
    return value[0];
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
        this.subscribeAccountContat = this.walletService.getAccountsInfo$().subscribe(
          async accountInfo => {
            if (accountInfo) {
              const account = this.walletService.filterAccountInfo(event.label);
              const accountValid = (
                account !== null &&
                account !== undefined &&
                account.accountInfo &&
                account.accountInfo.publicKey !== '0000000000000000000000000000000000000000000000000000000000000000'
              );
              if (this.subscribeAccountContat) {
                this.subscribeAccountContat.unsubscribe();
              }
              if (accountValid) {
                this.editAccountMultsignForm.get('cosignatory').patchValue(account.accountInfo.publicKey, { emitEvent: true });
                this.editAccountMultsignForm.get('contact').patchValue('', { emitEvent: false, onlySelf: true });
              } else {
                this.sharedService.showWarning('', 'Cosignatory does not have a public key');
                this.editAccountMultsignForm.get('contact').patchValue('', { emitEvent: false, onlySelf: true });
              }

            } else {
              this.editAccountMultsignForm.get('contact').patchValue('', { emitEvent: false, onlySelf: true });
              this.sharedService.showWarning('', 'Address is not valid');

            }
          }
        );





      }
      this.builder();
    }
  }

  /**
   * Delete cosignatory to the cosignatory List
   * @memberof CreateMultiSignatureComponent
   * @param id  - Address in cosignatory.
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
    this.validatorsCosignatory();
    // this.btnblckfun()
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
   * @memberof EditAccountMultisignComponent
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

  amountFormatterSimple(amount): string {
    return this.transactionService.amountFormatterSimple(amount);
  }
}

/**
 * Create a modify multisig account transaction object
 * @param deadline - The deadline to include the transaction.
 * @param minApprovalDelta - The min approval relative change.
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
