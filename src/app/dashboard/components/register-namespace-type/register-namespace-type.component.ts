import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { NamespacesService, NamespaceStorageInterface } from '../../../servicesModule/services/namespaces.service';
import { ProximaxProvider } from '../../../shared/services/proximax.provider';
import { TransactionsService } from '../../../transfer/services/transactions.service';

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
    private namespaceService: NamespacesService,
    private proximaxProvider: ProximaxProvider
  ) { }

  ngOnInit() {
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {

    let name = '';
    this.typeTransactionHex = `${this.registerNamespaceTransaction.data['type'].toString(16).toUpperCase()}`;
    this.nameNamespace = this.registerNamespaceTransaction.data.namespaceName;
    const namespaceName = await this.namespaceService.getNamespacesName([this.registerNamespaceTransaction.data.parentId]);
    console.log(namespaceName);
    // switch (this.registerNamespaceTransaction.data.namespaceType) {
    //   case 0:
    //     name =
    //     break;

    //   default:
    //     break;
    // }


    if (this.registerNamespaceTransaction.data.namespaceType !== 0) {
      if (this.registerNamespaceTransaction.data.parentId !== undefined) {
        let level: NamespaceStorageInterface[] = await this.namespaceService.getNamespaceFromId([this.registerNamespaceTransaction.data.parentId]);
        if (level !== null && level !== undefined && level.length > 0) {
          name = `${level[0].namespaceName.name}.${this.registerNamespaceTransaction.data.namespaceName}`;
          if (level[0].namespaceInfo.depth === 2) {
            let level1: NamespaceStorageInterface[] = await this.namespaceService.getNamespaceFromId(
              [this.proximaxProvider.getNamespaceId([level[0].namespaceName.parentId.id.lower, level[0].namespaceName.parentId.id.higher])]
            );
            name = `${level1[0].namespaceName.name}.${level[0].namespaceName.name}.${this.registerNamespaceTransaction.data.namespaceName}`;
          }
          this.nameNamespace = name;
        }
      }
    }
  }
}
