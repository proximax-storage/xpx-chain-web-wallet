import { Injectable } from "@angular/core";
import {
  MosaicInfo,
  MosaicId,
  MosaicView,
  NamespaceId
} from "tsjs-xpx-chain-sdk";
import { MosaicNames } from "tsjs-xpx-chain-sdk/dist/src/model/mosaic/MosaicNames";
import { ProximaxProvider } from "../../shared/services/proximax.provider";
import { NamespacesService } from "./namespaces.service";
import { WalletService } from '../../wallet/services/wallet.service';
import { environment } from 'src/environments/environment';
import { mosaicId } from 'js-xpx-chain-library';
import { Observable, BehaviorSubject } from 'rxjs';

export interface NamespaceLinkedMosaic {
  mosaicId: MosaicId,
  namespaceId: NamespaceId
}

@Injectable({
  providedIn: "root"
})
export class MosaicService {

  increment = 0;
  mosaicsViewCache: MosaicView[] = [];

  private mosaicChangedSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  private mosaicChanged$: Observable<number> = this.mosaicChangedSubject.asObservable();

  constructor(
    private namespacesService: NamespacesService,
    private proximaxProvider: ProximaxProvider,
    private walletService: WalletService
  ) { }


  /**
   *
   *
   * @param {MosaicId[]} mosaicsId
   * @returns {Promise<MosaicNames[]>}
   * @memberof MosaicService
   */
  async getMosaicsName(mosaicsId: MosaicId[]): Promise<MosaicNames[]> {
    return await this.proximaxProvider.mosaicHttp.getMosaicNames(mosaicsId).toPromise();
  }

  /**
   *
   *
   * @param {((MosaicId | NamespaceId)[])} findMosaicsByNamespace
   * @returns {Promise<MosaicsStorage[]>}
   * @memberof MosaicService
   */
  async searchMosaicFromNamespace(findMosaicsByNamespace: (MosaicId | NamespaceId)[]): Promise<MosaicsStorage[]> {
    const mosaicsTosaved: MosaicsStorage[] = [];
    if (findMosaicsByNamespace.length > 0) {
      const searchMosaicById: MosaicId[] = [];
      const savedLinked: NamespaceLinkedMosaic[] = [];
      for (let id of findMosaicsByNamespace) {
        const namespaceId = this.proximaxProvider.getNamespaceId([id.id.lower, id.id.higher]);
        const mosaicIdLinked = await this.proximaxProvider.getLinkedMosaicId(namespaceId).toPromise();
        if (mosaicIdLinked) {
          savedLinked.push({
            mosaicId: mosaicIdLinked,
            namespaceId: namespaceId
          });
          searchMosaicById.push(mosaicIdLinked);
        }
      }

      if (searchMosaicById.length > 0) {
        const otherMosaicsFound: MosaicInfo[] = await this.proximaxProvider.getMosaics(searchMosaicById).toPromise();
        // const namespaceName: NamespaceName[] = await this.namespacesService.getNamespacesName(savedLinked.map(x => x.namespaceId));
        const mosaicsName: MosaicNames[] = await this.getMosaicsName(savedLinked.map(x => x.mosaicId));
        // console.log('---mosaicsName---', mosaicsName);
        otherMosaicsFound.forEach(infoMosaic => {
          const dataFiltered = savedLinked.find(x => x.mosaicId.toHex() === infoMosaic.mosaicId.toHex());
          const mosaicIdFiltered = (dataFiltered) ? [dataFiltered.namespaceId.id.lower, dataFiltered.namespaceId.id.higher] : null;
          if (mosaicIdFiltered) {
            mosaicsTosaved.push({
              idMosaic: mosaicIdFiltered,
              mosaicNames: (mosaicsName) ? mosaicsName.find(x => x.mosaicId.toHex() === dataFiltered.mosaicId.toHex()) : null,
              mosaicInfo: infoMosaic
            });
          }
        });
      }
    }

    return mosaicsTosaved;
  }

