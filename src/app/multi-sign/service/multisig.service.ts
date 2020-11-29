import { Injectable } from '@angular/core';
import { ServicesModuleService } from 'src/app/servicesModule/services/services-module.service';
import { AccountsInfoInterface, AccountsInterface, WalletService } from 'src/app/wallet/services/wallet.service';
import {
  Account, AggregateTransaction, Deadline, ModifyMultisigAccountTransaction, MultisigAccountInfo, MultisigCosignatoryModification,
  MultisigCosignatoryModificationType, SignedTransaction, TransactionType, UInt64
} from 'tsjs-xpx-chain-sdk';
import { environment } from '../../../environments/environment';
import { Address } from 'tsjs-xpx-chain-sdk/dist/src/model/account/Address';
import { PublicAccount } from 'tsjs-xpx-chain-sdk/dist/src/model/account/PublicAccount';
import { TransactionsInterface, TransactionsService } from 'src/app/transactions/services/transactions.service';

@Injectable({
  providedIn: 'root'
})

export class MultisigService {
  consginerFirmList: ConsginerFirmList[] = [];
  constructor(
    private serviceModuleService: ServicesModuleService,
    private walletService: WalletService,
    private transactionService: TransactionsService,
  ) { }
  /**
   * Aggregate transaction
   * @param {ToAggregateConvertMultisigInterface} params
   * @returns {AggregateTransaction}
   */
  aggregateTransactionModifyMultisig (params: ToAggregateConvertMultisigInterface): AggregateTransaction {
    // console.log('params', params);
    const cosignatoriesPublicAccount: PublicAccount[] = params.othersCosignatories.concat(params.ownCosignatories);
    const cosignatoriesList = cosignatoriesPublicAccount.map(publicAccount => {
      return new MultisigCosignatoryModification(
        MultisigCosignatoryModificationType.Add,
        publicAccount
      );
    });
    let aggregateTransaction: AggregateTransaction = null;
    const modifyMultisigAccountTransaction = ModifyMultisigAccountTransaction.create(
      Deadline.create(environment.deadlineTransfer.deadline, environment.deadlineTransfer.chronoUnit),
      params.minApprovalDelta,
      params.minRemovalDelta,
      cosignatoriesList,
      params.account.address.networkType
    );
    const typeTX = this.validateTypeSignTxn(params.ownCosignatories, cosignatoriesPublicAccount);
    if (typeTX === TransactionType.AGGREGATE_BONDED) {
      // console.log('AGGREGATE_BONDED  AggregateTransaction');
      aggregateTransaction = AggregateTransaction.createBonded(
        Deadline.create(environment.deadlineTransfer.deadline, environment.deadlineTransfer.chronoUnit),
        [modifyMultisigAccountTransaction.toAggregate(params.account)],
        params.account.address.networkType
      );

    } else {
      // console.log('AGGREGATE_COMPLETE  AggregateTransaction');
      aggregateTransaction = AggregateTransaction.createComplete(
        Deadline.create(environment.deadlineTransfer.deadline, environment.deadlineTransfer.chronoUnit),
        [modifyMultisigAccountTransaction.toAggregate(params.account)],
        params.account.address.networkType,
        []
      );

    }
    return aggregateTransaction;
  }

  /**
   *
   * @param params
   */
  convertAccountToMultisig (params: ToConvertMultisigInterface) {
    const cosignatoriesPublicAccount: PublicAccount[] = params.othersCosignatories.concat(params.ownCosignatories.map(r => r.publicAccount));
    // const cosignatoriesPublicAccount: PublicAccount[] = params.othersCosignatories.concat(params.ownCosignatories);
    const cosignatoriesList = cosignatoriesPublicAccount.map(publicAccount => {
      return new MultisigCosignatoryModification(
        MultisigCosignatoryModificationType.Add,
        publicAccount
      );
    });

    const modifyMultisigAccountTransaction = ModifyMultisigAccountTransaction.create(
      Deadline.create(),
      params.minApprovalDelta,
      params.minRemovalDelta,
      cosignatoriesList,
      params.account.address.networkType
    );

    //   this.validateTypeSignTxn(params.ownCosignatories, cosignatoriesPublicAccount);
  }

