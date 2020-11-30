import { Component, OnInit, ViewChild } from '@angular/core';
import { TransactionsInterface, TransactionsService } from 'src/app/transactions/services/transactions.service';
import { AccountsInterface, WalletService } from 'src/app/wallet/services/wallet.service';
import { ConfigurationForm, SharedService } from 'src/app/shared/services/shared.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { ModalDirective } from 'ng-uikit-pro-standard';
import { Account } from 'tsjs-xpx-chain-sdk/dist/src/model/account/Account';
import { AggregateTransaction } from 'tsjs-xpx-chain-sdk/dist/src/model/transaction/AggregateTransaction';
import { ServicesModuleService, HeaderServicesInterface } from '../../../servicesModule/services/services-module.service';
import { SignedTransaction } from 'tsjs-xpx-chain-sdk/dist/src/model/transaction/SignedTransaction';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { PublicAccount } from 'tsjs-xpx-chain-sdk/dist/src/model/account/PublicAccount';
import { Address } from 'tsjs-xpx-chain-sdk/dist/src/model/account/Address';
import { MultisigAccountInfo } from 'tsjs-xpx-chain-sdk/dist/src/model/account/MultisigAccountInfo';
import {
  CosignatoryListInterface, CosignatoriesInterface, CosignatoryInterface,
  MultisigService, ContactsListInterface, CosignerFirmList, ToAggregateTransactionEditModifyMultisig
} from '../../service/multisig.service';
import { TransactionHttp } from 'tsjs-xpx-chain-sdk/dist/src/infrastructure/TransactionHttp';
import { ProximaxProvider } from 'src/app/shared/services/proximax.provider';
import { AccountInfo } from 'tsjs-xpx-chain-sdk/dist/src/model/account/AccountInfo';
import { CosignatoryList } from '../../service/multi-sign.service';
import { AppConfig } from 'src/app/config/app.config';
import { DataBridgeService } from 'src/app/shared/services/data-bridge.service';
import { TransactionType } from 'tsjs-xpx-chain-sdk/dist/src/model/transaction/TransactionType';
import { NodeService } from 'src/app/servicesModule/services/node.service';
@Component({
  selector: 'app-edit-account-multisig',
  templateUrl: './edit-account-multisig.component.html',
  styleUrls: ['./edit-account-multisig.component.css']
})
export class EditAccountMultisigComponent implements OnInit {
  @ViewChild('modalContact', { static: true }) modalContact: ModalDirective;
  blockSend: boolean;
  paramConvert: ToAggregateTransactionEditModifyMultisig;
  showSignCosignatory = false;
  accountToConvertSign: Account;
  aggregateTransaction: AggregateTransaction = null;
  currentAccount: CurrentAccountInterface[] = [];
  currentAccountToConvert: AccountsInterface;
  dataCurrentAccout: DataCurrentAccount = {};
  minDelta = 1;
  maxDelta = 1;
  contactList: ContactsListInterface[] = [];
  currentIteratorCosignatory: number;
  imageActiveBook =
    'assets/images/img/icon-address-book-gray-28h-proximax-sirius-wallet.svg';
  imageInactiveBook =
    'assets/images/img/icon-address-green-book-16h-proximax-sirius-wallet.svg';
  // currentAccount?: {
  //   name?: string;
  //   publicAccount?: PublicAccount;
  //   cosignatoryList?: CosignatoryListInterface[]
  // }

