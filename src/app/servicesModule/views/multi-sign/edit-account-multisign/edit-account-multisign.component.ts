import { Component, OnInit } from '@angular/core';
import { AppConfig } from 'src/app/config/app.config';
import { PublicAccount, TransactionHttp, Address, AccountInfo, Deadline, MultisigCosignatoryModification, NetworkType, UInt64, Account, AggregateTransaction, HashLockTransaction, Mosaic, MosaicId, ModifyMultisigAccountTransaction, MultisigCosignatoryModificationType, SignedTransaction } from 'tsjs-xpx-chain-sdk';
import { ConfigurationForm, SharedService } from 'src/app/shared/services/shared.service';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AccountsInterface, AccountsInfoInterface, WalletService } from 'src/app/wallet/services/wallet.service';
import { MultiSignService } from 'src/app/servicesModule/services/multi-sign.service';
import { ServicesModuleService } from 'src/app/servicesModule/services/services-module.service';
import { ProximaxProvider } from 'src/app/shared/services/proximax.provider';
import { NodeService } from 'src/app/servicesModule/services/node.service';
import { TransactionsService, TransactionsInterface } from 'src/app/transactions/services/transactions.service';
import { DataBridgeService } from 'src/app/shared/services/data-bridge.service';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-edit-account-multisign',
  templateUrl: './edit-account-multisign.component.html',
  styleUrls: ['./edit-account-multisign.component.css']
})
export class EditAccountMultisignComponent implements OnInit {
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
  minApprovaMaxLength: number = 1;
  minApprovaMinLength: number = 1;
  currentAccount: any;
  currentAccountToConvert: AccountsInterface;
  subscribeAccount: Subscription[] = [];
  accountInfo: AccountsInfoInterface = null;
  accountEditSign: Account;
  accountToConvertSign: Account;
  showConsginerFirmList: boolean
  accountValid: boolean;
  mdbBtnAddCosignatory: boolean;
  cosignatoryList: CosignatoryList[] = [];
  consginerFirmList: any = [];
  transactionHttp: TransactionHttp;
  listContact: ContactsListInterface[] = [];
  showContacts: boolean;
  isMultisig: boolean;
  searchContact: boolean;
  btnBlock: boolean;
  isDisabledList: boolean;
  blockSend: boolean;
  ban: any;
  consginerFirmName: string;
  consginerFirmAccount: any;
  subscribeAccountContat: Subscription;
  disable: boolean;
  subscribeAggregateBonded: Subscription[] = [];;

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
    this.showConsginerFirmList = false
    this.configurationForm = this.sharedService.configurationForm;
    this.accountValid = false;
    this.mdbBtnAddCosignatory = true;
    this.showContacts = false;
    this.cosignatoryList = [];
    this.isMultisig = false;
    this.ban = false;
    this.btnBlock = true;
    this.isDisabledList = false;
    this.transactionHttp = new TransactionHttp(environment.protocol + "://" + `${this.nodeService.getNodeSelected()}`);
  }

  ngOnInit() {
    this.createForm()
    this.booksAddress();
    this.subscribeValueChange();
    this.changeformStatus()
    this.listContact = this.booksAddress();
    // this.validatorsCosignatory()
    this.selectAccount(this.activateRoute.snapshot.paramMap.get('name'));


  }
  /**
 *
 *
 * @memberof CreateTransferComponent
 */
  ngOnDestroy(): void {
    // this.subscribeAccount.unsubscribe();

    this.unsubscribe(this.subscribeAggregateBonded);
    this.unsubscribe(this.subscribeAccount);
  }

  /**
 *
 *
 * @memberof ConvertAccountMultisignComponent
 */
  createForm() {
    //Form create multisignature default
    this.editAccountMultsignForm = this.fb.group({
      cosignatory: [''],
      cosignatorieSign: [''],
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
    // this.changeformStatus()
    // this.validatorsCosignatory()
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
* @memberof ConvertAccountMultisignComponent
*/
  selectAccount(name: string) {
    this.clearData();
    this.listContact = this.booksAddress();
    this.currentAccountToConvert = this.walletService.filterAccountWallet(name)
    this.listContact = this.booksAddress().filter(item => item.label !== this.currentAccountToConvert.name)
    this.subscribeAccount.push(this.walletService.getAccountsInfo$().subscribe(
      async accountInfo => {
        console.log("respondio  accountInfo")


        this.getAggregateBondedTransactionsValidate()
        // this.accountInfo = this.walletService.filterAccountInfo(name);

      }));
    // this.clearData();
  }

  /**
   *
   * @param name
   */
  validateAccount(name: string, disable: boolean) {
    this.mdbBtnAddCosignatory = true;
    this.accountInfo = this.walletService.filterAccountInfo(name);
    this.accountValid = (
      this.accountInfo !== null &&
      this.accountInfo !== undefined && this.accountInfo.accountInfo !== null);
    // if (this.subscribeAccount) {
    //   this.subscribeAccount.unsubscribe();
    // }
    this.unsubscribe(this.subscribeAccount);
    //Validate Account
    if (!this.accountValid)
      return

    //Validate Multisign
    this.isMultisig = (this.accountInfo.multisigInfo !== null && this.accountInfo.multisigInfo !== undefined && this.accountInfo.multisigInfo.isMultisig());
    if (!this.isMultisig) {
      this.sharedService.showError('Attention', 'not is Multisig');
      setTimeout(() => {
        this.router.navigate([`/${AppConfig.routes.MultiSign}`]);
      }, 3000);
    }
    //Validate Balance
    if (!this.accountInfo.accountInfo.mosaics.find(next => next.id.toHex() === environment.mosaicXpxInfo.id))
      return this.sharedService.showError('Attention', 'Insufficient balance');



    if (this.hasCosigner() && !this.disable) {
      this.publicAccountToConvert = PublicAccount.createFromPublicKey(this.currentAccountToConvert.publicAccount.publicKey, this.currentAccountToConvert.network)
      // this.getCosignerFirm()
      this.mdbBtnAddCosignatory = false;
      this.setValueForm('edit', true, 3);
    } else {
      this.mdbBtnAddCosignatory = true;
      this.setValueForm('view', true, 3)
      this.editAccountMultsignForm.disable();
      this.isDisabledList = true;
    }




  }
  // TransactionType.MODIFY_MULTISIG_ACCOUNT

  getAggregateBondedTransactionsValidate() {
    this.disable = false
    this.subscribeAggregateBonded.push(this.transactionService.getAggregateBondedTransactions$().subscribe((transactions: TransactionsInterface[]) => {

      for (let index = 0; index < transactions.length; index++) {
        for (let i = 0; i < transactions[index].data['innerTransactions'].length; i++) {
          this.disable = (transactions[index].data['innerTransactions'][i].signer.publicKey === this.currentAccountToConvert.publicAccount.publicKey);

          if (this.disable)
            break
        }
        if (this.disable)
          break
      }
      // }
      this.validateAccount(this.activateRoute.snapshot.paramMap.get('name'), this.disable)
    }));

  }

  hasCosigner(): boolean {
    let isCosigner = false;
    this.consginerFirmList = []
    this.consginerFirmName = "empty"
    this.consginerFirmAccount = null;
    for (let index = 0; index < this.walletService.currentWallet.accounts.length; index++) {
      const publicAccount: PublicAccount = PublicAccount.createFromPublicKey(this.walletService.currentWallet.accounts[index].publicAccount.publicKey,
        this.walletService.currentWallet.accounts[index].publicAccount.address.networkType);
      if (this.accountInfo.multisigInfo.hasCosigner(publicAccount)) {
        // this.consginerFirmName = '';
        this.consginerFirmAccount = this.walletService.currentWallet.accounts[index];
        this.consginerFirmList.push({
          label: this.walletService.currentWallet.accounts[index].name,
          value: this.walletService.currentWallet.accounts[index]
        })

        isCosigner = this.accountInfo.multisigInfo.hasCosigner(publicAccount)
        // break
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
    return isCosigner;
  }

  setValueForm(action: string, disableItem: boolean, type: number) {
    const consignatarioList: CosignatoryList[] = []
    for (let element of this.accountInfo.multisigInfo.cosignatories) {
      consignatarioList.push({ publicAccount: element, action: action, type: type, disableItem: disableItem, id: element.address });
    }
    this.editAccountMultsignForm.get('minApprovalDelta').patchValue(this.accountInfo.multisigInfo.minApproval, { emitEvent: false, onlySelf: true })
    this.editAccountMultsignForm.get('minRemovalDelta').patchValue(this.accountInfo.multisigInfo.minRemoval, { emitEvent: false, onlySelf: true })
    this.setCosignatoryList(consignatarioList, false)
  }



  /**
  *
  * @param $event
  */
  selectCosignatorieSign($event) {
    if ($event) {
      this.consginerFirmAccount = $event.value;
    } else {
      this.consginerFirmAccount = null;
    }
  }



  /**
  *
  *
  * @memberof CreateMultiSignatureComponent
  */
  editIntoMultisigTransaction() {
    this.blockSend = true;
    let common: any = { password: this.editAccountMultsignForm.get("password").value };
    if (this.walletService.decrypt(common, this.consginerFirmAccount)) {
      if (this.editAccountMultsignForm.valid && this.cosignatoryList.length > 0 && !this.ban) {
        this.ban = true;
        this.accountToConvertSign = Account.createFromPrivateKey(common.privateKey, this.consginerFirmAccount.network)
        // common = '';
        let convertIntoMultisigTransaction: ModifyMultisigAccountTransaction;
        convertIntoMultisigTransaction = this.modifyMultisigAccountTransaction()

        /**
         * Create Bonded
         */
        const aggregateTransaction = AggregateTransaction.createBonded(
          Deadline.create(),
          [convertIntoMultisigTransaction.toAggregate(this.currentAccountToConvert.publicAccount)],
          this.currentAccountToConvert.network);
        const generationHash = this.dataBridge.blockInfo.generationHash;
        const signedTransaction = this.accountToConvertSign.sign(aggregateTransaction, generationHash)  //Update-sdk-dragon

        // /**
        // * Create Hash lock transaction
        // */
        const hashLockTransaction = HashLockTransaction.create(
          Deadline.create(),
          new Mosaic(new MosaicId(environment.mosaicXpxInfo.id), UInt64.fromUint(Number(10000000))),
          UInt64.fromUint(480),
          signedTransaction,
          this.currentAccountToConvert.network);
        this.hashLock(this.accountToConvertSign.sign(hashLockTransaction, generationHash), signedTransaction) //Update-sdk-dragon
      }
    } else {
      this.blockSend = false;
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
  getTransactionStatushashLock(signedTransactionHashLock: SignedTransaction, signedTransactionBonded: SignedTransaction) {
    // Get transaction status
    this.subscribe['transactionStatus'] = this.dataBridge.getTransactionStatus().subscribe(
      statusTransaction => {
        // //  this.blockSend = false;
        if (statusTransaction !== null && statusTransaction !== undefined && signedTransactionHashLock !== null) {
          const statusTransactionHash = (statusTransaction['type'] === 'error') ? statusTransaction['data'].hash : statusTransaction['data'].transactionInfo.hash;
          const match = statusTransactionHash === signedTransactionHashLock.hash;
          if (statusTransaction['type'] === 'confirmed' && match) {
            this.announceAggregateBonded(signedTransactionBonded)
            signedTransactionHashLock = null;
            this.sharedService.showSuccess('', 'Transaction confirmed hash Lock');
          } else if (statusTransaction['type'] === 'unconfirmed' && match) {
            // signedTransactionHashLock = null;
            this.sharedService.showInfo('', 'Transaction unconfirmed hash Lock');
          } else if (match) {
            this.blockSend = false;
            this.ban = false;
            this.btnBlock = true;
            signedTransactionHashLock = null;
            this.sharedService.showWarning('', statusTransaction['data'].status.split('_').join(' '));
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
    )
    modifyobject = {
      deadline: Deadline.create(),
      minApprovalDelta: valor['minApprovalDelta'],
      minRemovalDelta: valor['minRemovalDelta'],
      modifications: this.multisigCosignatoryModification(this.getCosignatoryListFilter(1, 2)),
      networkType: this.currentAccountToConvert.network
    }

    return ModifyMultisigAccountTransaction.create(
      modifyobject.deadline,
      modifyobject.minApprovalDelta,
      modifyobject.minRemovalDelta,
      modifyobject.modifications,
      modifyobject.networkType
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
        const element = cosignatoryList[index];
        const type: MultisigCosignatoryModificationType = (cosignatoryList[index].type === 1) ? MultisigCosignatoryModificationType.Add : MultisigCosignatoryModificationType.Remove;
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
   * @memberof CreateMultiSignatureComponent
   *  @param {SignedTransaction} signedTransaction  - Signed transaction.
   */
  announceAggregateBonded(signedTransaction: SignedTransaction) {
    this.clearData();
    // this.clearForm();
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
        // this.blockSend = false;
        if (statusTransaction !== null && statusTransaction !== undefined && signedTransaction !== null) {
          const statusTransactionHash = (statusTransaction['type'] === 'error') ? statusTransaction['data'].hash : statusTransaction['data'].transactionInfo.hash;
          const match = statusTransactionHash === signedTransaction.hash;
          // CONFIRMED
          if (statusTransaction['type'] === 'confirmed' && match) {
            signedTransaction = null;
            this.sharedService.showSuccess('', 'Transaction confirmed');
          }
          // UNCONFIRMED
          else if (statusTransaction['type'] === 'unconfirmed' && match) {
            this.transactionService.searchAccountsInfo([this.currentAccountToConvert])
            signedTransaction = null;
            this.sharedService.showInfo('', 'Transaction unconfirmed');
          }
          // AGGREGATE BONDED ADDED
          else if (statusTransaction['type'] === 'aggregateBondedAdded' && match) {
            this.transactionService.searchAccountsInfo([this.currentAccountToConvert])
            signedTransaction = null;
            this.sharedService.showInfo('', 'Transaction aggregate bonded added');
          }
          // MATCH
          else if (match) {
            signedTransaction = null;
            this.sharedService.showWarning('', statusTransaction['data'].status.split('_').join(' '));
          }
        }
      }
    );
  }


  /**
  *
  *
  * @memberof CreateMultiSignatureComponent
  */
  clearData() {
    // this.createMultsignForm.get('selectAccount').patchValue('');
    this.editAccountMultsignForm.get('password').patchValue('', { emitEvent: false, onlySelf: true });
    this.editAccountMultsignForm.get('cosignatory').patchValue('', { emitEvent: false, onlySelf: true });
    this.editAccountMultsignForm.get('contact').patchValue('', { emitEvent: false, onlySelf: true });
    this.editAccountMultsignForm.get('minApprovalDelta').patchValue(1, { emitEvent: false, onlySelf: true });
    this.editAccountMultsignForm.get('minRemovalDelta').patchValue(1, { emitEvent: false, onlySelf: true });
    this.publicAccountToConvert = undefined;
    this.isMultisig = false;
    this.cosignatoryList = [];
    this.showContacts = false;
    this.mdbBtnAddCosignatory = true;
    this.minApprovaMaxLength = 1;
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

    this.showContacts = false;
    // this.mdbBtnAddCosignatory = true;
    // this.isMultisig = false;
    this.editAccountMultsignForm.get('cosignatory').patchValue('', { emitEvent: false, onlySelf: true });
    this.editAccountMultsignForm.get('contact').patchValue('', { emitEvent: false, onlySelf: true });
    this.editAccountMultsignForm.get('password').patchValue('', { emitEvent: false, onlySelf: true });
    this.editAccountMultsignForm.get('cosignatorieSign').patchValue('', { emitEvent: false, onlySelf: true });
    // this.publicAccountToConvert = undefined;
    // this.cosignatoryList = []; 
    // if (custom !== undefined) {
    //   if (formControl !== undefined) {
    //     this.editAccountMultsignForm.controls[formControl].get(custom).reset();
    //     return;
    //   }
    //   this.editAccountMultsignForm.get(custom).reset();
    //   return;
    // }
    // this.editAccountMultsignForm.reset();
    // return;
  }

  /**
  *
  *
  * @memberof CreateNamespaceComponent
  *
  */
  subscribeValueChange() {
    // Cosignatory ValueChange
    this.editAccountMultsignForm.get('cosignatory').valueChanges.subscribe(
      next => {
        if (next !== null && next !== undefined) {

        }
        this.validatorsCosignatory()
      }
    );
  }
  changeformStatus() {
    this.editAccountMultsignForm.statusChanges.subscribe(res => {
      this.btnblckfun()
      this.validatorsCosignatory()
    }
    );
  }
  btnblckfun() {
    this.btnBlock = true;
    if (this.editAccountMultsignForm.valid && this.cosignatoryList.length > 0) {
      this.btnBlock = false;
    }
  }

  iswalletContact(label: string): boolean {
    const value: boolean[] = this.listContact.filter(item => item.label === label).map((item: ContactsListInterface) => {
      return item.walletContact
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
            this.sharedService.showWarning('', 'you need a public key');

            this.editAccountMultsignForm.get('cosignatory').patchValue('', { emitEvent: false, onlySelf: true });
            this.editAccountMultsignForm.get('contact').patchValue('', { emitEvent: false, onlySelf: true });
            // this.showContacts = false;
          } else {
            this.editAccountMultsignForm.get('cosignatory').patchValue(res.publicKey, { emitEvent: true })
            this.editAccountMultsignForm.get('contact').patchValue('', { emitEvent: false, onlySelf: true });
          }
        }, err => {
          this.editAccountMultsignForm.get('contact').patchValue('', { emitEvent: false, onlySelf: true });
          this.searchContact = false;
          this.sharedService.showWarning('', 'Address is not valid');
        })
      } else {
        this.subscribeAccountContat = this.walletService.getAccountsInfo$().subscribe(
          async accountInfo => {
            if (accountInfo) {
              const account = this.walletService.filterAccountInfo(event.label);
              const accountValid = (
                account !== null &&
                account !== undefined &&
                account.accountInfo &&
                account.accountInfo.publicKey !== "0000000000000000000000000000000000000000000000000000000000000000"
              );
              if (this.subscribeAccountContat) {
                this.subscribeAccountContat.unsubscribe();
              }
              if (accountValid) {
                this.editAccountMultsignForm.get('cosignatory').patchValue(account.accountInfo.publicKey, { emitEvent: true })
                this.editAccountMultsignForm.get('contact').patchValue('', { emitEvent: false, onlySelf: true });
              } else {
                this.sharedService.showWarning('', 'you need a public key');
                this.editAccountMultsignForm.get('contact').patchValue('', { emitEvent: false, onlySelf: true });
              }

            } else {
              this.editAccountMultsignForm.get('contact').patchValue('', { emitEvent: false, onlySelf: true });
              this.sharedService.showWarning('', 'Address is not valid');

            }
          }
        );





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
      this.setCosignatoryList(cosignatoryList, true);
    } else {
      this.cosignatoryList.filter(item => item.action === "edit").map((item: CosignatoryList) => {
        item.type = 3;
      });
      this.cosignatoryList.filter(item => item.id.plain() === id.plain()).map((item: CosignatoryList) => {
        item.type = (type === 3) ? 2 : 3;
      });

      this.setCosignatoryList(this.cosignatoryList, true)
    }
    this.validatorsCosignatory()
    this.btnblckfun()
  }

  /**
   * Add cosignatory to the board
   * @memberof CreateMultiSignatureComponent
   */
  addCosignatory() {
    if (this.editAccountMultsignForm.get('cosignatory').valid) {
      this.showContacts = false;
      const cosignatory: PublicAccount = PublicAccount.createFromPublicKey(
        this.editAccountMultsignForm.get('cosignatory').value,
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
        this.setCosignatoryList(this.cosignatoryList, false);
        this.editAccountMultsignForm.get('cosignatory').patchValue('');
      } else {
        this.sharedService.showError('Attention', 'Cosignatory is already present in modification list');
      }
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
    * Get cosignatory list add and remove
    * @memberof CreateMultiSignatureComponent
    * @return {CosignatoryList} list cosignatory
    */
  getCosignatoryListFilter(type: number, orType: number): CosignatoryList[] {
    return this.cosignatoryList.filter(item => item.type === type || item.type === orType);

  }
  /**
  * Set cosignatory list
  * @memberof CreateMultiSignatureComponent
  * @param {CosignatoryList} [cosignatoryListParam] - list cosignatory
  */
  setCosignatoryList(cosignatoryListParam: CosignatoryList[], validDelta: boolean) {
    this.cosignatoryList = cosignatoryListParam;


    this.validatorsMinApprovalDelta();
    this.validatorsMinRemovalDelta();

    this.validatorsCosignatory()

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
  * Change the form validator (minRemovalDelta)
  * @memberof CreateMultiSignatureComponent
  */
  validatorsMinRemovalDelta() {
    this.minApprovaMaxLength = (this.getCosignatoryListFilter(1, 3).length > 0) ? this.getCosignatoryListFilter(1, 3).length : 0;
    const minLength = (this.getCosignatoryListFilter(1, 3).length > 0) ? 1 : 0;

    const validators = [Validators.required,
    Validators.minLength(minLength),
    Validators.maxLength(this.minApprovaMaxLength)];

    while (this.editAccountMultsignForm.get('minRemovalDelta').value > this.minApprovaMaxLength) {
      this.editAccountMultsignForm.get('minRemovalDelta').patchValue(this.editAccountMultsignForm.get('minRemovalDelta').value - 1, { emitEvent: false, onlySelf: true });
    }

    this.editAccountMultsignForm.controls['minRemovalDelta'].setValidators(validators);
    this.editAccountMultsignForm.controls['minRemovalDelta'].updateValueAndValidity({ emitEvent: false, onlySelf: true });

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

interface ContactsListInterface {
  label: string;
  value: string;
  walletContact: boolean;
}
