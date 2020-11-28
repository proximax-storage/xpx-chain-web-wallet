import { Component, OnInit, ViewChild } from '@angular/core';
import { TransactionsInterface, TransactionsService } from 'src/app/transactions/services/transactions.service';
import { AccountsInterface, WalletService } from 'src/app/wallet/services/wallet.service';
import { ConfigurationForm, SharedService } from 'src/app/shared/services/shared.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { ModalDirective } from 'ng-uikit-pro-standard';
import { Account } from 'tsjs-xpx-chain-sdk/dist/src/model/account/Account';
import { AggregateTransaction } from 'tsjs-xpx-chain-sdk/dist/src/model/transaction/AggregateTransaction';
import { ServicesModuleService, HeaderServicesInterface } from '../../../servicesModule/services/services-module.service';
import { ActivatedRoute } from '@angular/router';
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
  MultisigService, ContactsListInterface, ConsginerFirmList
} from '../../service/multisig.service';
import { TransactionHttp } from 'tsjs-xpx-chain-sdk/dist/src/infrastructure/TransactionHttp';
import { ProximaxProvider } from 'src/app/shared/services/proximax.provider';
import { AccountInfo } from 'tsjs-xpx-chain-sdk/dist/src/model/account/AccountInfo';
import { CosignatoryList } from '../../service/multi-sign.service';
@Component({
  selector: 'app-edit-account-multisig',
  templateUrl: './edit-account-multisig.component.html',
  styleUrls: ['./edit-account-multisig.component.css']
})
export class EditAccountMultisigComponent implements OnInit {
  @ViewChild('modalContact', { static: true }) modalContact: ModalDirective;
  showSignCosignatory = false;
  accountToConvertMultisig: Account;
  accountToConvertSign: Account;
  aggregateTransaction: AggregateTransaction = null;
  currentAccount: CurrentAccountInterface[] = [];
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
  showConsginerFirmList = false;
  configurationForm: ConfigurationForm = {};
  formEditAccountMultsig: FormGroup;
  consignerFirmList: ConsginerFirmList[] = [];
  otherCosignatorieList: ConsginerFirmList[] = [];
  otherCosignerFirmAccountList: ConsginerFirmList[] = [];
  consignerFirm: ConsginerFirmList
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
  showAccount = false;
  isRepeatCosignatoryVal = false;
  showContacts = false;
  validateAccountAlert: ValidateAccountAlert = null;
  constructor(
    private transactionService: TransactionsService, private walletService: WalletService,
    private activateRoute: ActivatedRoute, private sharedService: SharedService,
    private fb: FormBuilder, private multisigService: MultisigService,
    private proximaxProvider: ProximaxProvider,
  ) {

    this.infoBalance = {
      disabled: false,
      info: ''
    }
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
        console.log('ididid', id)
        this.showSignCosignatory = false;
        this.formEditAccountMultsig.get('otherCosignatorie').setValue('', {
          emitEvent: false
        })
        // this.consginerFirmAccountList = this.pushConsginerFirmList(id)
        const signCosignatory = this.consignerFirmList.find(item => item.value === id)
        if (signCosignatory) {
          this.showSignCosignatory = true;
          this.consignerFirm = signCosignatory;
          console.log('this.consignerFirmList', this.consignerFirmList)
          console.log(this.consignerFirmList.filter(item => item.value !== id))
        }
        this.otherCosignatorieList = this.consignerFirmList.filter(item => item.value !== id)
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
        console.log('id', id)
        this.otherCosignerFirmAccountList = [];
        this.otherCosignerFirmAccountList = this.pushOtherConsginerFirmList(id);
        // this.builder()
      }
    );
  }
  /**
   *
   * @param id
   */
  pushOtherConsginerFirmList (id: []): ConsginerFirmList[] {
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

  setCosignatorieSign (cosignerLength: number, accountConver: AccountsInterface): ConsginerFirmList[] {
    if (cosignerLength === 1) {
      this.showConsginerFirmList = false;
      this.formEditAccountMultsig.controls['cosignatorieSign'].setValidators(null);
    }
    if (cosignerLength > 1) {
      this.showConsginerFirmList = true;
      this.formEditAccountMultsig.controls['cosignatorieSign'].setValidators([Validators.required]);
    }
    this.formEditAccountMultsig.controls['cosignatorieSign'].updateValueAndValidity({ emitEvent: false, onlySelf: true });


    return this.multisigService.builConsginerList(accountConver.isMultisign, this.walletService.currentWallet.accounts, 10000);
  }
  /**
   *
   *
   * @param {*} account
   * @memberof ConvertAccountMultisigComponent
   */
  selectAccount (account: CurrentAccountInterface) {
    console.log('ACCOUNT', account.data);
    if (account) {
      const data = this.setDataCurrentAccout(account.data);
      this.contactList = this.multisigService.removeContactList(this.multisigService.validateAccountListContact(
        account.data.name ,
      ), data.cosignatoryList);
      // Validate is has cosigner currentWallet
      const cosignerLength = this.multisigService.hasCosignerInCurrentWallet(account.data.isMultisign, this.walletService.currentWallet.accounts);
      const isCosigner = (cosignerLength > 0) ? true : false;
      if (!isCosigner) {
        this.validateAccountAlert = { show: true, info: 'You are not consignee of the account', subInfo: 'Requires a valid cosigner to edit this account.' };
      } else {
        this.consignerFirmList = this.setCosignatorieSign(cosignerLength, account.data);
        if (this.consignerFirmList.length === 1) {
          this.consignerFirm = this.consignerFirmList[0]
          this.signType = 1;
        } else {
          this.signType = 2;
        }
      }
      //   // Validate in partial txs
      //   const ispartial = this.multisigService.onPartial(account.data, this.txOnpartial);
      //   if (ispartial) {
      //     this.validateAccountAlert = { show: true, info: 'Partial', subInfo: 'Has transactions in partial' };
      //   }
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
    console.log('cosignatoriesList', cosignatoriesList);
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
        name: null,
        address: x.address.plain(),
        publicAccount: PublicAccount.createFromPublicKey(x.publicKey, environment.typeNetwork.value),
        ownCosignatories: false
      };
      if (ownCosignatories) {
        if (ownCosignatories.isMultisign && ownCosignatories.isMultisign.isMultisig()) {
          for (const i of ownCosignatories.isMultisign.cosignatories) {
            const ownCosignatoriesTow = this.multisigService.filterOwnCosignatory({ publicKey: i.publicKey }, this.walletService.currentWallet.accounts);
            if (ownCosignatoriesTow) {
              data.cosignatories.push(
                { name: ownCosignatoriesTow.name, address: ownCosignatoriesTow.address }
              );
            } else {
              data.cosignatories.push(
                { name: null, address: i.address.plain() }
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
        // this.aggregateTransactionModifyMultisig();
      }
    );
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
    console.log('maxDelta', maxDelta);
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
      const publicAccountS = (!this.multisigService.validatePublicKey(x.publicKey)) ? null : PublicAccount.createFromPublicKey(x.publicKey, environment.typeNetwork.value);
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
  // full
  setValueForm (action: string, disableItem: boolean, type: number) {

    // const consignatarioList: CosignatoryList[] = [];
    // for (const element of this.accountInfo.multisigInfo.cosignatories) {
    //   consignatarioList.push({ publicAccount: element, action: action, type: type, disableItem: disableItem, id: element.address });
    // }
    // this.editAccountMultsignForm.get('minApprovalDelta').patchValue(this.accountInfo.multisigInfo.minApproval, { emitEvent: false, onlySelf: true });
    // this.editAccountMultsignForm.get('minRemovalDelta').patchValue(this.accountInfo.multisigInfo.minRemoval, { emitEvent: false, onlySelf: true });
    // this.setCosignatoryList(consignatarioList, false);
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
  disabled: Boolean,
  info: string
}
