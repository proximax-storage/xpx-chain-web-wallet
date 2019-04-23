import { Injectable } from "@angular/core";
import {
  NamespaceInfo,
  NamespaceId,
  NamespaceName,
  QueryParams,
  Address
} from "proximax-nem2-sdk";
import { NemProvider } from "../../shared/services/nem.provider";
import { WalletService } from "../../shared/services/wallet.service";
import { NamespaceStorage } from "../interfaces/mosaics-namespaces.interface";
import { ToastService } from "ng-uikit-pro-standard";
import { MosaicService } from "./mosaic.service";

@Injectable({
  providedIn: "root"
})
export class NamespacesService {
  namespaceViewCache: NamespaceName[] = [];

  constructor(
    private nemProvider: NemProvider,
    private walletService: WalletService,
    private toastrService: ToastService,
    private mosaicsService: MosaicService
  ) { }

  /**
   * Search and save namespace in cache
   *
   * @memberof NamespacesService
   */
  async buildNamespaceStorage() {
    this.getNamespacesFromAccountAsync(this.walletService.address)
      .then(response => this.setNamespaceStorage(response))
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
   * Get the namespace of an account
   *
   * @param {Address} address
   * @returns
   * @memberof NamespacesService
   */
  async getNamespacesFromAccountAsync(
    address: Address
  ): Promise<NamespaceInfo[]> {
    return await this.nemProvider.namespaceHttp
      .getNamespacesFromAccount(address)
      .toPromise();
  }

  /**
   *
   *
   * @param {NamespaceId[]} namespaceIds
   * @returns {Promise<NamespaceName[]>}
   * @memberof NamespacesService
   */
  async getNamespacesNameAsync(
    namespaceIds: NamespaceId[]
  ): Promise<NamespaceName[]> {
    return await this.nemProvider.namespaceHttp
      .getNamespacesName(namespaceIds)
      .toPromise();
  }

  /**
   *
   *
   * @param {*} namespaces
   * @memberof NamespacesService
   */
  async setNamespaceStorage(namespacesParam: NamespaceInfo[]) {
    if (namespacesParam.length > 0) {
      const ids = namespacesParam.map(element => {
        return element.id;
      });

      const namespacesStorage = this.getNamespaceFromStorage();
      const namespacesName = await this.getNamespacesNameAsync(ids);
      if (namespacesName) {
        namespacesParam.forEach(async element => {
          // Check if the namespace id exists in storage
          const existNamespace = namespacesStorage.find(
            k => this.nemProvider.getNamespaceId(k.id).toHex() === element.id.toHex()
          );

          if (existNamespace === undefined) {
            const namespaceName = namespacesName.find(
              data => data.namespaceId.toHex() === element.id.toHex()
            );

            if (namespaceName) {
              const data: NamespaceStorage = {
                id: [
                  namespaceName.namespaceId.id.lower,
                  namespaceName.namespaceId.id.higher
                ],
                namespaceName: namespaceName,
                NamespaceInfo: element
              };
              namespacesStorage.push(data);
            }
          }
          this.mosaicsService.buildMosaicsStorage(element.id);
        });

        localStorage.setItem(
          this.getNameStorage(),
          JSON.stringify(namespacesStorage)
        );
      }
    }
  }

  /**
   *
   *
   * @returns
   * @memberof NamespacesService
   */
  getNamespaceFromStorage(): NamespaceStorage[] {
    const dataStorage = localStorage.getItem(this.getNameStorage());
    return dataStorage === null ? [] : JSON.parse(dataStorage);
  }

  /**
   *
   *
   * @returns
   * @memberof NamespacesService
   */
  getNameStorage() {
    return `proximax-namespaces-${this.walletService.address.address.substr(
      4,
      12
    )}`;
  }

  // ***************** OLD ***********************************************************************************************************************

  destroyNamespaceCache() {
    this.namespaceViewCache = [];
  }

  setNamespacesCache(namespaceName: NamespaceName) {
    this.namespaceViewCache.push(namespaceName);
  }

  getNamespacesCache() {
    return this.namespaceViewCache;
  }

  async getNamespacesFromAccount(address: Address, queryParams?: QueryParams) {
    const promise = await new Promise(async (resolve, reject) => {
      const namespaceFromAccount = await this.nemProvider.namespaceHttp
        .getNamespacesFromAccount(address, queryParams)
        .toPromise();
      console.log(namespaceFromAccount);
      // const accountInfo = await this.nemProvider.accountHttp.getAccountInfo(address).toPromise();
      // console.log("accountInfo", accountInfo);
      // let mosaicsId = [];
      // if (searchXpx) {
      //   mosaicsId = accountInfo.mosaics.map((mosaic: Mosaic) => { return mosaic.id });
      // } else {
      //   accountInfo.mosaics.forEach((mosaic: Mosaic) => {
      //     if (mosaic.id.toHex() !== 'd423931bd268d1f4') {
      //       return mosaicsId.push(mosaic.id);
      //     }
      //   });
      // }

      // let response = {};
      // if (mosaicsId.length > 0) {
      //   const mosaicsName: MosaicName[] = await this.getNameMosaic(mosaicsId);
      //   console.log("mosaicsName", mosaicsName);
      //   const namespacesId = mosaicsName.map((mosaicsName: MosaicName) => { return mosaicsName.namespaceId });
      //   const namespaceName = await this.namespaceServices.getNameName(namespacesId);
      //   response = { mosaicsName: mosaicsName, namespaceName: namespaceName };
      // }

      // resolve(response);
    });

    return await promise;
  }

  async searchNamespace(namespacesId: NamespaceId[]) {
    const infoNamespace = [];
    const namespaceToSearch = [];
    for (let namespaceId of namespacesId) {
      const filterNamespace = this.filterNamespace(namespaceId);
      console.log("Existe filter namespace?", filterNamespace);
      if (filterNamespace === undefined) {
        namespaceToSearch.push(namespaceId);
      } else {
        infoNamespace.push(filterNamespace);
      }
    }

    // Search info namespace
    if (namespaceToSearch.length > 0) {
      const response = await this.nemProvider.getNamespaceViewPromise(
        namespaceToSearch
      );
      console.log("responseresponseresponse", response);
      Object.keys(response).forEach(element => {
        infoNamespace.push(response[element]);
        this.setNamespacesCache(response[element]);
      });
    }

    return infoNamespace;
  }

  filterNamespace(namespaceId: NamespaceId) {
    console.log("namespace en cache", this.namespaceViewCache);
    console.log("namespaceId by filter", namespaceId);
    if (this.namespaceViewCache !== undefined) {
      if (this.namespaceViewCache.length > 0) {
        const filtered = this.namespaceViewCache.find(function (element) {
          return element.namespaceId.toHex() === namespaceId.toHex();
        });
        return filtered;
      }
    }
  }

  async getNameName(namespaceId: NamespaceId[]) {
    return await this.nemProvider.namespaceHttp
      .getNamespacesName(namespaceId)
      .toPromise();
  }
}
