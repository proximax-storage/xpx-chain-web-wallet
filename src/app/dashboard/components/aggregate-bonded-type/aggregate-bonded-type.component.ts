import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { PaginationInstance } from 'ngx-pagination';
import { TransactionsInterface, TransactionsService } from '../../../transactions/services/transactions.service';

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
  typeTransactions = this.transactionService.getTypeTransactions();

  constructor(public transactionService: TransactionsService) { }

  ngOnInit() {
    this.typeTransactions = this.transactionService.getTypeTransactions();
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    this.aggregateBonded.data['innerTransactions'].forEach(element => {
      const nameType = Object.keys(this.typeTransactions).find(x => this.typeTransactions[x].id === element.type);
      element['nameType'] = (nameType) ? this.typeTransactions[nameType].name : element.type.toString(16).toUpperCase();
    });
  }

}
