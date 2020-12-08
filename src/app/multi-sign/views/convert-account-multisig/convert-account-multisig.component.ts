import { Component, OnInit, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ModalDirective } from 'ng-uikit-pro-standard';
import { Subscription } from 'rxjs/internal/Subscription';
import { NodeService } from 'src/app/servicesModule/services/node.service';
import { HeaderServicesInterface } from 'src/app/servicesModule/services/services-module.service';
import { DataBridgeService } from 'src/app/shared/services/data-bridge.service';
import { ProximaxProvider } from 'src/app/shared/services/proximax.provider';
import {
  ConfigurationForm,
  SharedService,
} from 'src/app/shared/services/shared.service';
import {
  TransactionsInterface,
  TransactionsService,
} from 'src/app/transactions/services/transactions.service';
import {
  AccountsInterface,
  WalletService,
} from 'src/app/wallet/services/wallet.service';
import { TransactionHttp } from 'tsjs-xpx-chain-sdk/dist/src/infrastructure/TransactionHttp';
import { Account } from 'tsjs-xpx-chain-sdk/dist/src/model/account/Account';
import { AccountInfo } from 'tsjs-xpx-chain-sdk/dist/src/model/account/AccountInfo';
import { Address } from 'tsjs-xpx-chain-sdk/dist/src/model/account/Address';
import { PublicAccount } from 'tsjs-xpx-chain-sdk/dist/src/model/account/PublicAccount';
import { AggregateTransaction } from 'tsjs-xpx-chain-sdk/dist/src/model/transaction/AggregateTransaction';
import { SignedTransaction } from 'tsjs-xpx-chain-sdk/dist/src/model/transaction/SignedTransaction';
import { TransactionType } from 'tsjs-xpx-chain-sdk/dist/src/model/transaction/TransactionType';
import { environment } from '../../../../environments/environment';
import {
  ContactsListInterface,
  CosignatoryInterface,
  MultisigService,
  ToAggregateConvertMultisigInterface
} from '../../service/multisig.service';

@Component({
  selector: 'app-convert-account-multisig.component',
  templateUrl: './convert-account-multisig.component.html',
  styleUrls: ['./convert-account-multisig.component.css'],
})
export class ConvertAccountMultisigComponent implements OnInit {
  @ViewChild('modalContact', { static: true }) modalContact: ModalDirective;
  accountToConvertMultisig: Account;
  accountToConvertSign: Account;
  aggregateTransaction: AggregateTransaction = null;
  blockSend: boolean;
  currentAccounts: CurrentAccountInterface[] = [];
  configurationForm: ConfigurationForm = {};
  currentAccountToConvert: AccountsInterface;
  disableAddCosignatory = true;
  formConvertAccountMultsig: FormGroup;
  imageActiveBook =
    'assets/images/img/icon-address-book-gray-28h-proximax-sirius-wallet.svg';
  imageInactiveBook =
    'assets/images/img/icon-address-green-book-16h-proximax-sirius-wallet.svg';
  isRepeatCosignatoryVal = false;
  minDelta = 1;
  maxDelta = 1;
  contactList: ContactsListInterface[] = [];
  currentIteratorCosignatory: number;
  paramConvert: ToAggregateConvertMultisigInterface = null;
  passwordMain = 'password';
  paramsHeader: HeaderServicesInterface = {
    moduleName: 'Accounts > Multisign',
    componentName: 'Convert to Multisig Account',
  };
  snapshot = false;
  searchContact = [];
  showContacts = false;
  subscribe: Subscription[] = [];
  subscribeContact: Subscription[] = [];
  transactionHttp: TransactionHttp;
  feeConfig: {
    fee: any,
    feeLockfund: number,
    feeTransaction: number,
    totalFee: number,
  };
  validateAccountAlert: ValidateAccountAlert = null;
  txOnpartial: TransactionsInterface[] = null;
  constructor(
    private activateRoute: ActivatedRoute,
    private fb: FormBuilder,
    private multisigService: MultisigService,
    private nodeService: NodeService,
    private walletService: WalletService,
    private transactionService: TransactionsService,
    private dataBridge: DataBridgeService,
    private proximaxProvider: ProximaxProvider,
    private sharedService: SharedService
  ) {
    this.validateAccountAlert = {
      show: false,
      info: '',
      subInfo: ''
    };
    this.feeConfig = {
      fee: '0.000000',
      feeLockfund: 10000000,
      feeTransaction: 44500,
      totalFee: 0
    };
    this.feeConfig.totalFee = this.feeConfig.feeTransaction + this.feeConfig.feeLockfund;
    this.configurationForm = this.sharedService.configurationForm;
    this.currentAccounts = [];
    this.transactionHttp = new TransactionHttp(environment.protocol + '://' + `${this.nodeService.getNodeSelected()}`);
  }

