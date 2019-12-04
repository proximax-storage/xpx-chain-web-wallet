import { Component, OnInit, ViewChild } from '@angular/core';
import { PublicAccount, AggregateTransaction, Account, MultisigAccountInfo, Address, Transaction, MultisigCosignatoryModification, ModifyMultisigAccountTransaction, UInt64 } from 'tsjs-xpx-chain-sdk';
import { PaginationInstance } from 'ngx-pagination';
import { ModalDirective } from 'ng-uikit-pro-standard';
import { Subscription } from 'rxjs';
import { AppConfig } from '../../../config/app.config';
import { WalletService, AccountsInfoInterface, AccountsInterface } from '../../../wallet/services/wallet.service';
import { ProximaxProvider } from '../../../shared/services/proximax.provider';
import { TransactionsInterface, TransactionsService } from '../../services/transactions.service';
import { SharedService, ConfigurationForm } from '../../../shared/services/shared.service';
import { DataBridgeService } from '../../../shared/services/data-bridge.service';
import { environment } from '../../../../environments/environment';

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

  dataSelected: TransactionsInterface = null;
  filter = '';
  goBack = `/${AppConfig.routes.service}`;
  maxSize = 0;
  moduleName = 'Transactions';
  multisigInfo: MultisigAccountInfo[] = [];
  nis1hash = null;
  elements: any = [];
  headElements = ['Deadline', 'Account linked to the transaction', 'Hash'];
  hideSign = false;
  objectKeys = Object.keys;
  onlySigner = false;
  password = '';
  passwordMain = 'password';
  subscription: Subscription[] = [];
  typeTransactions: any;
  validateAccount = false;
  configurationForm: ConfigurationForm;
  showSwap = false;
  msg = '';
  routeNis1Hash = environment.nis1.urlExplorer;
  deadline: string;


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
    this.subscription.push(this.transactionService.getAggregateBondedTransactions$().subscribe(
      next => {
        this.aggregateTransactions = next.sort((a, b) => (this.transactionService.dateFormat(a.data.deadline) < this.transactionService.dateFormat(b.data.deadline)) ? 1 : -1);
        this.aggregateTransactions.forEach(transaction => {
          transaction.hash = transaction.data.transactionInfo.hash;
          transaction['deadline'] = `${this.transactionService.dateFormat(transaction.data.deadline)} - UTC`;
        });
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

  changeInputType(inputType) {
    const newType = this.sharedService.changeInputType(inputType);
    this.passwordMain = newType;
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
    // console.log(transaction);
    this.msg = '';
    this.nis1hash = null;
    this.showSwap = false;
    this.modalPartial.show();
    this.dataSelected = transaction;
    this.deadline = `${this.transactionService.dateFormat(this.dataSelected.data['deadline'])} - UTC`;
    this.arraySelect = this.arraySelect.slice(0);
    // this.arraySelect = [];
    this.account = null;
    this.password = '';
    const arraySelect = [];
    const accountMultisig = this.walletService.filterAccountInfo(transaction.data['innerTransactions'][0].signer.address.pretty(), true);
    if (accountMultisig && accountMultisig.multisigInfo && accountMultisig.multisigInfo.cosignatories && accountMultisig.multisigInfo.cosignatories.length > 0) {
      accountMultisig.multisigInfo.cosignatories.forEach(element => {
        const cosignatorie: AccountsInterface = this.walletService.filterAccountWallet('', null, element.address.pretty());
        if (cosignatorie) {
          const publicAccount = this.proximaxProvider.createPublicAccount(cosignatorie.publicAccount.publicKey, cosignatorie.publicAccount.address.networkType);
          const signedByAccount = transaction.data.signedByAccount(publicAccount);
          arraySelect.push({
            label: (signedByAccount) ? `${cosignatorie.name} - Signed` : cosignatorie.name,
            value: cosignatorie,
            selected: false,
            signed: signedByAccount,
            disabled: signedByAccount
          });
        }
      });
    }

    transaction.data['innerTransactions'].forEach((element: any) => {
      // console.log('INNER TRANSACTIONS --->', element);
      const nameType = Object.keys(this.typeTransactions).find(x => this.typeTransactions[x].id === element.type);
      element['nameType'] = (nameType) ? this.typeTransactions[nameType].name : element.type.toString(16).toUpperCase();
      if (element.type === this.typeTransactions.modifyMultisigAccount.id) {
        const data: ModifyMultisigAccountTransaction = element;
        // aqui debo verificar si mi cuenta esta dentro de inner transaction para poder firmarla
        data.modifications.forEach(element => {
          const exist = arraySelect.find((b: any) => b.value.address === element.cosignatoryPublicAccount.address.plain());
          if (!exist) {
            const possibleCosignatorie: AccountsInterface = this.walletService.filterAccountWallet('', null, element.cosignatoryPublicAccount.address.pretty());
            // console.log('possibleCosignatorie ---->', possibleCosignatorie);
            // Address encontrada
            if (possibleCosignatorie) {
              const publicAccount = this.proximaxProvider.createPublicAccount(
                possibleCosignatorie.publicAccount.publicKey,
                this.walletService.currentAccount.network
              );

              const signedByAccount = transaction.data.signedByAccount(publicAccount);
              arraySelect.push({
                label: possibleCosignatorie.name,
                value: possibleCosignatorie,
                selected: false,
                signed: signedByAccount,
                disabled: signedByAccount
              });
            }
          }
        });
      }
    });

    const innerTransactions = transaction.data['innerTransactions'];
    if (innerTransactions.length === 1) {
      if (innerTransactions[0].type === this.typeTransactions.transfer.id) {
        if (innerTransactions[0]['message'] && innerTransactions[0]['message'].payload !== '') {
          try {
            const msg = JSON.parse(innerTransactions[0]['message'].payload);
            const addressAccountMultisig = environment.swapAccount.addressAccountMultisig;
            const addressAccountSimple = environment.swapAccount.addressAccountSimple;
            const addressSender = innerTransactions[0].signer.address.plain();
            if ((addressSender === addressAccountMultisig) || (addressSender === addressAccountSimple)) {
              if (msg && msg['type'] && msg['type'] === 'Swap') {
                // console.log('IS SWAP');
                this.nis1hash = msg['nis1Hash'];
                this.msg = msg['message'];
                this.showSwap = true;
              }
            }
          } catch (error) {
            // console.log('error', error);
          }
        }
      }
    }

    this.onlySigner = false;
    const cantSigned = arraySelect.filter((x: any) => x.signed === true);
    this.hideSign = (cantSigned.length === arraySelect.length) ? true : false;
    if (!this.hideSign) {
      if (arraySelect.length === 1) {
        this.onlySigner = true;
        this.account = arraySelect[0].value;
        this.selectAccount(arraySelect[0]);
      } else {
        this.arraySelect = arraySelect;
      }
    } else {
      this.arraySelect = arraySelect;
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
      const common: any = { password: this.password };
      // console.log(this.account);
      if (this.walletService.decrypt(common, this.account)) {
        const transaction: any = this.dataSelected.data;
        const account = this.proximaxProvider.getAccountFromPrivateKey(common.privateKey, this.walletService.currentAccount.network);
        this.password = '';
        this.modalPartial.hide();
        this.proximaxProvider.cosignAggregateBondedTransaction(transaction, account).subscribe(
          next => {
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