  /**
   *
   * check is multisig account
   * @param {AccountsInterface} account
   * @returns {boolean}
   * @memberof MultisigService
   */
  checkIsMultisig (account: AccountsInterface): boolean {
    let isMultisigValidate = false;
    if (account.isMultisign) {
      isMultisigValidate = account.isMultisign.minRemoval !== 0 && account.isMultisign.minApproval !== 0;
    }
    return Boolean(account.isMultisign !== null && account.isMultisign !== undefined && isMultisigValidate);
  }

  /**
   * check is multisig  own cosignatories
   * @param ownCosignatories
   */
  chechOwnCosignatoriesIsMultisig (ownCosignatories: PublicAccount[]): boolean {
    let ban = false;
    for (const i of ownCosignatories) {
      const accountInfo = this.walletService.filterAccountInfo(i.address.pretty(), true);
      if (accountInfo) {
        // console.log('ACCOUNT INFO', accountInfo);
        ban = (accountInfo.multisigInfo !== null && accountInfo.multisigInfo !== undefined && accountInfo.multisigInfo.isMultisig());
        if (ban) {
          break;
        }
      }
    }
    return ban;
  }

  /**
   * sign tx aggregate
   * @param {Account} accountSign
   * @param {AggregateTransaction} aggregateTransaction
   * @param {any}generationHash
   * @param {Account[]} myCosigners
   * @returns
   * @memberof MultisigService
   */
  signedTransaction (accountSign: Account, aggregateTransaction: AggregateTransaction, generationHash: any, myCosigners: Account[]): SignedTransaction {
    let signedTransaction: SignedTransaction = null;
    if (myCosigners.length > 0) {
      signedTransaction = accountSign.signTransactionWithCosignatories(aggregateTransaction, myCosigners, generationHash);
    } else {
      signedTransaction = accountSign.sign(aggregateTransaction, generationHash);
    }
    return signedTransaction;
  }

  /**
   * filter  own cosignatories
   * @param {CosignatoryInterface[]} cosignatoryList
   * @param {AccountsInterface[]} accounts
   * @returns
   * @memberof MultisigService
   */
  filterOwnCosignatories (cosignatoryList: CosignatoryInterface[], accounts: AccountsInterface[]): AccountsInterface[] {
    const myAccountsFilter: AccountsInterface[] = cosignatoryList.map(x => {
      return accounts.find(items => x.publicKey === items.publicAccount.publicKey);
    }).filter(x => {
      return x !== undefined;
    });
    return myAccountsFilter;
  }

  /**
   * filter  own cosignatories
   * @param {CosignatoryInterface[]} cosignatoryList
   * @param {AccountsInterface[]} accounts
   * @returns
   * @memberof MultisigService
   */
  filterOwnCosignatory (cosignatoryList: CosignatoryInterface, accounts: AccountsInterface[]): AccountsInterface {
    return accounts.find(x => x.publicAccount.publicKey === cosignatoryList.publicKey);
  }

  /**
   * filter  others cosignatories
   * @param {CosignatoryInterface[]} cosignatoryList
   * @param {AccountsInterface[]} accounts
   * @returns
   * @memberof MultisigService
   */
  filterOthersCosignatories (cosignatoryList: CosignatoryInterface[], accounts: AccountsInterface[]): CosignatoryInterface[] {
    const othersCosignatories: CosignatoryInterface[] = [];
    for (const list of cosignatoryList) {
      const others = accounts.find(items => list.publicKey === items.publicAccount.publicKey);
      if (!others) {
        othersCosignatories.push(PublicAccount.createFromPublicKey(list.publicKey, environment.typeNetwork.value));
      }
    }
    return othersCosignatories;
  }


