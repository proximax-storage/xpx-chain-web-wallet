import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Mosaic, MosaicView, MosaicInfo, NamespaceId } from 'tsjs-xpx-chain-sdk';
import { MosaicService, MosaicsStorage } from '../../../servicesModule/services/mosaic.service';
import { ProximaxProvider } from '../../../shared/services/proximax.provider';
import { TransactionsService, TransactionsInterface } from '../../../transactions/services/transactions.service';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-mosaics-info',
  templateUrl: `./mosaics-info.component.html`
})
export class MosaicsInfoComponent implements OnInit {

  @Input() mosaicsArray: Mosaic[] = [];
  @Input() transferTransaction: TransactionsInterface;
  @Output() changeSearch = new EventEmitter();

  headElements = ['Id', 'Name', 'Quantity'];
  mosaicXpx: any = {};
  quantity = [];
  viewOtherMosaics = false;
  viewMosaicXpx = false;
  searching = true;

  constructor(
    private mosaicService: MosaicService,
    private transactionService: TransactionsService,
    private proximaxProvider: ProximaxProvider
  ) { }

  ngOnInit() {
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    this.mosaicXpx = {};
    this.viewMosaicXpx = false;
    this.viewOtherMosaics = false;
    this.quantity = [];
    this.searching = true;

    console.log('-----this.mosaicsArray----', this.mosaicsArray);
    const mosaics: MosaicsStorage[] = await this.mosaicService.filterMosaics(this.mosaicsArray.map((mosaic: Mosaic) => { return mosaic.id }));
    console.log('----mosaicos encontrados-----', mosaics);
    this.searching = false;
    if (mosaics.length > 0) {
      for (let mosaic of mosaics) {
        // Create MosaicId from mosaic and namespace string id (ex: nem:xem or domain.subdom.subdome:token)
        const mosaicId = this.proximaxProvider.getMosaicId(mosaic.idMosaic).toHex();
        const myMosaic = this.mosaicsArray.find(next => next.id.toHex() === mosaicId);
        console.log('---myMosaic---', myMosaic);
        const amount = (mosaic.mosaicInfo !== null) ?
          this.transactionService.amountFormatter(myMosaic.amount, mosaic.mosaicInfo) :
          this.transactionService.amountFormatterSimple(myMosaic.amount.compact());

        // MOSAIC IS XPX
        if (mosaicId === environment.mosaicXpxInfo.id) {
          this.viewMosaicXpx = true;
          this.mosaicXpx = {
            id: environment.mosaicXpxInfo.id,
            name: environment.mosaicXpxInfo.name,
            amountFormatter: amount,
            mosaicInfo: mosaic
          }
        } else {
          console.log(mosaic.mosaicNames);
          const nameMosaic = (mosaic.mosaicNames && mosaic.mosaicNames.names.length > 0) ?
            mosaic.mosaicNames.names[0] : '';

          this.quantity.push({
            id: myMosaic.id.toHex(),
            name: nameMosaic,
            amountFormatter: amount,
            mosaicInfo: mosaic,
            existMosaic: true
          });
        }
      }
    } else {
      this.transferTransaction.data['mosaics'].forEach((_element: Mosaic) => {
        this.quantity.push({
          id: _element.id.toHex(),
          name: '',
          amountFormatter: this.transactionService.amountFormatterSimple(_element.amount.compact()),
          mosaicInfo: null,
          existMosaic: false
        });
      });
    }

    this.viewOtherMosaics = (this.quantity.length > 0) ? true : false;
    this.changeSearch.emit(true);
  }
}
