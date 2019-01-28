import { Component, OnInit } from '@angular/core';
import { MosaicId, AccountInfo } from 'proximax-nem2-sdk';
import { NemProvider } from '../../../../shared/services/nem.provider';
import { WalletService } from '../../../../shared/services/wallet.service';
import { MosaicService } from '../../../services/mosaic.service';

@Component({
  selector: 'app-create-mosaic',
  templateUrl: './create-mosaic.component.html',
  styleUrls: ['./create-mosaic.component.scss']
})
export class CreateMosaicComponent implements OnInit {

  isOwner = false;

  constructor(
    private nemProvider: NemProvider,
    private walletService: WalletService,
    private mosaicService: MosaicService
  ) { }

  ngOnInit() {
    this.accountInfo();
  }

  /**
   *
   *
   * @memberof CreateMosaicComponent
   */
  accountInfo() {
    const accountInfo = this.walletService.getAccountInfo();
    if (accountInfo === undefined) {
      this.nemProvider.accountHttp.getAccountInfo(this.walletService.address).subscribe(
        accountInfo => {
          console.log("AccountInfo desde cero", accountInfo);
          this.walletService.setAccountInfo(accountInfo);
          this.searchMosaics(accountInfo);
        }, error => {
          console.log("Error", error);
        }
      );
    } else {
      console.log("AccountInfo en cache", accountInfo);
      this.searchMosaics(accountInfo);
    }
  }

  /**
   * Seach mosaics
   *
   * @param {AccountInfo} accountInfo
   * @memberof CreateMosaicComponent
   */
  searchMosaics(accountInfo: AccountInfo) {
    const mosaicsId = [];
    const mosaicsCache = this.mosaicService.getMosaicsCache();

    // start the loop to look for the mosaics
    for (let element of accountInfo.mosaics) {
      // start the loop to look for the mosaics
      if (mosaicsCache.length > 0) {
        const mosaicsEquals = mosaicsCache.find(function (mc) {
          return mc.mosaicId.toHex() !== element.id.toHex();
        });

        if (mosaicsEquals !== undefined) {
          mosaicsId.push(element.id);
        }
      } else {
        console.log("No existe mosaicsCache...");
        mosaicsId.push(element.id);
      }
    }

    if (mosaicsId.length > 0) {
      // Search mosaics info
      this.nemProvider.mosaicHttp.getMosaics(mosaicsId).subscribe(
        mosaicsInfo => {
          for (let element of mosaicsInfo) {
            this.mosaicService.setMosaicsCache(element);
            if (element.owner.address.pretty() === this.walletService.address.pretty()) {
              console.log("Is Owner");
              this.isOwner = true;
            }
          }

          console.log("Is owner?", this.isOwner)
        });
    } else {
      console.log("Ya todos se encuentran en cache");
    }
  }

}
