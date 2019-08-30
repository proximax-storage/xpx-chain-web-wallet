import { Component, OnInit } from '@angular/core';
import { PublicAccount, AggregateTransaction, Account } from 'tsjs-xpx-chain-sdk';
import { PaginationInstance } from 'ngx-pagination';
import { first } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { AppConfig } from '../../../config/app.config';
import { WalletService, AccountsInfoInterface } from '../../../wallet/services/wallet.service';
import { ProximaxProvider } from '../../../shared/services/proximax.provider';
import { TransactionsInterface, TransactionsService } from '../../services/transactions.service';
import { SharedService, ConfigurationForm } from '../../../shared/services/shared.service';

@Component({
  selector: 'app-partial',
  templateUrl: './partial.component.html',
  styleUrls: ['./partial.component.css']
})
export class PartialComponent implements OnInit {

  aggregateTransactions: TransactionsInterface[] = [];
  componentName = 'Partial';
  configAdvance: PaginationInstance = {
    id: 'advanced',
    itemsPerPage: 10,
    currentPage: 1
  };

  configCustom: PaginationInstance = {
    id: 'custom',
    itemsPerPage: 1,
    currentPage: 1
  };

  dataSelected: TransactionsInterface = null;
  filter: string = '';
  goBack = `/${AppConfig.routes.service}`;
  maxSize = 0;
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
  password: string = '';
  subscription: Subscription[] = [];
  typeTransactions: any;
  configurationForm: ConfigurationForm;

  constructor(
    private proximaxProvider: ProximaxProvider,
    private sharedService: SharedService,
    public transactionService: TransactionsService,
    private walletService: WalletService
  ) { }

  /**
   *
   *
   * @memberof PartialComponent
   */
  ngOnInit() {
    this.configurationForm = this.sharedService.configurationForm;
    this.typeTransactions = this.transactionService.getTypeTransactions();
    this.subscription.push(this.walletService.getAccountsInfo$().subscribe(
      (next: AccountsInfoInterface[]) => {
        // console.log('getAccountsInfo ----> ', next);
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
   * @param {AggregateTransaction} transaction
   * @param {Account} account
   * @memberof PartialComponent
   */
  cosignAggregateBondedTransaction(transaction: AggregateTransaction, account: Account) {
    this.proximaxProvider.cosignAggregateBondedTransaction(transaction, account).subscribe(
      announcedTransaction => console.log(announcedTransaction),
      err => console.error(err)
    );
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
          // console.log('Get aggregate bonded --->', aggregateTransaction);
          aggregateTransaction.forEach((a: AggregateTransaction) => {
            const existTransction = this.aggregateTransactions.find(x => x.data.transactionInfo.hash === a.transactionInfo.hash);
            if (!existTransction) {
              const data = this.transactionService.getStructureDashboard(a);
              console.log('----> existTransction <-----', data);
              this.aggregateTransactions.push(data);
            }
          });
        }
      );
    });
  }

  /**
   *
   *
   * @memberof PartialComponent
   */
  sendTransaction() {
    if (
      this.password !== '' &&
      this.password.length >= this.configurationForm.passwordWallet.minLength &&
      this.password.length <= this.configurationForm.passwordWallet.maxLength) {

    }
    // account = sdk.Account.createFromPrivateKey(
    //   "13A32F217D99FE2D2DA40772490C3F5CEB86D93B5530BF44FE0EFC542404F642",
    //   168
    // );
  }
}
