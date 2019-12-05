import { Component, OnInit } from '@angular/core';
import { NgBlockUI, BlockUI } from 'ng-block-ui';
import { AppConfig } from '../../../config/app.config';
import { SharedService, ConfigurationForm } from '../../../shared/services/shared.service';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { WalletService, AccountsInfoInterface, AccountsInterface } from '../../../wallet/services/wallet.service';
import {
  Account, PublicAccount,
  ModifyMultisigAccountTransaction,
  Deadline,
  MultisigCosignatoryModification,
  UInt64,
  NetworkType,
  Address,
  MultisigCosignatoryModificationType,
  HashLockTransaction,
  TransactionHttp,
  SignedTransaction,
  AggregateTransaction,
  Mosaic,
  MosaicId,
  AccountInfo
} from 'tsjs-xpx-chain-sdk';
import { NodeService } from '../../../servicesModule/services/node.service';
import { DataBridgeService } from '../../../shared/services/data-bridge.service';
import { ServicesModuleService } from '../../../servicesModule/services/services-module.service';
import { ProximaxProvider } from '../../../shared/services/proximax.provider';
import { TransactionsService } from '../../../transactions/services/transactions.service';
import { MultiSignService } from '../../../servicesModule/services/multi-sign.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-create-multi-signature',
  templateUrl: './create-multi-signature.component.html',
  styleUrls: ['./create-multi-signature.component.css']
})
export class CreateMultiSignatureComponent implements OnInit {

  @BlockUI() blockUI: NgBlockUI;
  accountInfo: AccountsInfoInterface = null;
  publicAccountToConvert: PublicAccount;
  subscribe = ['accountInfo', 'transactionStatus', 'char', 'block'];
  blockSend: boolean;
  showCurrentAccountToConvert: boolean;
  accountValid: boolean;
  showContacts: boolean;
  searchContact: boolean;
  btnBlock: boolean;
  ban: boolean;
  mdbBtnAddCosignatory: boolean;
  listContact: any = [];
  subscribeAccount = null;
  configurationForm: ConfigurationForm = {};
  createMultsignForm: FormGroup;
  currentAccounts: any = [];
  routes = {
    backToService: `/${AppConfig.routes.service}`,
    createNewAccount: `/${AppConfig.routes.selectTypeCreationAccount}`,
    viewDetails: `/${AppConfig.routes.account}/`
  };
  currentAccountToConvert: AccountsInterface;
  cosignatoryList: CosignatoryList[] = [];
  headElements: string[];
  minApprovaMaxLength = 1;
  minApprovaMinLength = 1;
  accountToConvertSign: Account;
  transactionHttp: TransactionHttp;
  balance: string;
  isMultisig: boolean;
  consginerFirmName: string;
  consginerFirmAccount: AccountsInterface;

  constructor(
    private fb: FormBuilder,
    private sharedService: SharedService,
    private walletService: WalletService,
    private nodeService: NodeService,
    private dataBridge: DataBridgeService,
    private serviceModuleService: ServicesModuleService,
    private proximaxProvider: ProximaxProvider,
    private transactionService: TransactionsService,
    private multiSignService: MultiSignService

  ) {
    this.headElements = ['Address', 'Remove'];
    this.configurationForm = this.sharedService.configurationForm;
    this.blockSend = false;
    this.ban = false;
    this.btnBlock = true;
    this.accountValid = false;
    this.listContact = [];
    this.showContacts = false;
    this.mdbBtnAddCosignatory = true;
    this.searchContact = false;
    this.isMultisig = false;
    this.showCurrentAccountToConvert = false
    this.currentAccounts = []
    this.transactionHttp = new TransactionHttp(environment.protocol + "://" + `${this.nodeService.getNodeSelected()}`
    );
  }


  /**
 *
 *
 * @memberof CreateTransferComponent
 */
  ngOnDestroy(): void {
    this.subscribe.forEach(element => {
      if (this.subscribe[element] !== undefined) {
        this.subscribe[element].unsubscribe();
      }
    });
  }