  /**
   *
   *
   * @memberof ConvertAccountMultisigComponent
   */
  ngOnInit() {
    this.createForm();
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

  validateSnapshot() {
    this.currentAccounts = [];
    if (this.activateRoute.snapshot.paramMap.get('name') !== null) {
      this.getAccount(this.activateRoute.snapshot.paramMap.get('name'));
      this.snapshot = true;
    } else {
      this.snapshot = false;
      this.getAccounts();
    }
  }

  /**
   *
   *
   * @returns {FormGroup}
   * @memberof ConvertAccountMultisigComponent
   */
  newCosignatory(): FormGroup {
    return this.fb.group({
      cosignatory: ['', [Validators.pattern('^(0x|0X)?[a-fA-F0-9]+$')]],
    });
  }

  /**
   *
   *
   * @memberof ConvertAccountMultisigComponent
   */
  addCosignatory() {
    if (this.cosignatories.status === 'VALID') {
      this.searchContact.push(false);
      this.cosignatories.push(this.newCosignatory());
    }
  }

  /**
   *
   *
   * @memberof ConvertAccountMultisigComponent
   */


  /**
   *
   *
   * @memberof CreateMultiSignatureComponent
   *  @param {SignedTransaction} signedTransaction  - Signed transaction.
   */
  announceAggregateBonded(signedTransaction: SignedTransaction) {
    this.formConvertAccountMultsig.get('selectAccount').patchValue('', { emitEvent: false, onlySelf: true });
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
   * @memberof CreateMultiSignatureComponent
   *  @param {SignedTransaction} signedTransaction  - Signed transaction.
   */
  announceAggregateComplete(signedTransaction: SignedTransaction) {
    this.formConvertAccountMultsig.get('selectAccount').patchValue('', { emitEvent: false, onlySelf: true });
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
   * Get aggregateTransaction
   */
  aggregateTransactionModifyMultisig() {
    if (this.multisigService.validateOwnCosignatories(this.cosignatoriesList)) {
      const ownCosignatoriesS: PublicAccount[] = this.multisigService.filterOthersCosignatories(this.cosignatoriesList, this.walletService.currentWallet.accounts)
        .map(x => PublicAccount.createFromPublicKey(x.publicKey, this.currentAccountToConvert.network));
      this.multisigService.filterOthersCosignatories(this.cosignatoriesList, this.walletService.currentWallet.accounts)
        .map(x => PublicAccount.createFromPublicKey(x.publicKey, environment.typeNetwork.value));
      this.paramConvert = {
        account: this.currentAccountToConvert.publicAccount,
        ownCosignatories: this.multisigService.filterOwnCosignatories(this.cosignatoriesList, this.walletService.currentWallet.accounts)
          .map(x => PublicAccount.createFromPublicKey(x.publicAccount.publicKey, environment.typeNetwork.value)),
        othersCosignatories: ownCosignatoriesS,
        minApprovalDelta: this.formConvertAccountMultsig.get('minApprovalDelta').value,
        minRemovalDelta: this.formConvertAccountMultsig.get('minRemovalDelta').value
      };
      this.aggregateTransaction = this.multisigService.aggregateTransactionModifyMultisig(this.paramConvert);
      const feeAgregate = Number(this.transactionService.amountFormatterSimple(this.aggregateTransaction.maxFee.compact()));
      this.feeConfig.fee = feeAgregate.toFixed(6);
    }

  }
  /**
   *
   */
  createForm() {
    this.formConvertAccountMultsig = this.fb.group({
      cosignatory: ['', [Validators.pattern('^(0x|0X)?[a-fA-F0-9]+$')]],
      contact: [''],
      minApprovalDelta: [
        1,
        [Validators.required, Validators.minLength(1), Validators.maxLength(1)],
      ],
      minRemovalDelta: [
        1,
        [Validators.required, Validators.minLength(1), Validators.maxLength(1)],
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(this.configurationForm.passwordWallet.minLength),
          Validators.maxLength(this.configurationForm.passwordWallet.maxLength),
        ],
      ],
      selectAccount: ['', [Validators.required]],
      cosignatories: this.fb.array([]),
    });
  }

  convertIntoMultisigTransaction() {
    this.aggregateTransactionModifyMultisig();
    if (this.formConvertAccountMultsig.valid && !this.blockSend) {
      this.blockSend = true;
      const common: any = { password: this.formConvertAccountMultsig.get('password').value };
      if (this.walletService.decrypt(common, this.currentAccountToConvert)) {
        const accountSign: Account = Account.createFromPrivateKey(common.privateKey, this.currentAccountToConvert.network);
        const accountsWalletValid = this.walletService.currentWallet.accounts.filter(r => r.encrypted);
        const ownCosignatories = this.multisigService.filterOwnCosignatories(this.paramConvert.ownCosignatories, accountsWalletValid);
        const accountOwnCosignatoriess: Account[] = ownCosignatories.map(x => {
          if (this.walletService.decrypt(common, x)) {
            return Account.createFromPrivateKey(common.privateKey, x.network);
          }
        });
        const signedTransaction = this.multisigService.signedTransaction(accountSign, this.aggregateTransaction,
          this.dataBridge.blockInfo.generationHash, accountOwnCosignatoriess);
        if (this.aggregateTransaction.type === TransactionType.AGGREGATE_BONDED) {
          const hashLockSigned = this.transactionService.buildHashLockTransaction(signedTransaction, accountSign, this.dataBridge.blockInfo.generationHash);
          this.hashLock(hashLockSigned, signedTransaction);
        } else {
          this.announceAggregateComplete(signedTransaction);
        }
      } else {
        this.blockSend = false;
      }
    }
  }

  /**
   * @memberof CreateMultiSignatureComponent
   */
  clearForm() {
    this.cosignatories.clear();
    this.showContacts = false;
    this.formConvertAccountMultsig.reset({
      selectAccount: '',
      cosignatory: '',
      contact: '',
      minApprovalDelta: 1,
      minRemovalDelta: 1,
      password: '',
      cosignatories: this.fb.array([]),
    }, {
      emitEvent: false
    }
    );
  }
  /**
   *
   *
   * @param {*} inputType
   * @returns
   * @memberof ConvertAccountMultisigComponent
   */
  changeInputType(inputType: string) {
    this.passwordMain = this.sharedService.changeInputType(inputType);
    return this.passwordMain;
  }

  /**
   *
   *
   * @memberof ConvertAccountMultisigComponent
   */
  cleanInput(inputsKey: string[]) {
    inputsKey.forEach((element) => {
      this.formConvertAccountMultsig
        .get(element)
        .patchValue('', { emitEvent: false, onlySelf: true });
    });
  }
  /**
   * @memberof CreateMultiSignatureComponent
   */
  disabledForm(noIncluye: string, accion: boolean) {
    for (const x in this.formConvertAccountMultsig.value) {
      if (x !== noIncluye) {
        if (accion) {
          this.formConvertAccountMultsig.get(x).disable();
        } else {
          this.formConvertAccountMultsig.get(x).enable();
        }

      }
    }
  }

  /**
   *
   *
   * @memberof ConvertAccountMultisigComponent
   */
  getAccounts() {
    this.currentAccounts = [];
    const currentWallet = Object.assign({}, this.walletService.currentWallet);
    if (currentWallet && Object.keys(currentWallet).length > 0) {
      currentWallet.accounts.forEach((element) => {
        const accountInfo = this.walletService.filterAccountInfo(element.name);
        if (accountInfo) {
          if (!this.multisigService.checkIsMultisig(element)) {
            // console.log('is not multisig');
            this.currentAccounts.push({
              label: element.name,
              value: element.publicAccount,
              data: element,
              isPartial: false,
              isMultisig: false,
            });
          }
        }
      });
    }
  }
  /**
   *
   *
   * @memberof ConvertAccountMultisigComponent
   */
  getAccount(name) {
    const currentAccount = this.walletService.filterAccountWallet(name);
    this.currentAccounts.push({
      label: currentAccount.name,
      value: currentAccount.publicAccount,
      data: currentAccount,
      isPartial: false,
      isMultisig: this.multisigService.checkIsMultisig(currentAccount),
    });
    this.selectAccount(this.currentAccounts[0]);
    this.formConvertAccountMultsig.controls['selectAccount'].setValidators([]);
    this.formConvertAccountMultsig.controls['selectAccount'].updateValueAndValidity({ emitEvent: false, onlySelf: true });
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
            this.transactionService.searchAccountsInfo([this.currentAccountToConvert]);
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
   *
   *
   * @memberof ConvertAccountMultisignComponent
   */
  load() {
    this.subscribe.push(this.walletService.getAccountsInfo$().subscribe(
      next => {
        // console.log('NUEVO VALOR', next);
        this.validateSnapshot();
      }
    ));
    this.subscribe.push(
      this.transactionService
        .getAggregateBondedTransactions$()
        .subscribe((transactions: TransactionsInterface[]) => {
          if (transactions.length > 0) {
            console.log('ESTAS SON MIS TRANSACCIONES', transactions);
            this.txOnpartial = transactions;
            this.validateSnapshot();
          }
        })
    );
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
      this.getTransactionStatushashLock(hashLockTransactionSigned, signedTransaction);
    }, err => {
      this.clearForm();
      this.blockSend = false;
    });
  }

  /**
   *
   *
   * @param {*} e
   * @returns
   * @memberof ConvertAccountMultisigComponent
   */
  preventNumbers(e) {
    if (e.keyCode >= 48 && e.keyCode <= 57) {
      return false;
    }
  }

  /**
   *
   *
   * @param {number} i
   * @memberof ConvertAccountMultisigComponent
   */
  removeCosignatory(i: number) {
    this.cosignatories.removeAt(i);
    this.searchContact.pop();
  }

  /**
   *
   *
   * @param {*} account
   * @memberof ConvertAccountMultisigComponent
   */
  selectAccount(account: CurrentAccountInterface) {
    this.cosignatories.clear();
    this.formConvertAccountMultsig.enable({ emitEvent: false, onlySelf: true });
    this.formConvertAccountMultsig
      .get('cosignatory')
      .patchValue('', { emitEvent: false, onlySelf: false });
    if (account) {
      this.maxDelta = 1;
      this.currentAccountToConvert = account.data;
      this.contactList = this.multisigService.validateAccountListContact(
        account.label
      );
      // Validate  Balance
      this.validateAccountAlert = this.validBalance(account.data);
      // Validate in partial txs
      const ispartial = this.multisigService.onPartial(account.data, this.txOnpartial);
      if (ispartial) {
        this.validateAccountAlert = { show: true, info: 'Partial', subInfo: 'Has transactions in partial' };
      }
      // Validate is multisig
      if (account.isMultisig) {
        this.validateAccountAlert = { show: true, info: 'Is Multisig', subInfo: '' };
      }
      if (this.validateAccountAlert.show) {
        this.disabledForm('selectAccount', true);
      } else {
        this.disabledForm('selectAccount', false);
      }
    } else {
      this.contactList = [];
    }
  }
  /**
   *
   * @param account
   */
  validBalance(account: AccountsInterface): ValidateAccountAlert {
    const accountFiltered = this.walletService.filterAccountInfo(account.name);
    const insufficientBalanceSub = `${this.transactionService.amountFormatterSimple(this.feeConfig.totalFee)} XPX required to cover LockFund.`;
    const value: ValidateAccountAlert = { show: true, info: 'Insufficient Balance', subInfo: insufficientBalanceSub };
    if (!(accountFiltered !== null && accountFiltered !== undefined && accountFiltered.accountInfo !== null)) {
      return value;
    }
    console.log('accountFiltered', accountFiltered)
    const balanceAccount = accountFiltered.accountInfo.mosaics.find(next => next.id.toHex() === environment.mosaicXpxInfo.id);
    if (!balanceAccount) {
      return value;
    }
    if (balanceAccount.amount.compact() < this.feeConfig.totalFee) {
      return value;
    }
    return { show: false, info: '', subInfo: '' };
  }
  /**
   *
   *
   * @param {ContactsListInterface} data
   * @memberof ConvertAccountMultisigComponent
   */
  selectContact(data: ContactsListInterface) {
    this.unsubscribe(this.subscribeContact);
    this.modalContact.hide();
    this.cosignatories.controls[this.currentIteratorCosignatory]
      .get('cosignatory')
      .patchValue('', { emitEvent: true });
    if (data.publicKey) {
      if (!this.isRepeatCosignatory(this.cosignatoriesList, data.publicKey)) {
        this.cosignatories.controls[this.currentIteratorCosignatory]
          .get('cosignatory')
          .patchValue(data.publicKey, { emitEvent: true });
        this.formConvertAccountMultsig
          .get('contact')
          .patchValue('', { emitEvent: false, onlySelf: true });
      }
    } else {
      this.searchContact[this.currentIteratorCosignatory] = true;
      this.subscribeContact.push(
        this.proximaxProvider
          .getAccountInfo(Address.createFromRawAddress(data.value))
          .subscribe(
            async (response: AccountInfo) => {
              this.unsubscribe(this.subscribeContact);
              this.searchContact[this.currentIteratorCosignatory] = false;
              if (response.publicKeyHeight.toHex() === '0000000000000000') {
                this.sharedService.showWarning(
                  '',
                  'Cosignatory does not have a public key'
                );
                this.formConvertAccountMultsig
                  .get('cosignatory')
                  .patchValue('', { emitEvent: false, onlySelf: true });
                this.formConvertAccountMultsig
                  .get('contact')
                  .patchValue('', { emitEvent: false, onlySelf: true });
              } else {
                if (!this.isRepeatCosignatory(this.cosignatoriesList, response.publicKey)) {
                  this.cosignatories.controls[this.currentIteratorCosignatory]
                    .get('cosignatory')
                    .patchValue(response.publicKey, { emitEvent: true });
                  this.formConvertAccountMultsig
                    .get('contact')
                    .patchValue('', { emitEvent: false, onlySelf: true });
                }
              }
            },
            (err) => {
              this.formConvertAccountMultsig
                .get('contact')
                .patchValue('', { emitEvent: false, onlySelf: true });
              this.searchContact[this.currentIteratorCosignatory] = false;
              this.sharedService.showWarning('', 'Address is not valid');
            }
          )
      );
    }
  }

  /**
   *
   *
   * @memberof ConvertAccountMultisigComponent
   */
  showContact(iterator: number) {
    if (this.contactList.length > 0) {
      this.currentIteratorCosignatory = iterator;
      this.showContacts = !this.showContacts;
      this.modalContact.show();
    }
  }

  /**
   *
   *
   * @param {Subscription[]} subscribe
   * @memberof ConvertAccountMultisigComponent
   */
  unsubscribe(subscribe: Subscription[]) {
    if (subscribe.length > 0) {
      subscribe.forEach((subscription) => {
        subscription.unsubscribe();
      });
    }
  }

  // VALIDATES FUNCTIONS

  /**
   *
   *
   * @param {string} [nameInput='']
   * @param {string} [nameControl='']
   * @param {string} [nameValidation='']
   * @returns
   * @memberof ConvertAccountMultisigComponent
   */
  validateInput(
    nameInput: string = ''
  ) {
    let validation: AbstractControl = null;
    if (nameInput !== '') {
      validation = this.formConvertAccountMultsig.get(nameInput);
    }
    return validation;
  }
  /**
   *
   * @param numberControl
   */
  validateInputCosignatory(numberControl: number
  ) {
    this.cosignatories.controls[numberControl].get('cosignatory');
    return this.cosignatories.controls[numberControl].get('cosignatory');
  }

  /**
   *  TODO   patchValue , updateValueAndValidity, setValidators optimizar para una sola funcion
   */
  validatorsDelta() {
    this.maxDelta = this.cosignatoriesList.length;
    const validators = [Validators.required,
    Validators.minLength(1),
    Validators.maxLength(this.maxDelta)];
    if (this.cosignatoriesList.length > 0) {
      while (this.formConvertAccountMultsig.get('minApprovalDelta').value > this.cosignatoriesList.length) {
        this.formConvertAccountMultsig.get('minApprovalDelta').patchValue(this.formConvertAccountMultsig.get('minApprovalDelta').value - 1,
          { emitEvent: false, onlySelf: true });
      }
      while (this.formConvertAccountMultsig.get('minRemovalDelta').value > this.cosignatoriesList.length) {
        this.formConvertAccountMultsig.get('minRemovalDelta').patchValue(this.formConvertAccountMultsig.get('minRemovalDelta').value - 1,
          { emitEvent: false, onlySelf: true });
      }
    } else {
      this.formConvertAccountMultsig.get('minApprovalDelta').patchValue(1, { emitEvent: false, onlySelf: true });
      this.formConvertAccountMultsig.get('minRemovalDelta').patchValue(1, { emitEvent: false, onlySelf: true });
    }
    this.formConvertAccountMultsig.controls['minApprovalDelta'].setValidators(validators);
    this.formConvertAccountMultsig.controls['minApprovalDelta'].updateValueAndValidity({ emitEvent: false, onlySelf: true });
    this.formConvertAccountMultsig.controls['minRemovalDelta'].setValidators(validators);
    this.formConvertAccountMultsig.controls['minRemovalDelta'].updateValueAndValidity({ emitEvent: false, onlySelf: true });
  }

  /**
   * Validate new cosignatory is repeat in cosignatories List
   * @param cosignatoriesList
   * @param newCosignatory
   */
  isRepeatCosignatory(cosignatoriesList?: CosignatoryInterface[], compareCosignatory?): boolean {
    this.isRepeatCosignatoryVal = false;
    const list = (cosignatoriesList) ? cosignatoriesList : this.cosignatoriesList;
    if (list.length > 0 && compareCosignatory) {
      if (list.find((x) => x.publicKey.toUpperCase() === compareCosignatory.toUpperCase())) {
        this.isRepeatCosignatoryVal = true;
      }
    } else {
      if (list.find((item, index, array) => {
        return array.map((mapItem) => mapItem['publicKey']).indexOf(item['publicKey']) !== index;
      })) {
        this.isRepeatCosignatoryVal = true;
      }
    }
    if (this.isRepeatCosignatoryVal) { this.sharedService.showWarning('', 'Consignee already exists'); }
    return this.isRepeatCosignatoryVal;
  }

  subscribeValueChange() {
    // Cosignatory ValueChange
    this.formConvertAccountMultsig.get('cosignatories').valueChanges.subscribe(
      async next => {
        this.validatorsDelta();
        this.isRepeatCosignatory();
        this.aggregateTransactionModifyMultisig();
      }
    );
  }

  /**
   *
   *
   * @readonly
   * @type {FormArray}
   * @memberof ConvertAccountMultisigComponent
   */
  get cosignatories(): FormArray {
    return this.formConvertAccountMultsig.get('cosignatories') as FormArray;
  }

  /**
   *
   *
   * @readonly
   * @type {FormArray}
   * @memberof ConvertAccountMultisigComponent
   */
  get cosignatoriesList(): CosignatoryInterface[] {
    return this.formConvertAccountMultsig
      .get('cosignatories')
      .value.filter((x) => x.cosignatory).map(x => {
        return {
          publicKey: x.cosignatory.toUpperCase()
        };
      });
  }
}

interface CurrentAccountInterface {
  label: string;
  value: any;
  isPartial: boolean;
  data: AccountsInterface;
  isMultisig: boolean;
}

interface ValidateAccountAlert {
  show: boolean;
  info: string;
  subInfo: string;
}
