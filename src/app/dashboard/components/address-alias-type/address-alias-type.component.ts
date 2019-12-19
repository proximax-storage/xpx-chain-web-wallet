import { Component, OnInit, Input, SimpleChanges, OnChanges } from '@angular/core';
import { NamespacesService, NamespaceStorageInterface } from '../../../servicesModule/services/namespaces.service';
import { TransactionsInterface, TransactionsService } from '../../../transactions/services/transactions.service';
import { Transaction } from 'tsjs-xpx-chain-sdk';

@Component({
  selector: 'app-address-alias-type',
  templateUrl: './address-alias-type.component.html',
  styleUrls: ['./address-alias-type.component.css']
})
export class AddressAliasTypeComponent implements OnInit, OnChanges {

  @Input() addressAlias: TransactionsInterface = null;
  @Input() transaction: Transaction = null;
  @Input() simple = true;
  namespaceId = '';
  namespaceName = '';
  typeTransactionHex: string;

  constructor(
    private namespaceService: NamespacesService,
    private transactionService: TransactionsService
  ) { }

  ngOnInit() {
  }

  async ngOnChanges(changes: SimpleChanges) {
    // NAMESPACE
    this.namespaceId = '';
    this.namespaceName = '';

    if (!this.simple) {
      this.addressAlias = this.transactionService.getStructureDashboard(this.transaction);
    }

    this.typeTransactionHex = `${this.addressAlias.data['type'].toString(16).toUpperCase()}`;
    const namespaceId = this.namespaceService.getNamespaceId([this.addressAlias.data['namespaceId'].id.lower, this.addressAlias.data['namespaceId'].id.higher]);
    this.namespaceId = namespaceId.toHex();
    const namespaceInfo: NamespaceStorageInterface[] = await this.namespaceService.getNamespaceFromId([namespaceId]);
    if (namespaceInfo !== null && namespaceInfo !== undefined) {
      this.namespaceName = (namespaceInfo.length > 0) ? namespaceInfo[0].namespaceName.name : '';
    }
  }
}
