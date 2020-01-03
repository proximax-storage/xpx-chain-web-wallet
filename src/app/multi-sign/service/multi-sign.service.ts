import { Injectable } from '@angular/core';
import { AggregateTransaction, PublicAccount, Transaction, Deadline, TransactionType, Address, SignedTransaction, Account } from 'tsjs-xpx-chain-sdk';
import { environment } from 'src/environments/environment';
import { AccountsInterface } from 'src/app/wallet/services/wallet.service';

@Injectable({
  providedIn: 'root'
})
export class MultiSignService {

  minApprovaMaxCalc: number;
  minApprovaMinCalc: number;
  constructor() { }



  aggregateTransactionType(arrayTx: arrayTx[], transactionType: TypeTx, currentAccountToConvert: AccountsInterface): AggregateTransaction {
    const innerTxn = [];
    arrayTx.forEach(element => {
      innerTxn.push(element.tx.toAggregate(element.signer));
    });
    let aggregateTransaction: AggregateTransaction = null
    console.log('type:', transactionType.transactionType)
    switch (transactionType.transactionType) {
      case TransactionType.AGGREGATE_BONDED:
        console.log('AGGREGATE_BONDED  AggregateTransaction')
        aggregateTransaction = AggregateTransaction.createBonded(
          Deadline.create(environment.deadlineTransfer.deadline, environment.deadlineTransfer.chronoUnit),
          innerTxn,
          currentAccountToConvert.network
        );
        break
      case TransactionType.AGGREGATE_COMPLETE:
        console.log('AGGREGATE_COMPLETE  AggregateTransaction')
        aggregateTransaction = AggregateTransaction.createComplete(
          Deadline.create(environment.deadlineTransfer.deadline, environment.deadlineTransfer.chronoUnit),
          innerTxn,
          currentAccountToConvert.network,
          []
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

  signedTransaction(accountSign: Account,
    aggregateTransaction: AggregateTransaction,
    generationHash: any,
    myCosigners: Account[]): SignedTransaction {
    let signedTransaction: SignedTransaction = null
    // switch (transactionType.transactionType) {
    //   case TransactionType.AGGREGATE_BONDED:
    //     console.log('AGGREGATE_BONDED  SignedTransaction')
    //     if (transactionType.type === 0)
    //       signedTransaction = accountSign.sign(aggregateTransaction, generationHash)
    //     if (transactionType.type === 1) {
    if (myCosigners.length > 0) {
      signedTransaction = accountSign.signTransactionWithCosignatories(aggregateTransaction, myCosigners, generationHash)
    } else {
      signedTransaction = accountSign.sign(aggregateTransaction, generationHash)
    }
    //     }
    //     break
    // }
    return signedTransaction
  }

  typeSignTx(cosignatoryList: CosignatoryList[], accounts: AccountsInterface[]): TypeTx {
    let accountsFilter: AccountsInterface[] = []
    let typeTx: TypeTx = { type: null, transactionType: null }
    for (const list of cosignatoryList) {
      const account = accounts.find(items => list.publicAccount.publicKey === items.publicAccount.publicKey)
      if (account)
        accountsFilter.push(accounts.find(items => list.publicAccount.publicKey === items.publicAccount.publicKey))
    }
    console.log('accountsFilter', accountsFilter)
    if (accountsFilter === null || accountsFilter === undefined || accountsFilter.length === 0) {
      typeTx = { type: 0, transactionType: TransactionType.AGGREGATE_BONDED }
    } else if (accountsFilter.length === cosignatoryList.length) {
      typeTx = { type: 2, transactionType: TransactionType.AGGREGATE_COMPLETE }
    } else {
      typeTx = { type: 1, transactionType: TransactionType.AGGREGATE_BONDED }
    }
    return typeTx
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
    // for (const list of cosignatoryList) {
    //   let found = false;
    //   for (const mylist of myAccountsFilter) {
    //     if (mylist.publicAccount.publicKey === list.publicAccount.publicKey) {
    //       found = true;
    //       break;
    //     }
    //   }
    //   if (found == false)
    //     otherAccountsFilter.push(list)
    // }
    // return { myCosignatory: myAccountsFilter, otherCosigners: otherAccountsFilter }
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