  /**
   *
   *
   * @param {MosaicId[]} mosaicsId
   * @memberof MosaicService
   */
  async searchInfoMosaics(mosaicsId: MosaicId[]): Promise<MosaicsStorage[]> {
    try {
      let findMosaicsByNamespace: (MosaicId | NamespaceId)[] = [];
      let mosaicsTosaved: MosaicsStorage[] = [];
      let mosaicsFound: MosaicInfo[] = await this.proximaxProvider.getMosaics(mosaicsId).toPromise();
      console.log('MIS MOSAICOS ENCONTRADOS ---> ', mosaicsFound);
      mosaicsId.forEach(element => {
        const existMosaic = mosaicsFound.find(x => x.mosaicId.id.toHex() === element.id.toHex());
        if (!existMosaic) {
          findMosaicsByNamespace.push(element);
        }
      });

      if (findMosaicsByNamespace.length > 0) {
        const otherMosaics = await this.searchMosaicFromNamespace(findMosaicsByNamespace);
        otherMosaics.forEach(element => {
          mosaicsTosaved.push(element);
        });
      }


      if (mosaicsFound.length > 0) {
        const mosaicsName: MosaicNames[] = await this.getMosaicsName(mosaicsId);
        mosaicsFound.forEach(infoMosaic => {
          mosaicsTosaved.push({
            idMosaic: [infoMosaic.mosaicId.id.lower, infoMosaic.mosaicId.id.higher],
            mosaicNames: (mosaicsName) ? mosaicsName.find(x => x.mosaicId.toHex() === infoMosaic.mosaicId.toHex()) : null,
            mosaicInfo: infoMosaic
          });
        });
      }

      // console.log('MOSAICS TO SAVED ---> ', mosaicsTosaved);
      this.saveMosaicStorage(mosaicsTosaved);
      return mosaicsTosaved;
    } catch (error) {
      // console.log('---ERROR---');
    }
  }


  /**
   *
   *
   * @param {MosaicId[]} mosaicsId
   * @memberof MosaicService
   */
  async saveMosaicStorage(mosaicsTosaved: MosaicsStorage[]) {
    let mosaicsStorage: MosaicsStorage[] = this.getMosaicsFromStorage();
    mosaicsTosaved.forEach(element => {
      if (mosaicsStorage.length > 0) {
        mosaicsStorage = mosaicsStorage.filter(x =>
          this.proximaxProvider.getMosaicId(x.idMosaic).toHex() !==
          this.proximaxProvider.getMosaicId(element.idMosaic).toHex()
        );
        mosaicsStorage.push(element);
      } else {
        mosaicsStorage.push(element);
      }
    });

    // console.log('mosaicsTosavedStorage', mosaicsTosaved);
    this.setMosaicChanged();
    localStorage.setItem(this.getItemMosaicStorage(), JSON.stringify(mosaicsStorage));
  }


  /**
   *
   *
   * @memberof MosaicService
   */
  async filterMosaics(mosaicsId: MosaicId[] = null): Promise<MosaicsStorage[]> {
    // console.log('---MOSAICS TO FILTER----', mosaicsId);
    if (mosaicsId) {
      const mosaicsFromStorage: MosaicsStorage[] = this.getMosaicsFromStorage();
      if (mosaicsFromStorage.length > 0) {
        const dataReturn: MosaicsStorage[] = [];
        const toSearch: MosaicId[] = [];
        mosaicsId.forEach(element => {
          const exist = mosaicsFromStorage.find(x => this.proximaxProvider.getMosaicId(x.idMosaic).toHex() === element.toHex());
          (exist) ? dataReturn.push(exist) : toSearch.push(element);
        });

        if (toSearch.length > 0) {
          const mosaicsSearched = await this.searchInfoMosaics(toSearch);
          if (mosaicsSearched.length > 0) {
            mosaicsSearched.forEach(element => {
              dataReturn.push(element);
            });
          }
        }

        return dataReturn;
      } else {
        const infoMosaics: MosaicsStorage[] = await this.searchInfoMosaics(mosaicsId);
        return infoMosaics;
      }
    } else {
      const accountInfo = await this.walletService.filterAccountInfo(this.walletService.currentAccount.name);
      if (accountInfo && accountInfo.accountInfo && accountInfo.accountInfo.mosaics && accountInfo.accountInfo.mosaics.length > 0) {
        const mosaicsId = accountInfo.accountInfo.mosaics.map(x => x.id);
        return this.filterMosaics(mosaicsId);
      } else {
        return [];
      }
    }
  }


