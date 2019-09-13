import { Component, OnInit, ViewChild } from '@angular/core';
import { PublicAccount, AggregateTransaction, Account, MultisigAccountInfo, Address, Transaction, MultisigCosignatoryModification, ModifyMultisigAccountTransaction } from 'tsjs-xpx-chain-sdk';
import { PaginationInstance } from 'ngx-pagination';
import { ModalDirective } from 'ng-uikit-pro-standard';
import { Subscription } from 'rxjs';
import { AppConfig } from '../../../config/app.config';
import { WalletService, AccountsInfoInterface, AccountsInterface } from '../../../wallet/services/wallet.service';
import { ProximaxProvider } from '../../../shared/services/proximax.provider';
import { TransactionsInterface, TransactionsService } from '../../services/transactions.service';
import { SharedService, ConfigurationForm } from '../../../shared/services/shared.service';
import { DataBridgeService } from '../../../shared/services/data-bridge.service';

@Component({
  selector: 'app-partial',
  templateUrl: './partial.component.html',
  styleUrls: ['./partial.component.css']
})
export class PartialComponent implements OnInit {

  @ViewChild('modalPartialTransaction', { static: true }) modalPartial: ModalDirective;
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
  elements: any = [];
  headElements = ['Deadline', 'Fee', 'Account linked to the transaction', 'Hash'];
  hidePassword = false;
  objectKeys = Object.keys;
  password: string = '';
  subscription: Subscription[] = [];
  typeTransactions: any;
  validateAccount = false;
  configurationForm: ConfigurationForm;

  constructor(
    private dataBridge: DataBridgeService,
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
    this.transactionService.getAggregateBondedTransactions$().subscribe(
      next => this.aggregateTransactions = next
    );
    // this.getAccountsInfo();
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
    console.log('----------TransactionsInterface----------', transaction);
    this.dataSelected = transaction;
    this.arraySelect = [];
    const accountMultisig = this.walletService.filterAccountInfo(transaction.data['innerTransactions'][0].signer.address.pretty(), true);
    console.log('ACCOUNT MULTISIG -----> ', accountMultisig);
    if (accountMultisig && accountMultisig.multisigInfo && accountMultisig.multisigInfo.cosignatories && accountMultisig.multisigInfo.cosignatories.length > 0) {
      accountMultisig.multisigInfo.cosignatories.forEach(element => {
        const cosignatorie: AccountsInterface = this.walletService.filterAccount('', null, element.address.pretty());
        console.log('cosignatorie ---->', cosignatorie);
        if (cosignatorie) {
          const publicAccount = this.proximaxProvider.createPublicAccount(cosignatorie.publicAccount.publicKey, cosignatorie.publicAccount.address.networkType);
          const signedByAccount = transaction.data.signedByAccount(publicAccount);
          this.validateAccount = true;
          this.arraySelect.push({
            label: (signedByAccount) ? `${cosignatorie.name} - Signed` : cosignatorie.name,
            value: cosignatorie,
            selected: true,
            signed: signedByAccount,
            disabled: signedByAccount
          });
        }
      });

      const cantSigned = this.arraySelect.filter((x: any) => x.signed === true);
      if (cantSigned.length === this.arraySelect.length) {
        this.hidePassword = true;
      }
    }

    transaction.data['innerTransactions'].forEach((element: any) => {
      console.log('INNER TRANSACTIONS --->', element);
      const nameType = Object.keys(this.typeTransactions).find(x => this.typeTransactions[x].id === element.type);
      element['nameType'] = (nameType) ? this.typeTransactions[nameType].name : element.type.toString(16).toUpperCase();
      if (element.type === this.typeTransactions.modifyMultisigAccount.id) {
        const data: ModifyMultisigAccountTransaction = element;
        console.log('ModifyMultisigAccountTransaction.....', data);
        // aqui debo verificar si mi cuenta esta dentro de inner transaction para poder firmarla
        data.modifications.forEach(element => {
          const exist = this.arraySelect.find((b: any) => b.value.address === element.cosignatoryPublicAccount.address.plain());
          console.log('ARRAY SELECT --->', exist);
          if (!exist) {
            const possibleCosignatorie: AccountsInterface = this.walletService.filterAccount('', null, element.cosignatoryPublicAccount.address.pretty());
            console.log('possibleCosignatorie ---->', possibleCosignatorie);
            // Address encontrada
            if (possibleCosignatorie) {

              const publicAccount = this.proximaxProvider.createPublicAccount(
                possibleCosignatorie.publicAccount.publicKey,
                this.walletService.currentAccount.network
              );

              const signedByAccount = transaction.data.signedByAccount(publicAccount);
              this.arraySelect.push({
                label: possibleCosignatorie.name,
                value: possibleCosignatorie,
                selected: true,
                signed: signedByAccount,
                disabled: signedByAccount
              });
            }
          }
        });
      }
    });
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

          // this.getAggregateBondedTransactions(publicsAccounts);
        }
      }
    ));
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
        const transaction: any = this.dataSelected.data;
        const account = this.proximaxProvider.getAccountFromPrivateKey(common.privateKey, this.walletService.currentAccount.network);
        this.password = '';
        this.modalPartial.hide();
        this.dataBridge.setTransactionSigned(transaction);
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
    if (event) {
      this.validateAccount = false;
      this.accountSelected = this.proximaxProvider.createFromRawAddress(event.value.address).pretty();
    } else {
      this.validateAccount = true;
      this.accountSelected = '';
    }
  }
}
