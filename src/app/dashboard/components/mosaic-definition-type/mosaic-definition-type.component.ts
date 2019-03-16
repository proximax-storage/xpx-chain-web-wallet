import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { MosaicDefinitionTransaction, NamespaceService } from 'proximax-nem2-sdk';
import { NamespacesService } from '../../../servicesModule/services/namespaces.service';
import { NemProvider } from 'src/app/shared/services/nem.provider';
import { TransactionsService } from '../../../transactions/service/transactions.service';

@Component({
  selector: 'app-mosaic-definition-type',
  templateUrl: './mosaic-definition-type.component.html',
  styleUrls: ['./mosaic-definition-type.component.scss']
})
export class MosaicDefinitionTypeComponent implements OnInit {

  @Input() mosaicDefinition: MosaicDefinitionTransaction | any;

  constructor(
    private namespacesService: NamespacesService,
    public transactionService: TransactionsService
  ) { }

  ngOnInit() {
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    console.log(this.mosaicDefinition.parentId.toHex());
    this.mosaicDefinition['feeFormatter'] = this.transactionService.amountFormatterSimple(this.mosaicDefinition.fee.compact());
    const resultado = await this.namespacesService.searchNamespace([this.mosaicDefinition.parentId]);
    this.mosaicDefinition['namespaceName'] = resultado[0].name;
  }

}
