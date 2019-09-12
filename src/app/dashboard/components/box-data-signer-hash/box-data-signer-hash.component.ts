import { Component, OnInit, Input } from '@angular/core';
import { TransactionsInterface } from 'src/app/transactions/services/transactions.service';

@Component({
  selector: 'app-box-data-signer-hash',
  templateUrl: './box-data-signer-hash.component.html',
  styleUrls: ['./box-data-signer-hash.component.css']
})
export class BoxDataSignerHashComponent implements OnInit {

  @Input() dataSelected: TransactionsInterface;
  constructor() { }

  ngOnInit() {
  }

}
