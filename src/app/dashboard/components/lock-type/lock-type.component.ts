import { Component, OnInit, SimpleChanges, Input } from '@angular/core';
import { TransactionsInterface } from '../../../transactions/services/transactions.service';

@Component({
  selector: 'app-lock-type',
  templateUrl: './lock-type.component.html',
  styleUrls: ['./lock-type.component.css']
})
export class LockTypeComponent implements OnInit {

  @Input() transactionLock: TransactionsInterface = null;

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    // console.log(this.transactionLock);
  }

}
