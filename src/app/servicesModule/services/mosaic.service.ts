import { Injectable } from '@angular/core';
import {
  MosaicInfo,
  MosaicId,
  MosaicView,
  NamespaceId
} from 'tsjs-xpx-chain-sdk';
import { MosaicNames } from 'tsjs-xpx-chain-sdk/dist/src/model/mosaic/MosaicNames';
import { Observable, BehaviorSubject } from 'rxjs';
import { ProximaxProvider } from '../../shared/services/proximax.provider';
import { WalletService } from '../../wallet/services/wallet.service';
import { environment } from '../../../environments/environment';

export interface NamespaceLinkedMosaic {
  mosaicId: MosaicId;
  namespaceId: NamespaceId;
}

@Injectable({
  providedIn: 'root'
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
    return await this.proximaxProvider.mosaicHttp.getMosaicsNames(mosaicsId).toPromise(); // Update-sdk-dragon
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
      for (const id of findMosaicsByNamespace) {
        // convierto ese mosaico id a nemespace id
        const namespaceId = this.proximaxProvider.getNamespaceId([id.id.lower, id.id.higher]);
        // consulta si ese namespaceId esta linkeado a un mosaicId y retorna el mosaico Id
        const mosaicIdLinked = await this.proximaxProvider.getLinkedMosaicId(namespaceId).toPromise();
        // si esta linkeado...
        if (mosaicIdLinked) {
          // almacena que ese mosaic id esta linkeado a un namespace
          savedLinked.push({
            mosaicId: mosaicIdLinked,
            namespaceId
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
      const mosaicsTosaved: MosaicsStorage[] = [];
      if (mosaicsId.length > 0) {
        const findMosaicsByNamespace: (MosaicId | NamespaceId)[] = [];
        // le paso todos los mosaicsIds a la consulta
        const mosaicsFound: MosaicInfo[] = await this.proximaxProvider.getMosaics(mosaicsId).toPromise();
        // console.log('mosaicsFound', mosaicsFound);
        // Recorro los mosaics Ids
        mosaicsId.forEach(element => {
          // Filtra si el mosaico id fue encontrado
          const existMosaic = mosaicsFound.find(x => x.mosaicId.id.toHex() === element.id.toHex());
          if (!existMosaic) {
            // Si no fue encontrado, busca mosaicos por namespace
            findMosaicsByNamespace.push(element);
          }
        });

        // console.log('findMosaicsByNamespace', findMosaicsByNamespace);
        // Search mosaics by namespace Id
        if (findMosaicsByNamespace.length > 0) {
          // busca los namespaceId de los mosaicos que no fueron encontrados
          const otherMosaics = await this.searchMosaicFromNamespace(findMosaicsByNamespace);
          // console.log('otherMosaics', otherMosaics);
          otherMosaics.forEach(element => {
            mosaicsTosaved.push(element);
          });
        }


        if (mosaicsFound.length > 0) {
          const mosaicsName: MosaicNames[] = await this.getMosaicsName(mosaicsId);
          mosaicsFound.forEach(infoMosaic => {
            try {
              const existMosaicName = (mosaicsName) ? mosaicsName.find(x => x.mosaicId.toHex() === infoMosaic.mosaicId.toHex()) : null;
              mosaicsTosaved.push({
                idMosaic: [infoMosaic.mosaicId.id.lower, infoMosaic.mosaicId.id.higher],
                isNamespace: (existMosaicName && existMosaicName.names && existMosaicName.names.length > 0) ?
                  [existMosaicName.names[0].namespaceId.id.lower, existMosaicName.names[0].namespaceId.id.higher] :
                  null,
                mosaicNames: existMosaicName,
                mosaicInfo: infoMosaic
              });
            } catch (error) {
              // console.log('Has ocurred a error with search mosaics', error);
            }
          });
        }
      }

      this.saveMosaicStorage(mosaicsTosaved);
      return mosaicsTosaved;
    } catch (error) {
      console.error('Has ocurred a error with search mosaics', error);
    }
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
      for (const element of mosaicsTosaved) {
        if (mosaicsStorage.length > 0) {
          const mosaicIdToSaved = this.proximaxProvider.getMosaicId(element.idMosaic).toHex();
          const elementStorage = mosaicsStorage.find(x => this.proximaxProvider.getMosaicId(x.idMosaic).toHex() === mosaicIdToSaved);
          if (elementStorage) {
            // Verifica si en cache tiene namespaceId y si en el nuevo no trajo namespaceId
            if (elementStorage.isNamespace && !element.isNamespace) {
              // Si en cache tiene namespace, verifica si todavía está linkeado a ese namespace
              try {
                const mosaicIdLinked = await this.proximaxProvider.getLinkedMosaicId(this.proximaxProvider.getNamespaceId(elementStorage.isNamespace)).toPromise();
                if (mosaicIdLinked && (mosaicIdLinked.toHex() === mosaicIdToSaved)) {
                  element.isNamespace = elementStorage.isNamespace;
                }
              } catch (error) {
              }
            }
          }

          // reemplazo la información del mosaico
          mosaicsStorage = mosaicsStorage.filter(x => this.proximaxProvider.getMosaicId(x.idMosaic).toHex() !== mosaicIdToSaved);
        }
        mosaicsStorage.push(element);
      }

      localStorage.setItem(this.getItemMosaicStorage(), JSON.stringify(mosaicsStorage));
      this.setMosaicChanged();
    }
  }


  /**
   *
   *
   * @memberof MosaicService
   */
  async filterMosaics(mosaicsId: MosaicId[] = null, byAccount = ''): Promise<MosaicsStorage[]> {
    if (mosaicsId) {
      const mosaicsFromStorage: MosaicsStorage[] = this.getMosaicsFromStorage();
      if (mosaicsFromStorage.length > 0) {
        const dataReturn: MosaicsStorage[] = [];
        const toSearch: MosaicId[] = [];
        mosaicsId.forEach(element => {
          const existMosaic = mosaicsFromStorage.find(x => this.proximaxProvider.getMosaicId(x.idMosaic).toHex() === element.toHex());
          if (existMosaic) {
            dataReturn.push(existMosaic);
          } else {
            // tslint:disable-next-line: no-shadowed-variable
            const existMosaic = mosaicsFromStorage.find(x => (x.isNamespace) ? this.proximaxProvider.getMosaicId(x.isNamespace).toHex() === element.toHex() : undefined);
            if (existMosaic) {
              dataReturn.push(existMosaic);
            } else {
              toSearch.push(element);
            }
          }
        });

        // console.log('toSearch --> ', toSearch);
        if (toSearch.length > 0) {
          const mosaicsSearched = await this.searchInfoMosaics(toSearch);
          if (mosaicsSearched && mosaicsSearched.length > 0) {
            mosaicsSearched.forEach(element => {
              dataReturn.push(element);
            });
          }
        }

        // console.log('aqui 11......', dataReturn);

        return this.filterMosaicToReturn(dataReturn);
      } else {
        const infoMosaics: MosaicsStorage[] = await this.searchInfoMosaics(mosaicsId);
        // console.log('infoMosaics --> ', infoMosaics);
        return this.filterMosaicToReturn(infoMosaics);
      }
    } else {
      const name = (byAccount !== '') ? byAccount : this.walletService.currentAccount.name;
      const accountInfo = this.walletService.filterAccountInfo(name);
      if (accountInfo && accountInfo.accountInfo && accountInfo.accountInfo.mosaics && accountInfo.accountInfo.mosaics.length > 0) {
        return this.filterMosaics(accountInfo.accountInfo.mosaics.map(x => x.id));
      } else {
        return [];
      }
    }
  }



  /**
   *
   *
   * @memberof MosaicService
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
   * @param {MosaicsStorage[]} infoMosaics
   * @returns
   * @memberof MosaicService
   */
  filterMosaicToReturn(infoMosaics: MosaicsStorage[]) {
    const returned: MosaicsStorage[] = [];
    if (infoMosaics && infoMosaics.length > 0) {
      infoMosaics.forEach(element => {
        if (returned.length > 0) {
          const existByNamespace = returned.find(x => (x.isNamespace && element.isNamespace) ?
            this.proximaxProvider.getMosaicId(x.isNamespace).toHex() ===
            this.proximaxProvider.getMosaicId(element.isNamespace).toHex() : undefined
          );

          // search by mosaic
          if (!existByNamespace) {
            const existByMosaic = returned.find(x =>
              this.proximaxProvider.getMosaicId(x.idMosaic).toHex() ===
              this.proximaxProvider.getMosaicId(element.idMosaic).toHex()
            );

            if (!existByMosaic) {
              returned.push(element);
            }
          }
        } else {
          returned.push(element);
        }
      });
    }
    return returned;
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
