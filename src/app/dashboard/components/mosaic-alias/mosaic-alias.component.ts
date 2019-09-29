import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { MosaicId, NamespaceId } from 'tsjs-xpx-chain-sdk';
import { MosaicService } from '../../../servicesModule/services/mosaic.service';
import { NamespacesService } from '../../../servicesModule/services/namespaces.service';
import { TransactionsInterface } from '../../../transactions/services/transactions.service';

@Component({
  selector: 'app-mosaic-alias',
  templateUrl: './mosaic-alias.component.html',
  styleUrls: ['./mosaic-alias.component.css']
})
export class MosaicAliasComponent implements OnInit {

  @Input() mosaicAlias: TransactionsInterface = null;
  mosaicName: any; //Update-sdk-dragon
  mosaicId: string = '';
  namespaceId: string = '';
  namespaceName: string = '';
  typeTransactionHex: string;

  constructor(
    private mosaicService: MosaicService,
    private namespaceService: NamespacesService
  ) { }

  ngOnInit() {
  }

  async ngOnChanges(changes: SimpleChanges) {
    this.mosaicName = '';
    this.mosaicId = '';
    this.namespaceId = '';
    this.namespaceName = '';

    this.typeTransactionHex = `${this.mosaicAlias.data['type'].toString(16).toUpperCase()}`;
    const mosaicId = new MosaicId([this.mosaicAlias.data['mosaicId'].id.lower, this.mosaicAlias.data['mosaicId'].id.higher]);
    this.mosaicId = mosaicId.toHex();
    const mosaicInfo = await this.mosaicService.filterMosaics([mosaicId]);
    if (mosaicInfo !== null && mosaicInfo !== undefined && mosaicInfo.length > 0) {
      this.mosaicName = (mosaicInfo[0].mosaicNames.names.length > 0) ? mosaicInfo[0].mosaicNames.names[0].name : '';
    }
    // console.log("name mosaic:",this.mosaicName)

    // NAMESPACE
    const namespaceId = new NamespaceId([this.mosaicAlias.data['namespaceId'].id.lower, this.mosaicAlias.data['namespaceId'].id.higher]);
    this.namespaceId = namespaceId.toHex();
    const namespaceInfo = await this.namespaceService.getNamespaceFromId([namespaceId]);
    if (namespaceInfo !== null && namespaceInfo !== undefined && namespaceInfo.length > 0) {
      this.namespaceName = (namespaceInfo[0].namespaceName.name !== '') ? namespaceInfo[0].namespaceName.name : '';
    }
  }

}
