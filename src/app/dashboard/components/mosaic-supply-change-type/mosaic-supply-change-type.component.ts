import { Component, OnInit, Input } from '@angular/core';
import { TransactionsService } from '../../../transactions/service/transactions.service';

@Component({
  selector: 'app-mosaic-supply-change-type',
  templateUrl: './mosaic-supply-change-type.component.html',
  styleUrls: ['./mosaic-supply-change-type.component.scss']
})
export class MosaicSupplyChangeTypeComponent implements OnInit {

  @Input() mosaicSupplyChange: any;

  constructor(
    public transactionService: TransactionsService
  ) { }

  ngOnInit() {
  }



}
