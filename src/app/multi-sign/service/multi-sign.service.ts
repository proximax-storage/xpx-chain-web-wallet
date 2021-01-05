import { Injectable } from '@angular/core';
import { AggregateTransaction, PublicAccount, Transaction, Deadline, TransactionType, Address, SignedTransaction, Account, MultisigAccountInfo, UInt64 } from 'tsjs-xpx-chain-sdk';
import { environment } from 'src/environments/environment';
import { AccountsInterface } from 'src/app/wallet/services/wallet.service';
import { ProximaxProvider } from '../../shared/services/proximax.provider';

@Injectable({
  providedIn: 'root'
})
export class MultiSignService {

  minApprovaMaxCalc: number;
  minApprovaMinCalc: number;
  constructor(private proximaxProvider: ProximaxProvider) { }



  aggregateTransactionType(arrayTx: arrayTx[], transactionType: TypeTx, currentAccountToConvert: AccountsInterface): AggregateTransaction {
    const innerTxn = [];
    arrayTx.forEach(element => {
      innerTxn.push(element.tx.toAggregate(element.signer));
    });
    let aggregateTransaction: AggregateTransaction = null
    console.debug('type:', transactionType.transactionType)
    switch (transactionType.transactionType) {
      case TransactionType.AGGREGATE_BONDED:
        console.log('AGGREGATE_BONDED  AggregateTransaction')
        aggregateTransaction = this.proximaxProvider.buildAggregateBonded(
          innerTxn,
          currentAccountToConvert.network
        );
        break
      case TransactionType.AGGREGATE_COMPLETE:
        console.log('AGGREGATE_COMPLETE  AggregateTransaction')
        aggregateTransaction = this.proximaxProvider.buildAggregateComplete(
          innerTxn,
          currentAccountToConvert.network
        );

        break
    }
    return aggregateTransaction;

  }

  calcMinDelta(minApprovalDeltaE: number, minRemovalDeltaE: number, minApprovalDeltaM: number, minRemovalDeltaM: number) {
    return new Object({
      minApprovalDelta: minApprovalDeltaM - minApprovalDeltaE,
      minRemovalDelta: minRemovalDeltaM - minRemovalDeltaE
    })
  }
  countArray(key: string, value: any, array: any): number {
    let count = 0;
    for (let i = 0; i < array.length; ++i) {
      if (array[i][key] == value)
        count++;
    }
    return count

  }

  signedTransaction(accountSign: Account,
    aggregateTransaction: AggregateTransaction,
    generationHash: any,
    myCosigners: Account[]): SignedTransaction {
    let signedTransaction: SignedTransaction = null
    if (myCosigners.length > 0) {
      signedTransaction = accountSign.signTransactionWithCosignatories(aggregateTransaction, myCosigners, generationHash)
    } else {
      signedTransaction = accountSign.sign(aggregateTransaction, generationHash)
    }
    return signedTransaction
  }

  typeSignTxConvert(cosignatoryList: CosignatoryList[], accounts: AccountsInterface[]): TypeTx {
    let accountsFilter: AccountsInterface[] = []
    let typeTx: TypeTx = { type: null, transactionType: null }
    for (const list of cosignatoryList) {
      const account = accounts.find(items => list.publicAccount.publicKey === items.publicAccount.publicKey)
      if (account)
        accountsFilter.push(accounts.find(items => list.publicAccount.publicKey === items.publicAccount.publicKey))
    }
    if (accountsFilter === null || accountsFilter === undefined || accountsFilter.length === 0) {
      typeTx = { type: 0, transactionType: TransactionType.AGGREGATE_BONDED }
    } else if (accountsFilter.length === cosignatoryList.length) {
      typeTx = { type: 2, transactionType: TransactionType.AGGREGATE_COMPLETE }
    } else {
      typeTx = { type: 1, transactionType: TransactionType.AGGREGATE_BONDED }
    }
    return typeTx
  }

