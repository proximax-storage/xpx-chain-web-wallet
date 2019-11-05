import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AccountsInterface, WalletService } from '../../../wallet/services/wallet.service';
import { environment } from '../../../../environments/environment';
import { SharedService } from '../../../shared/services/shared.service';
import { TransactionsService } from '../../../transactions/services/transactions.service';

@Component({
  selector: 'app-select-account',
  templateUrl: './select-account.component.html',
  styleUrls: ['./select-account.component.css']
})
export class SelectAccountComponent implements OnInit {

  @Output() accountDebitFunds = new EventEmitter();
  accounts: any = [];
  listCosignatorie: any = [];
  mosaicXpx = null;
  sender: AccountsInterface = null;
  balanceXpx: string = '0.000000';


  constructor(
    private sharedService: SharedService,
    private transactionService: TransactionsService,
    private walletService: WalletService
  ) { }

  ngOnInit() {
    // Mosaic by default
    this.mosaicXpx = {
      id: environment.mosaicXpxInfo.id,
      name: environment.mosaicXpxInfo.name,
      divisibility: environment.mosaicXpxInfo.divisibility
    };

    this.walletService.currentWallet.accounts.forEach((element: AccountsInterface) => {
      this.accounts.push({
        label: element.name,
        active: element.default,
        value: element
      });

      if (element.default) {
        this.sender = element;
        const xpxBalance = this.walletService.getAmountAccount(this.sender.address);
        this.balanceXpx = this.transactionService.amountFormatterSimple(xpxBalance);
        this.accountDebitFunds.emit(this.sender);
      }
    });
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
