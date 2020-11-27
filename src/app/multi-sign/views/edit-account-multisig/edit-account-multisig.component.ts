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
  MultisigService
} from '../../service/multisig.service';
@Component({
  selector: 'app-edit-account-multisig',
  templateUrl: './edit-account-multisig.component.html',
  styleUrls: ['./edit-account-multisig.component.css']
})
export class EditAccountMultisigComponent implements OnInit {
  @ViewChild('modalContact', { static: true }) modalContact: ModalDirective;
  accountToConvertMultisig: Account;
  accountToConvertSign: Account;
  aggregateTransaction: AggregateTransaction = null;
  currentAccount: CurrentAccountInterface[] = [];
  dataCurrentAccout: DataCurrentAccount = {};

  // currentAccount?: {
  //   name?: string;
  //   publicAccount?: PublicAccount;
  //   cosignatoryList?: CosignatoryListInterface[]
  // }
  configurationForm: ConfigurationForm = {};
  formEditAccountMultsig: FormGroup;
  // TODO pasar a una sola junto con covert multisig
  feeConfig: {
    fee: any,
    feeLockfund: number,
    feeTransaction: number,
    totalFee: number,
  };
  data: Array<any>;
  paramsHeader: HeaderServicesInterface = {
    componentName: 'Edit Account Multisig',
    moduleName: 'Accounts > Multisign'
  };
  subscribe: Subscription[] = [];
  txOnpartial: TransactionsInterface[] = null;
  visibleIndex = -1;
  validateAccountAlert: ValidateAccountAlert = null;
  constructor(
    private transactionService: TransactionsService, private walletService: WalletService,
    private activateRoute: ActivatedRoute, private sharedService: SharedService,
    private fb: FormBuilder, private multisigService: MultisigService,
  ) {
    this.data = [
      {
        name: 'Lon wond',
        addres: 'VB2JKY-HRYWKO-4OX5HM-ABIOQH-IM6A25-53KGSQ-ONCU',
        isMultisig: true,
        cosig: [
          {
            name: 'Alivin',
            addres: 'VD4RD57SGDNJWWWNV6LNUIIQ6EF7YYHC6X7YRQHS',
            isMultisig: false,
            cosig: [

            ]
          },
          {
            name: 'Corina',
            addres: 'VAUIIRN33XXWCJARFXOKIEPIEJY3Y26U4J6THBGH',
            isMultisig: false
          }
        ]
      },
      {
        name: 'Jeffersson',
        addres: 'VBHRT2OWO7UUPX7TIHF7LUJC62CQO34WWPDRXIWL',
        isMultisig: false,
        cosig: [
          {
            name: 'Alivin',
            addres: 'VD4RD57SGDNJWWWNV6LNUIIQ6EF7YYHC6X7YRQHS',
            isMultisig: false,
            cosig: [

            ]
          },
          {
            name: 'Corina',
            addres: 'VAUIIRN33XXWCJARFXOKIEPIEJY3Y26U4J6THBGH',
            isMultisig: false
          }
        ]
      },
      {
        name: 'Luis',
        addres: 'VC737QHSRTY2J7RSYDIVGD244RG74YOSUV3O6UCY',
        isMultisig: false,
        cosig: [
          {
            name: 'Alivin',
            addres: 'VD4RD57SGDNJWWWNV6LNUIIQ6EF7YYHC6X7YRQHS',
            isMultisig: false,
            cosig: [

            ]
          },
          {
            name: 'Corina',
            addres: 'VAUIIRN33XXWCJARFXOKIEPIEJY3Y26U4J6THBGH',
            isMultisig: false
          }
        ]
      }
    ];
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

  ngOnInit() {
    this.createForm();
    this.load();
  }
  /**
   *
   */
  createForm() {
    this.formEditAccountMultsig = this.fb.group({
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
      ]
    });
  }

  /**
   *
   *
   * @memberof ConvertAccountMultisigComponent
   */
  getAccount(name) {
    const currentAccount = this.walletService.filterAccountWallet(name);
    this.currentAccount.push({
      // label: currentAccount.name,
      // value: currentAccount.publicAccount,
      data: currentAccount,
      // isPartial: false,
      // isMultisig: true
      // this.multisigService.checkIsMultisig(currentAccount),
    });
    this.selectAccount(this.currentAccount[0]);
    // this.formEditAccountMultsig.controls['selectAccount'].setValidators([]);
    // this.formEditAccountMultsig.controls['selectAccount'].updateValueAndValidity({ emitEvent: false, onlySelf: true });
  }

  /**
   *
   *
   * @param {*} account
   * @memberof ConvertAccountMultisigComponent
   */
  selectAccount(account: CurrentAccountInterface) {
    console.log('ACCOUNT', account.data);
    this.setDataCurrentAccout(account.data);
    // this.dataCurrentAccout.currentAccount = {
    //   name: account.data.name,
    //   publicAccount : account.data.publicAccount
    // }
    // this.cosignatories.clear();
    // this.formConvertAccountMultsig.enable({ emitEvent: false, onlySelf: true });
    // this.formConvertAccountMultsig
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
  // ODO hacer recursive function
  setDataCurrentAccout(account: AccountsInterface) {
    this.dataCurrentAccout.name = account.name;
    this.dataCurrentAccout.publicAccount = account.publicAccount;
    const address = Address.createFromPublicKey(account.publicAccount.publicKey, environment.typeNetwork.value);
    this.dataCurrentAccout.address = address.plain();
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
        console.log('aquiii')
        if (ownCosignatories.isMultisign && ownCosignatories.isMultisign.isMultisig()) {
          console.log('ownCosignatories.isMultisign.cosignatories', ownCosignatories.isMultisign.cosignatories)
          for (const i of ownCosignatories.isMultisign.cosignatories) {
            console.log(i)
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
    console.log('this.dataCurrentAccout', this.dataCurrentAccout.cosignatoryList);
  }

  /**
   *
   * @param ind
   */
  showSubItem(ind) {
    if (this.visibleIndex === ind) {
      this.visibleIndex = -1;
    } else {
      this.visibleIndex = ind;
    }
  }
  // setValueForm (action: string, disableItem: boolean, type: number) {
  //   const consignatarioList: CosignatoryListInterface[] = [];
  //   for (const element of this.accountInfo.multisigInfo.cosignatories) {
  //     consignatarioList.push({ publicAccount: element, action, type, disableItem, id: element.address, isMultisig: false });
  //   }
  //   this.formEditAccountMultsig.get('minApprovalDelta').patchValue(this.accountInfo.multisigInfo.minApproval, { emitEvent: false, onlySelf: true });
  //   this.formEditAccountMultsig.get('minRemovalDelta').patchValue(this.accountInfo.multisigInfo.minRemoval, { emitEvent: false, onlySelf: true });
  //   // this.setCosignatoryList(consignatarioList, false);
  // }
  /**
   *
   *
   * @memberof ConvertAccountMultisignComponent
   */
  load() {
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
// export interface CosignatoryListInterface extends CosignatoriesInterface {
//   action: string;
//   type: number;
//   disableItem: boolean;
//   id: Address;
//   cosignatories?: CosignatoriesInterface[];
// }
// export interface CosignatoriesInterface {
//   isMultisig?: boolean;
//   name?: string;
//   address?: string;
//   publicAccount?: PublicAccount;
//   ownCosignatories?: boolean;
// }

export interface DataCurrentAccount {
  name?: string;
  address?: string;
  publicAccount?: PublicAccount;
  cosignatoryList?: CosignatoryListInterface[];
}