  typeSignTxEdit(cosignatoryList: CosignatoryList[], multisigAccountInfo: MultisigAccountInfo, consginerFirmAccountList: ConsginerFirmList[], accounts: AccountsInterface[], signType: number): TypeTx {
    let cantFirm = consginerFirmAccountList.length;
    cantFirm = (cantFirm > 0) ? cantFirm : 1;
    let getcosignatory = this.getvalidateCosignatoryList(cosignatoryList, accounts)
    let typeTx: TypeTx = { type: null, transactionType: null }
    console.debug('minRemoval', multisigAccountInfo.minRemoval)
    console.debug('minApproval', multisigAccountInfo.minApproval)
    console.debug('cantFirm', cantFirm)
    console.debug('Getcosignatory', getcosignatory)

    if (getcosignatory) {
      let cantAdd = this.countArray('type', 1, cosignatoryList)
      let cabtRemove = this.countArray('type', 2, cosignatoryList)
      if (cantAdd > 0 && cabtRemove > 0) {
        console.debug('ADD Y REMOVE')
        if (cantFirm >= multisigAccountInfo.minRemoval && cantFirm >= multisigAccountInfo.minApproval) {
          typeTx = { type: 2, transactionType: TransactionType.AGGREGATE_COMPLETE }
        } else {
          typeTx = { type: 1, transactionType: TransactionType.AGGREGATE_BONDED }
        }
      } else if (cantAdd == 0 && cabtRemove == 0) {
        console.debug('NEVER')
        if (cantFirm >= multisigAccountInfo.minRemoval && cantFirm >= multisigAccountInfo.minApproval) {
          typeTx = { type: 2, transactionType: TransactionType.AGGREGATE_COMPLETE }
        } else {
          typeTx = { type: 1, transactionType: TransactionType.AGGREGATE_BONDED }
        }

      } else if (cantAdd > 0) {
        console.debug('ADD')
        if (cantFirm >= multisigAccountInfo.minApproval) {
          typeTx = { type: 2, transactionType: TransactionType.AGGREGATE_COMPLETE }
        } else {
          typeTx = { type: 1, transactionType: TransactionType.AGGREGATE_BONDED }
        }
      } else if (cabtRemove > 0) {
        console.debug('REMOVE')
        if (cantFirm >= multisigAccountInfo.minRemoval) {
          typeTx = { type: 2, transactionType: TransactionType.AGGREGATE_COMPLETE }
        } else {
          typeTx = { type: 1, transactionType: TransactionType.AGGREGATE_BONDED }
        }
      }
    } else {
      console.debug('FORSE')
      typeTx = { type: 1, transactionType: TransactionType.AGGREGATE_BONDED }
    }
    return typeTx
  }


  getvalidateCosignatoryList(cosignatoryList: CosignatoryList[], accounts: AccountsInterface[]) {
    let accountsFilter: AccountsInterface[] = []
    for (const list of cosignatoryList) {
      const account = accounts.find(items => list.publicAccount.publicKey === items.publicAccount.publicKey)
      if (account)
        accountsFilter.push(accounts.find(items => list.publicAccount.publicKey === items.publicAccount.publicKey))
    }
    return Boolean(accountsFilter.length === cosignatoryList.length)
  }
  myCosigners(cosignatoryList: CosignatoryList[], accounts: AccountsInterface[]): AccountsInterface[] {
    // otherCosigners(cosignatoryList: CosignatoryList[], accounts: AccountsInterface[]): AccountsInterface[] {
    let myAccountsFilter: AccountsInterface[] = []
    let otherAccountsFilter: CosignatoryList[] = []
    for (const list of cosignatoryList) {
      const myAccount = accounts.find(items => list.publicAccount.publicKey === items.publicAccount.publicKey)
      if (myAccount)
        myAccountsFilter.push(myAccount)
    }
    return myAccountsFilter
  }
}
interface arrayTx { tx: Transaction, signer: PublicAccount }[]
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
/**
 * @param type - 0 = AGGREGATE_BONDED , 1 = AGGREGATE_BONDED (COSIGNER) , 2 = AGGREGATE_COMPLETE (COSIGNER)
 * @param transactionType - Transaction type 
 **/
export interface TypeTx {
  type: number,
  transactionType: number,
}
export interface CosignersSignLis {
  myCosignatory: any
  otherCosigners: any,
}
export interface ConsginerFirmList {
  label: string;
  value: any;
  disabled: boolean;
  info: string;
  account: AccountsInterface
}