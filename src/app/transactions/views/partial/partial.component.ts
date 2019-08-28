import { Component, OnInit } from '@angular/core';
import { AppConfig } from '../../../config/app.config';
import { PaginationInstance } from 'ngx-pagination';
import { WalletService, AccountsInfoInterface } from 'src/app/wallet/services/wallet.service';
import { Subscription } from 'rxjs';
import { ProximaxProvider } from 'src/app/shared/services/proximax.provider';
import { PublicAccount, AggregateTransaction } from 'tsjs-xpx-chain-sdk';
import { first } from 'rxjs/operators';
import { TransactionsInterface } from '../../services/transactions.service';

@Component({
  selector: 'app-partial',
  templateUrl: './partial.component.html',
  styleUrls: ['./partial.component.css']
})
export class PartialComponent implements OnInit {

  aggregateTransactions: TransactionsInterface[] = [];
  componentName = 'Partial';
  config: PaginationInstance = {
    id: 'advanced',
    itemsPerPage: 10,
    currentPage: 1
  };
  filter: string = '';
  goBack = `/${AppConfig.routes.service}`;
  moduleName = 'Transactions';
  elements: any = [
    {
      status: 'Action Required!',
      deadline: '2019-07-10 20:38:04',
      fee: '0.000000',
      accountLinked: 'VDAE5R-ORTVTM-Y6M5EU-MLYQ5E-LQ7WWX-2AIFRO-Z3YN',
      hash: 'F416F7FA16AB94878D135F7AFD815A5DAB664F0588FD90592A7DB082C28A438C',
      statusBoolean: true
    },
    {
      status: 'Pending!',
      deadline: '2019-08-10 20:38:04',
      fee: '0.000000',
      accountLinked: 'VDAE5R-ORTVTM-Y6M5EU-MLYQ5E-LQ7WWX-2AIFRO-Z3YN',
      hash: 'F416F7FA16AB94878D135F7AFD815A5DAB664F0588FD90592A7DB082C28A438C',
      statusBoolean: false
    },
    {
      status: 'Action Required!',
      deadline: '2019-09-10 20:38:04',
      fee: '0.000000',
      accountLinked: 'VDAE5R-ORTVTM-Y6M5EU-MLYQ5E-LQ7WWX-2AIFRO-Z3YN',
      hash: 'F416F7FA16AB94878D135F7AFD815A5DAB664F0588FD90592A7DB082C28A438C',
      statusBoolean: true
    },
    {
      status: 'Action Required!',
      deadline: '2019-10-10 20:38:04',
      fee: '0.000000',
      accountLinked: 'VDAE5R-ORTVTM-Y6M5EU-MLYQ5E-LQ7WWX-2AIFRO-Z3YN',
      hash: 'F416F7FA16AB94878D135F7AFD815A5DAB664F0588FD90592A7DB082C28A438C',
      statusBoolean: true
    },
  ];

  headElements = ['Deadline', 'Fee', 'Account linked to the transaction', 'Hash'];
  objectKeys = Object.keys;
  subscription: Subscription[] = [];


  constructor(
    private proximaxProvider: ProximaxProvider,
    private walletService: WalletService
  ) { }

  /**
   *
   *
   * @memberof PartialComponent
   */
  ngOnInit() {
    this.subscription.push(this.walletService.getAccountsInfo$().subscribe(
      (next: AccountsInfoInterface[]) => {
        console.log('getAccountsInfo ----> ', next);
        if (next) {
          const publicsAccounts: PublicAccount[] = [];
          next.forEach((element: AccountsInfoInterface) => {
            if (element.multisigInfo && element.multisigInfo.multisigAccounts.length > 0) {
              // console.log(element.multisigInfo);
              element.multisigInfo.multisigAccounts.forEach(x => {
                const publicAccount = this.proximaxProvider.createPublicAccount(x.publicKey, x.address.networkType);
                publicsAccounts.push(publicAccount);
              });
            }
          });

          console.log('----publicsAccounts----', publicsAccounts);
          this.getAggregateBondedTransactions(publicsAccounts);
        }
      }
    ));
  }

  /**
   *
   *
   * @memberof PartialComponent
   */
  ngOnDestroy(): void {
    this.subscription.forEach(subscription => {
      subscription.unsubscribe();
    });
  }

  /**
   *
   *
   * @param {PublicAccount} publicAccount
   * @memberof PartialComponent
   */
  getAggregateBondedTransactions(publicsAccounts: PublicAccount[]) {
    publicsAccounts.forEach(publicAccount => {
      this.proximaxProvider.getAggregateBondedTransactions(publicAccount).pipe(first()).subscribe(
        aggregateTransaction => {
          console.log('Get aggregate bonded --->', aggregateTransaction);
          aggregateTransaction.forEach((a: AggregateTransaction) => {
            const existTransction = this.aggregateTransactions.find(x => x.transactionInfo.hash === a.transactionInfo.hash);
            console.log('----> existTransction <-----', existTransction);
            if (!existTransction) {
              this.aggregateTransactions.push(a);
            }
          });
        }
      );
    });
  }
}
