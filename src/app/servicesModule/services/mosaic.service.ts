import { Injectable } from "@angular/core";
import {
  MosaicInfo,
  MosaicId,
  MosaicView,
  Address,
  Mosaic,
  Namespace,
  NamespaceId,
  QueryParams,
  NamespaceName
} from "tsjs-xpx-catapult-sdk";
import { ProximaxProvider } from "../../shared/services/proximax.provider";
import { WalletService } from "../../shared/services/wallet.service";
import { TransactionsService } from "../../transactions/service/transactions.service";
import { ToastService } from "ng-uikit-pro-standard";
import { MosaicsStorage } from "../interfaces/mosaics-namespaces.interface";
import { MosaicXPXInterface } from "../../dashboard/services/transaction.interface";
import { MosaicName } from "proximax-nem2-sdk";

@Injectable({
  providedIn: "root"
})
export class MosaicService {
  // private balance: BehaviorSubject<any> = new BehaviorSubject<any>("0.000000");
  // private balance$: Observable<any> = this.balance.asObservable();

  mosaicsViewCache: MosaicView[] = [];
  mosaicXpx: MosaicXPXInterface = {
    mosaic: "prx:xpx",
    mosaicId: "d423931bd268d1f4",
    divisibility: 6
  };

  constructor(
    private proximaxProvider: ProximaxProvider,
    private toastrService: ToastService
  ) { }

  /**
   *
   *
   * @param {NamespaceId} namespaceId
   * @memberof MosaicService
   */
  /*async buildMosaicsFromNamespace(namespaceId: NamespaceId) {
    this.getMosaicsFromNamespace(namespaceId)
      .then(response => {
        // console.log("getMosaicsFromNamespace", response);
        if (response.length > 0) {
          this.saveMosaicsStorage(response);
        }
      })
      .catch(() => {
        const options = {
          closeButton: true,
          tapToDismiss: false,
          toastClass: "toastError"
        };
        this.toastrService.error(
          "Has ocurred a unexpected error, possible causes: the network is offline",
          "",
          options
        );
      });
  }*/

  /**
   *
   *
   * @param {MosaicId[]} mosaicsId
   * @returns
   * @memberof MosaicService
   */
  /*async getNameMosaics(mosaicsId: MosaicId[]): Promise<MosaicName[]> {
    return await this.proximaxProvider.mosaicHttp
      .getMosaicsName(mosaicsId)
      .toPromise();
  }*/

  /**
   *
   *
   * @param {NamespaceId[]} namespaceId
   * @returns
   * @memberof MosaicService
   */
  /* async getNameNamespace(namespaceId: NamespaceId[]) {
     return await this.proximaxProvider.namespaceHttp
       .getNamespacesName(namespaceId)
       .toPromise();
   }*/

  /**
   *
   *
   * @param {Address} address
   * @param {boolean} [searchXpx=true]
   * @returns
   * @memberof MosaicService
   */
  /* async getMosaicFromAddress(address: Address, searchXpx: boolean = true) {
     const promise = await new Promise(async (resolve, reject) => {
       const accountInfo = await this.proximaxProvider.accountHttp.getAccountInfo(address).toPromise();
       // console.log("accountInfo", accountInfo);
       let mosaicsId = [];
       if (searchXpx) {
         mosaicsId = accountInfo.mosaics.map((mosaic: Mosaic) => {
           return mosaic.id;
         });
       } else {
         accountInfo.mosaics.forEach((mosaic: Mosaic) => {
           if (mosaic.id.toHex() !== "d423931bd268d1f4") {
             return mosaicsId.push(mosaic.id);
           }
         });
       }

       let response = {};
       if (mosaicsId.length > 0) {
         const mosaicsName: MosaicName[] = await this.getNameMosaics(mosaicsId);
         // console.log("mosaicsName", mosaicsName);
         const namespacesId = mosaicsName.map((mosaicsName: MosaicName) => {
           return mosaicsName.namespaceId;
         });
         response = {
           mosaicsName: mosaicsName,
           namespaceName: await this.getNameNamespace(namespacesId)
         };
       }

       resolve(response);
     });

     return await promise;
   }*/

