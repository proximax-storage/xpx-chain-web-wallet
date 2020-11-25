import { Injectable } from '@angular/core';
import { ServicesModuleService } from 'src/app/servicesModule/services/services-module.service';
import { AccountsInterface, WalletService } from 'src/app/wallet/services/wallet.service';
import { Account, Deadline, ModifyMultisigAccountTransaction, MultisigCosignatoryModification, MultisigCosignatoryModificationType, TransactionType, UInt64 } from 'tsjs-xpx-chain-sdk';
import { Address } from 'tsjs-xpx-chain-sdk/dist/src/model/account/Address';
import { PublicAccount } from 'tsjs-xpx-chain-sdk/dist/src/model/account/PublicAccount';

@Injectable({
  providedIn: 'root'
})

export class MultisigService {
  constructor(
    private serviceModuleService: ServicesModuleService,
    private walletService: WalletService
  ) {}

  convertAccountToMultisig(params: ToConvertMultisigInterface) {
    const cosignatoriesPublicAccount: PublicAccount[] = params.othersCosignatories.concat(params.ownCosignatories.map(r => r.publicAccount));
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

    this.validateTypeSignTxn(params.ownCosignatories, cosignatoriesPublicAccount);
  }

  /**
   *
   *
   * @param {Account[]} ownCosignatories
   * @param {PublicAccount[]} allCosignatories
   * @returns
   * @memberof MultisigService
   */
  validateTypeSignTxn(ownCosignatories: Account[], allCosignatories: PublicAccount[]) {
    const accountsFilter = allCosignatories.filter(r => ownCosignatories.find(e => e.publicAccount.publicKey === r.publicKey));
    console.log('accountsFilter', accountsFilter);
    // validar si tengo los minímos necesarios para generar una transacción
    if (accountsFilter === null || accountsFilter === undefined || accountsFilter.length === 0) {
      return TransactionType.AGGREGATE_BONDED;
    } else if (accountsFilter.length === allCosignatories.length) {
      return TransactionType.AGGREGATE_COMPLETE;
    } else {
      return TransactionType.AGGREGATE_BONDED;
    }
  }

  /**
   *
   *
   * @param {AccountsInterface} account
   * @returns {boolean}
   * @memberof MultisigService
   */
  checkIsMultisig(account: AccountsInterface): boolean {
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
  validateAccountListContact(nameCurrentAccount: string): ContactsListInterface[] {
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
  action: string;
  disableItem: boolean;
  id: Address;
  publicAccount: PublicAccount;
  type: number;
}

export interface ToConvertMultisigInterface {
  account: Account;
  ownCosignatories: Account[];
  othersCosignatories: PublicAccount[];
  minApprovalDelta: number;
  minRemovalDelta: number;
}
