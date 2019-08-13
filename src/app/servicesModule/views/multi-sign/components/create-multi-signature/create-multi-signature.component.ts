import { Component, OnInit } from '@angular/core';
import { NgBlockUI, BlockUI } from 'ng-block-ui';
import { AppConfig } from 'src/app/config/app.config';
import { SharedService, ConfigurationForm } from 'src/app/shared/services/shared.service';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { WalletService, AccountsInfoInterface } from 'src/app/wallet/services/wallet.service';
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
  Listener,
  LockFundsTransaction,
  TransactionHttp,
  SignedTransaction,
  NetworkCurrencyMosaic,
  AggregateTransaction,
  Mosaic,
  NamespaceId,
  MosaicId,
  AccountInfo
} from 'tsjs-xpx-chain-sdk';
import { environment } from '../../../../../../environments/environment';
import { NodeService } from 'src/app/servicesModule/services/node.service';
import { mergeMap, filter } from 'rxjs/operators';
import { DataBridgeService } from 'src/app/shared/services/data-bridge.service';
import { ServicesModuleService } from 'src/app/servicesModule/services/services-module.service';
import { ProximaxProvider } from 'src/app/shared/services/proximax.provider';
import { TransactionsService } from 'src/app/transfer/services/transactions.service';

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
  currentAccountToConvert: any;
  cosignatoryList: CosignatoryList[] = [];
  headElements: string[];
  modifyMultisigAccountTransactionObject: ModifyMultisigAccountTransactionObject;
  minApprovaMaxLength: number = 1;
  minApprovaMinLength: number = 0;
  accountToConvert: Account;
  connector: Listener;
  transactionHttp: TransactionHttp
  balance: string;

  constructor(
    private fb: FormBuilder,
    private sharedService: SharedService,
    private walletService: WalletService,
    private nodeService: NodeService,
    private dataBridge: DataBridgeService,
    private serviceModuleService: ServicesModuleService,
    private proximaxProvider: ProximaxProvider,
    private transactionService: TransactionsService,

  ) {
    this.headElements = ['Address', 'Action', 'Remove'];
    this.configurationForm = this.sharedService.configurationForm;
    this.blockSend = false;
    this.accountValid = false;
    this.listContact = [];
    this.showContacts = false;
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
  }

  /**
  *
  *
  * @memberof CreateMultiSignatureComponent
  */
  clearForm() {
    this.createMultsignForm.get('selectAccount').patchValue('', { emitEvent: false });
    this.createMultsignForm.get('cosignatory').patchValue('', { emitEvent: false });
    this.createMultsignForm.get('minRemovalDelta').patchValue(1, { emitEvent: false });

  }

  /**
 *
 *
 * @memberof CreateMultiSignatureComponent
 */
  clearData() {
    // this.createMultsignForm.get('selectAccount').patchValue('');
    this.createMultsignForm.get('cosignatory').patchValue('', { emitEvent: false });
    this.createMultsignForm.get('minApprovalDelta').patchValue(1, { emitEvent: false });
    this.createMultsignForm.get('minRemovalDelta').patchValue(1, { emitEvent: false });
    this.cosignatoryList = []
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
      this.proximaxProvider.getAccountInfo(Address.createFromRawAddress(event.value)).subscribe((res: AccountInfo) => {
        console.log(res)
        if (res.publicKeyHeight.toHex() === '0000000000000000') {

          this.sharedService.showWarning('', 'you need a public key');
        } else {
          this.createMultsignForm.get('cosignatory').patchValue(res.publicKey, { emitEvent: true })
        }
      }, err => {
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

  /**
  *
  *
  * @memberof CreateMultiSignatureComponent
  */
  convertIntoMultisigTransaction() {
    this.blockSend = true;
    let common: any = { password: this.createMultsignForm.get("password").value };

    if (this.walletService.decrypt(common, this.currentAccountToConvert)) {

      if (this.createMultsignForm.valid && this.cosignatoryList.length > 0) {
        this.accountToConvert = Account.createFromPrivateKey(common.privateKey, this.currentAccountToConvert.network)
        // common = '';
        this.modifyMultisigAccountTransactionObject = {
          deadline: Deadline.create(),
          accountToConvert: this.accountToConvert,
          modifications: this.multisigCosignatoryModification(this.cosignatoryList,
            MultisigCosignatoryModificationType.Add),
          minApprovalDelta: this.createMultsignForm.get('minApprovalDelta').value,
          minRemovalDelta: this.createMultsignForm.get('minRemovalDelta').value,
          networkType: this.currentAccountToConvert.network
        }
        const convertIntoMultisigTransaction = ModifyMultisigAccountTransaction.create(
          this.modifyMultisigAccountTransactionObject.deadline,
          this.modifyMultisigAccountTransactionObject.minApprovalDelta,
          this.modifyMultisigAccountTransactionObject.minRemovalDelta,
          this.modifyMultisigAccountTransactionObject.modifications,
          this.modifyMultisigAccountTransactionObject.networkType);


        /**
         * Create Bonded
         */
        const aggregateTransaction = AggregateTransaction.createBonded(
          Deadline.create(),
          [convertIntoMultisigTransaction.toAggregate(this.accountToConvert.publicAccount)],
          this.modifyMultisigAccountTransactionObject.networkType);
        const signedTransaction = this.accountToConvert.sign(aggregateTransaction)

        /**
        * Create Hash lock transaction
        */

        console.log("net", NetworkCurrencyMosaic.createRelative(10))

        console.log("xpx", new Mosaic(new MosaicId('0dc67fbe1cad29e3'), UInt64.fromUint(Number(10000000))))
        console.log(new NamespaceId('prx.xpx').toHex())
        const hashLockTransaction = HashLockTransaction.create(
          Deadline.create(),
          new Mosaic(new MosaicId('0dc67fbe1cad29e3'), UInt64.fromUint(Number(10000000))),
          UInt64.fromUint(480),
          signedTransaction,
          this.modifyMultisigAccountTransactionObject.networkType);

        this.hashLock(this.accountToConvert.sign(hashLockTransaction), signedTransaction)

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
          this.getTransactionStatushashLock(hashLockTransactionSigned)
          this.blockSend = false;
        },
        err => {
          this.sharedService.showError('', err);
          this.blockSend = false;
        });

  }
  /**
   *
   *
   * @memberof CreateMultiSignatureComponent
   *  @param {SignedTransaction} signedTransaction  - Signed transaction.
   */
  getTransactionStatushashLock(signedTransaction) {
    // Get transaction status
    this.subscribe['transactionStatus'] = this.dataBridge.getTransactionStatus().subscribe(
      statusTransaction => {
        if (statusTransaction !== null && statusTransaction !== undefined && signedTransaction !== null) {
          const statusTransactionHash = (statusTransaction['type'] === 'error') ? statusTransaction['data'].hash : statusTransaction['data'].transactionInfo.hash;
          const match = statusTransactionHash === signedTransaction.hash;
          if (statusTransaction['type'] === 'confirmed' && match) {
            signedTransaction = null;
            this.sharedService.showSuccess('', 'Transaction confirmed');
          } else if (statusTransaction['type'] === 'unconfirmed' && match) {
            signedTransaction = null;
            this.sharedService.showInfo('', 'Transaction unconfirmed');
          } else if (match) {
            signedTransaction = null;
            this.sharedService.showWarning('', statusTransaction['data'].status.split('_').join(' '));
          }
        }
      }
    );
  }

  // /**
  // * @memberof CreateMultiSignatureComponent
  // * @param {SignedTransaction} hashLockTransactionSigned  - Hash lock funds transaction.
  // * @param {SignedTransaction} signedTransaction  - Signed transaction of Bonded.
  // * @param {Account} account  - Account to convert 
  // */
  // hashLockMonitor(account: Account, hashLockTransactionSigned: SignedTransaction, signedTransaction: SignedTransaction) {
  //   this.connector.open().then(() => {
  //     this.connector.confirmed(account.address)
  //       .pipe(
  //         filter((transaction) => transaction.transactionInfo !== undefined
  //           && transaction.transactionInfo.hash === hashLockTransactionSigned.hash),
  //         mergeMap(ignored => this.transactionHttp.announceAggregateBonded(signedTransaction))
  //       )
  //       .subscribe(announcedAggregateBonded => console.log(announcedAggregateBonded),
  //         err => console.error(err));
  //   });
  // }












  /**
   * With a multisig cosignatory modification a cosignatory is added to or deleted from a multisig account.
   *
   * @memberof CreateMultiSignatureComponent
   * @param {CosignatoryList}  cosignatoryList  - Cosignatory list.
   * @param {MultisigCosignatoryModificationType} type  - type modification.
   */
  multisigCosignatoryModification(cosignatoryList: CosignatoryList[], type: MultisigCosignatoryModificationType): MultisigCosignatoryModification[] {
    const cosignatory = []
    for (let index = 0; index < cosignatoryList.length; index++) {
      const element = cosignatoryList[index];
      cosignatory.push(
        new MultisigCosignatoryModification(
          type,
          cosignatoryList[index].publicAccount,
        )
      )
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
  selectAccount($event: Event) {
    this.clearData()
    const account: any = $event
    console.log(account)
    this.showCurrentAccountToConvert = false;
    if (account !== null && account !== undefined) {
      this.currentAccountToConvert = account.value;
      this.showCurrentAccountToConvert = true;
      this.subscribeAccount = this.walletService.getAccountsInfo$().subscribe(
        async accountInfo => {
          console.log(this.currentAccountToConvert)
          console.log(accountInfo)

          this.accountInfo = this.walletService.filterAccountInfo(this.currentAccountToConvert.name);
          console.log(this.accountInfo)
          this.accountValid = (
            this.accountInfo !== null &&
            this.accountInfo !== undefined &&
            this.accountInfo.accountInfo &&
            this.accountInfo.accountInfo.publicKey !== "0000000000000000000000000000000000000000000000000000000000000000"
          );
          if (this.subscribeAccount) {
            this.subscribeAccount.unsubscribe();
          }
          this.balance = '0.000000'
          if (this.accountValid) {
            const mosaicXPX = this.accountInfo.accountInfo.mosaics.find(next => next.id.toHex() === environment.mosaicXpxInfo.id);

            if (mosaicXPX) {
              this.balance = this.transactionService.amountFormatterSimple(mosaicXPX.amount.compact());
            }

            console.log('mosaicXPX', mosaicXPX)
            console.log('balance', this.balance)
            this.publicAccountToConvert = PublicAccount.createFromPublicKey(this.currentAccountToConvert.publicAccount.publicKey, this.currentAccountToConvert.network)
          } else {
            this.sharedService.showWarning('', 'you need a public key');
          }
        }
      );

    }



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
    Validators.maxLength(this.cosignatoryList.length)]
    this.minApprovaMinLength = 0;
    this.minApprovaMaxLength = this.cosignatoryList.length
    this.createMultsignForm.get('minApprovalDelta').patchValue(0);
    this.createMultsignForm.controls['minApprovalDelta'].setValidators(validators);
    this.createMultsignForm.controls['minApprovalDelta'].updateValueAndValidity({ emitEvent: false });

  }

  /**
* Change the form validator (minRemovalDelta)
* @memberof CreateMultiSignatureComponent
*/
  validatorsMinRemovalDelta() {
    const validators = [Validators.required,
    Validators.minLength(1),
    Validators.maxLength(this.cosignatoryList.length)]
    this.minApprovaMinLength = 0;
    this.minApprovaMaxLength = this.cosignatoryList.length
    this.createMultsignForm.get('minRemovalDelta').patchValue(0);
    this.createMultsignForm.controls['minRemovalDelta'].setValidators(validators);
    this.createMultsignForm.controls['minRemovalDelta'].updateValueAndValidity({ emitEvent: false });

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
        this.cosignatoryList.push({ publicAccount: cosignatory, action: 'Add', id: cosignatory.address });
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
  deleteCosignatory(id: Address) {
    const cosignatoryList = this.cosignatoryList.filter(item => item.id.plain() !== id.plain());
    this.setCosignatoryList(cosignatoryList);
    this.validatorsCosignatory()
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
    * Get cosignatory list
    * @memberof CreateMultiSignatureComponent
    * @return {CosignatoryList} list cosignatory
    */
  getCosignatoryList(): CosignatoryList[] {
    return this.cosignatoryList;
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
export interface ModifyMultisigAccountTransactionObject {
  deadline?: Deadline;
  accountToConvert?: Account;
  minApprovalDelta?: number;
  minRemovalDelta?: number;
  modifications?: MultisigCosignatoryModification[];
  networkType?: NetworkType,
  maxFee?: UInt64
}

/**
 * cosignatory List
 * @param publicAccount
 * @param action - event (Add or delete)
 * @param id - Address in cosignatory
*/
export interface CosignatoryList {
  publicAccount: PublicAccount;
  action: string;
  id: Address;
}
