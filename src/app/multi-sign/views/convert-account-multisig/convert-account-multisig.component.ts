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
  MultiSignService,
} from '../../service/multi-sign.service';
import {
  ContactsListInterface,
  CosignatoryInterface,
  MultisigService,
  ToAggregateConvertMultisigInterface,
  ToConvertMultisigInterface
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
  // cosignatoryList: CosignatoryInterface[] = [];
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
  // typeTx: TypeTx;
  // transactionHttp: TransactionHttp;
  paramConvert: ToAggregateConvertMultisigInterface = null;
  passwordMain = 'password';
  paramsHeader: HeaderServicesInterface = {
    moduleName: 'Accounts > Multisign',
    componentName: 'Convert to Multisig Account',
  };
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
  constructor(
    private activateRoute: ActivatedRoute,
    private fb: FormBuilder,
    private multisigService: MultisigService,
    private nodeService: NodeService,
    private walletService: WalletService,
    private multiSignService: MultiSignService,
    private transactionService: TransactionsService,
    private dataBridge: DataBridgeService,
    private proximaxProvider: ProximaxProvider,
    private sharedService: SharedService
  ) {
    console.log('load component...');
    this.feeConfig = {
      fee: '0.000000',
      feeLockfund: 10000000,
      feeTransaction: 44500,
      totalFee: 0
    };
    this.configurationForm = this.sharedService.configurationForm;
    this.currentAccounts = [];
    this.transactionHttp = new TransactionHttp(environment.protocol + '://' + `${this.nodeService.getNodeSelected()}`);
  }

  /**
   *
   *
   * @memberof ConvertAccountMultisigComponent
   */
  ngOnInit () {
    this.createForm();
    this.getAccounts();
    this.subscribeValueChange();
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
   * @memberof ConvertAccountMultisigComponent
   */


  /**
   *
   *
   * @memberof CreateMultiSignatureComponent
   *  @param {SignedTransaction} signedTransaction  - Signed transaction.
   */
  announceAggregateBonded (signedTransaction: SignedTransaction) {
    this.formConvertAccountMultsig.get('selectAccount').patchValue('', { emitEvent: false, onlySelf: true });
    this.transactionHttp.announceAggregateBonded(signedTransaction).subscribe(
      async () => {
        this.getTransactionStatus(signedTransaction);
      },
      err => {
        this.sharedService.showError('', err);
        // this.clearForm();
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
      this.getTransactionStatus(signedTransaction)
    },
    err => {
      this.sharedService.showError('', err);
      // this.clearForm();
      this.blockSend = false;
    });

}

  /**
   * Get aggregateTransaction
   */
  aggregateTransactionModifyMultisig () {
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
  createForm () {
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

  convertIntoMultisigTransaction () {
    this.aggregateTransactionModifyMultisig();
    if (this.formConvertAccountMultsig.valid && !this.blockSend) {
      this.blockSend = true;
      const common: any = { password: this.formConvertAccountMultsig.get('password').value };
      if (this.walletService.decrypt(common, this.currentAccountToConvert)) {
        const accountSign: Account = Account.createFromPrivateKey(common.privateKey, this.currentAccountToConvert.network);
        const ownCosignatories = this.multisigService.filterOwnCosignatories(this.paramConvert.ownCosignatories, this.walletService.currentWallet.accounts);
        const accountOwnCosignatoriess: Account[] = ownCosignatories.map(x => {
          if (this.walletService.decrypt(common, x)) {
            return Account.createFromPrivateKey(common.privateKey, x.network);
          }
        });
        console.log('AccountOwnCosignatoriess', accountOwnCosignatoriess);
        const signedTransaction = this.multisigService.signedTransaction(accountSign, this.aggregateTransaction,
          this.dataBridge.blockInfo.generationHash, accountOwnCosignatoriess);
        if (this.aggregateTransaction.type === TransactionType.AGGREGATE_BONDED) {
          console.log('AGGREGATE_BONDED');
          const hashLockSigned = this.transactionService.buildHashLockTransaction(signedTransaction, accountSign, this.dataBridge.blockInfo.generationHash)
          this.hashLock(hashLockSigned, signedTransaction);
        } else {
          console.log('AGGREGATE_COMPLETE');
          this.announceAggregateComplete(signedTransaction);
        }
        // if (ownCosignatories.length > 0) {
        //   for (let item of ownCosignatories) {
        //     if (this.walletService.decrypt(common, item)) {
        //       AccountMyCosigners.push(Account.createFromPrivateKey(common.privateKey, item.network))
        //     }
        //   }
        // const ownCosignatories = this.multisigService.filterOwnCosignatories(this.cosignatoriesList, this.walletService.currentWallet.accounts);
      } else {
        console.log('CLAVE NO VALIDA');
        this.blockSend = false;
      }
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
   *
   * @memberof ConvertAccountMultisigComponent
   */
  cleanInput (inputsKey: string[]) {
    inputsKey.forEach((element) => {
      this.formConvertAccountMultsig
        .get(element)
        .patchValue('', { emitEvent: false, onlySelf: true });
    });
  }

  /**
   *
   *
   * @memberof ConvertAccountMultisigComponent
   */
  getAccounts () {
    const currentWallet = Object.assign({}, this.walletService.currentWallet);
    if (currentWallet && Object.keys(currentWallet).length > 0) {
      console.log('currentWallet', currentWallet);
      // validar que la transacción no esté en parcial
      this.subscribe.push(
        this.transactionService
          .getAggregateBondedTransactions$()
          .subscribe((transactions: TransactionsInterface[]) => {
            if (transactions.length > 0) {
              console.log('ESTAS SON MIS TRANSACCIONES', transactions);
            }
          })
      );

      currentWallet.accounts.forEach((element) => {
        const accountInfo = this.walletService.filterAccountInfo(element.name);
        console.log('accountInfo', accountInfo);
        if (accountInfo) {
          if (!this.multisigService.checkIsMultisig(element)) {
            console.log('is not multisig');
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
 * @memberof CreateMultiSignatureComponent
 *  @param {SignedTransaction} signedTransaction  - Signed transaction.
 */
  getTransactionStatushashLock (signedTransactionHashLock: SignedTransaction, signedTransactionBonded: SignedTransaction) {
    // Get transaction status
    this.dataBridge.getTransactionStatus().subscribe(
      statusTransaction => {
        if (statusTransaction !== null && statusTransaction !== undefined && signedTransactionHashLock !== null) {
          const match = statusTransaction['hash'] === signedTransactionHashLock.hash;
          if (statusTransaction['type'] === 'confirmed' && match) {
            setTimeout(() => {
              this.announceAggregateBonded(signedTransactionBonded)
              signedTransactionHashLock = null;
            }, environment.delayBetweenLockFundABT);
          } else if (statusTransaction['type'] === 'unconfirmed' && match) {
            // signedTransactionHashLock = null;
          } else if (match) {
            // this.clearForm()
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
          // this.clearForm();
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
          // this.clearForm();
          this.blockSend = false;
          signedTransaction = null;
        }
      }
    }
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
  hashLock (hashLockTransactionSigned: SignedTransaction, signedTransaction: SignedTransaction) {
    this.transactionHttp.announce(hashLockTransactionSigned).subscribe(async () => {
      this.getTransactionStatushashLock(hashLockTransactionSigned, signedTransaction);
    }, err => {
      // this.clearForm();
      this.blockSend = false;
      // this.sharedService.showError('', err);
    });
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
   * @param {*} account
   * @memberof ConvertAccountMultisigComponent
   */
  selectAccount (account: CurrentAccountInterface) {
    // this.cosignatoryList = [];
    this.formConvertAccountMultsig.enable({ emitEvent: false, onlySelf: true });
    this.formConvertAccountMultsig
      .get('cosignatory')
      .patchValue('', { emitEvent: false, onlySelf: false });
    if (account) {
      console.log('Account selected --->', account);
      this.maxDelta = 1;
      this.currentAccountToConvert = account.data;
      this.contactList = this.multisigService.validateAccountListContact(
        account.label
      );
    } else {
      this.contactList = [];
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

  // /**
  //  *
  //  *
  //  * @param {CosignatoryInterface} cosignatoryListParam
  //  * @memberof ConvertAccountMultisigComponent
  //  */
  // setCosignatoryList (cosignatory: CosignatoryInterface) {
  //   this.cosignatoryList.push(cosignatory);
  //   // this.validatorsMinApprovalDelta();
  //   // this.validatorsMinRemovalDelta();
  // }

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
  validateInput (
    nameInput: string = '',
    nameControl: string = '',
    nameValidation: string = ''
  ) {
    let validation: AbstractControl = null;
    if (nameInput !== '' && nameControl !== '') {
      validation = this.formConvertAccountMultsig.controls[nameControl].get(
        nameInput
      );
    } else if (
      nameInput === '' &&
      nameControl !== '' &&
      nameValidation !== ''
    ) {
      validation = this.formConvertAccountMultsig.controls[
        nameControl
      ].getError(nameValidation);
    } else if (nameInput !== '') {
      validation = this.formConvertAccountMultsig.get(nameInput);
    }
    return validation;
  }

  /**
   *  TODO   patchValue , updateValueAndValidity, setValidators optimizar para una sola funcion
   */
  validatorsDelta () {
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
  isRepeatCosignatory (cosignatoriesList?: CosignatoryInterface[], compareCosignatory?): boolean {
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

  subscribeValueChange () {
    // Cosignatory ValueChange
    this.formConvertAccountMultsig.get('cosignatories').valueChanges.subscribe(
      async next => {
        this.validatorsDelta();
        this.isRepeatCosignatory();
        // this.multisigService.validateCosig('');
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
  get cosignatories (): FormArray {
    return this.formConvertAccountMultsig.get('cosignatories') as FormArray;
  }

  /**
   *
   *
   * @readonly
   * @type {FormArray}
   * @memberof ConvertAccountMultisigComponent
   */
  get cosignatoriesList (): CosignatoryInterface[] {
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
