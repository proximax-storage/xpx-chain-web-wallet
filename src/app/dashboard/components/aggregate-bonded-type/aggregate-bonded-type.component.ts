import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { TransactionsInterface, TransactionsService } from '../../../transactions/services/transactions.service';
import { PaginationInstance } from 'ngx-pagination';

@Component({
  selector: 'app-aggregate-bonded-type',
  templateUrl: './aggregate-bonded-type.component.html',
  styleUrls: ['./aggregate-bonded-type.component.css']
})
export class AggregateBondedTypeComponent implements OnInit {

  @Input() aggregateBonded: TransactionsInterface;
  configCustom: PaginationInstance = {
    id: 'custom',
    itemsPerPage: 1,
    currentPage: 1
  };


  headElements = ['Signer', 'Public Key', 'signature'];
  maxSize = 0;
  typeTransactions: any;

  constructor(public transactionService: TransactionsService) { }

  ngOnInit() {
    this.typeTransactions = this.transactionService.getTypeTransactions();
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    console.log(this.aggregateBonded);
  }

}
