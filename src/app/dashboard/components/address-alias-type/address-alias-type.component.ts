import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { NamespaceId } from 'tsjs-xpx-chain-sdk';

import { NamespacesService, NamespaceStorageInterface } from '../../../servicesModule/services/namespaces.service';
import { TransactionsInterface } from '../../../transfer/services/transactions.service';

@Component({
  selector: 'app-address-alias-type',
  templateUrl: './address-alias-type.component.html',
  styleUrls: ['./address-alias-type.component.css']
})
export class AddressAliasTypeComponent implements OnInit {

  @Input() addressAlias: TransactionsInterface = null;
  namespaceId: string = '';
  namespaceName: string = '';
  typeTransactionHex: string;

  constructor(
    private namespaceService: NamespacesService
  ) { }

  ngOnInit() {
  }

  async ngOnChanges(changes: SimpleChanges) {
    // NAMESPACE
    this.namespaceId = '';
    this.namespaceName = '';
    this.typeTransactionHex = `${this.addressAlias.data['type'].toString(16).toUpperCase()}`;
    const namespaceId = this.namespaceService.getNamespaceId([this.addressAlias.data['namespaceId'].id.lower, this.addressAlias.data['namespaceId'].id.higher]);
    this.namespaceId = namespaceId.toHex();
    const namespaceInfo: NamespaceStorageInterface[] = await this.namespaceService.getNamespaceFromId([namespaceId]);
    if (namespaceInfo !== null && namespaceInfo !== undefined) {
      this.namespaceName = (namespaceInfo.length > 0) ? namespaceInfo[0].namespaceName.name : '';
    }
  }
}
