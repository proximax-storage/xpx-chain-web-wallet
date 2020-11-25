
import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ModalDirective } from 'ng-uikit-pro-standard';
import { Subscription } from 'rxjs/internal/Subscription';
import { HeaderServicesInterface } from 'src/app/servicesModule/services/services-module.service';
import { DataBridgeService } from 'src/app/shared/services/data-bridge.service';
import { ProximaxProvider } from 'src/app/shared/services/proximax.provider';
import { ConfigurationForm, SharedService } from 'src/app/shared/services/shared.service';
import { TransactionsInterface, TransactionsService } from 'src/app/transactions/services/transactions.service';
import { AccountsInterface, WalletService } from 'src/app/wallet/services/wallet.service';
import { AccountInfo } from 'tsjs-xpx-chain-sdk/dist/src/model/account/AccountInfo';
import { Address } from 'tsjs-xpx-chain-sdk/dist/src/model/account/Address';
import { CosignatoryList, MultiSignService } from '../../service/multi-sign.service';
import { ContactsListInterface, CosignatoryInterface, MultisigService } from '../../service/multisig.service';

@Component({
  selector: 'app-convert-account-multisig.component',
  templateUrl: './convert-account-multisig.component.html',
  styleUrls: ['./convert-account-multisig.component.css']
})
export class ConvertAccountMultisigComponent implements OnInit {

  @ViewChild('modalContact', { static: true }) modalContact: ModalDirective;
  // accountToConvertMultisig: Account;
  // aggregateTransaction: AggregateTransaction;
  blockSend: boolean;
  currentAccounts: CurrentAccountInterface[] = [];
  configurationForm: ConfigurationForm = {};
  cosignatoryList: CosignatoryList[] = [];
  currentAccountToConvert: AccountsInterface;
  disableAddCosignatory = true;
  formConvertAccountMultsig: FormGroup;
  imageActiveBook = 'assets/images/img/icon-address-book-gray-28h-proximax-sirius-wallet.svg';
  imageInactiveBook = 'assets/images/img/icon-address-green-book-16h-proximax-sirius-wallet.svg';
  minApprovaMinLength = 1;
  minApprovaMaxLength = 1;
  contactList: ContactsListInterface[] = [];
  currentIteratorCosignatory: number;
  // typeTx: TypeTx;
  // transactionHttp: TransactionHttp;
  passwordMain = 'password';
  paramsHeader: HeaderServicesInterface = {
    moduleName: 'Accounts > Multisign',
    componentName: 'Convert to Multisig Account'
  };
  searchContact = [];
  showContacts = false;
  subscribe: Subscription[] = [];
  subscribeContact: Subscription[] = [];

  constructor(
    private activateRoute: ActivatedRoute,
    private fb: FormBuilder,
    private multisigService: MultisigService,
    private walletService: WalletService,
    private multiSignService: MultiSignService,
    private transactionService: TransactionsService,
    private dataBridge: DataBridgeService,
    private proximaxProvider: ProximaxProvider,
    private sharedService: SharedService
  ) {
    console.log('load component...');
    this.configurationForm = this.sharedService.configurationForm;
    this.currentAccounts = [];
  }

  /**
   *
   *
   * @memberof ConvertAccountMultisigComponent
   */
  ngOnInit() {
    this.createForm();
    this.getAccounts();
    console.log('estatus --->', this.cosignatories.status);
  }

  /**
   *
   *
   * @returns {FormGroup}
   * @memberof ConvertAccountMultisigComponent
   */
  newCosignatory(): FormGroup {
    return this.fb.group({
      cosignatory: ['', [
        Validators.pattern('^(0x|0X)?[a-fA-F0-9]+$')
      ]]
    });
  }

