import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { TransactionsInterface } from '../../services/transaction.interface';

@Component({
  selector: 'app-aggregate-bonded-type',
  templateUrl: './aggregate-bonded-type.component.html',
  styleUrls: ['./aggregate-bonded-type.component.scss']
})
export class AggregateBondedTypeComponent implements OnInit {

  @Input() aggregateBonded: TransactionsInterface;
  headElements = ['Signer', 'Public Key', 'signature'];

  constructor() { }

  ngOnInit() {
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    // console.log(this.aggregateBonded);
  }

}