  /**
   * Search mosaics by mosaicsId
   *
   * @param {MosaicId[]} mosaicsId
   * @returns
   * @memberof MosaicService
   */
  /* async searchMosaics(mosaicsId: MosaicId[]): Promise<MosaicsStorage[]> {
     const mosaicsStorage = [];
     const mosaicsToSearch = [];
     //Filter mosaics to search
     mosaicsId.forEach(mosaicId => {
       // Filter and get the storage mosaic from mosaicId
       const filterMosaic = this.filterMosaic(mosaicId);
       // In case there is no mosaic in storage, add the id in mosaicsToSearch to be searched later
       (filterMosaic === undefined || filterMosaic === null) ? mosaicsToSearch.push(mosaicId.id) : mosaicsStorage.push(filterMosaic);
     });

     // console.log(mosaicsToSearch);
     if (mosaicsToSearch.length > 0) {
       // Gets MosaicInfo for different mosaicIds.
       const mosaicsInfo = await this.proximaxProvider.getMosaics(mosaicsToSearch).toPromise();
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
   }*/

  /**
   *
   *
   * @param {MosaicInfo[]} mosaicsInfo
   * @param {NamespaceName[]} [namespaceName]
   * @returns
   * @memberof MosaicService
   */
  /* async saveMosaicsStorage(mosaicsInfo: MosaicInfo[], mosaicsToSearch?: MosaicId[]) {
     //get mosaics from storage
     const mosaicsStorage = this.getMosaicsFromStorage();
     //filter mosaics id from mosaicsInfo params
     const mosaicsIds = (mosaicsInfo.length > 0) ? mosaicsInfo.map(data => data.mosaicId) : mosaicsToSearch;
     // If the mosaic identification has data, look for the names of the tiles. This must return an array of mosaics name
     const mosaicsName = (mosaicsIds.length > 0) ? await this.getNameMosaics(mosaicsIds) : [];
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
   }*/

  /*async buildStructureMosaicStorage(mosaicsStorage: MosaicsStorage[], mosaicId: MosaicId, mosaicsName: MosaicName[], mosaicInfo: MosaicInfo): Promise<MosaicsStorage> {
    // Check if the mosaics id exists in storage
    const existMosaic = mosaicsStorage.find(key => this.proximaxProvider.getMosaicId(key.id).toHex() === mosaicId.toHex());
    // Mosaic does not exist in storage
    if (existMosaic === undefined || existMosaic === null) {
      // From the arrangement of the mosaics name, filter the mosaic name data by the mosaic id
      const mosaicName = mosaicsName.find(data => data.mosaicId.toHex() === mosaicId.toHex());
      // If mosaicName is defined
      if (mosaicName) {
        const namespaceId = (mosaicInfo) ? [mosaicInfo.namespaceId] : [mosaicName.namespaceId];
        const x = await this.proximaxProvider.namespaceHttp.getNamespacesName(namespaceId).toPromise();
        const infoComplete = (mosaicInfo) ? true : false;

        // Push to the array of mosaicsStorage
        return {
          id: [mosaicName.mosaicId.id.lower, mosaicName.mosaicId.id.higher],
          namespaceName: x[0],
          mosaicName: mosaicName,
          mosaicInfo: mosaicInfo,
          infoComplete: infoComplete
        };

      }
    }

    return null;
  }*/

  /**
   * Filter mosaic by mosaicId
   *
   * @param {MosaicId} mosaicId
   * @returns
   * @memberof MosaicService
   */
  /* filterMosaic(mosaicId: MosaicId): MosaicsStorage {
     const mosaicsStorage = this.getMosaicsFromStorage();
     if (mosaicsStorage.length > 0) {
       const filtered = mosaicsStorage.find(element => {
         return this.proximaxProvider.getMosaicId(element.id).toHex() === mosaicId.toHex();
       });

       return filtered;
     }
   }*/

  /**
   *
   *
   * @returns
   * @memberof MosaicService
   */
  /*  getNameStorage() {
      return `proximax-mosaics`;
      // return `proximax-mosaics-${this.walletService.address.address.substr(4, 12)}`;
    }*/

  /**
   *
   *
   * @param {NamespaceId} namespaceId
   * @param {QueryParams} [queryParams]
   * @returns {Observable<MosaicInfo[]>}
   * @memberof MosaicService
   */
  /*getMosaicsFromNamespace(namespaceId: NamespaceId, queryParams?: QueryParams): Promise<MosaicInfo[]> {
    return this.proximaxProvider.mosaicHttp
      .getMosaicsFromNamespace(namespaceId, queryParams)
      .toPromise();
  }*/

  /**
   *
   *
   * @returns {MosaicsStorage[]}
   * @memberof MosaicService
   */
  /* getMosaicsFromStorage(): MosaicsStorage[] {
     const dataStorage = localStorage.getItem(this.getNameStorage());
     return dataStorage === null ? [] : JSON.parse(dataStorage);
   }*/
}
