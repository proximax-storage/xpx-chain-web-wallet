import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { TransferTransaction } from 'nem-library';
import { TransactionsService } from 'src/app/transactions/services/transactions.service';

@Component({
  selector: 'app-transfer-type-bonded',
  templateUrl: './transfer-type-bonded.component.html',
  styleUrls: ['./transfer-type-bonded.component.css']
})
export class TransferTypeBondedComponent implements OnInit {

  @Input() transferTransactionBonded: TransferTransaction = null;
  constructor(
    public transactionService: TransactionsService
  ) { }

  ngOnInit() {
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    console.log(this.transferTransactionBonded);
  }

}
