import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { UInt64, MosaicId, MosaicInfo, Mosaic, MosaicView } from 'proximax-nem2-sdk';
import { NemProvider } from '../../../shared/services/nem.provider';
import { MosaicService } from '../../../servicesModule/services/mosaic.service';
import { TransactionsService } from 'src/app/transactions/service/transactions.service';

@Component({
  selector: 'app-mosaics-info',
  template: `<!-- MOSAICS -->
              <div class="row mt-1rem">
                <div class="col-6">
                <span class="fs-08rem fw-bolder"><b>Mosaics info:</b></span>
                </div>
              </div>

              <container *ngIf="!viewDetail">
                <mdb-progress-bar class="progress primary-color-dark" mode="indeterminate"></mdb-progress-bar>
              </container>

              <container *ngIf="viewDetail">
                <div class="table-responsive table-striped ">
                  <table mdbTable id="tablePreview" class="table table-hover table-bordered table-striped table-sm z-depth-0">
                    <thead>
                      <tr>
                        <th *ngFor="let head of headElements" scope="col" class="text-align-left"><b>{{head}}</b></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr mdbTableCol *ngFor="let element of mosaicsArray; let i = index">
                        <td class="font-size-08rem">
                          <a class="text-link mouse-pointer">{{element.id.toHex()}}</a>
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

  @Input() mosaicsArray = [];
  @Input() viewAmount = false;
  mosaicsInfo = [];
  viewDetail = false;
  headElements = ['Id', 'Name', 'Amount'];
  constructor(
    private mosaicService: MosaicService,
    private transactionService: TransactionsService
  ) { }

  ngOnInit() {
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    console.log("mosaicsArray", this.mosaicsArray)
    this.viewDetail = false;
    const mosaicsId = this.mosaicsArray.map((mosaic: Mosaic) => { return mosaic.id; });
    const mosaicsViewCache: MosaicView[] = await this.mosaicService.searchMosaics(mosaicsId);
    if (mosaicsViewCache.length > 0) {
      console.log("mosaicsViewCache", mosaicsViewCache);
      for (let ma of this.mosaicsArray) {
        for (let mi of mosaicsViewCache) {
          console.log("ma", ma.id.toHex());
          console.log("mi", mi.mosaicInfo.mosaicId.toHex());
          if (ma.id.toHex() === mi.mosaicInfo.mosaicId.toHex()) {
            ma['mosaicInfo'] = mi;
            ma['amountFormatter'] = this.transactionService.amountFormatter(ma.amount, ma.id, [mi.mosaicInfo]);
          }
        }
      }

      this.viewDetail = true;
    }
  }

  amountFormatter(amount: UInt64, mosaicId: MosaicId, mosaics: MosaicInfo[]) {

  }
}
