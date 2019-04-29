import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { TransactionsService } from '../../../transactions/service/transactions.service';

@Component({
  selector: 'app-register-namespace-type',
  templateUrl: './register-namespace-type.component.html',
  styleUrls: ['./register-namespace-type.component.scss']
})
export class RegisterNamespaceTypeComponent implements OnInit {

  @Input() registerNamespaceTransaction: any;

  constructor(
    public transactionService: TransactionsService
  ) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log("this.registerNamespaceTransaction", this.registerNamespaceTransaction);
    /*  this.registerNamespaceTransaction.feeFormatter = this.transactionService.amountFormatterSimple(this.registerNamespaceTransaction.fee.compact());*/
  }
}
