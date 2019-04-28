import { Injectable } from "@angular/core";
import {
  MosaicInfo,
  MosaicId,
  MosaicView,
  Address,
  Mosaic,
  MosaicName,
  Namespace,
  NamespaceId,
  QueryParams,
  NamespaceName
} from "proximax-nem2-sdk";
import { NemProvider } from "../../shared/services/nem.provider";
import { WalletService } from "../../shared/services/wallet.service";
import { TransactionsService } from "../../transactions/service/transactions.service";
import { ToastService } from "ng-uikit-pro-standard";
import { MosaicsStorage } from "../interfaces/mosaics-namespaces.interface";
import { MosaicXPXInterface } from "../../dashboard/services/dashboard.interface";

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
    private nemProvider: NemProvider,
    private walletService: WalletService,
    private toastrService: ToastService
  ) { }

  /**
   *
   *
   * @param {NamespaceId} namespaceId
   * @memberof MosaicService
   */
  async buildMosaicsStorage(namespaceId: NamespaceId) {
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
  }

  /**
   *
   *
   * @param {MosaicId[]} mosaicsId
   * @returns
   * @memberof MosaicService
   */
  async getNameMosaics(mosaicsId: MosaicId[]): Promise<MosaicName[]> {
    return await this.nemProvider.mosaicHttp
      .getMosaicsName(mosaicsId)
      .toPromise();
  }

  /**
   *
   *
   * @param {NamespaceId[]} namespaceId
   * @returns
   * @memberof MosaicService
   */
  async getNameNamespace(namespaceId: NamespaceId[]) {
    return await this.nemProvider.namespaceHttp
      .getNamespacesName(namespaceId)
      .toPromise();
  }

  /**
   *
   *
   * @param {Address} address
   * @param {boolean} [searchXpx=true]
   * @returns
   * @memberof MosaicService
   */
  async getMosaicFromAddress(address: Address, searchXpx: boolean = true) {
    const promise = await new Promise(async (resolve, reject) => {
      const accountInfo = await this.nemProvider.accountHttp
        .getAccountInfo(address)
        .toPromise();
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
  }

  /**
   * Search mosaics by mosaicsId
   *
   * @param {MosaicId[]} mosaicsId
   * @returns
   * @memberof MosaicService
   */
  async searchMosaics(mosaicsId: MosaicId[]): Promise<MosaicsStorage[]> {
    // console.log("mosaicsId", mosaicsId);
    const infoMosaics = [];
    const mosaicsToSearch = [];
    mosaicsId.forEach(mosaicId => {
      const filterMosaic = this.filterMosaic(mosaicId);
      if (filterMosaic === undefined) {
        mosaicsToSearch.push(mosaicId);
      } else {
        infoMosaics.push(filterMosaic);
      }
    });

    // Search info mosaics
    if (mosaicsToSearch.length > 0) {
      const response = await this.nemProvider.getMosaics(mosaicsToSearch).toPromise();
      // console.log('---response ----', response);
      await this.saveMosaicsStorage(response);
      Object.keys(response).forEach(elm => {
        // console.log(response[elm].mosaicId);
        if (this.filterMosaic(response[elm].mosaicId)) {
          infoMosaics.push(this.filterMosaic(response[elm].mosaicId));
        }
      });
    }

    // console.log(infoMosaics);
    return infoMosaics;
  }

  /**
   *
   *
   * @param {MosaicInfo[]} mosaicsInfo
   * @param {NamespaceName[]} [namespaceName]
   * @returns
   * @memberof MosaicService
   */
  async saveMosaicsStorage(mosaicsInfo: MosaicInfo[], namespaceNameParam?: NamespaceName) {
    // console.log('mosaicsInfo ---> ', mosaicsInfo);

    //filter mosaics id from mosaicsInfo params
    const mosaicsIds = mosaicsInfo.map(data => data.mosaicId);
    //get mosaics from storage
    const mosaicsStorage = this.getMosaicsFromStorage();
    // If the mosaic identification has data, look for the names of the tiles. This must return an array of mosaics name
    const mosaicsName = (mosaicsIds.length > 0) ? await this.getNameMosaics(mosaicsIds) : [];
    for (let mosaicInfo of mosaicsInfo) {
      // Check if the mosaics id exists in storage
      const existMosaic = mosaicsStorage.find(key => this.nemProvider.getMosaicId(key.id).toHex() === mosaicInfo.mosaicId.toHex());
      // Mosaic does not exist in storage
      if (existMosaic === undefined) {
        // From the arrangement of the mosaics name, filter the mosaic name data by the mosaic id
        const mosaicName = mosaicsName.find(data => data.mosaicId.toHex() === mosaicInfo.mosaicId.toHex());
        // If mosaicName is defined
        if (mosaicName) {
          let namespaceName: NamespaceName | NamespaceName[] = namespaceNameParam;
          // If namespaceNameParam is not defined, look up the NamespaceName array by namespaceIds
          if (namespaceNameParam === undefined) {
            const x = await this.nemProvider.namespaceHttp.getNamespacesName([mosaicInfo.namespaceId]).toPromise();
            namespaceName = x[0];
          }

          // Push to the array of mosaicsStorage
          const data: MosaicsStorage = {
            id: [mosaicName.mosaicId.id.lower, mosaicName.mosaicId.id.higher],
            namespaceName: namespaceName,
            mosaicName: mosaicName,
            mosaicInfo: mosaicInfo
          };
          mosaicsStorage.push(data);
        }
      }
    }

    localStorage.setItem(this.getNameStorage(), JSON.stringify(mosaicsStorage));
    return mosaicsStorage;
  }

  /**
   * Destroy mosaics cache
   *
   * @memberof MosaicService
   */
  destroyMosaicCache() {
    this.mosaicsViewCache = [];
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
    if (mosaicsStorage.length > 0) {
      const filtered = mosaicsStorage.find(element => {
        return this.getMosaicId(element.id).toHex() === mosaicId.toHex();
      });

      return filtered;
    }
  }

  /**
   *
   *
   * @returns
   * @memberof MosaicService
   */
  getNameStorage() {
    return `proximax-mosaics`;
    // return `proximax-mosaics-${this.walletService.address.address.substr(4, 12)}`;
  }

  /**
   * Get all mosaics in cache
   *
   * @returns
   * @memberof MosaicService
   */
  getMosaicsCache() {
    return this.mosaicsViewCache;
  }

  /**
   *
   *
   * @returns {Observable<any>}
   * @memberof MosaicService
   */
  // getBalance$(): Observable<any> {
  //   return this.balance$;
  // }

  /**
   *
   *
   * @param {NamespaceId} namespaceId
   * @param {QueryParams} [queryParams]
   * @returns {Observable<MosaicInfo[]>}
   * @memberof MosaicService
   */
  getMosaicsFromNamespace(
    namespaceId: NamespaceId,
    queryParams?: QueryParams
  ): Promise<MosaicInfo[]> {
    return this.nemProvider.mosaicHttp
      .getMosaicsFromNamespace(namespaceId, queryParams)
      .toPromise();
  }

  getMosaicsFromStorage(): MosaicsStorage[] {
    const dataStorage = localStorage.getItem(this.getNameStorage());
    return dataStorage === null ? [] : JSON.parse(dataStorage);
  }

  getMosaicId(id: string | number[]): MosaicId {
    return this.nemProvider.getMosaicId(id);
  }

  getMosaicsPromise(mosaicIds: MosaicId[]): Promise<MosaicInfo[]> {
    return this.nemProvider.getMosaics(mosaicIds).toPromise();
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

  // setBalance$(amount: any): void {
  //   this.balance.next(this.transactionService.amountFormatterSimple(amount));
  // }

  /**
   *
   *
   * @memberof MosaicService
   */
  // updateBalance() {
  //   this.nemProvider
  //     .getAccountInfo(this.walletService.address)
  //     .pipe(first())
  //     .subscribe(
  //       next => {
  //         console.log("Account Info! ---> ", next);
  //         this.walletService.setAccountInfo(next);
  //         next.mosaics.forEach(element => {
  //           if (element.id.toHex() === this.mosaicXpx.mosaicId) {
  //             console.log("balance...", this.transactionService.amountFormatterSimple(element.amount.compact()));
  //             this.setBalance$(element.amount.compact());
  //           }
  //         });
  //       },
  //       _err => {
  //         console.log("--- ERROR TO SEARCH BALANCE ----- ", _err);
  //         this.setBalance$("0.000000");
  //         // this.updateBalance();
  //       }
  //     );
  // }
}