  /**
   *
   *
   * @memberof ConvertAccountMultisigComponent
   */
  addCosignatory() {
    console.log('addCosignatory', this.cosignatories);
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
  createForm() {
    this.formConvertAccountMultsig = this.fb.group({
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
      selectAccount: ['', [
        Validators.required
      ]],
      cosignatories: this.fb.array([])
    });
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
    inputsKey.forEach(element => {
      this.formConvertAccountMultsig.get(element).patchValue('', { emitEvent: false, onlySelf: true });
    });
  }

  /**
   *
   *
   * @memberof ConvertAccountMultisigComponent
   */
  getAccounts() {
    const currentWallet = Object.assign({}, this.walletService.currentWallet);
    if (currentWallet && Object.keys(currentWallet).length > 0) {
      console.log('currentWallet', currentWallet);
      // validar que la transacción no esté en parcial
      this.subscribe.push(this.transactionService.getAggregateBondedTransactions$().subscribe((transactions: TransactionsInterface[]) => {
        if (transactions.length > 0) {
          console.log('ESTAS SON MIS TRANSACCIONES', transactions);
        }
      }));

      currentWallet.accounts.forEach(element => {
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
              isMultisig: false
            });
          }
        }
      });
    }
  }

  /**
   *
   *
   * @param {*} e
   * @returns
   * @memberof ConvertAccountMultisigComponent
   */
  preventNumbers(e) {
    console.log('eeeee', e);
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
    console.log('cosignatories --->', this.cosignatories);
  }

  /**
   *
   *
   * @param {*} account
   * @memberof ConvertAccountMultisigComponent
   */
  selectAccount(account: CurrentAccountInterface) {
    this.cosignatoryList = [];
    this.formConvertAccountMultsig.enable({ emitEvent: false, onlySelf: true });
    this.formConvertAccountMultsig.get('cosignatory').patchValue('', { emitEvent: false, onlySelf: false });
    if (account) {
      console.log('Account selected --->', account);
      this.minApprovaMaxLength = 1;
      this.currentAccountToConvert = account.data;
      this.contactList = this.multisigService.validateAccountListContact(account.label);
      console.log('Contact list --->', this.contactList);
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
  selectContact(data: ContactsListInterface) {
    this.unsubscribe(this.subscribeContact);
    console.log('Contact selected', data);
    this.modalContact.hide();
    this.cosignatories.controls[this.currentIteratorCosignatory].get('cosignatory').patchValue('', { emitEvent: true });
    if (data.publicKey) {
      this.cosignatories.controls[this.currentIteratorCosignatory].get('cosignatory').patchValue(data.publicKey, { emitEvent: true });
      this.formConvertAccountMultsig.get('contact').patchValue('', { emitEvent: false, onlySelf: true });
    } else {
      console.log('consultar public key');
      this.searchContact[this.currentIteratorCosignatory] = true;
      this.subscribeContact.push(this.proximaxProvider.getAccountInfo(Address.createFromRawAddress(data.value)).subscribe(async (response: AccountInfo) => {
        this.unsubscribe(this.subscribeContact);
        this.searchContact[this.currentIteratorCosignatory] = false;
        if (response.publicKeyHeight.toHex() === '0000000000000000') {
          this.sharedService.showWarning('', 'Cosignatory does not have a public key');
          this.formConvertAccountMultsig.get('cosignatory').patchValue('', { emitEvent: false, onlySelf: true });
          this.formConvertAccountMultsig.get('contact').patchValue('', { emitEvent: false, onlySelf: true });
        } else {
          this.cosignatories.controls[this.currentIteratorCosignatory].get('cosignatory').patchValue(response.publicKey, { emitEvent: true });
          this.formConvertAccountMultsig.get('contact').patchValue('', { emitEvent: false, onlySelf: true });
        }
      }, err => {
        this.formConvertAccountMultsig.get('contact').patchValue('', { emitEvent: false, onlySelf: true });
        this.searchContact[this.currentIteratorCosignatory] = false;
        this.sharedService.showWarning('', 'Address is not valid');
      }));
    }
  }

  /**
   *
   *
   * @param {CosignatoryInterface} cosignatoryListParam
   * @memberof ConvertAccountMultisigComponent
   */
  setCosignatoryList(cosignatory: CosignatoryInterface) {
    this.cosignatoryList.push(cosignatory);
    // this.validatorsMinApprovalDelta();
    // this.validatorsMinRemovalDelta();
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
      subscribe.forEach(subscription => {
        subscription.unsubscribe();
      });
    }
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
  validateInput(nameInput: string = '', nameControl: string = '', nameValidation: string = '') {
    let validation: AbstractControl = null;
    if (nameInput !== '' && nameControl !== '') {
      validation = this.formConvertAccountMultsig.controls[nameControl].get(nameInput);
    } else if (nameInput === '' && nameControl !== '' && nameValidation !== '') {
      validation = this.formConvertAccountMultsig.controls[nameControl].getError(nameValidation);
    } else if (nameInput !== '') {
      validation = this.formConvertAccountMultsig.get(nameInput);
    }
    return validation;
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
}

interface CurrentAccountInterface {
  label: string;
  value: any;
  isPartial: boolean;
  data: AccountsInterface;
  isMultisig: boolean;
}
