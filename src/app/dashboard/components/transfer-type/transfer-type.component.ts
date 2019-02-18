import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { Deadline } from 'proximax-nem2-sdk';
import { TransactionsService } from '../../../transactions/service/transactions.service';

@Component({
  selector: 'app-transfer-type',
  templateUrl: './transfer-type.component.html',
  styleUrls: ['./transfer-type.component.scss']
})
export class TransferTypeComponent implements OnInit {

  @Input() transferTransaction: any;

  constructor(
    public transactionService: TransactionsService
  ) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
  }

  dateFormat(deadline: Deadline) {
    return this.transactionService.dateFormat(deadline);
  }

}
