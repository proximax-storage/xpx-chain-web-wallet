import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { TransactionsInterface, TransactionsService } from '../../../transactions/services/transactions.service';

@Component({
  selector: 'app-transfer-type',
  templateUrl: './transfer-type.component.html',
  styleUrls: ['./transfer-type.component.css']
})
export class TransferTypeComponent implements OnInit {

  @Input() transferTransaction: TransactionsInterface;
  searching = true;
  typeTransactionHex: string;

  constructor(
    public transactionService: TransactionsService
  ) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.searching = true;
    this.typeTransactionHex = `${this.transferTransaction.data['type'].toString(16).toUpperCase()}`;
    console.log(this.transferTransaction);
  }

}
