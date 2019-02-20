import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { TransactionsService } from '../../../transactions/service/transactions.service';
import { MosaicService } from '../../../servicesModule/services/mosaic.service';
import { MosaicSupplyChangeTransaction } from 'proximax-nem2-sdk';

@Component({
  selector: 'app-mosaic-supply-change-type',
  templateUrl: './mosaic-supply-change-type.component.html',
  styleUrls: ['./mosaic-supply-change-type.component.scss']
})
export class MosaicSupplyChangeTypeComponent implements OnInit {

  @Input() mosaicSupplyChange: MosaicSupplyChangeTransaction;
  viewMosaicName = false;
  searching = true;

  constructor(
    public transactionService: TransactionsService,
    private mosaicService: MosaicService
  ) { }

  ngOnInit() {
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    this.searching = true;
    this.viewMosaicName = false;
   // this.mosaicSupplyChange['deltaFormatter'] = this.transactionService.formatNumberMilesThousands(this.mosaicSupplyChange.delta.compact());
    const response = await this.mosaicService.searchMosaics([this.mosaicSupplyChange.mosaicId]);
    console.log("MosaicSupplyChangeTypeComponent", response);
    if (response.length > 0) {
      this.viewMosaicName = true;
      this.mosaicSupplyChange['mosaicView'] = response[0];
      this.mosaicSupplyChange['feeFormatter'] = this.transactionService.amountFormatterSimple(this.mosaicSupplyChange.fee.compact());
      console.log("su div", this.mosaicSupplyChange['mosaicView'].mosaicInfo.divisibility)
      if (Number(this.mosaicSupplyChange['mosaicView'].mosaicInfo.divisibility) === 0) {
        this.mosaicSupplyChange['deltaFormatter'] = this.transactionService.formatNumberMilesThousands(this.mosaicSupplyChange.delta.compact());
      }else {
        console.log("formatHere");
        this.mosaicSupplyChange['deltaFormatter'] = this.transactionService.amountFormatter(this.mosaicSupplyChange.delta, this.mosaicSupplyChange.mosaicId, [this.mosaicSupplyChange['mosaicView'].mosaicInfo]);
      }
    }
    this.searching = false;
  }

}
