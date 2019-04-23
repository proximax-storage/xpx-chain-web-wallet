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
  QueryParams
} from "proximax-nem2-sdk";
import { first } from "rxjs/internal/operators/first";
import { BehaviorSubject, Observable } from "rxjs";
import { NemProvider } from "../../shared/services/nem.provider";
import { NamespacesService } from "./namespaces.service";
import { WalletService } from "../../shared/services/wallet.service";
import { TransactionsService } from "../../transactions/service/transactions.service";
import { ToastService } from "ng-uikit-pro-standard";
import { MosaicsStorage } from "../interfaces/mosaics-namespaces.interface";

@Injectable({
  providedIn: "root"
})
export class MosaicService {
  // private balance: BehaviorSubject<any> = new BehaviorSubject<any>("0.000000");
  // private balance$: Observable<any> = this.balance.asObservable();

  mosaicsViewCache: MosaicView[] = [];
  // mosaicXpx = {
  //   mosaic: "prx:xpx",
  //   mosaicId: "d423931bd268d1f4"
  // };

  constructor(
    private nemProvider: NemProvider,
    private walletService: WalletService,
    private transactionService: TransactionsService,
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
        console.log("getMosaicsFromNamespace", response);
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
      console.log("accountInfo", accountInfo);
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
        console.log("mosaicsName", mosaicsName);
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
  async searchMosaics(mosaicsId: MosaicId[]) {
    console.log("mosaicsId", mosaicsId);
    const infoMosaicsView = [];
    const mosaicsToSearch = [];
    for (let mosaicId of mosaicsId) {
      const filterMosaic = this.filterMosaic(mosaicId);
      console.log("Existe filter mosaic?", filterMosaic);
      if (filterMosaic === undefined) {
        mosaicsToSearch.push(mosaicId);
      } else {
        infoMosaicsView.push(filterMosaic);
      }
    }

    // Search info mosaics
    if (mosaicsToSearch.length > 0) {
      const response = await this.nemProvider.getMosaicViewPromise(
        mosaicsToSearch
      );
      Object.keys(response).forEach(element => {
        infoMosaicsView.push(response[element]);
        this.setMosaicsCache(response[element]);
      });
    }
    return infoMosaicsView;
  }

  async saveMosaicsStorage(mosaicsInfo: MosaicInfo[]) {
    const mosaicsStorage = this.getMosaicsFromStorage();
    const ids = mosaicsInfo.map(data => data.mosaicId);
    const nameMosaics = await this.getNameMosaics(ids);
    mosaicsInfo.forEach(element => {
      // Check if the mosaics id exists in storage
      const existMosaic = mosaicsStorage.find(
        key =>
          this.nemProvider.getMosaicId(key.id).toHex() ===
          element.mosaicId.toHex()
      );

      if (existMosaic === undefined) {
        const mosaicName = nameMosaics.find(
          data => data.mosaicId.toHex() === element.mosaicId.toHex()
        );

        if (mosaicName) {
          const data: MosaicsStorage = {
            id: [mosaicName.mosaicId.id.lower, mosaicName.mosaicId.id.higher],
            mosaicName: mosaicName,
            mosaicInfo: element
          };
          mosaicsStorage.push(data);
        }
      }
    });
    localStorage.setItem(this.getNameStorage(), JSON.stringify(mosaicsStorage));
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
  filterMosaic(mosaicId: MosaicId) {
    console.log("Mosaicos en cache", this.mosaicsViewCache);
    console.log("mosaicId by filter", mosaicId);
    if (this.mosaicsViewCache.length > 0) {
      const filtered = this.mosaicsViewCache.find(function (element) {
        return element.mosaicInfo.mosaicId.toHex() === mosaicId.toHex();
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
    return `proximax-mosaics-${this.walletService.address.address.substr(
      4,
      12
    )}`;
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
