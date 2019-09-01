import { Component, OnInit, Input } from '@angular/core';
import { TransactionsInterface, TransactionsService } from '../../../transactions/services/transactions.service';

@Component({
  selector: 'app-attestation-type',
  templateUrl: './attestation-type.component.html',
  styleUrls: ['./attestation-type.component.css']
})
export class AttestationTypeComponent implements OnInit {

  @Input() attestationInfo: TransactionsInterface;
  searching = true;
  typeTransactionHex: string;

  constructor(
    public transactionService: TransactionsService
  ) { }

  ngOnInit() {
    console.log(this.attestationInfo);
  }

  // ngOnChanges(changes: SimpleChanges): void {
  //   this.searching = true;
  //   this.typeTransactionHex = `${this.attestationInfo.data['type'].toString(16).toUpperCase()}`;
  //   // console.log(this.transferTransaction);
  // }

}