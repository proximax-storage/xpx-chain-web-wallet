import { Injectable } from "@angular/core";
import {
  MosaicInfo,
  MosaicId,
  MosaicView,
  NamespaceName,
  NamespaceInfo
} from "tsjs-xpx-chain-sdk";
import { MosaicNames } from "tsjs-xpx-chain-sdk/dist/src/model/mosaic/MosaicNames";
import { ProximaxProvider } from "../../shared/services/proximax.provider";
import { NamespacesService } from "./namespaces.service";
import { WalletService } from '../../wallet/services/wallet.service';


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
    private walletService: WalletService,
    private namespacesService: NamespacesService
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
    if (mosaicsToSearch.length > 0) {
      // Gets MosaicInfo for different mosaicIds.
      const mosaicsInfo = await this.proximaxProvider.getMosaics(mosaicsToSearch).toPromise();
      //      console.log('mosaicsInfo', mosaicsInfo);
      // There is an array of mosaicsInfo
      // console.log('----- mosaicsInfo -----> ', mosaicsInfo);
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
        if (mosaicsToSearch.length > 0) {
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
    const accountInfo = this.walletService.filterAccountInfo();
    // console.log(accountInfo);
    if (accountInfo !== undefined) {
      // Map mosaics of an account
      const mosaicsFromAccount: MosaicsStorage[] = await this.searchMosaics(accountInfo.accountInfo.mosaics.map(n => n.id));
      // console.log(mosaicsFromAccount);
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
    // searchByNamespaceId
    const searchByNamespaceId = [];
    //get mosaics from storage
    const mosaicsStorage = this.getMosaicsFromStorage();
    //filter mosaics id from mosaicsInfo params
    let mosaicsIds = [];
    // If the mosaic identification has data, look for the names of the tiles. This must return an array of mosaics name
    let mosaicsName = [];

    // Init process
    /* if (mosaicsInfo.length > 0) {
       mosaicsIds = mosaicsInfo.map(data => data.mosaicId);
       mosaicsName = await this.getNameMosaics(mosaicsIds);
       for (let mosaicInfo of mosaicsInfo) {
         console.log('----mosaicInfo-----', mosaicInfo);
         // Valida si el mosaico posee name
         const currentMosaicName = mosaicsName.find(data => data.mosaicId.toHex() === mosaicInfo.mosaicId.toHex());
         console.log('----currentMosaicName---', currentMosaicName);
         if (currentMosaicName && currentMosaicName.names.length > 0) {
           const data = await this.buildStructureMosaicStorage(mosaicsStorage, mosaicInfo.mosaicId, mosaicsName, mosaicInfo);
           if (data) {
             console.log('------data------', data);
             mosaicsStorage.push(data);
           }
         } else {
           searchByNamespaceId.push(this.namespacesService.getNamespaceId([mosaicInfo.mosaicId.id.lower, mosaicInfo.mosaicId.id.higher]));
         }
       }
     } else {
       mosaicsIds = mosaicsToSearch;
       mosaicsName = [];
     }

     return mosaicsStorage;*/

    if (mosaicsInfo.length > 0) {
      mosaicsIds = mosaicsInfo.map(data => data.mosaicId);
      mosaicsName = await this.getNameMosaics(mosaicsIds);
      for (let mosaicInfo of mosaicsInfo) {
        const currentMosaic = mosaicsName.find(data => data.mosaicId.toHex() === mosaicInfo.mosaicId.toHex());
        if (currentMosaic && currentMosaic.names.length > 0) {
          const data = await this.buildStructureMosaicStorage(mosaicsStorage, mosaicInfo.mosaicId, mosaicsName, mosaicInfo);
          if (data) {
            mosaicsStorage.push(data);
          }
        } else {
          searchByNamespaceId.push(this.namespacesService.getNamespaceId([mosaicInfo.mosaicId.id.lower, mosaicInfo.mosaicId.id.higher]));
        }
      }

      if (searchByNamespaceId.length > 0) {
        const namespacesName = await this.namespacesService.getNamespacesNameAsync(searchByNamespaceId);
        const names = [];
        if (namespacesName.length > 0) {
          namespacesName.forEach(element => {
            if (element.parentId !== undefined) {
              const parent = namespacesName.find(data => data.namespaceId.toHex() === element.parentId.toHex());
              names.push({
                id: element.namespaceId,
                name: `${element.name}.${parent.name}`
              });
            }
          });
        }

        // console.log('----namespacesName-----', namespacesName);
        for (let element of searchByNamespaceId) {
          if (mosaicsInfo.length > 0) {
            const currentMosaicInfo = mosaicsInfo.find(elm => elm.mosaicId.toHex() === element.toHex());
            // const currentMosaic = mosaicsName.find(data => data.mosaicId.toHex() === currentMosaicInfo.mosaicId.toHex());
            const data = await this.buildStructureMosaicStorage(mosaicsStorage, element, [], currentMosaicInfo, names);
            if (data) {
              mosaicsStorage.push(data);
            }
          }
        }
      }
    } else {
      mosaicsIds = mosaicsToSearch;
      mosaicsName = [];
      if (mosaicsToSearch) {
        for (let mosaicId of mosaicsToSearch) {
          const currentMosaic = mosaicsName.find(data => data.mosaicId.toHex() === mosaicId.toHex());
          if (currentMosaic && currentMosaic.names.length > 0) {
            const data = await this.buildStructureMosaicStorage(mosaicsStorage, mosaicId, mosaicsName, null);
            if (data) {
              mosaicsStorage.push(data);
            }
          } else {
            // console.log(mosaicId);
            searchByNamespaceId.push(this.namespacesService.getNamespaceId([mosaicId['lower'], mosaicId['higher']]));
            // console.log('Busca la vaina por Namespace entonces menor!');
          }
        }

        if (searchByNamespaceId.length > 0) {
          const namespacesName = await this.namespacesService.getNamespacesNameAsync(searchByNamespaceId);
          const names = [];
          if (namespacesName.length > 0) {
            namespacesName.forEach(element => {
              if (element.parentId !== undefined) {
                const parent = namespacesName.find(data => data.namespaceId.toHex() === element.parentId.toHex());
                names.push({
                  id: element.namespaceId,
                  name: `${parent.name}.${element.name}`
                });
              }
            });
          }
          // console.log('----namespacesName-----', namespacesName);
          for (let element of searchByNamespaceId) {
            const data = await this.buildStructureMosaicStorage(mosaicsStorage, element, [], null, names);
            if (data) {
              mosaicsStorage.push(data);
            }
          }
        }
      } else {
        return [];
      }
    }

    const saveDataStorage = [];
    // console.log(mosaicsStorage);
    /*mosaicsStorage.forEach(element => {
      // console.log(element);
      if (element.mosaicNames.length > 0) {
        saveDataStorage.push(element);
      }
    });*/
    // console.log('mosaicsStorage', mosaicsStorage);
    //localStorage.setItem(this.getNameStorage(), JSON.stringify(saveDataStorage));
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
  async buildStructureMosaicStorage(
    mosaicsStorage: MosaicsStorage[],
    mosaicId: MosaicId,
    mosaicsName: MosaicNames[],
    mosaicInfo: MosaicInfo,
    namespaceName: any[] = null
  ): Promise<MosaicsStorage> {
    /* console.log('------mosaicId------', mosaicId);
     console.log('-----buildStructureMosaicStorage mosaicInfo-----', mosaicInfo);*/
    // Check if the mosaics id exists in storage
    const existMosaic = mosaicsStorage.find(key => this.proximaxProvider.getMosaicId(key.id).toHex() === mosaicId.toHex());
    // Mosaic does not exist in storage
    if (existMosaic === undefined || existMosaic === null) {
      let name = [];
      if (namespaceName !== null && namespaceName !== undefined) {
        // From the arrangement of the mosaics name, filter the mosaic name data by the mosaic id
        const data = namespaceName.find(data => data.id.toHex() === mosaicId.toHex());
        // console.log('by namespace', data);
        if (data !== undefined) {
          name = [data.name];
        }
      } else {
        // From the arrangement of the mosaics name, filter the mosaic name data by the mosaic id
        const data = mosaicsName.find(data => data.mosaicId.toHex() === mosaicId.toHex());
        name = data.names;
        // console.log('by mosaicname', data);
      }

      // If mosaicName is defined
      if (name) {
        // console.log('name------------');
        const infoComplete = (mosaicInfo) ? true : false;
        // Push to the array of mosaicsStorage
        return {
          id: [mosaicId.id.lower, mosaicId.id.higher],
          mosaicNames: new MosaicNames(new MosaicId([mosaicId.id.lower, mosaicId.id.higher]), name),
          mosaicInfo: mosaicInfo,
          infoComplete: infoComplete
        };
      } else {
        // console.log('name------------');
        const infoComplete = (mosaicInfo) ? true : false;
        // Push to the array of mosaicsStorage
        return {
          id: [mosaicId.id.lower, mosaicId.id.higher],
          mosaicNames: [],
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


export interface MosaicsStorage {
  id: number[];
  mosaicNames: MosaicNames | any;
  mosaicInfo: MosaicInfo;
  infoComplete: boolean;
}

export interface MosaicXPXInterface {
  mosaic: "prx.xpx",
  mosaicId: "0dc67fbe1cad29e3",
  divisibility: 6
}
