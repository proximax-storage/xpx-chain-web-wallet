import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { MosaicId } from 'tsjs-xpx-chain-sdk';
import * as cloneDeep from 'lodash/cloneDeep';
import { TransactionsService } from '../../../transactions/service/transactions.service';
import { TransactionsInterface } from '../../services/transaction.interface';
import { MosaicService } from '../../../servicesModule/services/mosaic.service';
import { MosaicsStorage } from '../../../servicesModule/interfaces/mosaics-namespaces.interface';

@Component({
  selector: 'app-mosaic-definition-type',
  templateUrl: './mosaic-definition-type.component.html',
  styleUrls: ['./mosaic-definition-type.component.scss']
})
export class MosaicDefinitionTypeComponent implements OnInit {

  @Input() mosaicDefinition: TransactionsInterface;
  @Input() viewBox: boolean;
  viewNamespaceId: boolean = false;
  mosaicId: MosaicId;
  typeTransactionHex: string;

  constructor(
    private mosaicService: MosaicService,
    public transactionService: TransactionsService
  ) { }

  ngOnInit() {
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    // console.log(this.mosaicDefinition);
    this.viewBox = (changes['viewBox'] !== null && changes['viewBox'] !== undefined) ? changes['viewBox'].currentValue : true;
    if (this.viewBox) {
      this.typeTransactionHex = `${this.mosaicDefinition.data['type'].toString(16).toUpperCase()}`;
      this.mosaicId = this.mosaicDefinition.data['mosaicId'].toHex();
      await this.getMosaicStorage([this.mosaicDefinition.data['mosaicId']]);
    } else {
      this.typeTransactionHex = `${this.mosaicDefinition['type'].toString(16).toUpperCase()}`;
      this.mosaicId = this.mosaicDefinition['mosaicId'].toHex();
      await this.getMosaicStorage([this.mosaicDefinition['mosaicId']]);
      this.mosaicDefinition['fee'] = cloneDeep(this.mosaicDefinition['maxFee'].compact());
    }
  }

  async getMosaicStorage(mosaicsId: MosaicId[]) {
    this.viewNamespaceId = false;
    this.mosaicDefinition['mosaicsStorage'] = null;
    const mosaics: MosaicsStorage[] = await this.mosaicService.searchMosaics(mosaicsId);
    if (mosaics !== undefined && mosaics !== null) {
      if (mosaics.length > 0) {
        this.viewNamespaceId = false;
        this.mosaicDefinition['mosaicsStorage'] = mosaics[0];
      }
    }
  }

}
