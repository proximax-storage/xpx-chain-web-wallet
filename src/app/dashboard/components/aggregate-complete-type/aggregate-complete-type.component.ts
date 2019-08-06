import { Component, OnInit, SimpleChanges, Input } from '@angular/core';
import { TransactionsInterface, TransactionsService } from '../../../transfer/services/transactions.service';

@Component({
  selector: 'app-aggregate-complete-type',
  templateUrl: './aggregate-complete-type.component.html',
  styleUrls: ['./aggregate-complete-type.component.css']
})
export class AggregateCompleteTypeComponent implements OnInit {

  @Input() aggregateComplete: TransactionsInterface;
  headElements = ['Type', 'Signer', 'Public Key', 'signature'];
  typeTransactions: any;
  p: number = 1;
  typeTransactionHex: string;

  constructor(
    private transactionService: TransactionsService
  ) { }

  ngOnInit() {
    this.typeTransactions = this.transactionService.arraTypeTransaction;
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    this.typeTransactionHex = `${this.aggregateComplete.data['type'].toString(16).toUpperCase()}`;
    this.aggregateComplete.data['innerTransactions'].forEach((element: any) => {
      const keyType = this.transactionService.getNameTypeTransaction(element.type);
      element['nameType'] = this.transactionService.arraTypeTransaction[keyType].name;
      element['typeTransactionHex'] = `${element.type.toString(16).toUpperCase()}`;
    });
  }

}
