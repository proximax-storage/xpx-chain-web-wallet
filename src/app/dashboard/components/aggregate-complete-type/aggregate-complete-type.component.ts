import { Component, OnInit, SimpleChanges, Input } from '@angular/core';
import { TransactionsInterface, TransactionsService } from '../../../transactions/services/transactions.service';

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
    // console.log('aggregateComplete', this.aggregateComplete);

    this.typeTransactionHex = `${this.aggregateComplete.data['type'].toString(16).toUpperCase()}`;
    this.aggregateComplete.data['innerTransactions'].forEach((element: any) => {
      element['feePart'] = this.transactionService.getDataPart(this.transactionService.amountFormatterSimple(element.maxFee.compact()), 6);
      element['nameType'] = this.transactionService.arraTypeTransaction[this.transactionService.getNameTypeTransaction(element.type)].name;
      element['typeTransactionHex'] = `${element.type.toString(16).toUpperCase()}`;
    });
  }

}
