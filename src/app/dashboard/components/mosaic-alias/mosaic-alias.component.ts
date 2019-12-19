import { Component, OnInit, Input, SimpleChanges, OnChanges } from '@angular/core';
import { MosaicId, NamespaceId, MosaicAlias, Transaction } from 'tsjs-xpx-chain-sdk';
import { MosaicService } from '../../../servicesModule/services/mosaic.service';
import { NamespacesService } from '../../../servicesModule/services/namespaces.service';
import { TransactionsInterface, TransactionsService } from '../../../transactions/services/transactions.service';

@Component({
  selector: 'app-mosaic-alias',
  templateUrl: './mosaic-alias.component.html',
  styleUrls: ['./mosaic-alias.component.css']
})
export class MosaicAliasComponent implements OnInit, OnChanges {

  @Input() transaction: Transaction = null;
  @Input() mosaicAlias: TransactionsInterface = null;
  @Input() simple = true;
  mosaicName: any;
  mosaicId = '';
  namespaceId = '';
  namespaceName = '';
  typeTransactionHex: string;

  constructor(
    private mosaicService: MosaicService,
    private namespaceService: NamespacesService,
    private transactionService: TransactionsService
  ) { }

  ngOnInit() {
  }

  async ngOnChanges(changes: SimpleChanges) {
    this.mosaicName = '';
    this.mosaicId = '';
    this.namespaceId = '';
    this.namespaceName = '';

    if (!this.simple) {
      this.mosaicAlias = this.transactionService.getStructureDashboard(this.transaction);
    }


    this.typeTransactionHex = `${this.mosaicAlias['data']['type'].toString(16).toUpperCase()}`;
    const mosaicId = new MosaicId([this.mosaicAlias['data']['mosaicId'].id.lower, this.mosaicAlias['data']['mosaicId'].id.higher]);
    this.mosaicId = mosaicId.toHex();
    const mosaicInfo = await this.mosaicService.filterMosaics([mosaicId]);
    if (mosaicInfo !== null && mosaicInfo !== undefined && mosaicInfo.length > 0) {
      this.mosaicName = (mosaicInfo[0].mosaicNames.names.length > 0) ? mosaicInfo[0].mosaicNames.names[0].name : '';
    }

    // NAMESPACE
    const namespaceId = new NamespaceId([this.mosaicAlias['data']['namespaceId'].id.lower, this.mosaicAlias['data']['namespaceId'].id.higher]);
    this.namespaceId = namespaceId.toHex();
    const namespaceInfo = await this.namespaceService.getNamespaceFromId([namespaceId]);
    if (namespaceInfo !== null && namespaceInfo !== undefined && namespaceInfo.length > 0) {
      this.namespaceName = (namespaceInfo[0].namespaceName.name !== '') ? namespaceInfo[0].namespaceName.name : '';
    }

  }
}
