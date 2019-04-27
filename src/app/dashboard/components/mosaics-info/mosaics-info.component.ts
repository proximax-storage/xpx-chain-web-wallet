import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Mosaic, MosaicView, MosaicName, MosaicInfo } from 'proximax-nem2-sdk';
import { MosaicService } from '../../../servicesModule/services/mosaic.service';
import { TransactionsService } from '../../../transactions/service/transactions.service';
import { MosaicsStorage } from '../../../servicesModule/interfaces/mosaics-namespaces.interface';

@Component({
  selector: 'app-mosaics-info',
  template: `<!-- MOSAICS -->
                <ng-container *ngIf="viewMosaicXpx">
                  <div class="mt-3">
                    <!--
                    <div class="row">
                      <div class="col-md-3">
                        <span class="fs-08rem fw-bolder"><b>Mosaic:</b></span>
                      </div>
                      <div class="col-md-9">
                        <span class="fs-08rem fw-bolder">{{mosaicXpx.mosaicInfo.namespaceName}}:{{mosaicXpx.mosaicInfo.mosaicName}}</span>
                      </div>
                    </div>-->

                    <div class="row mt-3">
                      <div class="col-md-3">
                        <span class="fs-08rem fw-bolder"><b>Amount:</b></span>
                      </div>
                      <div class="col-md-9">
                        <span class="fs-08rem fw-bolder">{{mosaicXpx.amountFormatter}} (XPX)</span>
                      </div>
                    </div>
                  </div>
                </ng-container>


                <container *ngIf="viewOtherMosaics">
                  <div class="row mt-1rem">
                    <div class="col-6">
                      <span class="fs-08rem fw-bolder"><b>Other mosaics:</b></span>
                    </div>
                  </div>

                  <div class="table-responsive table-striped ">
                    <table mdbTable id="tablePreview" class="table table-hover table-bordered table-striped table-sm z-depth-0">
                      <thead>
                        <tr>
                          <th *ngFor="let head of headElements" scope="col" class="text-align-left"><b>{{head}}</b></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr mdbTableCol *ngFor="let element of quantity; let i = index">
                          <td class="font-size-08rem">
                            <a class="text-link mouse-pointer">{{element.id}}</a>
                          </td>
                          <td class="font-size-08rem">{{element.mosaicInfo.namespaceName}}:{{element.mosaicInfo.mosaicName}}</td>
                          <td class="font-size-08rem">{{element.amountFormatter}}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </container>

              `
})
export class MosaicsInfoComponent implements OnInit {

  @Input() mosaicsArray: Mosaic[] = [];
  @Input() viewAmount = false;
  @Output() changeSearch = new EventEmitter();

  mosaicsInfo = [];
  viewOtherMosaics = false;
  headElements = ['Id', 'Name', 'Quantity'];
  mosaicXpx: any = {};
  viewMosaicXpx = false;
  quantity = [];

  constructor(
    private mosaicService: MosaicService,
    private transactionService: TransactionsService
  ) { }

  ngOnInit() {
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    this.quantity = [];
    const mosaicsId = this.mosaicsArray.map((mosaic: Mosaic) => { return mosaic.id });
    const mosaics: MosaicsStorage[] = await this.mosaicService.searchMosaics(mosaicsId);
    for (let mosaic of mosaics) {
      console.log(mosaic);
      const mosaicId = this.mosaicService.getMosaicId(mosaic.id).toHex();
      const myMosaic = this.mosaicsArray.find(next => next.id.toHex() === mosaicId)
      if (mosaicId === this.mosaicService.mosaicXpx.mosaicId) {  // MOSAIC IS XPX
        this.viewMosaicXpx = true;
        this.mosaicXpx = {
          id: this.mosaicService.mosaicXpx.mosaicId,
          name: this.mosaicService.mosaicXpx.mosaic,
          amountFormatter: this.transactionService.amountFormatter(myMosaic.amount, myMosaic.id, mosaic.mosaicInfo),
          mosaicInfo: mosaic
        }
      } else {
        console.log(mosaic);
        this.quantity.push({
          id: myMosaic.id.toHex(),
          name: mosaic.mosaicName,
          amountFormatter: this.transactionService.amountFormatter(myMosaic.amount, myMosaic.id, mosaic.mosaicInfo),
          mosaicInfo: mosaic
        });
      }
    }

    this.viewOtherMosaics = (this.quantity.length > 0) ? true : false;
    this.changeSearch.emit(true);
  }

  async hi(changes: SimpleChanges): Promise<void> {
    console.log("mosaicsArray", this.mosaicsArray);
    this.mosaicsInfo = this.mosaicsArray.slice(0);
    this.mosaicXpx = null;
    this.viewOtherMosaics = false;
    this.viewMosaicXpx = false;
    const mosaicsId = this.mosaicsInfo.map((mosaic: Mosaic) => {
      // if (mosaic.id.toHex() !== 'd423931bd268d1f4') { return mosaic.id }
      return mosaic.id
    });
    const mosaicsViewCache = await this.mosaicService.searchMosaics(mosaicsId);
    if (mosaicsViewCache.length > 0) {
      console.log("mosaicsViewCache", mosaicsViewCache);
      for (let ma of this.mosaicsInfo) {
        for (let mi of mosaicsViewCache) {
          console.log("ma", ma.id.toHex());
          console.log("mi", mi.mosaicInfo.mosaicId.toHex());
          if (ma.id.toHex() === mi.mosaicInfo.mosaicId.toHex()) {
            ma['mosaicInfo'] = mi;
            if (ma.id.toHex() === 'd423931bd268d1f4') {
              // ma['amountFormatter'] = this.transactionService.amountFormatter(ma.amount, ma.id, [mi.mosaicInfo]);
              this.mosaicXpx = ma;
              this.viewMosaicXpx = true;
              this.mosaicsInfo.splice(ma);
            } else {
              ma['amountFormatter'] = this.transactionService.formatNumberMilesThousands(ma.amount.compact());
            }
          }
        }
      }

      if (this.mosaicsInfo.length > 0) {
        this.viewOtherMosaics = true;
      }
    } else {
      const mosaicsName: MosaicName[] = await this.mosaicService.getNameMosaics(mosaicsId);
    }
    this.changeSearch.emit(true);
  }


}
