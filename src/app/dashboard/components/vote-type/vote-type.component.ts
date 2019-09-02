import { Component, OnInit, Input } from '@angular/core';
import { TransactionsInterface, TransactionsService } from '../../../transactions/services/transactions.service';

@Component({
  selector: 'app-vote-type',
  templateUrl: './vote-type.component.html',
  styleUrls: ['./vote-type.component.css']
})
export class VoteTypeComponent implements OnInit {

  @Input() transactionInfo: TransactionsInterface;
  searching = true;
  typeTransactionHex: string;
  
  constructor(
    public transactionService: TransactionsService
  ) { }

  ngOnInit() {
    console.log('MODAL INFO', this.transactionInfo);
  }

}