  /**
   *
   * @param account
   * @param txOnpartial
   */
  onPartial (account: AccountsInterface, txOnpartial: TransactionsInterface[]): boolean {
    let isPartial = false;
    if (txOnpartial !== null && txOnpartial.length > 0) {
      for (const tx of txOnpartial) {
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < tx.data['innerTransactions'].length; i++) {
          isPartial = (tx.data['innerTransactions'][i].signer.publicKey === account.publicAccount.publicKey);
          if (isPartial) {
            break;
          }
        }
        if (isPartial) {
          break;
        }
      }
    }
    return isPartial;
  }

  /**
   *
   * check type TXs sign
   * @param {Account[]} ownCosignatories
   * @param {PublicAccount[]} allCosignatories
   * @returns
   * @memberof MultisigService
   */
  validateTypeSignTxn (ownCosignatories: PublicAccount[], allCosignatories: PublicAccount[]) {
    const accountsFilter = allCosignatories.filter(r => ownCosignatories.find(e => e.publicKey === r.publicKey));
    // console.log('accountsFilter', accountsFilter);
    // validar si tengo los minímos necesarios para generar una transacción
    if (accountsFilter === null || accountsFilter === undefined || accountsFilter.length === 0) {
      return TransactionType.AGGREGATE_BONDED;
    } else if ((accountsFilter.length === allCosignatories.length) && !this.chechOwnCosignatoriesIsMultisig(accountsFilter)) {
      return TransactionType.AGGREGATE_COMPLETE;
    } else {
      return TransactionType.AGGREGATE_BONDED;
    }
  }

  /**
   * Validate public key  ownCosignatories
   * @param cosignatoryList;
   * @param reg;
   */
  validateOwnCosignatories (cosignatoryList: CosignatoryInterface[], reg = /^(0x|0X)?[a-fA-F0-9]+$/) {
    {
      let va = true;
      for (const is of cosignatoryList) {
        if (!reg.test(is.publicKey) || is.publicKey.length < 64) {
          va = false;
          break;

        }
      }
      return va;
    }
  }
  validatePublicKey (publickKey: string, reg = /^(0x|0X)?[a-fA-F0-9]+$/): boolean {
    if (!reg.test(publickKey) || publickKey.length < 64) {
      return false;

    }
    return true;
  }

  recurBuildCosig (publicKey: string, accounts: AccountsInterface[], feeTx: number) {

    // if (accountUni.isMultisign && accountUni.isMultisign.isMultisig()) {

    //   for (let item of accountUni.isMultisign.account())
    //   // const ownCosignatories = this.filterOwnCosignatory({ publicKey: items.publicKey }, this.walletService.currentWallet.accounts);

    //  }

    // this.consginerFirmList.push({
    //   label: item.name,
    //   value: item.address,
    //   disabled: infValidate[0].disabled,
    //   info: infValidate[0].info,
    //   account: item,
    //   isMultisig: item.isMultisign
    // })


  }

  /**
   *
   * @param {AccountsInterface[]} accounts  -
   * @returns {ConsginerFirmList[]}
   * @memberof EditAccountMultisignComponent
   */
  builConsginerList (accountConvert: MultisigAccountInfo, accounts: AccountsInterface[], feeTx: number): ConsginerFirmList[] {
    const list: ConsginerFirmList[] = [];
    for (const item of accounts) {
      const publicAccount: PublicAccount = PublicAccount.createFromPublicKey(item.publicAccount.publicKey, item.network);
      if (accountConvert.hasCosigner(publicAccount)) {
        const accountFiltered: AccountsInfoInterface = this.walletService.filterAccountInfo(item.name);
        const infValidate = this.transactionService.validateBalanceCosignatorie(accountFiltered, Number(feeTx)).infValidate;
        // if (item.isMultisign && item.isMultisign.isMultisig()) {
        //   for (let items of item.isMultisign.cosignatories) {
        //     const ownCosignatories = this.filterOwnCosignatory({ publicKey: items.publicKey }, this.walletService.currentWallet.accounts);


        //   }



        // } else {
        list.push({
          label: item.name,
          value: item.address,
          disabled: infValidate[0].disabled,
          info: infValidate[0].info,
          account: item,
          isMultisig: item.isMultisign
        });
        // }

      }
    }

    return list;
  }
  /**
   * Validate if there is a co-signer of the multi-signature account in my wallet
   * @param accountConvert
   * @param accounts
   * @returns
   */
  hasCosignerInCurrentWallet (accountConvert: MultisigAccountInfo, accounts: AccountsInterface[]): number {
    let consigner = 0;
    for (const item of accounts) {
      const publicAccount: PublicAccount = PublicAccount.createFromPublicKey(item.publicAccount.publicKey,
        item.network);
      if (accountConvert.hasCosigner(publicAccount)) {
        consigner++;
      }
    }
    return consigner;
  }


  /**
   *
   *
   * @param {string} nameCurrentAccount
   * @returns {ContactsListInterface[]}
   * @memberof MultisigService
   */
  validateAccountListContact (nameCurrentAccount: string): ContactsListInterface[] {
    const listContactReturn: ContactsListInterface[] = [];
    const bookAddress: ContactsListInterface[] = this.serviceModuleService.getBooksAddress();
    if (bookAddress !== undefined && bookAddress !== null) {
      const listContactfilter = bookAddress.filter(item => item.label !== nameCurrentAccount);
      for (const element of listContactfilter) {
        const account = this.walletService.filterAccountWallet(element.label);
        let isMultisig = false;
        let publicKey = null;
        // TODO: Validar aqui si mi contacto es multifirma y si yo estoy como cosignatario de mi contacto, no debe listarme ese contacto
        // if (account && account.isMultisign && account.isMultisign.isMultisig() && account.isMultisign.cosignatories.find(r => r.)) {

        // }
        if (account) {
          publicKey = account.publicAccount.publicKey;
          isMultisig = this.checkIsMultisig(account);
        }
        listContactReturn.push({
          label: element.label,
          value: element.value,
          publicKey,
          walletContact: element.walletContact,
          isMultisig,
          disabled: false
        });
      }
    }

    return listContactReturn;
  }
  /**
   *
   *
   * @param {string} nameCurrentAccount
   * @returns {ContactsListInterface[]}
   * @memberof MultisigService
   */
  removeContactList (contactList: ContactsListInterface[], cosignatoryList: CosignatoryListInterface[]): ContactsListInterface[] {
    console.log('contactList', contactList);
    console.log('cosignatoryList', cosignatoryList);
    return contactList.map(x => {
      console.log('cosignatoryList', cosignatoryList.find(i => i.address === x.value));
      if (!cosignatoryList.find(i => i.address === x.value)) {
        return x;
      }
    }).filter(l => l);
  }
}

