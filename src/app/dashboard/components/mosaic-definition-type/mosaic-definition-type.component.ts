import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { NamespacesService } from '../../../servicesModule/services/namespaces.service';
import { TransactionsService } from '../../../transactions/service/transactions.service';
import { TransactionsInterface } from '../../services/transaction.interface';

@Component({
  selector: 'app-mosaic-definition-type',
  templateUrl: './mosaic-definition-type.component.html',
  styleUrls: ['./mosaic-definition-type.component.scss']
})
export class MosaicDefinitionTypeComponent implements OnInit {

  @Input() mosaicDefinition: TransactionsInterface;
  viewNamespaceId: boolean = false;

  constructor(
    private namespacesService: NamespacesService,
    public transactionService: TransactionsService
  ) { }

  ngOnInit() {
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    this.viewNamespaceId = false;
    this.namespacesService.getNamespaceFromId(this.mosaicDefinition.data['parentId']).then(
      response => {
        if (response) {
          this.mosaicDefinition['namespaceName'] = response.namespaceName.name;
        } else {
          this.viewNamespaceId = false;
        }
      }
    ).catch(err => {
      this.viewNamespaceId = true;
    });
  }

}
