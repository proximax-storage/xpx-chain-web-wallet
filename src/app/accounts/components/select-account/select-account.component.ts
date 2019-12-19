import { Component, OnInit, Output, EventEmitter, OnChanges, SimpleChanges, OnDestroy, Input } from '@angular/core';
import { AccountsInterface, WalletService, AccountsInfoInterface } from '../../../wallet/services/wallet.service';
import { environment } from '../../../../environments/environment';
import { SharedService } from '../../../shared/services/shared.service';
import { TransactionsService } from '../../../transactions/services/transactions.service';
import { ProximaxProvider } from '../../../shared/services/proximax.provider';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-select-account',
  templateUrl: './select-account.component.html',
  styleUrls: ['./select-account.component.css']
})
export class SelectAccountComponent implements OnInit, OnDestroy {

  @Input() publicKeyToSelect: string = null;
  @Output() accountDebitFunds = new EventEmitter();
  @Output() cosignatoryEvent = new EventEmitter();
  @Output() isMultisgEvent = new EventEmitter();
  accounts: any = [];
  balanceXpx = '0.000000';
  cosignatory: AccountsInterface = null;
  feeCosignatory: any = 10044500;
  listCosignatorie: any = [];
  mosaicXpx = null;
  msgLockfungCosignatorie = '';
  sender: AccountsInterface = null;
  subscription: Subscription[] = [];

  constructor(
    private proximaxProvider: ProximaxProvider,
    private sharedService: SharedService,
    private transactionService: TransactionsService,
    private walletService: WalletService
  ) { }

  ngOnInit() {

    // console.log('publicKeyToSelect', this.publicKeyToSelect);
    // Mosaic by default
    this.mosaicXpx = {
      id: environment.mosaicXpxInfo.id,
      name: environment.mosaicXpxInfo.name,
      divisibility: environment.mosaicXpxInfo.divisibility
    };


    this.accountInfo();
    this.subscription.push(this.walletService.getAccountsInfo$().subscribe(
      next => this.accountInfo()
    ));

    const amount = this.transactionService.getDataPart(this.transactionService.amountFormatterSimple(this.feeCosignatory), 6);
    const formatterAmount = `<span class="fs-085rem">${amount.part1}</span><span class="fs-07rem">${amount.part2}</span>`;
    this.msgLockfungCosignatorie = `Cosignatory has sufficient balance (${formatterAmount} XPX) to cover LockFund Fee`;

  }

  ngOnDestroy(): void {
    this.subscription.forEach(subscription => {
      subscription.unsubscribe();
    });
  }

  /**
   *
   *
   * @memberof SelectAccountComponent
   */
  accountInfo() {
    this.accounts = [];
    this.cosignatory = null;
    this.listCosignatorie = [];
    if (this.walletService.currentWallet) {
      this.walletService.currentWallet.accounts.forEach((element: AccountsInterface) => {
        const status = (element.default && !this.publicKeyToSelect) ? true : false;
        if (this.publicKeyToSelect && element.publicAccount.publicKey === this.publicKeyToSelect) {
          this.accounts.push({
            label: element.name,
            active: true,
            value: element
          });

          this.sender = element;
          const xpxBalance = this.walletService.getAmountAccount(this.sender.address);
          this.balanceXpx = this.transactionService.amountFormatterSimple(xpxBalance);
          this.accountDebitFunds.emit(this.sender);
          setTimeout(() => {
            this.findCosignatories();
          });
        } else {
          this.accounts.push({
            label: element.name,
            active: status,
            value: element
          });
        }


        if (status) {
          this.sender = element;
          const xpxBalance = this.walletService.getAmountAccount(this.sender.address);
          this.balanceXpx = this.transactionService.amountFormatterSimple(xpxBalance);
          this.accountDebitFunds.emit(this.sender);
        }
      });
    }
  }