  /**
   *
   *
   * @returns {Observable<boolean>}
   * @memberof MosaicService
   */
  getMosaicChanged(): Observable<number> {
    return this.mosaicChanged$;
  }

  /**
    *
    *
    * @returns
    * @memberof MosaicService
    */
  getItemMosaicStorage() {
    return environment.nameKeyMosaicStorage;
  }

  /**
  *
  *
  * @returns {MosaicsStorage[]}
  * @memberof MosaicService
  */
  getMosaicsFromStorage(): MosaicsStorage[] {
    const dataStorage = localStorage.getItem(this.getItemMosaicStorage());
    return (dataStorage !== null && dataStorage !== undefined) ? JSON.parse(dataStorage) : [];
  }

  /**
   *
   *
   * @memberof MosaicService
   */
  resetMosaicsStorage() {
    localStorage.removeItem(this.getItemMosaicStorage());
  }

  /**
   *
   *
   * @memberof MosaicService
   */
  setMosaicChanged() {
    this.mosaicChangedSubject.next(this.increment + 1);
  }


  /**
   *
   *
   * @param {NamespaceLinkedMosaic[]} data
   * @memberof MosaicService
   */
  saveLinkedMosaic(data: NamespaceLinkedMosaic[]) {
    const dataStorage = localStorage.getItem(environment.nameKeyMosaicNamespaceLinked);
    const dataFormatter: NamespaceLinkedMosaic[] = (dataStorage !== null && dataStorage !== undefined) ? JSON.parse(dataStorage) : [];
    if (dataFormatter.length > 0) {
      data.forEach(element => {
        const exist = dataFormatter.find(x =>
          this.proximaxProvider.getNamespaceId([x.namespaceId.id.lower, x.namespaceId.id.higher]) ===
          this.proximaxProvider.getMosaicId([x.mosaicId.id.lower, x.mosaicId.id.higher])
        );

        if (!exist) {
          dataFormatter.push(element);
        }
      });
    } else {
      data.forEach(element => {
        dataFormatter.push(element);
      });
    }

    localStorage.setItem(environment.nameKeyMosaicNamespaceLinked, JSON.stringify(dataFormatter));
  }



  // ----------------------------------------------------------------------------------------------------------------



  /**
   *
   *
   * @param {MosaicId[]} mosaicsId
   * @returns
   * @memberof MosaicService
   */
  async getNameMosaics2(mosaicsId: MosaicId[]): Promise<MosaicNames[]> {
    return await this.proximaxProvider.mosaicHttp.getMosaicNames(mosaicsId).toPromise();
  }

