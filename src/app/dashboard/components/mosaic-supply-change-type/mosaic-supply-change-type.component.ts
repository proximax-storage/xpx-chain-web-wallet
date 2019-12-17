import { Component, OnInit, Input, SimpleChanges, OnChanges } from '@angular/core';
import { MosaicId, Transaction } from 'tsjs-xpx-chain-sdk';
import * as cloneDeep from 'lodash/cloneDeep';
import { MosaicService } from '../../../servicesModule/services/mosaic.service';
import { TransactionsInterface, TransactionsService } from '../../../transactions/services/transactions.service';


@Component({
  selector: 'app-mosaic-supply-change-type',
  templateUrl: './mosaic-supply-change-type.component.html',
  styleUrls: ['./mosaic-supply-change-type.component.css']
})
export class MosaicSupplyChangeTypeComponent implements OnInit, OnChanges {

  @Input() mosaicSupplyChange: TransactionsInterface;
  @Input() innerTxn: Transaction[];
  @Input() viewBox: boolean;
  viewMosaicName = false;
  searching = true;
  mosaicId: MosaicId;
  typeTransactionHex: string;
  divisibility = null;
  typeTransactions = null;

  constructor(
    public transactionService: TransactionsService,
    private mosaicService: MosaicService
  ) { }

  ngOnInit() {
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    this.typeTransactions = this.transactionService.getTypeTransactions();
    this.viewBox = (changes['viewBox'] !== null && changes['viewBox'] !== undefined) ? changes['viewBox'].currentValue : true;
    this.viewMosaicName = false;
    this.mosaicSupplyChange['mosaicsStorage'] = null;
    if (this.innerTxn) {
      for (const element of this.innerTxn) {
        if (element.type === this.typeTransactions.mosaicDefinition.id) {
          this.divisibility = element['mosaicProperties'].divisibility;
          break;
        }
      }
    }

    if (this.viewBox) {
      this.typeTransactionHex = `${this.mosaicSupplyChange.data['type'].toString(16).toUpperCase()}`;
      this.mosaicId = this.mosaicSupplyChange.data['mosaicId'].toHex();
      this.searchMosaics([this.mosaicSupplyChange.data['mosaicId']]);
      // this.mosaicSupplyChange['fee'] = cloneDeep(this.mosaicSupplyChange.data['maxFee'].compact());
    } else {
      this.typeTransactionHex = `${this.mosaicSupplyChange['type'].toString(16).toUpperCase()}`;
      this.mosaicId = this.mosaicSupplyChange['mosaicId'].toHex();
      this.searchMosaics([this.mosaicSupplyChange['mosaicId']]);
      this.mosaicSupplyChange['fee'] = cloneDeep(this.mosaicSupplyChange['maxFee'].compact());
    }
  }

  /**
   *
   *
   * @param {MosaicId[]} mosaicsId
   * @memberof MosaicSupplyChangeTypeComponent
   */
  searchMosaics(mosaicsId: MosaicId[]) {
    this.mosaicService.filterMosaics(mosaicsId).then(
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
