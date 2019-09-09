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
      mosaicsId.forEach(element => {
        const existMosaic = mosaicsFound.find(x => x.mosaicId.id.toHex() === element.id.toHex());
        if (!existMosaic) {
          findMosaicsByNamespace.push(element);
        }
      });

      // Search mosaics by namespace Id
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

      this.saveMosaicStorage(mosaicsTosaved);
      return mosaicsTosaved;
    } catch (error) {}
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

}


export interface MosaicsStorage {
  idMosaic: number[];
  mosaicNames: MosaicNames;
  mosaicInfo: MosaicInfo;
}