  ngOnInit() {
    this.createForm()
    this.subscribeValueChange();
    this.getAccounts();
    this.booksAddress()
    // cuenta multi firma
    //9efe61fb49eea91fdfd89c80bae15b769c64e687917584473c823a6c0962ee90
    //TBFZFICV47MMUVYVHNOKJ3APF27SSW3AD6UV55OA



    //consignatario
    //ac54e59fec8f0e1770e6e7cb35f7ecf3d6ed7356b9f88787d15d3d9bd01f90f9
    // TCQXBGF4VMERBI5AMXJCS7RXWGCYVWOWSN6E2VIV

    //sin key
    //4c18c4d267dc2a249bbf2edf95ae931e20cd34d80e3611f653873fbab05ffc39
    //TAINL455O6TEF3FJDK63FKY7KCFATMWFGYMQRLOS
  }

  /**
   *
   *
   * @memberof CreateMultiSignatureComponent
   */
  createForm() {
    //Form create multisignature default
    this.createMultsignForm = this.fb.group({
      selectAccount: ['', [
        Validators.required
      ]
      ],
      cosignatory: [''],
      contact: [''],
      minApprovalDelta: [1, [
        Validators.required, Validators.minLength(1),
        Validators.maxLength(1)]],
      minRemovalDelta: [1, [
        Validators.required, Validators.minLength(1),
        Validators.maxLength(1)]],
      password: ['', [
        Validators.required,
        Validators.minLength(this.configurationForm.passwordWallet.minLength),
        Validators.maxLength(this.configurationForm.passwordWallet.maxLength)
      ]
      ],
    });
    this.validatorsCosignatory();
    this.changeformStatus()
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
    this.showCurrentAccountToConvert = false;
    this.showContacts = false;
    this.mdbBtnAddCosignatory = true;
    this.isMultisig = false;
    this.publicAccountToConvert = undefined;
    this.cosignatoryList = [];
    if (custom !== undefined) {
      if (formControl !== undefined) {
        this.createMultsignForm.controls[formControl].get(custom).reset();
        return;
      }
      this.createMultsignForm.get(custom).reset();
      return;
    }
    this.createMultsignForm.reset();
    return;
  }

  /**
 *
 *
 * @memberof CreateMultiSignatureComponent
 */
  clearData() {
    // this.createMultsignForm.get('selectAccount').patchValue('');
    this.createMultsignForm.get('cosignatory').patchValue('', { emitEvent: false, onlySelf: true });
    this.createMultsignForm.get('contact').patchValue('', { emitEvent: false, onlySelf: true });
    this.createMultsignForm.get('minApprovalDelta').patchValue(1, { emitEvent: false, onlySelf: true });
    this.createMultsignForm.get('minRemovalDelta').patchValue(1, { emitEvent: false, onlySelf: true });
    this.publicAccountToConvert = undefined;
    this.isMultisig = false;
    this.cosignatoryList = [];
    this.showContacts = false;
    this.mdbBtnAddCosignatory = true;
  }

  changeformStatus() {
    this.createMultsignForm.statusChanges.subscribe(res => {
      this.btnblckfun()
    }
    );
  }
  btnblckfun() {
    this.btnBlock = true;
    if (this.createMultsignForm.valid && this.cosignatoryList.length > 0) {
      this.btnBlock = false;
    }
  }

  /**
  *
  *
  * @memberof CreateTransferComponent
  */
  booksAddress() {
    const data = this.listContact.slice(0);
    const bookAddress = this.serviceModuleService.getBooksAddress();
    this.listContact = [];
    if (bookAddress !== undefined && bookAddress !== null) {
      for (let x of bookAddress) {
        data.push(x);
      }
      this.listContact = data;
    }
  }