  /**
   * Search mosaics by mosaicsId
   *
   * @param {MosaicId[]} mosaicsId
   * @returns
   * @memberof MosaicService
   */
  async searchMosaics2(mosaicsId: MosaicId[]): Promise<MosaicsStorage[]> {
    // console.log('mosaicsId---> ', mosaicsId);
    const mosaicsStorage = [];
    const mosaicsToSearch = [];
    //Filter mosaics to search
    mosaicsId.forEach(mosaicId => {
      // Filter and get the storage mosaic from mosaicId
      const filterMosaic = this.filterMosaic2(mosaicId);
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
        await this.saveMosaicsStorage2(mosaicsInfo, null);
        for (let elm of Object.keys(mosaicsInfo)) {
          // Filter and get the storage mosaic from mosaicId
          const filterMosaic = this.filterMosaic2(mosaicsInfo[elm].mosaicId);
          if (filterMosaic) {
            // If the mosaic exists in storage, it is added to the variable mosaicsStorage to be returned later
            mosaicsStorage.push(filterMosaic);
          }
        }

        if (infoMosaicsNotFound.length > 0) {
          // Pass the variable infoMosaicsNotFound per parameter to saveMosaicsStorage to find only the name of the mosaic and save in storage
          await this.saveMosaicsStorage2([], infoMosaicsNotFound);
          for (let mosaicId of mosaicsId) {
            const filterMosaic = this.filterMosaic2(mosaicId);
            if (filterMosaic) {
              mosaicsStorage.push(filterMosaic);
            }
          }
        }
      } else {
        if (mosaicsToSearch.length > 0) {
          // Pass the variable mosaicsToSearch per parameter to saveMosaicsStorage to find only the name of the mosaic and save in storage
          await this.saveMosaicsStorage2([], mosaicsToSearch);
          for (let mosaicId of mosaicsId) {
            const filterMosaic = this.filterMosaic2(mosaicId);
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
  async searchMosaicsFromAccountStorage$2(): Promise<MosaicsStorage[]> {
    const mosaicFound = [];
    const mosaicsToSearch: MosaicId[] = [];
    const accountInfo = this.walletService.filterAccountInfo();
    // console.log(accountInfo);
    if (accountInfo !== undefined) {
      // Map mosaics of an account
      const mosaicsFromAccount: MosaicsStorage[] = await this.searchMosaics2(accountInfo.accountInfo.mosaics.map(n => n.id));
      // console.log(mosaicsFromAccount);
      // Valid if the account has tiles
      if (mosaicsFromAccount.length > 0) {
        //Starts the mosaic loop of an account
        for (let element of mosaicsFromAccount) {
          //Find the id of a mosaic
          const mosaicId = this.proximaxProvider.getMosaicId(element.idMosaic);
          // Filter if the mosaic exists in the storage
          const existMosaic = this.filterMosaic2(mosaicId);
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
          const response = await this.searchMosaics2(mosaicsToSearch);
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
  async saveMosaicsStorage2(mosaicsInfo: MosaicInfo[], mosaicsToSearch?: MosaicId[]) {
    // searchByNamespaceId
    const searchByNamespaceId: NamespaceId[] = [];
    //get mosaics from storage
    const mosaicsStorage = this.getMosaicsFromStorage();
    //filter mosaics id from mosaicsInfo params
    let mosaicsIds = [];
    // If the mosaic identification has data, look for the names of the tiles. This must return an array of mosaics name
    let mosaicsName = [];

    if (mosaicsInfo.length > 0) {
      mosaicsIds = mosaicsInfo.map(data => data.mosaicId);
      mosaicsName = await this.getNameMosaics2(mosaicsIds);
      for (let mosaicInfo of mosaicsInfo) {
        const currentMosaic = mosaicsName.find(data => data.mosaicId.toHex() === mosaicInfo.mosaicId.toHex());
        if (currentMosaic && currentMosaic.names.length > 0) {
          const data = await this.buildStructureMosaicStorage2(mosaicsStorage, mosaicInfo.mosaicId, mosaicsName, mosaicInfo);
          if (data) {
            mosaicsStorage.push(data);
          }
        } else {
          searchByNamespaceId.push(this.namespacesService.getNamespaceId([mosaicInfo.mosaicId.id.lower, mosaicInfo.mosaicId.id.higher]));
        }
      }

      if (searchByNamespaceId.length > 0) {
        const namespacesInfo = await this.namespacesService.getNamespaceFromId(searchByNamespaceId);
        const names = [];
        if (namespacesInfo.length > 0) {
          namespacesInfo.forEach(element => {
            if (element.namespaceName !== undefined && element.namespaceName !== null) {
              const parent = namespacesInfo.find(data =>
                this.namespacesService.getNamespaceId([data.namespaceName.namespaceId.id.lower, data.namespaceName.namespaceId.id.higher]).toHex() ===
                this.namespacesService.getNamespaceId([element.namespaceName.parentId.id.lower, element.namespaceName.parentId.id.higher]).toHex()
              );

              names.push({
                id: element.namespaceName.namespaceId,
                name: `${element.namespaceName.name}.${parent.namespaceName.name}`
              });
            }
          });
        }

        // console.log('----namespacesName-----', namespacesName);
        for (let element of searchByNamespaceId) {
          if (mosaicsInfo.length > 0) {
            const currentMosaicInfo = mosaicsInfo.find(elm => elm.mosaicId.toHex() === element.toHex());
            // const currentMosaic = mosaicsName.find(data => data.mosaicId.toHex() === currentMosaicInfo.mosaicId.toHex());
            const data = await this.buildStructureMosaicStorage2(mosaicsStorage, element, [], currentMosaicInfo, names);
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
            const data = await this.buildStructureMosaicStorage2(mosaicsStorage, mosaicId, mosaicsName, null);
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
          const namespacesInfo = await this.namespacesService.getNamespaceFromId(searchByNamespaceId);
          const names = [];
          if (namespacesInfo.length > 0) {
            namespacesInfo.forEach(element => {
              // console.log(element);
              if (element.namespaceName !== undefined && element.namespaceName !== null) {
                const parent = namespacesInfo.find(data =>
                  this.namespacesService.getNamespaceId([data.namespaceName.namespaceId.id.lower, data.namespaceName.namespaceId.id.higher]).toHex() ===
                  this.namespacesService.getNamespaceId([element.namespaceName.parentId.id.lower, element.namespaceName.parentId.id.higher]).toHex()
                );

                names.push({
                  id: element.namespaceName.namespaceId,
                  name: `${element.namespaceName.name}.${parent.namespaceName.name}`
                });
              }
            });
          }
          // console.log('----namespacesName-----', namespacesName);
          for (let element of searchByNamespaceId) {
            const data = await this.buildStructureMosaicStorage2(mosaicsStorage, element, [], null, names);
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
    localStorage.setItem(this.getItemMosaicStorage(), JSON.stringify(mosaicsStorage));
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
  async buildStructureMosaicStorage2(mosaicsStorage: MosaicsStorage[], mosaicId: MosaicId, mosaicsName: MosaicNames[], mosaicInfo: MosaicInfo, namespaceName: any[] = null): Promise<MosaicsStorage> {
    /* console.log('------mosaicId------', mosaicId);
     console.log('-----buildStructureMosaicStorage mosaicInfo-----', mosaicInfo);*/
    // Check if the mosaics id exists in storage
    const existMosaic = mosaicsStorage.find(key => this.proximaxProvider.getMosaicId(key.idMosaic).toHex() === mosaicId.toHex());
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
          idMosaic: [mosaicId.id.lower, mosaicId.id.higher],
          mosaicNames: new MosaicNames(new MosaicId([mosaicId.id.lower, mosaicId.id.higher]), name),
          mosaicInfo: mosaicInfo
        };
      } else {
        // console.log('name------------');
        const infoComplete = (mosaicInfo) ? true : false;
        // Push to the array of mosaicsStorage
        return {
          idMosaic: [mosaicId.id.lower, mosaicId.id.higher],
          mosaicNames: null,
          mosaicInfo: mosaicInfo
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
  filterMosaic2(mosaicId: MosaicId): MosaicsStorage {
    const mosaicsStorage = this.getMosaicsFromStorage();
    console.log(mosaicsStorage);
    if (mosaicsStorage !== null && mosaicsStorage !== undefined) {
      if (mosaicsStorage.length > 0) {
        const filtered = mosaicsStorage.find(element => {

          return this.proximaxProvider.getMosaicId(element.idMosaic).toHex() === mosaicId.toHex();
        });

        return filtered;
      }
    }

    return null;
  }
}


export interface MosaicsStorage {
  idMosaic: number[];
  mosaicNames: MosaicNames;
  mosaicInfo: MosaicInfo;
}
