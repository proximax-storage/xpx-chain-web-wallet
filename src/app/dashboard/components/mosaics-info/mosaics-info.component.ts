import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Mosaic, MosaicView, MosaicInfo } from 'tsjs-xpx-chain-sdk';
import { MosaicService } from '../../../servicesModule/services/mosaic.service';
import { TransactionsService } from '../../../transactions/service/transactions.service';
import { MosaicsStorage } from '../../../servicesModule/interfaces/mosaics-namespaces.interface';
import { TransactionsInterface } from '../../services/transaction.interface';
import { ProximaxProvider } from '../../../shared/services/proximax.provider';

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
    const mosaics: MosaicsStorage[] = await this.mosaicService.searchMosaics(this.mosaicsArray.map((mosaic: Mosaic) => { return mosaic.id }));
    if (mosaics.length > 0) {
      for (let mosaic of mosaics) {
        // Create MosaicId from mosaic and namespace string id (ex: nem:xem or domain.subdom.subdome:token)
        // console.log(mosaic);
        const mosaicId = this.proximaxProvider.getMosaicId(mosaic.id).toHex();
        const myMosaic = this.mosaicsArray.find(next => next.id.toHex() === mosaicId);
        const amount = (mosaic.mosaicInfo !== null) ?
          this.transactionService.amountFormatter(myMosaic.amount, mosaic.mosaicInfo) :
          this.transactionService.amountFormatterSimple(myMosaic.amount.compact());
        // MOSAIC IS XPX
        if (mosaicId === this.mosaicService.mosaicXpx.mosaicId) {
          this.viewMosaicXpx = true;
          this.mosaicXpx = {
            id: this.mosaicService.mosaicXpx.mosaicId,
            name: this.mosaicService.mosaicXpx.mosaic,
            amountFormatter: amount,
            mosaicInfo: mosaic
          }
        } else {
          // console.log(mosaic.mosaicName);
          const nameMosaic = (mosaic.mosaicNames.names.length > 0) ? mosaic.mosaicNames.names[0] : this.proximaxProvider.getMosaicId(mosaic.id).toHex();
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
