import { Injectable } from '@angular/core';
import { AggregateTransaction, PublicAccount, Transaction, Deadline, TransactionType, Address } from 'tsjs-xpx-chain-sdk';
import { environment } from 'src/environments/environment';
import { AccountsInterface } from 'src/app/wallet/services/wallet.service';

@Injectable({
  providedIn: 'root'
})
export class MultiSignService {

  minApprovaMaxCalc: number;
  minApprovaMinCalc: number;
  constructor() { }

  aggregateTransactionType(arrayTx: arrayTx[], transactionType: TransactionType, currentAccountToConvert: AccountsInterface): AggregateTransaction {
    const innerTxn = [];
    arrayTx.forEach(element => {
      innerTxn.push(element.tx.toAggregate(element.signer));
    });
    let aggregateTransaction: AggregateTransaction = null
    switch (transactionType) {
      case TransactionType.AGGREGATE_BONDED:
        aggregateTransaction = AggregateTransaction.createBonded(
          Deadline.create(environment.deadlineTransfer.deadline, environment.deadlineTransfer.chronoUnit),
          innerTxn,
          currentAccountToConvert.network
        );
        break
      case TransactionType.AGGREGATE_COMPLETE:

        break

    }
    return aggregateTransaction;



  }

  typeSignTx(cosignatoryList: CosignatoryList[], accounts: AccountsInterface[]) {

    const lengthListCosig = cosignatoryList.length
    const lengthAccounts = accounts.length

    console.log('cosignatoryList', cosignatoryList.length)
    console.log('accountsInterface', accounts)

    for (const list of cosignatoryList) {
      console.log('list')

      accounts.filter(items => list.publicAccount.publicKey === items.publicAccount.publicKey)


    }

    return null
  }





  calcMinDelta(minApprovalDeltaE: number, minRemovalDeltaE: number, minApprovalDeltaM: number, minRemovalDeltaM: number) {
    return new Object({
      minApprovalDelta: minApprovalDeltaM - minApprovalDeltaE,
      minRemovalDelta: minRemovalDeltaM - minRemovalDeltaE

    })
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