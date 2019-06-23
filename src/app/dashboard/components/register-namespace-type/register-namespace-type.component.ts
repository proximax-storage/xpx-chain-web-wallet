import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { TransactionsService } from '../../../transactions/service/transactions.service';
import { NamespaceStorage } from '../../../servicesModule/interfaces/mosaics-namespaces.interface';
import { NamespacesService } from '../../../servicesModule/services/namespaces.service';
import { ProximaxProvider } from '../../../shared/services/proximax.provider';

@Component({
  selector: 'app-register-namespace-type',
  templateUrl: './register-namespace-type.component.html',
  styleUrls: ['./register-namespace-type.component.scss']
})
export class RegisterNamespaceTypeComponent implements OnInit {

  @Input() registerNamespaceTransaction: any = null;
  nameNamespace = '';

  constructor(
    public transactionService: TransactionsService,
    private namespaceService: NamespacesService,
    private proximaxProvider: ProximaxProvider
  ) { }

  ngOnInit() {
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    this.nameNamespace = this.registerNamespaceTransaction.data.namespaceName;
    let name = '';
    if (this.registerNamespaceTransaction.data.namespaceType !== 0) {
      if (this.registerNamespaceTransaction.data.parentId !== undefined) {
        let level: NamespaceStorage = await this.namespaceService.getNamespaceFromId(this.registerNamespaceTransaction.data.parentId);
        if (level !== null) {
          name = `${level.namespaceName.name}.${this.registerNamespaceTransaction.data.namespaceName}`;
          if (level.NamespaceInfo.depth === 2) {
            let level1: NamespaceStorage = await this.namespaceService.getNamespaceFromId(
              this.proximaxProvider.getNamespaceId([level.namespaceName.parentId.id.lower, level.namespaceName.parentId.id.higher])
            );
            name = `${level1.namespaceName.name}.${level.namespaceName.name}.${this.registerNamespaceTransaction.data.namespaceName}`;
          }

          this.nameNamespace = name;
        }
      }
    }
  }
}
