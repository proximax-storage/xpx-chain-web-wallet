import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { TransferTransaction } from 'tsjs-xpx-chain-sdk';
import { TransactionsService, TransactionsInterface } from '../../../transactions/services/transactions.service';

@Component({
  selector: 'app-transfer-type-bonded',
  templateUrl: './transfer-type-bonded.component.html',
  styleUrls: ['./transfer-type-bonded.component.css']
})
export class TransferTypeBondedComponent implements OnInit {

  @Input() transferTransactionBonded: TransferTransaction = null;
  @Input() msg: string = '';
  transactionBuilder: TransactionsInterface = null;

  constructor(
    public transactionService: TransactionsService
  ) { }

  ngOnInit() {
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    console.log(this.transferTransactionBonded);
    this.transactionBuilder = this.transactionService.getStructureDashboard(this.transferTransactionBonded);
    console.log('----build---', this.transactionBuilder);
  }

}