export interface ContactsListInterface {
  label: string;
  value: string;
  publicKey?: string;
  walletContact: boolean;
  isMultisig: boolean;
  disabled: boolean;
}

export interface CosignatoryInterface {
  action?: string;
  disableItem?: boolean;
  id?: Address;
  publicKey: string;
  type?: number;
}
export interface CosignatoryListInterface extends CosignatoriesInterface {
  loading?: boolean;
  action: string;
  type: number;
  disableItem: boolean;
  id: Address;
  cosignatories?: CosignatoriesInterface[];
}
export interface CosignatoriesInterface {
  isMultisig?: MultisigAccountInfo;
  name?: string;
  address?: string;
  publicAccount?: PublicAccount;
  ownCosignatories?: boolean;
}
export interface ToAggregateConvertMultisigInterface {
  account: PublicAccount;
  ownCosignatories: PublicAccount[];
  othersCosignatories: PublicAccount[];
  minApprovalDelta: number;
  minRemovalDelta: number;
}
export interface ToConvertMultisigInterface {
  account: Account;
  ownCosignatories: Account[];
  othersCosignatories: PublicAccount[];
  minApprovalDelta: number;
  minRemovalDelta: number;
}

export interface ConsginerFirmList {
  label: string;
  value: any;
  disabled: boolean;
  info: string;
  account: AccountsInterface;
  isMultisig: MultisigAccountInfo
}
