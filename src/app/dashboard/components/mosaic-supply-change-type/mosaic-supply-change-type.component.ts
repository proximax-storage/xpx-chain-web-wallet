import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { MosaicId } from 'tsjs-xpx-chain-sdk';
import * as cloneDeep from 'lodash/cloneDeep';
import { MosaicService } from '../../../servicesModule/services/mosaic.service';
import { TransactionsInterface, TransactionsService } from '../../../transfer/services/transactions.service';


@Component({
  selector: 'app-mosaic-supply-change-type',
  templateUrl: './mosaic-supply-change-type.component.html',
  styleUrls: ['./mosaic-supply-change-type.component.css']
})
export class MosaicSupplyChangeTypeComponent implements OnInit {

  @Input() mosaicSupplyChange: TransactionsInterface;
  @Input() viewBox: boolean;
  viewMosaicName = false;
  searching = true;
  mosaicId: MosaicId;
  typeTransactionHex: string;

  constructor(
    public transactionService: TransactionsService,
    private mosaicService: MosaicService
  ) { }

  ngOnInit() {    
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    this.viewBox = (changes['viewBox'] !== null && changes['viewBox'] !== undefined) ? changes['viewBox'].currentValue : true;
    this.viewMosaicName = false;
    this.mosaicSupplyChange['mosaicsStorage'] = null;
    if (this.viewBox) {
      this.typeTransactionHex = `${this.mosaicSupplyChange.data['type'].toString(16).toUpperCase()}`;
      this.mosaicId = this.mosaicSupplyChange.data['mosaicId'].toHex();
      await this.searchMosaics([this.mosaicSupplyChange.data['mosaicId']]);
      // this.mosaicSupplyChange['fee'] = cloneDeep(this.mosaicSupplyChange.data['maxFee'].compact());
    } else {
      this.typeTransactionHex = `${this.mosaicSupplyChange['type'].toString(16).toUpperCase()}`;
      this.mosaicId = this.mosaicSupplyChange['mosaicId'].toHex();
      await this.searchMosaics([this.mosaicSupplyChange['mosaicId']]);
      this.mosaicSupplyChange['fee'] = cloneDeep(this.mosaicSupplyChange['maxFee'].compact());
    }
  }

  searchMosaics(mosaicsId: MosaicId[]) {
    this.mosaicService.searchMosaics(mosaicsId).then(
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
