import { Injectable } from '@angular/core';
import { MosaicInfo, MosaicId, MosaicView } from 'proximax-nem2-sdk';
import { NemProvider } from '../../shared/services/nem.provider';

@Injectable({
  providedIn: 'root'
})
export class MosaicService {

  mosaicsViewCache: MosaicView[] = [];

  constructor(
    private nemProvider: NemProvider
  ) { }


  /**
   * Destroy mosaics cache
   *
   * @memberof MosaicService
   */
  destroyMosaicCache() {
    this.mosaicsViewCache = [];
  }


  /**
   * Set mosaics in cache
   *
   * @param {string} mosaicId
   * @param {string} [mosaicName]
   * @param {string} [namespaceName]
   * @memberof MosaicService
   */
  setMosaicsCache(mosaicsViewCache: MosaicView) {
    this.mosaicsViewCache.push(mosaicsViewCache);
  }

  /**
   * Get all mosaics in cache
   *
   * @returns
   * @memberof MosaicService
   */
  getMosaicsCache(){
    return this.mosaicsViewCache;
  }


  /**
   * Search mosaics by mosaicsId
   *
   * @param {MosaicId[]} mosaicsId
   * @returns
   * @memberof MosaicService
   */
  async searchMosaics(mosaicsId: MosaicId[]) {
    console.log("mosaicsId", mosaicsId)
    const infoMosaicsView = [];
    const mosaicsToSearch = [];
    for(let mosaicId of mosaicsId) {
      const filterMosaic = this.filterMosaic(mosaicId);
      console.log("Existe filter mosaic?", filterMosaic)
      if (filterMosaic === undefined) {
        mosaicsToSearch.push(mosaicId);
      }else {
        infoMosaicsView.push(filterMosaic);
      }
    }

    // Search info mosaics
    if (mosaicsToSearch.length > 0) {
      const response = await this.nemProvider.getMosaicViewPromise(mosaicsToSearch);
      Object.keys(response).forEach(element => {
        infoMosaicsView.push(response[element]);
        this.setMosaicsCache(response[element]);
      });
    }
    return infoMosaicsView;
  }


  /**
   * Filter mosaic by mosaicId
   *
   * @param {MosaicId} mosaicId
   * @returns
   * @memberof MosaicService
   */
  filterMosaic(mosaicId: MosaicId) {
    console.log("Mosaicos en cache", this.mosaicsViewCache);
    console.log("mosaicId by filter", mosaicId);
    if (this.mosaicsViewCache.length > 0) {
      const filtered = this.mosaicsViewCache.find(function(element){
        return element.mosaicInfo.mosaicId.toHex() === mosaicId.toHex();
      });

      return filtered;
    }
  }
}