  showCosignerFirmList = false;
  configurationForm: ConfigurationForm = {};
  formEditAccountMultsig: FormGroup;
  consignerFirmList: CosignerFirmList[] = [];
  otherCosignatorieList: CosignerFirmList[] = [];
  otherCosignerFirmAccountList: CosignerFirmList[] = [];
  consignerFirm: CosignerFirmList;
  infoBalance: InfoBalance;
  // TODO pasar a una sola junto con covert multisig
  feeConfig: {
    fee: any,
    feeLockfund: number,
    feeTransaction: number,
    totalFee: number,
  };
  signType = 0;
  data: Array<any>;
  paramsHeader: HeaderServicesInterface = {
    componentName: 'Edit Account Multisig',
    moduleName: 'Accounts > Multisign'
  };
  passwordMain = 'password';
  subscribe: Subscription[] = [];
  searchContact = [];
  subscribeContact: Subscription[] = [];
  transactionHttp: TransactionHttp;
  txOnpartial: TransactionsInterface[] = null;
  visibleIndex = -1;
  visibleIndexOnelvl = -1;
  showAccount = false;
  isRepeatCosignatoryVal = false;
  showContacts = false;
  validateAccountAlert: ValidateAccountAlert = null;
  constructor(
    public transactionService: TransactionsService, private walletService: WalletService,
    private activateRoute: ActivatedRoute, private sharedService: SharedService,
    private fb: FormBuilder, private multisigService: MultisigService,
    private proximaxProvider: ProximaxProvider,
    private router: Router,
    private dataBridge: DataBridgeService,
    private nodeService: NodeService
  ) {
    this.transactionHttp = new TransactionHttp(environment.protocol + '://' + `${this.nodeService.getNodeSelected()}`);
    this.infoBalance = {
      disabled: false,
      info: ''
    };
    // TODO pasar a una sola junto con covert multisig validateAccountAlert  feeConfig , configurationForm
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
  }

  ngOnInit () {


    this.createForm();
    this.subscribeValueChange();
    this.load();
    this.selectCosignatorieSign();
    this.selectOtherCosignatorieSign();

  }
  /**
    *
    *
    * @memberof ConvertAccountMultisignComponent
    */
  ngOnDestroy (): void {
    this.subscribe.forEach(subscription => {
      subscription.unsubscribe();
    });
  }
  /**
   *
   *
   * @returns {FormGroup}
   * @memberof ConvertAccountMultisigComponent
   */
  newCosignatory (): FormGroup {
    return this.fb.group({
      cosignatory: ['', [Validators.pattern('^(0x|0X)?[a-fA-F0-9]+$')]],
    });
  }

  /**
   *
   *
   * @memberof ConvertAccountMultisigComponent
   */
  addCosignatory () {
    if (this.cosignatories.status === 'VALID') {
      this.searchContact.push(false);
      this.cosignatories.push(this.newCosignatory());
    }
  }
  /**
   *
   *
   * @param {*} e
   * @returns
   * @memberof ConvertAccountMultisigComponent
   */
  preventNumbers (e) {
    if (e.keyCode >= 48 && e.keyCode <= 57) {
      return false;
    }
  }
  /**
   *
   *
   * @param {*} inputType
   * @returns
   * @memberof ConvertAccountMultisigComponent
   */
  changeInputType (inputType: string) {
    this.passwordMain = this.sharedService.changeInputType(inputType);
    return this.passwordMain;
  }
  /**
   *
   */
  createForm () {
    this.formEditAccountMultsig = this.fb.group({
      cosignatory: ['', [Validators.pattern('^(0x|0X)?[a-fA-F0-9]+$')]],
      cosignatorieSign: [''],
      otherCosignatorie: [''],
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
      cosignatories: this.fb.array([]),
    });
  }

  /**
   *
   * @memberof EditAccountMultisignComponent
   */
  selectCosignatorieSign () {
    this.formEditAccountMultsig.get('cosignatorieSign').valueChanges.subscribe(
      id => {
        this.showSignCosignatory = false;
        this.formEditAccountMultsig.get('otherCosignatorie').setValue('', {
          emitEvent: false
        });
        // this.consginerFirmAccountList = this.pushCosignerFirmList(id)
        const signCosignatory = this.consignerFirmList.find(item => item.value === id);
        if (signCosignatory) {
          this.showSignCosignatory = true;
          this.consignerFirm = signCosignatory;
        }
        this.otherCosignatorieList = this.consignerFirmList.filter(item => item.value !== id);
        this.builderOtherCosignatorie(id);
        // this.builder()
      }
    );
  }
  // builderOtherCosignatorie(id) {
  //   if (id) {

  //   }
  // }

