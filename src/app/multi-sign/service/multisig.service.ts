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
  consginerFirmList: CosignatoryListInterface[] = [];
  constructor(
    private serviceModuleService: ServicesModuleService,
    private walletService: WalletService,
    private transactionService: TransactionsService,
  ) { }
/**
 *
 *
 * @param {CosignatoryList[]}
 * @returns {MultisigCosignatoryModification[]}
 * @memberof EditAccountMultisignComponent
 */
  multisigCosignatoryModification(cosignatoryList: CosignatoryListInterface[]): MultisigCosignatoryModification[] {
    const cosignatory = [];
    if (cosignatoryList.length > 0) {
      // tslint:disable-next-line: prefer-for-of
      for (let index = 0; index < cosignatoryList.length; index++) {
        const element = cosignatoryList[index];
        const type: MultisigCosignatoryModificationType = (cosignatoryList[index].type === 1) ?
          MultisigCosignatoryModificationType.Add : MultisigCosignatoryModificationType.Remove;
        cosignatory.push(
          new MultisigCosignatoryModification(
            type,
            cosignatoryList[index].publicAccount,
          )
        );
      }

    }
    return cosignatory;
  }
  /**
   * Aggregate transaction
   * @param {ToAggregateConvertMultisigInterface} params
   * @returns {AggregateTransaction}
   */
  aggregateTransactionEditModifyMultisig(params: ToAggregateTransactionEditModifyMultisig): AggregateTransaction {
    const valor = this.calcMinDelta(
      params.minApprovalDelta.minApprovalOld,
      params.minRemovalDelta.minRemovalOld,
      params.minApprovalDelta.minApprovalNew,
      params.minRemovalDelta.minRemovalNew,
    );
    const modifyMultisigAccountTransaction: ModifyMultisigAccountTransaction = ModifyMultisigAccountTransaction.create(
      Deadline.create(environment.deadlineTransfer.deadline, environment.deadlineTransfer.chronoUnit),
      valor['minApprovalDelta'],
      valor['minRemovalDelta'],
      this.multisigCosignatoryModification(params.cosignatoryLis),
      environment.typeNetwork.value
    );
    let aggregateTransaction: AggregateTransaction = null;

    const typeTX = this.typeSignTxEdit(params.cosignatoryLis,
      params.minRemovalDelta.minRemovalOld,
      params.minApprovalDelta.minApprovalOld,
      params.cosignerFirmList,
      params.accountsWallet);
    if (typeTX === TransactionType.AGGREGATE_BONDED) {
      aggregateTransaction = AggregateTransaction.createBonded(
        Deadline.create(environment.deadlineTransfer.deadline, environment.deadlineTransfer.chronoUnit),
        [modifyMultisigAccountTransaction.toAggregate(params.account)],
        params.account.address.networkType
      );

    } else {
      aggregateTransaction = AggregateTransaction.createComplete(
        Deadline.create(environment.deadlineTransfer.deadline, environment.deadlineTransfer.chronoUnit),
        [modifyMultisigAccountTransaction.toAggregate(params.account)],
        params.account.address.networkType,
        []
      );

    }
    return aggregateTransaction;
  }

  calcMinDelta(minApprovalDeltaE: number, minRemovalDeltaE: number, minApprovalDeltaM: number, minRemovalDeltaM: number) {
    return new Object({
      minApprovalDelta: minApprovalDeltaM - minApprovalDeltaE,
      minRemovalDelta: minRemovalDeltaM - minRemovalDeltaE
    });
  }

  /**
   * Aggregate transaction
   * @param {ToAggregateConvertMultisigInterface} params
   * @returns {AggregateTransaction}
   */
  aggregateTransactionModifyMultisig(params: ToAggregateConvertMultisigInterface): AggregateTransaction {
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
      aggregateTransaction = AggregateTransaction.createBonded(
        Deadline.create(environment.deadlineTransfer.deadline, environment.deadlineTransfer.chronoUnit),
        [modifyMultisigAccountTransaction.toAggregate(params.account)],
        params.account.address.networkType
      );

    } else {
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
  convertAccountToMultisig(params: ToConvertMultisigInterface) {
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
  checkIsMultisig(account: AccountsInterface): boolean {
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
  chechOwnCosignatoriesIsMultisig(ownCosignatories: PublicAccount[]): boolean {
    let ban = false;
    for (const i of ownCosignatories) {
      const accountInfo = this.walletService.filterAccountInfo(i.address.pretty(), true);
      if (accountInfo) {
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
  filterOwnCosignatories(cosignatoryList: CosignatoryInterface[], accounts: AccountsInterface[]): AccountsInterface[] {
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
  filterOwnCosignatory(cosignatoryList: CosignatoryInterface, accounts: AccountsInterface[]): AccountsInterface {
    return accounts.find(x => x.publicAccount.publicKey === cosignatoryList.publicKey);
  }
  filterOtherCosignerFirmAccountList(cosignerFirmListOne: CosignerFirmList[], cosignerFirmListOtwo: CosignerFirmList[]): CosignerFirmList[] {
    const cosignerFirmListOnes: CosignerFirmList[] = [];
    for (const list of cosignerFirmListOne) {
      if (!cosignerFirmListOtwo.find(items => list.account.address === items.account.address)) {
        cosignerFirmListOnes.push(list);
      }
    }
    return cosignerFirmListOnes;
  }

  /**
   * filter  others cosignatories
   * @param {CosignatoryInterface[]} cosignatoryList
   * @param {AccountsInterface[]} accounts
   * @returns
   * @memberof MultisigService
   */
  filterOthersCosignatories(cosignatoryList: CosignatoryInterface[], accounts: AccountsInterface[]): CosignatoryInterface[] {
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
  onPartial(account: AccountsInterface, txOnpartial: TransactionsInterface[]): boolean {
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
  validateTypeSignTxn(ownCosignatories: PublicAccount[], allCosignatories: PublicAccount[]) {
    const accountsFilter = allCosignatories.filter(r => ownCosignatories.find(e => e.publicKey === r.publicKey));
    // validar si tengo los minímos necesarios para generar una transacción
    if (accountsFilter === null || accountsFilter === undefined || accountsFilter.length === 0) {
      return TransactionType.AGGREGATE_BONDED;
    } else if ((accountsFilter.length === allCosignatories.length) && !this.chechOwnCosignatoriesIsMultisig(accountsFilter)) {
      return TransactionType.AGGREGATE_COMPLETE;
    } else {
      return TransactionType.AGGREGATE_BONDED;
    }
  }
  typeSignTxEdit(
    cosignatoryList: CosignatoryListInterface[],
    minRemoval: number,
    minApproval: number,
    consginerFirmAccountList: CosignerFirmList[],
    accounts: AccountsInterface[]): TransactionType {
    let cantFirm = consginerFirmAccountList.length;
    cantFirm = (cantFirm > 0) ? cantFirm : 1;
    const ownCosignatories = this.filterOwnCosignatories(cosignatoryList.map(x => {
      return {
        publicKey: x.publicAccount.publicKey
      };
    }), accounts);
    if (!Boolean(ownCosignatories.length === cosignatoryList.length)) {
      return TransactionType.AGGREGATE_BONDED;
    }
    const cantAdd = cosignatoryList.filter(x => x.type === 1).length;
    const cabtRemove = cosignatoryList.filter(x => x.type === 2).length;
    if (cantAdd > 0 && cabtRemove > 0) {
      console.log('ADD Y REMOVE');
      if (cantFirm >= minRemoval && cantFirm >= minApproval) {
        return TransactionType.AGGREGATE_COMPLETE;
      } else {
        return TransactionType.AGGREGATE_BONDED;
      }
    }
    if (cantAdd === 0 && cabtRemove === 0) {
      console.log('NEVER');
      if (cantFirm >= minRemoval && cantFirm >= minApproval) {
        return TransactionType.AGGREGATE_COMPLETE;
      } else {
        return TransactionType.AGGREGATE_BONDED;
      }
    }
    if (cantAdd > 0) {
      console.log('ADD');
      if (cantFirm >= minApproval) {
        return TransactionType.AGGREGATE_COMPLETE;
      } else {
        return TransactionType.AGGREGATE_BONDED;
      }
    }
    if (cabtRemove > 0) {
      console.log('REMOVE');
      if (cantFirm >= minRemoval) {
        return TransactionType.AGGREGATE_COMPLETE;
      } else {
        return TransactionType.AGGREGATE_BONDED;
      }
    }
  }
  /**
   * Validate public key  ownCosignatories
   * @param cosignatoryList;
   * @param reg;
   */
  validateOwnCosignatories(cosignatoryList: CosignatoryInterface[], reg = /^(0x|0X)?[a-fA-F0-9]+$/) {
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
  validatePublicKey(publickKey: string, reg = /^(0x|0X)?[a-fA-F0-9]+$/): boolean {
    if (!reg.test(publickKey) || publickKey.length < 64) {
      return false;

    }
    return true;
  }

  /**
   *
   *
   * @param {AccountsInterface} account
   * @param {number} feeTx
   * @param {string} [isCosigOf]
   * @returns
   * @memberof MultisigService
   */
  private buildCosignatory(account: AccountsInterface, feeTx: number, isCosigOf?: string) {
    const accountFiltered: AccountsInfoInterface = this.walletService.filterAccountInfo(account.name);
    if (accountFiltered) {
      const accountIsMultisig = accountFiltered && accountFiltered.multisigInfo && accountFiltered.multisigInfo.cosignatories.length > 0;
      let validateBalance = null;
      if (feeTx) {
        validateBalance = this.transactionService.validateBalanceCosignatorie(accountFiltered, Number(feeTx)).infValidate;
      }

      const label = accountIsMultisig ? `${account.name} - Multisig` : account.name;
      // if (accountIsMultisig && isCosigOf) {
      //   label = `${isCosigOf} > ${label}`;
      // }
      return {
        label,
        value: account.address,
        disabled: (validateBalance && validateBalance[0].disabled) || accountIsMultisig,
        info: validateBalance && validateBalance[0].info,
        account,
        isMultisig: account.isMultisign,
        accountIsMultisig,
        accountFiltered
      };
    }

    return null;
  }

  /**
   *
   *
   * @param {MultisigAccountInfo} accountConvert
   * @param {AccountsInterface[]} accounts
   * @param {number} feeTx
   * @returns {cosignerFirmList[]}
   * @memberof MultisigService
   */
  buildCosignerList(account: MultisigAccountInfo, accounts: AccountsInterface[], feeTx?: number): CosignerFirmList[] {
    if (account) {
      const list: CosignerFirmList[] = [];
      for (const item of accounts) {
        const publicAccount: PublicAccount = PublicAccount.createFromPublicKey(item.publicAccount.publicKey, item.network);
        if (account.hasCosigner(publicAccount)) {
          const response = this.buildCosignatory(item, feeTx);
          if (response) {
            list.push(response);
            if (response.accountIsMultisig) {
              response.accountFiltered.multisigInfo.cosignatories.forEach(e => {
                const cosignatoryLevel1Filtered = this.walletService.filterAccountWallet('', null, e.address.pretty());
                if (cosignatoryLevel1Filtered) {
                  const responseCosigLevel1 = this.buildCosignatory(cosignatoryLevel1Filtered, feeTx, response.account.name);
                  if (responseCosigLevel1) {
                    if (!list.find(d => d.account.publicAccount.publicKey === responseCosigLevel1.account.publicAccount.publicKey)) {
                      list.push(responseCosigLevel1);
                    }
                    if (responseCosigLevel1.accountIsMultisig) {
                      responseCosigLevel1.accountFiltered.multisigInfo.cosignatories.forEach(b => {
                        const cosignatoryLevel2Filtered = this.walletService.filterAccountWallet('', null, b.address.pretty());
                        if (cosignatoryLevel2Filtered) {
                          const responseCosigLevel2 = this.buildCosignatory(cosignatoryLevel2Filtered, feeTx, responseCosigLevel1.account.name);
                          if (responseCosigLevel2) {
                            if (!list.find(d => d.account.publicAccount.publicKey === responseCosigLevel2.account.publicAccount.publicKey)) {
                              list.push(responseCosigLevel2);
                            }
                          }
                        }
                      });
                    }
                  }
                }
              });
            }
          }
        }
      }
      return list;
    } else {
      return [];
    }
  }

  /**
   * Validate if there is a co-signer of the multi-signature account in my wallet
   * @param accountConvert
   * @param accounts
   * @returns
   */
  hasCosignerInCurrentWallet(accountConvert: MultisigAccountInfo, accounts: AccountsInterface[]): number {
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
  validateAccountListContact(nameCurrentAccount: string): ContactsListInterface[] {
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
  removeContactList(contactList: ContactsListInterface[], cosignatoryList: CosignatoryListInterface[]): ContactsListInterface[] {
    return contactList.map(x => {
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

  /**
   * cosignatory List
   * @param publicAccount
   * @param action - event (Add or delete)
   * @param type - 1 = Add , 2 = remove , 3 = view
   * @param disableItem - Disable item list
   * @param id - Address in cosignatory
   */
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
  cosignatorieswTow?: CosignatoriesInterface[];
}
export interface ToAggregateConvertMultisigInterface {
  account: PublicAccount;
  ownCosignatories: PublicAccount[];
  othersCosignatories: PublicAccount[];
  minApprovalDelta: number;
  minRemovalDelta: number;
}
export interface ToAggregateTransactionEditModifyMultisig {
  account: PublicAccount;
  cosignerFirmList: CosignerFirmList[];
  cosignatoryLis: CosignatoryListInterface[];
  accountsWallet: AccountsInterface[];
  minApprovalDelta: {
    minApprovalOld: number,
    minApprovalNew: number
  };
  minRemovalDelta: {
    minRemovalOld: number,
    minRemovalNew: number
  };
}

export interface ToConvertMultisigInterface {
  account: Account;
  ownCosignatories: Account[];
  othersCosignatories: PublicAccount[];
  minApprovalDelta: number;
  minRemovalDelta: number;
}

export interface CosignerFirmList {
  label: string;
  value: any;
  disabled: boolean;
  info: string;
  account: AccountsInterface;
  isMultisig: MultisigAccountInfo;
  accountIsMultisig: boolean;
  accountFiltered: AccountsInfoInterface;
  selected?: boolean;
}
