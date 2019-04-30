import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { TransactionsService } from '../../../transactions/service/transactions.service';
import { MosaicService } from '../../../servicesModule/services/mosaic.service';
import { TransactionsInterface } from '../../services/transaction.interface';

@Component({
  selector: 'app-mosaic-supply-change-type',
  templateUrl: './mosaic-supply-change-type.component.html',
  styleUrls: ['./mosaic-supply-change-type.component.scss']
})
export class MosaicSupplyChangeTypeComponent implements OnInit {

  @Input() mosaicSupplyChange: TransactionsInterface;
  viewMosaicName = false;
  searching = true;

  constructor(
    public transactionService: TransactionsService,
    private mosaicService: MosaicService
  ) { }

  ngOnInit() {
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    this.viewMosaicName = false;
    this.mosaicService.searchMosaics([this.mosaicSupplyChange.data['mosaicId']]).then(
      response => {
        this.searching = false;
        if (response.length > 0) {
          this.viewMosaicName = true;
          this.mosaicSupplyChange['mosaicsStorage'] = response[0];
        }
      }).catch(err => {
        this.viewMosaicName = false;
        this.searching = false;
      });
  }
}
