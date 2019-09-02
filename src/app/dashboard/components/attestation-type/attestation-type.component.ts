import { Component, OnInit, Input } from '@angular/core';
import { TransactionsInterface, TransactionsService } from '../../../transactions/services/transactions.service';

@Component({
  selector: 'app-attestation-type',
  templateUrl: './attestation-type.component.html',
  styleUrls: ['./attestation-type.component.css']
})
export class AttestationTypeComponent implements OnInit {

  @Input() transactionInfo: TransactionsInterface;
  searching = true;
  typeTransactionHex: string;

  constructor(
    public transactionService: TransactionsService
  ) { }

  ngOnInit() {
    console.log('MODAL INFO', this.transactionInfo);
  }

  // ngOnChanges(changes: SimpleChanges): void {
  //   this.searching = true;
  //   this.typeTransactionHex = `${this.transactionInfo.data['type'].toString(16).toUpperCase()}`;
  //   // console.log(this.transferTransaction);
  // }

}