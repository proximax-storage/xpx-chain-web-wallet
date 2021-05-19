import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import {
  PublicAccount,
  AggregateTransaction,
  Account,
  MultisigAccountInfo,
  ModifyMultisigAccountTransaction
} from 'tsjs-xpx-chain-sdk';
import { PaginationInstance } from 'ngx-pagination';
import { ModalDirective } from 'ng-uikit-pro-standard';
import { Subscription } from 'rxjs';
import { AppConfig } from '../../../config/app.config';
import { WalletService, AccountsInfoInterface, AccountsInterface } from '../../../wallet/services/wallet.service';
import { ProximaxProvider } from '../../../shared/services/proximax.provider';
import { TransactionsInterface, TransactionsService } from '../../services/transactions.service';
import { SharedService, ConfigurationForm } from '../../../shared/services/shared.service';
import { environment } from '../../../../environments/environment';
import { CosignerFirmList, MultisigService } from 'src/app/multi-sign/service/multisig.service';
import { formatDate } from '@angular/common';
@Component({
  selector: 'app-partial',
  templateUrl: './partial.component.html',
  styleUrls: ['./partial.component.css']
})
export class PartialComponent implements OnInit, OnDestroy {

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
  headElements = ['Sign/add', 'Deadline', 'Account Linked To The Transaction', 'Hash'];
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
    private walletService: WalletService,
    private multisigService: MultisigService
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
        this.aggregateTransactions = next.sort((a, b) => (
          this.transactionService.dateFormat(a.data.deadline) < this.transactionService.dateFormat(b.data.deadline)
        ) ? 1 : -1);

