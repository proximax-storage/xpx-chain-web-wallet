import { Component, OnInit, SimpleChanges, Input } from '@angular/core';
import { TransactionsInterface } from '../../services/transaction.interface';

@Component({
  selector: 'app-aggregate-complete-type',
  templateUrl: './aggregate-complete-type.component.html',
  styleUrls: ['./aggregate-complete-type.component.scss']
})
export class AggregateCompleteTypeComponent implements OnInit {

  @Input() aggregateComplete: TransactionsInterface;
  headElements = ['Signer', 'Public Key', 'signature'];

  constructor() { }

  ngOnInit() {
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    console.log(this.aggregateComplete);
  }

}
