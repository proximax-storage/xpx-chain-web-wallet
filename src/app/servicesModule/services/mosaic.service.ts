import { Injectable } from "@angular/core";
import {
  MosaicInfo,
  MosaicId,
  MosaicView
} from "tsjs-xpx-chain-sdk";
import { ProximaxProvider } from "../../shared/services/proximax.provider";
import { WalletService } from "../../shared/services/wallet.service";
import { MosaicsStorage } from "../interfaces/mosaics-namespaces.interface";
import { MosaicXPXInterface } from "../../dashboard/services/transaction.interface";
import { MosaicNames } from "tsjs-xpx-chain-sdk/dist/src/model/mosaic/MosaicNames";


@Injectable({
  providedIn: "root"
})
export class MosaicService {

  mosaicsViewCache: MosaicView[] = [];
  mosaicXpx: MosaicXPXInterface = {
    mosaic: "prx.xpx",
    mosaicId: "0dc67fbe1cad29e3",
    divisibility: 6
  };

  constructor(
    private proximaxProvider: ProximaxProvider,
    private walletService: WalletService
  ) { }


  /**
   *
   *
   * @param {MosaicId[]} mosaicsId
   * @returns
   * @memberof MosaicService
   */
  async getNameMosaics(mosaicsId: MosaicId[]): Promise<MosaicNames[]> {
    return await this.proximaxProvider.mosaicHttp.getMosaicNames(mosaicsId).toPromise();
  }


  /**
   * Search mosaics by mosaicsId
   *
   * @param {MosaicId[]} mosaicsId
   * @returns
   * @memberof MosaicService
   */
  async searchMosaics(mosaicsId: MosaicId[]): Promise<MosaicsStorage[]> {
    // console.log('mosaicsId---> ', mosaicsId);
    const mosaicsStorage = [];
    const mosaicsToSearch = [];
    //Filter mosaics to search
    mosaicsId.forEach(mosaicId => {
      // Filter and get the storage mosaic from mosaicId
      const filterMosaic = this.filterMosaic(mosaicId);
      // In case there is no mosaic in storage, add the id in mosaicsToSearch to be searched later
      (filterMosaic === undefined || filterMosaic === null) ? mosaicsToSearch.push(mosaicId.id) : mosaicsStorage.push(filterMosaic);
    });

    // console.log('mosaicsToSearch ---> ', mosaicsToSearch);
    // console.log('mosaicsStorage ---> ', mosaicsStorage);

    //console.log(mosaicsToSearch);
    if (mosaicsToSearch.length > 0) {
      // Gets MosaicInfo for different mosaicIds.
      const mosaicsInfo = await this.proximaxProvider.getMosaics(mosaicsToSearch).toPromise();
      // console.log('mosaicsInfo', mosaicsInfo);
      // There is an array of mosaicsInfo
      if (mosaicsInfo.length > 0) {
        const infoMosaicsNotFound = [];
        mosaicsToSearch.forEach(element => {
          const exist = mosaicsInfo.find(e => e.mosaicId.toHex() === element.toHex());
          (exist === undefined || exist === null) ? infoMosaicsNotFound.push(element) : [];
        });

        // Save mosaicsInfo in storage
        await this.saveMosaicsStorage(mosaicsInfo, null);
        for (let elm of Object.keys(mosaicsInfo)) {
          // Filter and get the storage mosaic from mosaicId
          const filterMosaic = this.filterMosaic(mosaicsInfo[elm].mosaicId);
          if (filterMosaic) {
            // If the mosaic exists in storage, it is added to the variable mosaicsStorage to be returned later
            mosaicsStorage.push(filterMosaic);
          }
        }

        if (infoMosaicsNotFound.length > 0) {
          // Pass the variable infoMosaicsNotFound per parameter to saveMosaicsStorage to find only the name of the mosaic and save in storage
          await this.saveMosaicsStorage([], infoMosaicsNotFound);
          for (let mosaicId of mosaicsId) {
            const filterMosaic = this.filterMosaic(mosaicId);
            if (filterMosaic) {
              mosaicsStorage.push(filterMosaic);
            }
          }
        }
      } else {
        // Pass the variable mosaicsToSearch per parameter to saveMosaicsStorage to find only the name of the mosaic and save in storage
        await this.saveMosaicsStorage([], mosaicsToSearch);
        for (let mosaicId of mosaicsId) {
          const filterMosaic = this.filterMosaic(mosaicId);
          if (filterMosaic) {
            mosaicsStorage.push(filterMosaic);
          }
        }
      }
    }

    return mosaicsStorage;
  }