  /**
 *
 *
 * @param {*} event
 * @memberof CreateMultiSignatureComponent
 */
  async selectContact(event: { label: string, value: string }) {
    if (event !== undefined && event.value !== '') {
      this.searchContact = true;
      this.createMultsignForm.get('cosignatory').patchValue('', { emitEvent: false, onlySelf: true });
      this.proximaxProvider.getAccountInfo(Address.createFromRawAddress(event.value)).subscribe((res: AccountInfo) => {
        this.searchContact = false;
        if (res.publicKeyHeight.toHex() === '0000000000000000') {
          this.sharedService.showWarning('', 'you need a public key');
          this.createMultsignForm.get('contact').patchValue('', { emitEvent: false, onlySelf: true });
          this.createMultsignForm.get('contact').patchValue('', { emitEvent: false, onlySelf: true });
          // this.showContacts = false;
        } else {
          this.createMultsignForm.get('cosignatory').patchValue(res.publicKey, { emitEvent: true })
          this.createMultsignForm.get('contact').patchValue('', { emitEvent: false, onlySelf: true });
        }
      }, err => {
        this.createMultsignForm.get('contact').patchValue('', { emitEvent: false, onlySelf: true });
        this.searchContact = false;
        this.sharedService.showWarning('', 'Address is not valid');
      })
    }
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
      validation = this.createMultsignForm.controls[nameControl].get(nameInput);
    } else if (nameInput === '' && nameControl !== '' && nameValidation !== '') {
      validation = this.createMultsignForm.controls[nameControl].getError(nameValidation);
    } else if (nameInput !== '') {
      validation = this.createMultsignForm.get(nameInput);
    }
    return validation;
  }

  /**
   *
   * Get accounts wallet
   * @memberof CreateMultiSignatureComponent
   */
  getAccounts() {
    this.walletService.currentWallet.accounts.forEach(element => {
      this.currentAccounts.push({
        label: element.name,
        value: element
      });
    });
  }

  selectAccount($event: Event) {
    this.clearData()
    this.createMultsignForm.get('password').reset()
    this.createMultsignForm.enable({ emitEvent: false, onlySelf: true });
    const account: any = $event
    this.showCurrentAccountToConvert = false;
    if (account !== null && account !== undefined) {

      this.showCurrentAccountToConvert = true;
      this.currentAccountToConvert = account.value;
      this.validatorsMinApprovalDelta();
      this.validatorsMinRemovalDelta();
      this.subscribeAccount = this.walletService.getAccountsInfo$().subscribe(
        async accountInfo => {
          this.accountInfo = this.walletService.filterAccountInfo(account.value.name);
          this.accountValid = (
            this.accountInfo !== null &&
            this.accountInfo !== undefined && this.accountInfo.accountInfo !== null);
          if (this.subscribeAccount) {
            this.subscribeAccount.unsubscribe();
          }
          this.balance = '0.000000'
          this.isMultisig = (this.accountInfo !== null &&
            this.accountInfo !== undefined && this.accountInfo.multisigInfo !== null && this.accountInfo.multisigInfo !== undefined && this.accountInfo.multisigInfo.isMultisig());
          if (!this.isMultisig) {

            this.mdbBtnAddCosignatory = false;
            this.publicAccountToConvert = PublicAccount.createFromPublicKey(this.currentAccountToConvert.publicAccount.publicKey, this.currentAccountToConvert.network)
            if (this.accountValid) {
              const mosaicXPX = this.accountInfo.accountInfo.mosaics.find(next => next.id.toHex() === environment.mosaicXpxInfo.id);
              if (mosaicXPX) {
                this.balance = this.transactionService.amountFormatterSimple(mosaicXPX.amount.compact());
              }
            }
          } else {

            const mosaicXPX = this.accountInfo.accountInfo.mosaics.find(next => next.id.toHex() === environment.mosaicXpxInfo.id);

            if (mosaicXPX) {
              this.balance = this.transactionService.amountFormatterSimple(mosaicXPX.amount.compact());
            }
            if (this.hasCosigner()) {
              this.publicAccountToConvert = PublicAccount.createFromPublicKey(this.currentAccountToConvert.publicAccount.publicKey, this.currentAccountToConvert.network)
              // this.getCosignerFirm()
              this.mdbBtnAddCosignatory = false;
              this.setValueForm('edit', true, 3);
              this.validatorsCosignatory()

            } else {
              this.mdbBtnAddCosignatory = true;
              this.setValueForm('view', true, 3)
              this.createMultsignForm.disable();
              this.createMultsignForm.get('selectAccount').enable({ emitEvent: false, onlySelf: true });
              // this.createMultsignForm.updateValueAndValidity({ emitEvent: false, onlySelf: true })
              // this.btnBlock = true;
            }
          }
        });
    }
  }

  hasCosigner(): boolean {
    let isCosigner = false;
    this.consginerFirmName = "empty"
    this.consginerFirmAccount = null;
    for (let index = 0; index < this.walletService.currentWallet.accounts.length; index++) {
      const publicAccount: PublicAccount = PublicAccount.createFromPublicKey(this.walletService.currentWallet.accounts[index].publicAccount.publicKey, this.walletService.currentWallet.accounts[index].publicAccount.address.networkType);
      if (this.accountInfo.multisigInfo.hasCosigner(publicAccount)) {
        this.consginerFirmName = this.walletService.currentWallet.accounts[index].name;
        this.consginerFirmAccount = this.walletService.currentWallet.accounts[index];
        isCosigner = this.accountInfo.multisigInfo.hasCosigner(publicAccount)
        break
      }
    }
    return isCosigner;
  }

  /**
  *
  *
  * @memberof CreateMultiSignatureComponent
  */
  convertIntoMultisigTransaction() {
    this.blockSend = true;
    let common: any = { password: this.createMultsignForm.get("password").value };
    let accountDecrypt: AccountsInterface;
    accountDecrypt = this.isMultisig ? this.consginerFirmAccount : this.currentAccountToConvert;
    if (this.walletService.decrypt(common, accountDecrypt)) {
      if (this.createMultsignForm.valid && this.cosignatoryList.length > 0 && !this.ban) {
        this.ban = true;
        this.accountToConvertSign = Account.createFromPrivateKey(common.privateKey, accountDecrypt.network)
        // common = '';
        let convertIntoMultisigTransaction: ModifyMultisigAccountTransaction;
        convertIntoMultisigTransaction = this.modifyMultisigAccountTransaction()
        // console.log('convertIntoMultisigTransaction', convertIntoMultisigTransaction)

        /**
         * Create Bonded
         */
        const aggregateTransaction = AggregateTransaction.createBonded(
          Deadline.create(environment.deadlineTransfer.deadline, environment.deadlineTransfer.chronoUnit),
          [convertIntoMultisigTransaction.toAggregate(this.currentAccountToConvert.publicAccount)],
          this.currentAccountToConvert.network);
        const generationHash = this.dataBridge.blockInfo.generationHash;
        const signedTransaction = this.accountToConvertSign.sign(aggregateTransaction, generationHash) //Update-sdk-dragon

        // /**
        // * Create Hash lock transaction
        // */
        const hashLockTransaction = HashLockTransaction.create(
          Deadline.create(environment.deadlineTransfer.deadline, environment.deadlineTransfer.chronoUnit),
          new Mosaic(new MosaicId(environment.mosaicXpxInfo.id), UInt64.fromUint(Number(10000000))),
          UInt64.fromUint(environment.lockFundDuration),
          signedTransaction,
          this.currentAccountToConvert.network);

        this.hashLock(this.accountToConvertSign.sign(hashLockTransaction, generationHash), signedTransaction) //Update-sdk-dragon
      }
    } else {
      this.blockSend = false;
    }
  }


  modifyMultisigAccountTransaction(): ModifyMultisigAccountTransaction {
    let modifyobject: Modifyobject;
    if (this.isMultisig) {
      const valor = this.multiSignService.calcMinDelta(
        this.accountInfo.multisigInfo.minApproval,
        this.accountInfo.multisigInfo.minRemoval,
        this.createMultsignForm.get('minApprovalDelta').value,
        this.createMultsignForm.get('minRemovalDelta').value
      )
      modifyobject = {
        deadline: Deadline.create(environment.deadlineTransfer.deadline, environment.deadlineTransfer.chronoUnit),
        minApprovalDelta: valor['minApprovalDelta'],
        minRemovalDelta: valor['minRemovalDelta'],
        modifications: this.multisigCosignatoryModification(this.getCosignatoryListFilter(1, 2)),
        networkType: this.currentAccountToConvert.network
      }
      // console.log(modify)
    } else {
      modifyobject = {
        deadline: Deadline.create(environment.deadlineTransfer.deadline, environment.deadlineTransfer.chronoUnit),
        minApprovalDelta: this.createMultsignForm.get('minApprovalDelta').value,
        minRemovalDelta: this.createMultsignForm.get('minRemovalDelta').value,
        modifications: this.multisigCosignatoryModification(this.getCosignatoryListFilter(1, 1)),
        networkType: this.currentAccountToConvert.network
      }
    }
    return ModifyMultisigAccountTransaction.create(
      modifyobject.deadline,
      modifyobject.minApprovalDelta,
      modifyobject.minRemovalDelta,
      modifyobject.modifications,
      modifyobject.networkType);
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
          this.getTransactionStatushashLock(hashLockTransactionSigned, signedTransaction)
          // this.blockSend = false;
        },
        err => {
          this.ban = false;
          this.blockSend = false;
          this.btnBlock = true;
          this.sharedService.showError('', err);
          // this.blockSend = false;
        });

  }

  /**
   *
   *
   * @memberof CreateMultiSignatureComponent
   *  @param {SignedTransaction} signedTransaction  - Signed transaction.
   */
  announceAggregateBonded(signedTransaction: SignedTransaction) {
    this.clearData();
    this.clearForm();
    this.transactionHttp.announceAggregateBonded(signedTransaction).subscribe(
      async () => {
        this.getTransactionStatus(signedTransaction)
        this.blockSend = false;
        this.btnBlock = true;
        this.ban = false;
      },
      err => {
        this.sharedService.showError('', err);
        this.ban = false;
        this.blockSend = false;
        this.btnBlock = true;
      });

  }
  copyMessage(message: string) {
    this.sharedService.showSuccess('', `${message} copied`);
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
        // console.log('EL MMG statusTransaction', statusTransaction);
        // this.blockSend = false;
        if (statusTransaction !== null && statusTransaction !== undefined && signedTransaction !== null) {
          const match = statusTransaction['hash'] === signedTransaction.hash;
          if (statusTransaction['type'] === 'confirmed' && match) {
            signedTransaction = null;
          } else if (statusTransaction['type'] === 'unconfirmed' && match) {
            this.transactionService.searchAccountsInfo([this.currentAccountToConvert])
            signedTransaction = null;
          } else if (match) {
            signedTransaction = null;
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
  getTransactionStatushashLock(signedTransactionHashLock: SignedTransaction, signedTransactionBonded: SignedTransaction) {
    // Get transaction status
    this.subscribe['transactionStatus'] = this.dataBridge.getTransactionStatus().subscribe(
      statusTransaction => {
        // console.log('EL MMG statusTransaction', statusTransaction);
        // //  this.blockSend = false;
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
            this.blockSend = false;
            this.ban = false;
            this.btnBlock = true;
            signedTransactionHashLock = null;
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
    // console.log(cosignatoryList)
    if (cosignatoryList.length > 0) {
      for (let index = 0; index < cosignatoryList.length; index++) {
        const element = cosignatoryList[index];
        const type: MultisigCosignatoryModificationType = (cosignatoryList[index].type === 1) ? MultisigCosignatoryModificationType.Add : MultisigCosignatoryModificationType.Remove;
        // console.log("type", type)
        cosignatory.push(
          new MultisigCosignatoryModification(
            type,
            cosignatoryList[index].publicAccount,
          )
        )
      }

    }
    return cosignatory
  }
  /**
  *
  *
  * @memberof CreateNamespaceComponent
  *
  */
  subscribeValueChange() {
    // Cosignatory ValueChange
    this.createMultsignForm.get('cosignatory').valueChanges.subscribe(
      next => {
        if (next !== null && next !== undefined) {

        }
        this.validatorsCosignatory()
      }
    );
  }

  setValueForm(action: string, disableItem: boolean, type: number) {
    const consignatarioList: CosignatoryList[] = []
    for (let element of this.accountInfo.multisigInfo.cosignatories) {
      consignatarioList.push({ publicAccount: element, action: action, type: type, disableItem: disableItem, id: element.address });

    }
    this.createMultsignForm.get('minApprovalDelta').patchValue(this.accountInfo.multisigInfo.minApproval, { emitEvent: false, onlySelf: true })
    this.createMultsignForm.get('minRemovalDelta').patchValue(this.accountInfo.multisigInfo.minRemoval, { emitEvent: false, onlySelf: true })
    this.setCosignatoryList(consignatarioList)
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
    if (this.cosignatoryList.length > 0 && (this.createMultsignForm.get('cosignatory').value === null
      || this.createMultsignForm.get('cosignatory').value === undefined
      || this.createMultsignForm.get('cosignatory').value === '')) {
      this.createMultsignForm.controls['cosignatory'].setValidators(null);
    } else {
      this.createMultsignForm.controls['cosignatory'].setValidators(validators);
    }
    this.createMultsignForm.controls['cosignatory'].updateValueAndValidity({ emitEvent: false });
  }

  /**
  * Change the form validator (minApprovalDelta)
  * @memberof CreateMultiSignatureComponent
  */
  validatorsMinApprovalDelta() {
    const validators = [Validators.required,
    Validators.minLength(1),
    Validators.maxLength(this.getCosignatoryListFilter(1, 3).length)]
    // this.minApprovaMinLength = 1;
    this.minApprovaMaxLength = this.getCosignatoryListFilter(1, 3).length
    // this.createMultsignForm.get('minApprovalDelta').patchValue(1, { emitEvent: false, onlySelf: true });
    this.createMultsignForm.controls['minApprovalDelta'].setValidators(validators);
    this.createMultsignForm.controls['minApprovalDelta'].updateValueAndValidity({ emitEvent: false, onlySelf: true });
  }

  /**
* Change the form validator (minRemovalDelta)
* @memberof CreateMultiSignatureComponent
*/
  validatorsMinRemovalDelta() {
    const validators = [Validators.required,
    Validators.minLength(1),
    Validators.maxLength(this.getCosignatoryListFilter(1, 3).length)]
    // this.minApprovaMinLength = 1;
    this.minApprovaMaxLength = this.getCosignatoryListFilter(1, 3).length
    // this.createMultsignForm.get('minRemovalDelta').patchValue(1, { emitEvent: false, onlySelf: true });
    this.createMultsignForm.controls['minRemovalDelta'].setValidators(validators);
    this.createMultsignForm.controls['minRemovalDelta'].updateValueAndValidity({ emitEvent: false, onlySelf: true });

  }

  /**
  * Add cosignatory to the board
  * @memberof CreateMultiSignatureComponent
  */
  addCosignatory() {
    if (this.createMultsignForm.get('cosignatory').valid) {
      this.showContacts = false;
      const cosignatory: PublicAccount = PublicAccount.createFromPublicKey(
        this.createMultsignForm.get('cosignatory').value,
        this.walletService.currentAccount.network
      );
      // Cosignatory needs a public key
      // if (!this.cosignatoryPubKey) return this._Alert.cosignatoryhasNoPubKey();

      // Multisig cannot be cosignatory
      if (this.publicAccountToConvert.address.plain() === cosignatory.address.plain())
        return this.sharedService.showError('Attention', 'A multisig account cannot be set as cosignatory');
      // Check presence in cosignatory List array
      if (!Boolean(this.cosignatoryList.find(item => { return item.publicAccount.address.plain() === cosignatory.address.plain() }))) {
        this.btnblckfun()
        this.cosignatoryList.push({ publicAccount: cosignatory, action: 'Add', type: 1, disableItem: false, id: cosignatory.address });
        this.setCosignatoryList(this.cosignatoryList);
        this.createMultsignForm.get('cosignatory').patchValue('');
      } else {
        this.sharedService.showError('Attention', 'Cosignatory is already present in modification list');
      }
    }
  }
  /**
  * Delete cosignatory to the cosignatory List
  * @memberof CreateMultiSignatureComponent
  * @param id  - Address in cosignatory.
  */
  deleteCosignatory(id: Address, disableItem: boolean, type: number) {
    if (!disableItem) {
      const cosignatoryList = this.cosignatoryList.filter(item => item.id.plain() !== id.plain())
      this.setCosignatoryList(cosignatoryList);
    } else {

      this.cosignatoryList.filter(item => item.action === "edit").map((item: CosignatoryList) => {
        item.type = 3;
      });
      this.cosignatoryList.filter(item => item.id.plain() === id.plain()).map((item: CosignatoryList) => {
        item.type = (item.type === 3) ? 2 : 3
      });
      this.setCosignatoryList(this.cosignatoryList)
    }
    this.validatorsCosignatory()
    this.btnblckfun()
    this.createMultsignForm.get('minApprovalDelta').patchValue('', { emitEvent: false, onlySelf: true });
    this.createMultsignForm.get('minRemovalDelta').patchValue('', { emitEvent: false, onlySelf: true });
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
  getCosignatoryListFilter(type: number, orType: number): CosignatoryList[] {
    return this.cosignatoryList.filter(item => item.type === type || item.type === orType);

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
  deadline: Deadline,
  minApprovalDelta: number,
  minRemovalDelta: number,
  modifications: MultisigCosignatoryModification[],
  networkType: NetworkType,
  maxFee?: UInt64
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
