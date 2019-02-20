import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { TransactionsService } from '../../../transactions/service/transactions.service';

@Component({
  selector: 'app-transfer-type',
  templateUrl: './transfer-type.component.html',
  styleUrls: ['./transfer-type.component.scss']
})
export class TransferTypeComponent implements OnInit {

  @Input() transferTransaction: any;
  searching = true;

  constructor(
    public transactionService: TransactionsService
  ) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.searching = true;
    this.transferTransaction.feeFormatter = this.transactionService.amountFormatterSimple(this.transferTransaction.fee.compact());
  }

}