  /**
   *
   *
   * @returns {Promise<MosaicsStorage[]>}
   * @memberof MosaicService
   */
  async searchMosaicsFromAccountStorage$(): Promise<MosaicsStorage[]> {
    const mosaicFound = [];
    const mosaicsToSearch: MosaicId[] = [];
    // Map mosaics of an account
    const mosaicsFromAccount: MosaicsStorage[] = await this.searchMosaics(this.walletService.getAccountInfo().mosaics.map(n => n.id));
    // Valid if the account has tiles
    if (mosaicsFromAccount.length > 0) {
      //Starts the mosaic loop of an account
      for (let element of mosaicsFromAccount) {
        //Find the id of a mosaic
        const mosaicId = this.proximaxProvider.getMosaicId(element.id);
        // Filter if the mosaic exists in the storage
        const existMosaic = this.filterMosaic(mosaicId);
        /*If the mosaic does not exist in the storage, assign it to mosaicsToSearch to be searched later.
          Otherwise, push mosaics found.*/
        if (existMosaic === null || existMosaic === undefined) {
          mosaicsToSearch.push(mosaicId);
        } else {
          mosaicFound.push(existMosaic);
        }
      }

      //If there is any data in MosaicsToSearch, proceed to find the tiles and save it in the storage
      if (mosaicsToSearch.length > 0) {
        const response = await this.searchMosaics(mosaicsToSearch);
        response.forEach(element => {
          mosaicFound.push(element);
        });
      }
    }
    return mosaicFound;
  }

  /**
   *
   *
   * @param {MosaicInfo[]} mosaicsInfo
   * @param {NamespaceName[]} [namespaceName]
   * @returns
   * @memberof MosaicService
   */
  async saveMosaicsStorage(mosaicsInfo: MosaicInfo[], mosaicsToSearch?: MosaicId[]) {
    //get mosaics from storage
    const mosaicsStorage = this.getMosaicsFromStorage();
    //filter mosaics id from mosaicsInfo params
    const mosaicsIds = (mosaicsInfo.length > 0) ? mosaicsInfo.map(data => data.mosaicId) : mosaicsToSearch;
    // If the mosaic identification has data, look for the names of the tiles. This must return an array of mosaics name
    const mosaicsName = (mosaicsIds.length > 0) ? await this.getNameMosaics(mosaicsIds) : [];
    // console.log('----> mosaicsName ', mosaicsName);
    if (mosaicsInfo.length > 0) {
      for (let mosaicInfo of mosaicsInfo) {
        const data = await this.buildStructureMosaicStorage(mosaicsStorage, mosaicInfo.mosaicId, mosaicsName, mosaicInfo);
        if (data) {
          mosaicsStorage.push(data);
        }
      }
    } else {
      if (mosaicsToSearch) {
        for (let mosaicId of mosaicsToSearch) {
          const data = await this.buildStructureMosaicStorage(mosaicsStorage, mosaicId, mosaicsName, null);
          if (data) {
            mosaicsStorage.push(data);
          }
        }
      } else {
        return [];
      }
    }

    localStorage.setItem(this.getNameStorage(), JSON.stringify(mosaicsStorage));
    return mosaicsStorage;
  }

  /**
   *
   *
   * @param {MosaicsStorage[]} mosaicsStorage
   * @param {MosaicId} mosaicId
   * @param {MosaicNames[]} mosaicsName
   * @param {MosaicInfo} mosaicInfo
   * @returns {Promise<MosaicsStorage>}
   * @memberof MosaicService
   */
  async buildStructureMosaicStorage(mosaicsStorage: MosaicsStorage[], mosaicId: MosaicId, mosaicsName: MosaicNames[], mosaicInfo: MosaicInfo): Promise<MosaicsStorage> {
    // Check if the mosaics id exists in storage
    const existMosaic = mosaicsStorage.find(key => this.proximaxProvider.getMosaicId(key.id).toHex() === mosaicId.toHex());
    // Mosaic does not exist in storage
    if (existMosaic === undefined || existMosaic === null) {
      // From the arrangement of the mosaics name, filter the mosaic name data by the mosaic id
      const mosaicName = mosaicsName.find(data => data.mosaicId.toHex() === mosaicId.toHex());
      // If mosaicName is defined
      if (mosaicName) {
        const infoComplete = (mosaicInfo) ? true : false;
        // Push to the array of mosaicsStorage
        return {
          id: [mosaicName.mosaicId.id.lower, mosaicName.mosaicId.id.higher],
          mosaicNames: mosaicName,
          mosaicInfo: mosaicInfo,
          infoComplete: infoComplete
        };

      }
    }

    return null;
  }

  /**
   * Filter mosaic by mosaicId
   *
   * @param {MosaicId} mosaicId
   * @returns
   * @memberof MosaicService
   */
  filterMosaic(mosaicId: MosaicId): MosaicsStorage {
    const mosaicsStorage = this.getMosaicsFromStorage();
    if (mosaicsStorage !== null && mosaicsStorage !== undefined) {
      if (mosaicsStorage.length > 0) {
        const filtered = mosaicsStorage.find(element => {
          return this.proximaxProvider.getMosaicId(element.id).toHex() === mosaicId.toHex();
        });

        return filtered;
      }
    }

    return null;
  }

  /**
   *
   *
   * @returns
   * @memberof MosaicService
   */
  getNameStorage() {
    return `proximax-mosaics`;
  }

  /**
   *
   *
   * @returns {MosaicsStorage[]}
   * @memberof MosaicService
   */
  getMosaicsFromStorage(): MosaicsStorage[] {
    const dataStorage = localStorage.getItem(this.getNameStorage());
    return (dataStorage !== null && dataStorage !== undefined) ? JSON.parse(dataStorage) : [];
  }

  /**
   *
   *
   * @memberof MosaicService
   */
  resetMosaicsStorage() {
    localStorage.removeItem(this.getNameStorage());
  }
}
