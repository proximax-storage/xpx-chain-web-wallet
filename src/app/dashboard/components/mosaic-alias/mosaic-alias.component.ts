import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { MosaicAlias, MosaicId, NamespaceId } from 'tsjs-xpx-catapult-sdk';
import { MosaicService } from 'src/app/servicesModule/services/mosaic.service';
import { TransactionsInterface } from '../../services/transaction.interface';
import { NamespacesService } from 'src/app/servicesModule/services/namespaces.service';

@Component({
  selector: 'app-mosaic-alias',
  templateUrl: './mosaic-alias.component.html',
  styleUrls: ['./mosaic-alias.component.scss']
})
export class MosaicAliasComponent implements OnInit {

  @Input() mosaicAlias: TransactionsInterface = null;
  mosaicNameId: string = '';
  namespaceNameId: string = '';

  constructor(
    private mosaicService: MosaicService,
    private namespaceService: NamespacesService
  ) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    const mosaicId = new MosaicId([this.mosaicAlias.data['mosaicId'].id.lower, this.mosaicAlias.data['mosaicId'].id.higher]);
    this.mosaicNameId = mosaicId.toHex();
    const mosaicInfo = this.mosaicService.filterMosaic(mosaicId);
    if (mosaicInfo !== null && mosaicInfo !== undefined) {
      this.mosaicNameId = (mosaicInfo.mosaicNames.names.length > 0) ? mosaicInfo.mosaicNames.names[0] : mosaicId.toHex();
    }

    // NAMESPACE
    const namespaceId = new NamespaceId([this.mosaicAlias.data['namespaceId'].id.lower, this.mosaicAlias.data['namespaceId'].id.higher]);
    this.namespaceNameId = namespaceId.toHex();
    const namespaceInfo = this.namespaceService.filterNamespace(namespaceId);
    if (namespaceInfo !== null && namespaceInfo !== undefined) {
      // console.log(namespaceInfo);
      this.namespaceNameId = (namespaceInfo.namespaceName.name !== '') ? namespaceInfo.namespaceName.name : namespaceId.toHex();
    }
  }

}
