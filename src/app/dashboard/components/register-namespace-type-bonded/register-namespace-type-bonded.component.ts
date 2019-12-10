import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { RegisterNamespaceTransaction } from 'tsjs-xpx-chain-sdk';
import { TransactionsInterface, TransactionsService } from '../../../transactions/services/transactions.service';
import { NamespaceStorageInterface, NamespacesService } from '../../../servicesModule/services/namespaces.service';

@Component({
  selector: 'app-register-namespace-type-bonded',
  templateUrl: './register-namespace-type-bonded.component.html',
  styleUrls: ['./register-namespace-type-bonded.component.css']
})
export class RegisterNamespaceTypeBondedComponent implements OnInit, OnChanges {

  @Input() registerNamespaceTransaction: RegisterNamespaceTransaction = null;

  nameNamespace = '';
  transactionBuilder: TransactionsInterface = null;
  typeTransactionHex: string;

  constructor(
    private namespaceService: NamespacesService,
    private transactionService: TransactionsService
  ) { }

  ngOnInit() {
  }

  async ngOnChanges(changes: SimpleChanges) {
    this.transactionBuilder = this.transactionService.getStructureDashboard(this.registerNamespaceTransaction);
    this.typeTransactionHex = `${this.transactionBuilder.data['type'].toString(16).toUpperCase()}`;
    this.nameNamespace = this.transactionBuilder.data.namespaceName;
    if (this.transactionBuilder.data.namespaceType !== 0) {
      if (this.transactionBuilder.data.parentId !== undefined) {
        const level: NamespaceStorageInterface[] = await this.namespaceService.getNamespaceFromId([this.transactionBuilder.data.parentId]);
        if (level !== null && level !== undefined && level.length > 0) {
          this.nameNamespace = `${level[0].namespaceName.name}.${this.transactionBuilder.data.namespaceName}`;
        }
      }
    }
  }
}