        this.aggregateTransactions.forEach(transaction => {
          transaction['totalSigned'] = 0;
          this.walletService.getCurrentWallet().accounts.forEach(element => {
            const publicAccount = this.proximaxProvider.createPublicAccount(element.publicAccount.publicKey);
            const x = transaction.data.signedByAccount(publicAccount);
            if (x) {
              transaction['totalSigned'] += 1;
              transaction['isSigned'] = true;
            }
          });
          transaction.hash = transaction.data.transactionInfo.hash;
          transaction['deadline'] =  this.convertDateTimeFormat(transaction.data.deadline.value.toString());
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
  convertDateTimeFormat(dateTime: string): string{
    let dateFormat = "MM/dd/yyyy HH:mm:ss";
    let date = new Date(dateTime);
    let timezone = - date.getTimezoneOffset();

    return formatDate(date, dateFormat, 'en-us', timezone.toString());
  }

  /**
   *
   *
   * @param {*} inputType
   * @memberof PartialComponent
   */
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
      announcedTransaction => console.debug(announcedTransaction),
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
    this.msg = '';
    this.nis1hash = null;
    this.showSwap = false;
    this.modalPartial.show();
    this.dataSelected = transaction;
    this.deadline =  this.convertDateTimeFormat(this.dataSelected.data['deadline'].value.toString());
    this.arraySelect = this.arraySelect.slice(0);
    // this.arraySelect = [];
    this.account = null;
    this.password = '';
    let arraySelect = [];
    const accountMultisig = this.walletService.filterAccountInfo(transaction.data['innerTransactions'][0].signer.address.pretty(), true);
    if (accountMultisig && accountMultisig.multisigInfo && accountMultisig.multisigInfo.cosignatories && accountMultisig.multisigInfo.cosignatories.length > 0) {
      arraySelect = this.multisigService.buildCosignerList(accountMultisig.multisigInfo, this.walletService.currentWallet.accounts);
      arraySelect.map((r: CosignerFirmList | any) => {
        const publicAccount = this.proximaxProvider.createPublicAccount(r.account.publicAccount.publicKey, r.account.network);
        const hasSigned = transaction.data.signedByAccount(publicAccount);
        r.value = r.account;
        r.signed = hasSigned;
        if (!r.disabled) {
          r.disabled = r.disabled || hasSigned;
        }
      });
    }

    transaction.data['innerTransactions'].forEach((element: any) => {
      const nameType = Object.keys(this.typeTransactions).find(x => this.typeTransactions[x].id === element.type);
      element['nameType'] = (nameType) ? this.typeTransactions[nameType].name : element.type.toString(16).toUpperCase();
      if (element.type === this.typeTransactions.modifyMultisigAccount.id) {
        const data: ModifyMultisigAccountTransaction = element;
        // aqui debo verificar si mi cuenta esta dentro de inner transaction para poder firmarla
        // tslint:disable-next-line: no-shadowed-variable
        data.modifications.forEach(element => {
          const exist = arraySelect.find((b: any) => b.value.address === element.cosignatoryPublicAccount.address.plain());
          if (!exist) {
            const possibleCosignatory: AccountsInterface = this.walletService.filterAccountWallet('', null, element.cosignatoryPublicAccount.address.pretty());
            // Address encontrada
            if (possibleCosignatory) {
              if (possibleCosignatory && possibleCosignatory.isMultisign && possibleCosignatory.isMultisign.isMultisig()) {
                // All cosignatories level 2
                possibleCosignatory.isMultisign.cosignatories.forEach(level2 => {
                  // Is added before in array select?
                  const existOtherCosignatory = arraySelect.find((b: any) => b.value.address === level2.address.plain());
                  if (!existOtherCosignatory) {
                    // Other cosignatory level 2
                    const cosignatoryLevelTwo: AccountsInterface = this.walletService.filterAccountWallet('', null, level2.address.pretty());
                    if (cosignatoryLevelTwo) {
                      if (cosignatoryLevelTwo && cosignatoryLevelTwo.isMultisign && cosignatoryLevelTwo.isMultisign.isMultisig()) {
                        // All cosignatories level 3
                        cosignatoryLevelTwo.isMultisign.cosignatories.forEach(level3 => {
                          // Is added before in array select?
                          const existCosignatoryLevelThree = arraySelect.find((b: any) => b.value.address === level3.address.plain());
                          if (!existCosignatoryLevelThree) {
                            // Other cosignatory level 3
                            const cosignatoryLevelThree: AccountsInterface = this.walletService.filterAccountWallet('', null, level3.address.pretty());
                            if (cosignatoryLevelThree) {
                              const publicAccount = this.proximaxProvider.createPublicAccount(
                                cosignatoryLevelThree.publicAccount.publicKey,
                                this.walletService.currentAccount.network
                              );

                              const signedByAccount = transaction.data.signedByAccount(publicAccount);
                              arraySelect.push({
                                label: cosignatoryLevelThree.name,
                                value: cosignatoryLevelThree,
                                selected: false,
                                signed: signedByAccount,
                                disabled: signedByAccount
                              });
                            }
                          }
                        });
                      } else {
                        const publicAccount = this.proximaxProvider.createPublicAccount(
                          cosignatoryLevelTwo.publicAccount.publicKey,
                          this.walletService.currentAccount.network
                        );

                        const signedByAccount = transaction.data.signedByAccount(publicAccount);
                        arraySelect.push({
                          label: cosignatoryLevelTwo.name,
                          value: cosignatoryLevelTwo,
                          selected: false,
                          signed: signedByAccount,
                          disabled: signedByAccount
                        });
                      }
                    }
                  }
                });
              } else {
                const publicAccount = this.proximaxProvider.createPublicAccount(
                  possibleCosignatory.publicAccount.publicKey,
                  this.walletService.currentAccount.network
                );

                const signedByAccount = transaction.data.signedByAccount(publicAccount);
                arraySelect.push({
                  label: possibleCosignatory.name,
                  value: possibleCosignatory,
                  selected: false,
                  signed: signedByAccount,
                  disabled: signedByAccount
                });
              }
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
        this.arraySelect = arraySelect.filter(r => !r.disabled);
      }
    } else {
      this.arraySelect = arraySelect.filter(r => !r.disabled);
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
      if (this.walletService.decrypt(common, this.account)) {
        const transaction: any = this.dataSelected.data;
        const account = this.proximaxProvider.getAccountFromPrivateKey(common.privateKey, this.walletService.currentAccount.network);
        this.password = '';
        this.modalPartial.hide();
        this.proximaxProvider.cosignAggregateBondedTransaction(transaction, account).subscribe(next => { });
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
