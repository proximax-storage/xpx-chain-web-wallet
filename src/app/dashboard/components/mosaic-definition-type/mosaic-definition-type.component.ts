import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { NamespacesService } from '../../../servicesModule/services/namespaces.service';
import { TransactionsService } from '../../../transactions/service/transactions.service';
import { TransactionsInterface } from '../../services/transaction.interface';
import { MosaicService } from '../../../servicesModule/services/mosaic.service';
import { MosaicsStorage } from 'src/app/servicesModule/interfaces/mosaics-namespaces.interface';

@Component({
  selector: 'app-mosaic-definition-type',
  templateUrl: './mosaic-definition-type.component.html',
  styleUrls: ['./mosaic-definition-type.component.scss']
})
export class MosaicDefinitionTypeComponent implements OnInit {

  @Input() mosaicDefinition: TransactionsInterface;
  viewNamespaceId: boolean = false;

  constructor(
    private mosaicService: MosaicService,
    public transactionService: TransactionsService
  ) { }

  ngOnInit() {
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    this.viewNamespaceId = false;
    this.mosaicDefinition['mosaicsStorage'] = null;
    const mosaics: MosaicsStorage[] = await this.mosaicService.searchMosaics([this.mosaicDefinition.data['mosaicId']]);
    if (mosaics.length > 0) {
      this.viewNamespaceId = false;
      this.mosaicDefinition['mosaicsStorage'] = mosaics[0];
    }
  }

}
