import { Injectable } from '@angular/core';
import { ServicesModuleService } from 'src/app/servicesModule/services/services-module.service';
import { AccountsInterface, WalletService } from 'src/app/wallet/services/wallet.service';
import {
  Account, AggregateTransaction, Deadline, ModifyMultisigAccountTransaction, MultisigCosignatoryModification,
  MultisigCosignatoryModificationType, SignedTransaction, TransactionType, UInt64
} from 'tsjs-xpx-chain-sdk';
import { environment } from '../../../environments/environment';
import { Address } from 'tsjs-xpx-chain-sdk/dist/src/model/account/Address';
import { PublicAccount } from 'tsjs-xpx-chain-sdk/dist/src/model/account/PublicAccount';

@Injectable({
  providedIn: 'root'
})

export class MultisigService {
  constructor(
    private serviceModuleService: ServicesModuleService,
    private walletService: WalletService
  ) { }
  /**
   * AggregateTransaction
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
      signedTransaction = accountSign.signTransactionWithCosignatories(aggregateTransaction, myCosigners, generationHash)
    } else {
      signedTransaction = accountSign.sign(aggregateTransaction, generationHash)
    }
    return signedTransaction;
  }

  /**
   *
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
   *
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
   *
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

  /**
   *
   *
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

