import { Injectable } from "@angular/core";
import {
  MosaicInfo,
  MosaicId,
  MosaicView,
  NamespaceId
} from "tsjs-xpx-chain-sdk";
import { MosaicNames } from "tsjs-xpx-chain-sdk/dist/src/model/mosaic/MosaicNames";
import { ProximaxProvider } from "../../shared/services/proximax.provider";
import { WalletService } from '../../wallet/services/wallet.service';
import { environment } from 'src/environments/environment';
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
    return await this.proximaxProvider.mosaicHttp.getMosaicsNames(mosaicsId).toPromise(); //Update-sdk-dragon
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
      // recorro todos los mosaics id o namespaces id
      for (let id of findMosaicsByNamespace) {
        // convierto ese mosaico id a nemespace id
        const namespaceId = this.proximaxProvider.getNamespaceId([id.id.lower, id.id.higher]);
        // consulta si ese namespaceId esta linkeado a un mosaicId y retorna el mosaico Id
        const mosaicIdLinked = await this.proximaxProvider.getLinkedMosaicId(namespaceId).toPromise();
        // si esta linkeado...
        if (mosaicIdLinked) {
          //almacena que ese mosaic id esta linkeado a un namespace
          savedLinked.push({
            mosaicId: mosaicIdLinked,
            namespaceId: namespaceId
          });
          // Busca los mosaics ids encontrados (linkeados)
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
              idMosaic: [infoMosaic.mosaicId.id.lower, infoMosaic.mosaicId.id.higher],
              isNamespace: mosaicIdFiltered,
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
      let mosaicsTosaved: MosaicsStorage[] = [];
      if (mosaicsId.length > 0) {
        let findMosaicsByNamespace: (MosaicId | NamespaceId)[] = [];
        // le paso todos los mosaicsIds a la consulta
        let mosaicsFound: MosaicInfo[] = await this.proximaxProvider.getMosaics(mosaicsId).toPromise();
        // Recorro los mosaics Ids
        mosaicsId.forEach(element => {
          // Filtra si el mosaico id fue encontrado
          const existMosaic = mosaicsFound.find(x => x.mosaicId.id.toHex() === element.id.toHex());
          if (!existMosaic) {
            // Si no fue encontrado, busca mosaicos por namespace
            findMosaicsByNamespace.push(element);
          }
        });

        // Search mosaics by namespace Id
        if (findMosaicsByNamespace.length > 0) {
          // busca los namespaceId de los mosaicos que no fueron encontrados
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
              isNamespace: null,
              mosaicNames: (mosaicsName) ? mosaicsName.find(x => x.mosaicId.toHex() === infoMosaic.mosaicId.toHex()) : null,
              mosaicInfo: infoMosaic
            });
          });
        }
      }

      this.saveMosaicStorage(mosaicsTosaved);
      return mosaicsTosaved;
    } catch (error) { }
  }

  /**
   *
   *
   * @param {MosaicId[]} mosaicsId
   * @memberof MosaicService
   */
  async saveMosaicStorage(mosaicsTosaved: MosaicsStorage[]) {
    if (mosaicsTosaved) {
      let mosaicsStorage: MosaicsStorage[] = this.getMosaicsFromStorage();
      for (let element of mosaicsTosaved) {
        if (mosaicsStorage.length > 0) {
          const mosaicIdToSaved = this.proximaxProvider.getMosaicId(element.idMosaic).toHex();
          const a = mosaicsStorage.find(x => this.proximaxProvider.getMosaicId(x.idMosaic).toHex() === mosaicIdToSaved);
          if (a) {
            // Verifica si en cache tiene namespaceId y si en el nuevo no trajo namespaceId
            if (a.isNamespace && !element.isNamespace) {
              // Si en cache tiene namespace, verifica si todavía está linkeado a ese namespace
              const mosaicIdLinked = await this.proximaxProvider.getLinkedMosaicId(this.proximaxProvider.getNamespaceId(a.isNamespace)).toPromise();
              if (mosaicIdLinked && (mosaicIdLinked.toHex() === mosaicIdToSaved)) {
                element.isNamespace = a.isNamespace;
              }
            }
          }

          // reemplazo la información del mosaico
          mosaicsStorage = mosaicsStorage.filter(x => this.proximaxProvider.getMosaicId(x.idMosaic).toHex() !== mosaicIdToSaved);
        }

        mosaicsStorage.push(element);
      }

      this.setMosaicChanged();
      localStorage.setItem(this.getItemMosaicStorage(), JSON.stringify(mosaicsStorage));
    }
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
          const existMosaic = mosaicsFromStorage.find(x => this.proximaxProvider.getMosaicId(x.idMosaic).toHex() === element.toHex());
          if (existMosaic) {
            dataReturn.push(existMosaic)
          } else {
            const existMosaic = mosaicsFromStorage.find(x => (x.isNamespace) ?
              this.proximaxProvider.getMosaicId(x.isNamespace).toHex() === element.toHex() :
              undefined
            );
            (existMosaic) ? dataReturn.push(existMosaic) : toSearch.push(element);
          }
        });

        if (toSearch.length > 0) {
          const mosaicsSearched = await this.searchInfoMosaics(toSearch);
          if(mosaicsSearched && mosaicsSearched.length > 0) {
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
      const accountInfo = this.walletService.filterAccountInfo(this.walletService.currentAccount.name);
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
   */
  async getMosaicXPX() {
    let existMosaic = null;
    const mosaicsFromStorage: MosaicsStorage[] = this.getMosaicsFromStorage();
    if (mosaicsFromStorage.length > 0) {
      existMosaic = mosaicsFromStorage.find(x => this.proximaxProvider.getMosaicId(x.idMosaic).toHex() === environment.mosaicXpxInfo.id);
    }

    if (!existMosaic) {
      const xpxMosaic = await this.searchMosaicFromNamespace([this.proximaxProvider.getMosaicId(environment.mosaicXpxInfo.namespaceIdUint64)]);
      this.saveMosaicStorage(xpxMosaic);
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
}


export interface MosaicsStorage {
  idMosaic: number[];
  isNamespace: number[];
  mosaicNames: MosaicNames;
  mosaicInfo: MosaicInfo;
}
