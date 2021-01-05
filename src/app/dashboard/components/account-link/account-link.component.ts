import { Component, OnInit, SimpleChanges, Input } from '@angular/core';
import { TransactionsInterface } from '../../../transactions/services/transactions.service';

@Component({
  selector: 'app-account-link-type',
  templateUrl: './account-link.component.html',
  styleUrls: ['./account-link.component.css']
})
export class AccountLinkComponent implements OnInit {

  @Input() accountLink: TransactionsInterface = null;
  searching = true;
  typeTransactionHex: string;

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    this.typeTransactionHex = `${this.accountLink.data['type'].toString(16).toUpperCase()}`;
    // console.log(this.transactionLock);
  }

}