  /**
   *
   *
   * @param {AccountsInterface} sender
   * @memberof SelectAccountComponent
   */
  changeAccount(sender: AccountsInterface) {
    this.sender = sender;
    const xpxBalance = this.walletService.getAmountAccount(this.sender.address);
    this.balanceXpx = this.transactionService.amountFormatterSimple(xpxBalance);
    this.accountDebitFunds.emit(sender);
    this.accounts.forEach(element => {
      if (sender.name === element.value.name) {
        element.active = true;
      } else {
        element.active = false;
      }
    });
    this.findCosignatories();
  }

  /**
   *
   *
   * @memberof SelectAccountComponent
   */
  findCosignatories() {
    this.cosignatory = null;
    this.listCosignatorie = [];
    if (this.sender.isMultisign && this.sender.isMultisign.cosignatories && this.sender.isMultisign.cosignatories.length > 0) {
      this.isMultisgEvent.emit(true);
      if (this.sender.isMultisign.cosignatories.length === 1) {
        const addressCosignatory = this.proximaxProvider.createFromRawAddress(this.sender.isMultisign.cosignatories[0].address['address']);
        const cosignatorieAccount: AccountsInterface = this.walletService.filterAccountWallet('', null, addressCosignatory.pretty());
        if (cosignatorieAccount) {
          const accountFiltered: AccountsInfoInterface = this.walletService.filterAccountInfo(cosignatorieAccount.name);
          const infValidate = this.transactionService.validateBalanceCosignatorie(accountFiltered, Number(this.feeCosignatory)).infValidate;
          this.cosignatory = cosignatorieAccount;
          this.listCosignatorie = [{
            label: cosignatorieAccount.name,
            value: cosignatorieAccount,
            selected: true,
            disabled: infValidate[0].disabled,
            info: infValidate[0].info
          }];

          this.cosignatoryEvent.emit({
            disabledForm: true,
            cosignatory: null
          });
        } else {
          // this.disabledAllField = true;
          // this.formTransfer.disable();
          this.cosignatoryEvent.emit({
            disabledForm: true,
            cosignatory: this.cosignatory
          });
        }
      } else {
        const listCosignatorie = [];
        this.sender.isMultisign.cosignatories.forEach(cosignatorie => {
          const address = this.proximaxProvider.createFromRawAddress(cosignatorie.address['address']);
          const cosignatorieAccount: AccountsInterface = this.walletService.filterAccountWallet('', null, address.pretty());
          if (cosignatorieAccount) {
            const accountFiltered: AccountsInfoInterface = this.walletService.filterAccountInfo(cosignatorieAccount.name);
            const infValidate = this.transactionService.validateBalanceCosignatorie(accountFiltered, Number(this.feeCosignatory)).infValidate;
            listCosignatorie.push({
              label: cosignatorieAccount.name,
              value: cosignatorieAccount,
              selected: true,
              disabled: infValidate[0].disabled,
              info: infValidate[0].info
            });
          }
        });

        if (listCosignatorie && listCosignatorie.length > 0) {
          this.listCosignatorie = listCosignatorie;
          if (listCosignatorie.length === 1) {
            this.cosignatory = listCosignatorie[0].value;
            this.cosignatoryEvent.emit({
              disabledForm: listCosignatorie[0].disabled,
              cosignatory: this.cosignatory
            });
          }
        } else {
          this.cosignatoryEvent.emit({
            disabledForm: true,
            cosignatory: null
          });
        }
      }
    } else {
      this.isMultisgEvent.emit(false);
      this.cosignatoryEvent.emit(null);
    }
  }



  /**
   *
   *
   * @param {*} event
   * @memberof SelectAccountComponent
   */
  selectCosignatory(event: any) {
    this.cosignatoryEvent.emit({
      disabledForm: event.disabled,
      cosignatory: event.value
    });
  }

  /**
   *
   *
   * @returns
   * @memberof SelectAccountComponent
   */
  getQuantity() {
    return this.sharedService.amountFormat(String(this.balanceXpx));
  }
}
