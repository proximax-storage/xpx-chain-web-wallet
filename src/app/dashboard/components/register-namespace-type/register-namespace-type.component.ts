import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { NamespacesService, NamespaceStorageInterface } from '../../../servicesModule/services/namespaces.service';
import { ProximaxProvider } from '../../../shared/services/proximax.provider';
import { TransactionsService } from '../../../transactions/services/transactions.service';

@Component({
  selector: 'app-register-namespace-type',
  templateUrl: './register-namespace-type.component.html',
  styleUrls: ['./register-namespace-type.component.css']
})
export class RegisterNamespaceTypeComponent implements OnInit {

  @Input() registerNamespaceTransaction: any = null;
  nameNamespace = '';
  typeTransactionHex: string;

  constructor(
    public transactionService: TransactionsService,
    private namespaceService: NamespacesService
  ) { }

  ngOnInit() {
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    let name = '';
    this.typeTransactionHex = `${this.registerNamespaceTransaction.data['type'].toString(16).toUpperCase()}`;
    this.nameNamespace = this.registerNamespaceTransaction.data.namespaceName;
    if (this.registerNamespaceTransaction.data.namespaceType !== 0) {
      if (this.registerNamespaceTransaction.data.parentId !== undefined) {
        let level: NamespaceStorageInterface[] = await this.namespaceService.getNamespaceFromId([this.registerNamespaceTransaction.data.parentId]);
        if (level !== null && level !== undefined && level.length > 0) {
          name = `${level[0].namespaceName.name}.${this.registerNamespaceTransaction.data.namespaceName}`;
          this.nameNamespace = name;
        }
      }
    }
  }
}
