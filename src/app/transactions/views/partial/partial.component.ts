import { Component, OnInit } from '@angular/core';
import { PublicAccount, AggregateTransaction, Account, MultisigAccountInfo, Address, Transaction } from 'tsjs-xpx-chain-sdk';
import { PaginationInstance } from 'ngx-pagination';
import { first } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { AppConfig } from '../../../config/app.config';
import { WalletService, AccountsInfoInterface, AccountsInterface } from '../../../wallet/services/wallet.service';
import { ProximaxProvider } from '../../../shared/services/proximax.provider';
import { TransactionsInterface, TransactionsService } from '../../services/transactions.service';
import { SharedService, ConfigurationForm } from '../../../shared/services/shared.service';

@Component({
  selector: 'app-partial',
  templateUrl: './partial.component.html',
  styleUrls: ['./partial.component.css']
})
export class PartialComponent implements OnInit {

  account: AccountsInterface = null;
  accountSelected = '';
  arraySelect: Array<object> = [];
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
  multisigInfo: MultisigAccountInfo[] = [];
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
  validateAccount = false;
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
    this.getAccountsInfo();
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
   * @param {TransactionsInterface} transaction
   * @memberof PartialComponent
   */
  find(transaction: TransactionsInterface) {
    transaction.data['innerTransactions'].forEach(element => {
      const nameType = Object.keys(this.typeTransactions).find(x => this.typeTransactions[x].id === element.type);
      element['nameType'] = (nameType) ? this.typeTransactions[nameType].name : element.type.toString(16).toUpperCase();
    });

    this.dataSelected = transaction;
    console.log(transaction.data['innerTransactions'][0].signer.address.pretty());
    const otro = this.walletService.filterAccountInfo(transaction.data['innerTransactions'][0].signer.address.pretty(), true);
    console.log(otro);
    if (otro.multisigInfo.cosignatories && otro.multisigInfo.cosignatories.length > 0) {
      otro.multisigInfo.cosignatories.forEach(element => {
        const cosignatorie: AccountsInterface = this.walletService.filterAccount('', null, element.address.pretty());
        console.log('COSIGNATORIE ----> ', cosignatorie);
        if (cosignatorie) {
          this.validateAccount = true;
          this.arraySelect.push({
            label: cosignatorie.name,
            value: cosignatorie,
            selected: true,
            disabled: false
          });
        }
      });
    }
  }

  /**
   *
   *
   * @memberof PartialComponent
   */
  getAccountsInfo() {
    this.subscription.push(this.walletService.getAccountsInfo$().subscribe(
      (next: AccountsInfoInterface[]) => {
        if (next && next.length === this.walletService.currentWallet.accounts.length) {
          const publicsAccounts: PublicAccount[] = [];
          next.forEach((element: AccountsInfoInterface) => {
            if (element.multisigInfo && element.multisigInfo.multisigAccounts.length > 0) {
              element.multisigInfo.multisigAccounts.forEach(x => {
                if (publicsAccounts.length > 0) {
                  if (publicsAccounts.find(b => b.publicKey !== x.publicKey)) {
                    const publicAccount = this.proximaxProvider.createPublicAccount(x.publicKey, x.address.networkType);
                    publicsAccounts.push(publicAccount);
                  }
                } else {
                  const publicAccount = this.proximaxProvider.createPublicAccount(x.publicKey, x.address.networkType);
                  publicsAccounts.push(publicAccount);
                }
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
   * @param {PublicAccount} publicAccount
   * @memberof PartialComponent
   */
  getAggregateBondedTransactions(publicsAccounts: PublicAccount[]) {
    publicsAccounts.forEach(publicAccount => {
      this.proximaxProvider.getAggregateBondedTransactions(publicAccount).pipe(first()).subscribe(
        aggregateTransaction => {
          console.log('Get aggregate bonded --->', aggregateTransaction);
          aggregateTransaction.forEach((a: AggregateTransaction) => {
            const existTransction = this.aggregateTransactions.find(x => x.data.transactionInfo.hash === a.transactionInfo.hash);
            if (!existTransction) {
              const data = this.transactionService.getStructureDashboard(a);
              // console.log('----> existTransction <-----', data);
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
      this.validateAccount === false && this.password !== '' &&
      this.password.length >= this.configurationForm.passwordWallet.minLength &&
      this.password.length <= this.configurationForm.passwordWallet.maxLength
    ) {
      let common: any = { password: this.password };
      if (this.walletService.decrypt(common, this.account)) {
        console.log(common);
        const transaction: any = this.dataSelected.data;
        const account = this.proximaxProvider.getAccountFromPrivateKey(common.privateKey, this.walletService.currentAccount.network);
        this.proximaxProvider.cosignAggregateBondedTransaction(transaction, account).subscribe(
          next => {
            console.log(next);
          }
        );
      }
    }
  }

  /**
   *
   *
   * @param {*} event
   * @memberof PartialComponent
   */
  selectAccount(event: any) {
    console.log(event);
    if (event) {
      this.validateAccount = false;
      this.accountSelected = this.proximaxProvider.createFromRawAddress(event.value.address).pretty();
    } else {
      this.validateAccount = true;
      this.accountSelected = '';
    }
  }
}
