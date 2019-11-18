import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Mosaic, MosaicView, MosaicInfo, NamespaceId } from 'tsjs-xpx-chain-sdk';
import { MosaicService, MosaicsStorage } from '../../../servicesModule/services/mosaic.service';
import { ProximaxProvider } from '../../../shared/services/proximax.provider';
import { TransactionsService, TransactionsInterface } from '../../../transactions/services/transactions.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-mosaics-info',
  templateUrl: `./mosaics-info.component.html`
})
export class MosaicsInfoComponent implements OnInit {

  @Input() mosaicsArray: Mosaic[] = [];
  @Input() simple = true;
  @Input() transferTransaction: TransactionsInterface;
  @Input() receive = true;
  @Output() changeSearch = new EventEmitter();

  headElements = ['Id', 'Name'];
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
    // console.log(this.simple);
    if (this.simple === false) {
      this.transferTransaction = this.transferTransaction;
      this.receive = this.receive;
    } else {
      this.simple = true;
      this.transferTransaction = this.transferTransaction.data;
      this.receive = this.receive;
    }

    console.log('\n\n-----this.mosaicsArray----', this.mosaicsArray);
    const mosaics: MosaicsStorage[] = await this.mosaicService.filterMosaics(this.mosaicsArray.map((mosaic: Mosaic) => { return mosaic.id }));
    console.log('\n\n----mosaicos encontrados-----', mosaics);
    this.searching = false;
    if (mosaics.length > 0) {
      for (let mosaic of mosaics) {
        const id = this.findMosaic(mosaic);
        // me quedé validando que me retorne el mosaico id y no namespace id, ya que en mosaicInfo no muestra
        console.log('\n\n---My mosaic---', id);
        if (id.length > 0) {

        } else {
          this.quantity.push({
            id: this.proximaxProvider.getMosaicId(mosaic.idMosaic).toHex(),
            name: '',
            amountFormatter: '',
            mosaicInfo: mosaic,
            existMosaic: false
          });
        }


        /* if (id) {
           const amount = this.getAmount(mosaic, id);
           console.log('\n\namountamount', amount);

           // MOSAIC IS XPX
           if (this.proximaxProvider.getMosaicId(mosaic.idMosaic).toHex() === environment.mosaicXpxInfo.id) {
             this.viewMosaicXpx = true;
             this.mosaicXpx = {
               id: environment.mosaicXpxInfo.id,
               name: environment.mosaicXpxInfo.name,
               amountFormatter: amount,
               mosaicInfo: mosaic
             }
           } else {
             const nameMosaic = this.getName(mosaic);
             this.quantity.push({
               id: id.id.toHex(),
               name: nameMosaic,
               amountFormatter: amount,
               mosaicInfo: mosaic,
               existMosaic: true
             });

             console.log('this.quantitythis.quantitythis.quantity', this.quantity);
           }
         } else {
           this.quantity.push({
             id: this.proximaxProvider.getMosaicId(mosaic.idMosaic).toHex(),
             name: '',
             amountFormatter: '',
             mosaicInfo: mosaic,
             existMosaic: false
           });
         }*/
      }
    } else {
      this.transferTransaction['mosaics'].forEach((_element: Mosaic) => {
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


  /**
   *
   * @param mosaicStorage
   */
  findMosaic(mosaicStorage: MosaicsStorage) {
    console.log('this.mosaicsArray', this.mosaicsArray);
    // Create MosaicId from mosaic and namespace string id (ex: nem:xem or domain.subdom.subdome:token)
    const dataReturn = [];
    this.mosaicsArray.forEach(element => {
      const mosaicId = this.proximaxProvider.getMosaicId(mosaicStorage.idMosaic).toHex();
      const byMosaicId = element.id.toHex() === mosaicId;
      if (byMosaicId) {
        dataReturn.push(element);
        // return byMosaicId;
      } else if (mosaicStorage.isNamespace) {
        const namespaceId = this.proximaxProvider.getNamespaceId(mosaicStorage.isNamespace).toHex();
        const byNamespaceId = element.id.toHex() === namespaceId;
        if (byNamespaceId) {
          dataReturn.push(element);
        }
      }
    });

    return dataReturn;
    /*const mosaicId = this.proximaxProvider.getMosaicId(mosaicStorage.idMosaic).toHex();
    const byMosaicId = this.mosaicsArray.filter(next => next.id.toHex() === mosaicId);
    if (byMosaicId) {
      console.log('\n\n byMosaicId', byMosaicId);
      return byMosaicId;
    } else if (mosaicStorage.isNamespace) {
      const namespaceId = this.proximaxProvider.getNamespaceId(mosaicStorage.isNamespace).toHex();
      const byNamespaceId = this.mosaicsArray.filter(next => next.id.toHex() === namespaceId);
      console.log('\n\n isNamespace', byNamespaceId);
      return byNamespaceId;
    }*/

    return null;
  }

  /**
   *
   * @param mosaic
   * @param id
   */
  getAmount(mosaic: MosaicsStorage, id: Mosaic) {
    if (mosaic.mosaicInfo) {
      return this.transactionService.amountFormatter(id.amount, mosaic.mosaicInfo);
    }

    return this.transactionService.amountFormatterSimple(id.amount.compact());
  }

  /**
   *
   * @param mosaic
   */
  getName(mosaic: MosaicsStorage) {
    return (
      mosaic.mosaicNames &&
      mosaic.mosaicNames.names.length > 0
    ) ? mosaic.mosaicNames.names[0].name : '';
  }
}
