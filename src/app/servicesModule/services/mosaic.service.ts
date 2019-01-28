import { Injectable } from '@angular/core';
import { MosaicId, NamespaceId, Mosaic, MosaicInfo } from 'proximax-nem2-sdk';

@Injectable({
  providedIn: 'root'
})
export class MosaicService {

  mosaicsCache: MosaicInfo[] = [];

  constructor() { }


  /**
   * Destroy mosaics cache
   *
   * @memberof MosaicService
   */
  destroyMosaicCache() {
    this.mosaicsCache = [];
  }


  /**
   * Set mosaics in cache
   *
   * @param {string} mosaicId
   * @param {string} [mosaicName]
   * @param {string} [namespaceName]
   * @memberof MosaicService
   */
  setMosaicsCache(mosaicInfo: MosaicInfo) {
    this.mosaicsCache.push(mosaicInfo);
  }

  /**
   * Get all mosaics in cache
   *
   * @returns
   * @memberof MosaicService
   */
  getMosaicsCache(){
    return this.mosaicsCache;
  }

}