  /**
   *
   *
   */
  selectOtherCosignatorieSign () {
    this.formEditAccountMultsig.get('otherCosignatorie').valueChanges.subscribe(
      id => {
        this.otherCosignerFirmAccountList = [];
        this.otherCosignerFirmAccountList = this.pushOtherCosignerFirmList(id);
        // this.builder()
      }
    );
  }
  /**
   *
   * @param id
   */
  pushOtherCosignerFirmList (id: []): CosignerFirmList[] {
    const value: CosignerFirmList[] = [];
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
   * Delete cosignatory to the cosignatory List
   * @memberof CreateMultiSignatureComponent
   * @param {Address} id  - Address in cosignatory.
   * @param {Boolean} disableItem
   * @param {number} type
   */
  deleteCosignatory (id: Address, disableItem: boolean, type: number) {
    this.dataCurrentAccout.cosignatoryList.filter(x => x.action === 'edit').map((item: CosignatoryListInterface) => {
      item.type = 3;
    });
    if (type === 2) {
      this.dataCurrentAccout.cosignatoryList.find(x => x.id.plain() === id.plain() && x.action === 'edit').type = 3;
    } else {
      this.dataCurrentAccout.cosignatoryList.find(x => x.id.plain() === id.plain() && x.action === 'edit').type = 2;
    }
    this.validatorsDelta(this.cosignatoriesList.filter(x => x.type === 1 || x.type === 3).length);
  }
  editIntoMultisigTransaction () {

    this.aggregateTransactionEditModifyMultisig();
    if (this.formEditAccountMultsig.valid && !this.blockSend) {
      this.blockSend = true;

      const common: any = { password: this.formEditAccountMultsig.get('password').value };
      if (this.walletService.decrypt(common, this.consignerFirm.account)) {
        const accountSign: Account = Account.createFromPrivateKey(common.privateKey, this.currentAccountToConvert.network);
        const accountsWalletValid = this.walletService.currentWallet.accounts.filter(r => r.encrypted);
        const ownCosignatories = this.multisigService.filterOwnCosignatories(this.otherCosignatorieList.map(x => {
          return {
            publicKey: x.account.publicAccount.publicKey
          };
        }), accountsWalletValid);
        const ownCosignatorieslist = this.multisigService.filterOwnCosignatories(this.cosignatoriesList.filter(t => t.type === 1).map(x => {
          return {
            publicKey: x.publicAccount.publicKey
          };
        }), accountsWalletValid);
        const myCosigner = ownCosignatories.concat(ownCosignatorieslist);
        const accountOwnCosignatoriess: Account[] = myCosigner.map(x => {
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
   *
   *
   * @memberof EditAccountMultisignComponent
   *  @param {SignedTransaction} signedTransaction  - Signed transaction.
   */
  announceAggregateComplete (signedTransaction: SignedTransaction) {
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
  hashLock (hashLockTransactionSigned: SignedTransaction, signedTransaction: SignedTransaction) {
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
   * @memberof CreateMultiSignatureComponent
   *  @param {SignedTransaction} signedTransaction  - Signed transaction.
   */
  getTransactionStatushashLock (signedTransactionHashLock: SignedTransaction, signedTransactionBonded: SignedTransaction) {
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
     * @memberof EditAccountMultisignComponent
     *  @param {SignedTransaction} signedTransaction  - Signed transaction.
     */
  announceAggregateBonded (signedTransaction: SignedTransaction) {
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
  getTransactionStatus (signedTransaction: SignedTransaction) {
    // Get transaction status
    this.subscribe['transactionStatus'] = this.dataBridge.getTransactionStatus().subscribe(
      statusTransaction => {
        // this.blockSend = false;
        if (statusTransaction !== null && statusTransaction !== undefined && signedTransaction !== null) {
          const match = statusTransaction['hash'] === signedTransaction.hash;
          if (match) {
            this.clearForm();
            this.blockSend = false;
          }
          // CONFIRMED
          if (statusTransaction['type'] === 'confirmed' && match) {
            signedTransaction = null;
          } else if (statusTransaction['type'] === 'unconfirmed' && match) {
            this.transactionService.searchAccountsInfo([this.currentAccountToConvert]);
            signedTransaction = null;
          } else if (statusTransaction['type'] === 'aggregateBondedAdded' && match) {
            this.transactionService.searchAccountsInfo([this.currentAccountToConvert]);
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
   * @memberof CreateMultiSignatureComponent
   */
  clearForm () {
    // .reset({
    //   cosignatory: '',
    //   cosignatorieSign: '',
    //   otherCosignatorie: '',
    //   contact: '',
    //   minApprovalDelta: 1,
    //   minRemovalDelta: 1,
    //   password: ''
    // }, {
    //     emitEvent: false
    //   }
    // );
    this.cosignatories.clear();
    this.showContacts = false;
    this.formEditAccountMultsig.reset({
      cosignatorieSign: '',
      otherCosignatorie: '',
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
   * @param {number} i
   * @memberof ConvertAccountMultisigComponent
   */
  removeCosignatory (i: number) {
    this.cosignatories.removeAt(i);
    this.searchContact.pop();
  }
  /**
   *
   *
   * @memberof ConvertAccountMultisigComponent
   */
  showContact (iterator: number) {
    if (this.contactList.length > 0) {
      this.currentIteratorCosignatory = iterator;
      this.showContacts = !this.showContacts;
      this.modalContact.show();
    }
  }
  /**
   *
   *
   * @param {ContactsListInterface} data
   * @memberof ConvertAccountMultisigComponent
   */
  selectContact (data: ContactsListInterface) {
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
        this.formEditAccountMultsig
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
                this.formEditAccountMultsig
                  .get('cosignatory')
                  .patchValue('', { emitEvent: false, onlySelf: true });
                this.formEditAccountMultsig
                  .get('contact')
                  .patchValue('', { emitEvent: false, onlySelf: true });
              } else {
                if (!this.isRepeatCosignatory(this.cosignatoriesList, response.publicKey)) {
                  this.cosignatories.controls[this.currentIteratorCosignatory]
                    .get('cosignatory')
                    .patchValue(response.publicKey, { emitEvent: true });
                  this.formEditAccountMultsig
                    .get('contact')
                    .patchValue('', { emitEvent: false, onlySelf: true });
                }
              }
            },
            (err) => {
              this.formEditAccountMultsig
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
  getAccount (name) {
    const currentAccount = this.walletService.filterAccountWallet(name);
    this.currentAccount.push({
      data: currentAccount,
    });
    this.selectAccount(this.currentAccount[0]);
  }
  getColor (type) {
    switch (type) {
      case 1:
        return 'green';
      case 2:
        return 'red';
      case 3:
        return 'gray';
    }
  }

  updateConfigFormCosignatorieSign (cosignerLength: number) {
    if (cosignerLength === 1) {
      this.showCosignerFirmList = false;
      this.formEditAccountMultsig.controls['cosignatorieSign'].setValidators(null);
    }
    if (cosignerLength > 1) {
      this.showCosignerFirmList = true;
      this.formEditAccountMultsig.controls['cosignatorieSign'].setValidators([Validators.required]);
    }
    this.formEditAccountMultsig.controls['cosignatorieSign'].updateValueAndValidity({ emitEvent: false, onlySelf: true });


    // return this.multisigService.buildCosignerList(accountConver.isMultisign, this.walletService.currentWallet.accounts, 10000);
  }
  /**
   *
   *
   * @param {*} account
   * @memberof ConvertAccountMultisigComponent
   */
  selectAccount (account: CurrentAccountInterface) {
    console.log('ACCOUNT', account.data);
    if (!account.data.isMultisign) {
      this.router.navigate([`/${AppConfig.routes.home}`]);
    }
    // falta lo del parcial TODO
    if (account) {
      this.currentAccountToConvert = account.data;
      const data = this.setDataCurrentAccout(account.data);
      this.contactList = this.multisigService.removeContactList(this.multisigService.validateAccountListContact(
        account.data.name ,
      ), data.cosignatoryList);
      // Validate is has cosigner currentWallet
      const list = this.multisigService.buildCosignerList(account.data.isMultisign, this.walletService.currentWallet.accounts, this.feeConfig.totalFee);
      const listFilter = list.filter(x => !x.accountIsMultisig);
      if (listFilter.length > 0) {
        if (listFilter.length === 1) {
          this.consignerFirm = listFilter[0];
          this.signType = 1;
        } else {
          this.consignerFirmList = list;
          this.signType = 2;
        }
        this.updateConfigFormCosignatorieSign(listFilter.length);
      } else {
        this.validateAccountAlert = { show: true, info: 'You are not consignee of the account', subInfo: 'Requires a valid cosigner to edit this account.' };
      }
      if (this.validateAccountAlert.show) {
        this.disabledForm('selectAccount', true);
      } else {
        this.disabledForm('selectAccount', false);
      }
    } else {
      this.contactList = [];
    }
    // this.dataCurrentAccout.currentAccount = {
    //   name: account.data.name,
    //   publicAccount : account.data.publicAccount
    // }
    // this.cosignatories.clear();
    // this.formEditAccountMultsig.enable({ emitEvent: false, onlySelf: true });
    // this.formEditAccountMultsig
    //   .get('cosignatory')
    //   .patchValue('', { emitEvent: false, onlySelf: false });
    // if (account) {
    //   this.maxDelta = 1;
    //   this.currentAccountToConvert = account.data;
    //   this.contactList = this.multisigService.validateAccountListContact(
    //     account.label
    //   );
    //   // Validate  Balance
    //   this.validateAccountAlert = this.validBalance(account.data);
    //   // Validate in partial txs
    //   const ispartial = this.multisigService.onPartial(account.data, this.txOnpartial);
    //   if (ispartial) {
    //     this.validateAccountAlert = { show: true, info: 'Partial', subInfo: 'Has transactions in partial' };
    //   }
    //   // Validate is multisig
    //   if (account.isMultisig) {
    //     this.validateAccountAlert = { show: true, info: 'Is Multisig', subInfo: '' };
    //   }
    //   if (this.validateAccountAlert.show) {
    //     this.disabledForm('selectAccount', true);
    //   } else {
    //     this.disabledForm('selectAccount', false);
    //   }
    // } else {
    //   this.contactList = [];
    // }
  }
  /**
   * Validate new cosignatory is repeat in cosignatories List
   * @param cosignatoriesList
   * @param newCosignatory
   */
  isRepeatCosignatory (cosignatoriesList?: CosignatoryListInterface[], compareCosignatory?): boolean {
    this.isRepeatCosignatoryVal = false;
    const list = (cosignatoriesList) ? cosignatoriesList : this.cosignatoriesList;
    if (list.length > 0 && compareCosignatory) {
      if (list.find((x) => x.publicAccount.publicKey.toUpperCase() === compareCosignatory.toUpperCase())) {
        this.isRepeatCosignatoryVal = true;
      }
    } else {
      if (list.find((item, index, array) => {
        return array.map((mapItem) => mapItem.publicAccount['publicKey']).indexOf(item.publicAccount['publicKey']) !== index;
      })) {
        this.isRepeatCosignatoryVal = true;
      }
    }
    if (this.isRepeatCosignatoryVal) { this.sharedService.showWarning('', 'Consignee already exists'); }
    return this.isRepeatCosignatoryVal;
  }
  // TODO hacer recursive function
  setDataCurrentAccout (account: AccountsInterface): DataCurrentAccount {
    this.dataCurrentAccout.name = account.name;
    this.dataCurrentAccout.publicAccount = account.publicAccount;
    const address = Address.createFromPublicKey(account.publicAccount.publicKey, environment.typeNetwork.value);
    this.dataCurrentAccout.address = address.plain();
    this.formEditAccountMultsig.get('minApprovalDelta').patchValue(account.isMultisign.minApproval, { emitEvent: false, onlySelf: true });
    this.formEditAccountMultsig.get('minRemovalDelta').patchValue(account.isMultisign.minRemoval, { emitEvent: false, onlySelf: true });
    this.validatorsDelta(account.isMultisign.cosignatories.length);
    const nameNull = 'Other cosigner';
    this.dataCurrentAccout.cosignatoryList = account.isMultisign.cosignatories.map(x => {
      const data: CosignatoryListInterface = {
        publicAccount: PublicAccount.createFromPublicKey(x.publicKey, environment.typeNetwork.value),
        action: 'edit',
        type: 3,
        disableItem: true,
        id: x.address,
        cosignatories: []
      };
      const ownCosignatories = this.multisigService.filterOwnCosignatory({ publicKey: x.publicKey }, this.walletService.currentWallet.accounts);
      let d = {
        loading: true,
        isMultisig: null,
        name: nameNull,
        address: x.address.plain(),
        publicAccount: PublicAccount.createFromPublicKey(x.publicKey, environment.typeNetwork.value),
        ownCosignatories: false
      };
      if (ownCosignatories) {
        if (ownCosignatories.isMultisign && ownCosignatories.isMultisign.isMultisig()) {
          for (const i of ownCosignatories.isMultisign.cosignatories) {
            const ownCosignatoriesTow = this.multisigService.filterOwnCosignatory({ publicKey: i.publicKey }, this.walletService.currentWallet.accounts);
            if (ownCosignatoriesTow) {
              const cosignatorieswTowList: CosignatoriesInterface[] = ownCosignatoriesTow.isMultisign.cosignatories.map(xY => {
                const ownCosignatoriesThree = this.multisigService.filterOwnCosignatory({ publicKey: xY.publicKey }, this.walletService.currentWallet.accounts);
                const xy = {
                  name: nameNull,
                  address: xY.address.plain(),
                  publicAccount: PublicAccount.createFromPublicKey(xY.publicKey, environment.typeNetwork.value)
                };
                if (ownCosignatoriesThree) {
                  xy.name = ownCosignatoriesThree.name;
                }
                return xy;
              });
              data.cosignatories.push(
                {
                  publicAccount: ownCosignatoriesTow.publicAccount,
                  name: ownCosignatoriesTow.name, address: ownCosignatoriesTow.address, cosignatorieswTow: cosignatorieswTowList
                  , isMultisig: ownCosignatoriesTow.isMultisign
                }
              );
            } else {
              data.cosignatories.push(
                {
                  publicAccount: PublicAccount.createFromPublicKey(i.publicKey, environment.typeNetwork.value),
                  name: nameNull, address: i.address.plain(), cosignatorieswTow: []
                }
              );
            }
          }
        }
        d = {
          loading: false,
          isMultisig: ownCosignatories.isMultisign,
          name: ownCosignatories.name,
          address: ownCosignatories.address,
          publicAccount: ownCosignatories.publicAccount,
          ownCosignatories: true
        };
      }
      return Object.assign(data, d);
    });
    console.log('this.dataCurrentAccout.cosignatoryList', this.dataCurrentAccout.cosignatoryList);
    return this.dataCurrentAccout;
  }

  /**
   *
   * @param ind
   */
  showSubItem (ind) {
    if (this.visibleIndex === ind) {
      this.visibleIndex = -1;
    } else {
      this.visibleIndex = ind;
    }
    this.visibleIndexOnelvl = -1;
  }
  /**
   *
   * @param ind
   */
  showSubItemOnelvl (ind) {
    if (this.visibleIndexOnelvl === ind) {
      this.visibleIndexOnelvl = -1;
    } else {
      this.visibleIndexOnelvl = ind;
    }
  }

  /**
   *
   *
   * @memberof ConvertAccountMultisignComponent
   */
  load () {
    this.subscribe.push(this.walletService.getAccountsInfo$().subscribe(
      next => {
        // console.log('NUEVO VALOR', next);
        this.getAccount(this.activateRoute.snapshot.paramMap.get('name'));
      }
    ));
    this.subscribe.push(
      this.transactionService
        .getAggregateBondedTransactions$()
        .subscribe((transactions: TransactionsInterface[]) => {
          if (transactions.length > 0) {
            console.log('ESTAS SON MIS TRANSACCIONES', transactions);
            this.txOnpartial = transactions;
          }
        })
    );
  }

  subscribeValueChange () {
    // Cosignatory ValueChange
    this.formEditAccountMultsig.get('cosignatories').valueChanges.subscribe(
      async next => {
        this.isRepeatCosignatory();
        this.validatorsDelta(this.cosignatoriesList.filter(x => x.type === 1 || x.type === 3).length);
        this.aggregateTransactionEditModifyMultisig();
      }
    );
  }
  builderOtherCosignatorie (id) {
    if (id) {
      this.otherCosignatorieList = this.consignerFirmList.filter(item => item.value !== id);
    }
  }
  /**
   * Get aggregateTransaction
   */
  aggregateTransactionEditModifyMultisig () {
    const cosignatoriesList = this.cosignatoriesList.filter(x => x.type === 1 || x.type === 2).map(x => {
      return {
        publicKey: x.publicAccount.publicKey
      };
    });
    if (this.multisigService.validateOwnCosignatories(cosignatoriesList)) {
      this.paramConvert = {
        account: this.currentAccountToConvert.publicAccount,
        cosignerFirmList: this.consignerFirmList.filter(x => !x.disabled).concat(this.otherCosignerFirmAccountList.filter(x => !x.disabled)),
        cosignatoryLis: this.cosignatoriesList.filter(x => x.type === 1 || x.type === 2),
        accountsWallet: this.walletService.currentWallet.accounts,
        minApprovalDelta: {
          minApprovalOld: this.currentAccountToConvert.isMultisign.minApproval,
          minApprovalNew: this.formEditAccountMultsig.get('minApprovalDelta').value
        },
        minRemovalDelta: {
          minRemovalOld: this.currentAccountToConvert.isMultisign.minRemoval,
          minRemovalNew: this.formEditAccountMultsig.get('minRemovalDelta').value
        },
      };
      this.aggregateTransaction = this.multisigService.aggregateTransactionEditModifyMultisig(this.paramConvert);
      const feeAgregate = Number(this.transactionService.amountFormatterSimple(this.aggregateTransaction.maxFee.compact()));
      this.feeConfig.fee = feeAgregate.toFixed(6);
      console.log('this.aggregateTransactio', this.aggregateTransaction);
      console.log(this.feeConfig.fee);
    }

  }
  /**
   *
   * @param numberControl
   */
  validateInputCosignatory (numberControl: number
  ) {
    this.cosignatories.controls[numberControl].get('cosignatory');
    return this.cosignatories.controls[numberControl].get('cosignatory');
  }
  /**
   *
   *
   * @param {string} [nameInput='']
   * @param {string} [nameControl='']
   * @param {string} [nameValidation='']
   * @returns
   * @memberof ConvertAccountMultisigComponent
   */
  validateInput (
    nameInput: string = ''
  ) {
    let validation: AbstractControl = null;
    if (nameInput !== '') {
      validation = this.formEditAccountMultsig.get(nameInput);
    }
    return validation;
  }
  /**
   *  TODO   patchValue , updateValueAndValidity, setValidators optimizar para una sola funcion
   */
  validatorsDelta (maxDelta: number = 1) {
    this.maxDelta = maxDelta;
    const validators = [Validators.required,
    Validators.minLength(1),
    Validators.maxLength(this.maxDelta)];
    if (maxDelta > 0) {
      while (this.formEditAccountMultsig.get('minApprovalDelta').value > maxDelta) {
        this.formEditAccountMultsig.get('minApprovalDelta').patchValue(this.formEditAccountMultsig.get('minApprovalDelta').value - 1,
          { emitEvent: false, onlySelf: true });
      }
      while (this.formEditAccountMultsig.get('minRemovalDelta').value > maxDelta) {
        this.formEditAccountMultsig.get('minRemovalDelta').patchValue(this.formEditAccountMultsig.get('minRemovalDelta').value - 1,
          { emitEvent: false, onlySelf: true });
      }
    } else {
      this.formEditAccountMultsig.get('minApprovalDelta').patchValue(1, { emitEvent: false, onlySelf: true });
      this.formEditAccountMultsig.get('minRemovalDelta').patchValue(1, { emitEvent: false, onlySelf: true });
    }
    this.formEditAccountMultsig.controls['minApprovalDelta'].setValidators(validators);
    this.formEditAccountMultsig.controls['minApprovalDelta'].updateValueAndValidity({ emitEvent: false, onlySelf: true });
    this.formEditAccountMultsig.controls['minRemovalDelta'].setValidators(validators);
    this.formEditAccountMultsig.controls['minRemovalDelta'].updateValueAndValidity({ emitEvent: false, onlySelf: true });
  }


  /**
   *
   *
   * @param {Subscription[]} subscribe
   * @memberof ConvertAccountMultisigComponent
   */
  unsubscribe (subscribe: Subscription[]) {
    if (subscribe.length > 0) {
      subscribe.forEach((subscription) => {
        subscription.unsubscribe();
      });
    }
  }
  /**
   *
   *
   * @readonly
   * @type {FormArray}
   * @memberof ConvertAccountMultisigComponent
   */
  get cosignatories (): FormArray {
    return this.formEditAccountMultsig.get('cosignatories') as FormArray;
  }

  /**
   *
   *
   * @readonly
   * @type {FormArray}
   * @memberof ConvertAccountMultisigComponent
   */
  get cosignatoriesList (): CosignatoryListInterface[] {
    const list = this.formEditAccountMultsig
      .get('cosignatories')
      .value.filter((x) => x.cosignatory).map(x => {
        return {
          publicKey: x.cosignatory.toUpperCase()
        };
      }).filter(x => x && x !== '' && this.multisigService.validatePublicKey(x.publicKey));
    return this.concatCosignatoriesList(list, this.dataCurrentAccout.cosignatoryList);
  }

  /**
   *
   * @param newCosignatoryList
   * @param oldCosignatoryList
   */
  concatCosignatoriesList (newCosignatoryList: CosignatoryInterface[], oldCosignatoryList: CosignatoryListInterface[]): CosignatoryListInterface[] {
    const list: CosignatoryListInterface[] = newCosignatoryList.map(x => {
      const publicAccountS = (!this.multisigService.validatePublicKey(x.publicKey)) ? null :
        PublicAccount.createFromPublicKey(x.publicKey, environment.typeNetwork.value);
      return {
        type: 1,
        action: 'add',
        disableItem: false,
        id: publicAccountS.address,
        loading: false,
        cosignatories: [],
        publicAccount: publicAccountS
      };
    });
    return list.concat(oldCosignatoryList);
  }

  /**
  *
  *
  * @memberof ConvertAccountMultisigComponent
  */
  cleanInput (inputsKey: string[]) {
    inputsKey.forEach((element) => {
      this.formEditAccountMultsig
        .get(element)
        .patchValue('', { emitEvent: false, onlySelf: true });
    });
  }
  /**
   * @memberof CreateMultiSignatureComponent
   */
  disabledForm (noIncluye: string, accion: boolean) {
    for (const x in this.formEditAccountMultsig.value) {
      if (x !== noIncluye) {
        if (accion) {
          this.formEditAccountMultsig.get(x).disable();
        } else {
          this.formEditAccountMultsig.get(x).enable();
        }

      }
    }
  }

}

interface CurrentAccountInterface {
  label?: string;
  value?: any;
  isPartial?: boolean;
  data: AccountsInterface;
  isMultisig?: boolean;
}

interface ValidateAccountAlert {
  show: boolean;
  info: string;
  subInfo: string;
}

// /**
//  * cosignatory List
//  * @param publicAccount
//  * @param action - event (Add or delete)
//  * @param type - 1 = Add , 2 = remove , 3 = view
//  * @param disableItem - Disable item list
//  * @param id - Address in cosignatory
// */

export interface DataCurrentAccount {
  name?: string;
  address?: string;
  publicAccount?: PublicAccount;
  cosignatoryList?: CosignatoryListInterface[];
}

export interface InfoBalance {
  disabled: boolean;
  info: string;
}
