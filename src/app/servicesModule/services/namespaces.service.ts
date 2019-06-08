import { Injectable } from "@angular/core";
import {
  NamespaceInfo,
  NamespaceId,
  NamespaceName,
  Address,
  QueryParams
} from "tsjs-xpx-catapult-sdk";
import { ProximaxProvider } from "../../shared/services/proximax.provider";
import { WalletService } from "../../shared/services/wallet.service";
import { NamespaceStorage } from "../interfaces/mosaics-namespaces.interface";
import { ToastService } from "ng-uikit-pro-standard";
import { MosaicService } from "./mosaic.service";
import { Observable, BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class NamespacesService {
  namespaceViewCache: NamespaceName[] = [];
  namespaceFromAccount: NamespaceInfo[] = null;

  constructor(
    private proximaxProvider: ProximaxProvider,
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
    //Gets array of NamespaceInfo for an account
    this.getNamespacesFromAccountAsync(this.walletService.address)
      .then(response => {
        this.namespaceFromAccount = response;
        this.setNamespaceStorage(response);
      }).catch(() => {
        /*const options = {
          closeButton: true,
          tapToDismiss: false,
          toastClass: "toastError"
        };
        this.toastrService.error(
          "Has ocurred a unexpected error, possible causes: the network is offline",
          "",
          options
        ); */
      });
  }

  /**
   *
   *
   * @param {NamespaceId} namespaceId
   * @returns {Promise<NamespaceStorage>}
   * @memberof NamespacesService
   */
  async getNamespaceFromId(namespaceId: NamespaceId): Promise<NamespaceStorage> {
    const data = this.filterNamespace(namespaceId);
    if (data !== null && data !== undefined) {
      return data;
    }

    const namespaceInfo = await this.proximaxProvider.getNamespace(namespaceId).toPromise();
    if (namespaceInfo && Object.keys(namespaceInfo).length > 0) {
      await this.setNamespaceStorage([namespaceInfo]);
      return this.filterNamespace(namespaceId);
    }

    return null;
  }

  /**
   * Gets array of NamespaceInfo for an account
   *
   * @param {Address} address
   * @returns
   * @memberof NamespacesService
   */
  async getNamespacesFromAccountAsync(address: Address): Promise<NamespaceInfo[]> {
    //Gets array of NamespaceInfo for an account
    return await this.proximaxProvider.namespaceHttp.getNamespacesFromAccount(address).toPromise();
  }

  /**
   *
   *
   * @param {NamespaceId[]} namespaceIds
   * @returns {Promise<NamespaceName[]>}
   * @memberof NamespacesService
   */
  async getNamespacesNameAsync(namespaceIds: NamespaceId[]): Promise<NamespaceName[]> {
    return await this.proximaxProvider.namespaceHttp.getNamespacesName(namespaceIds).toPromise();
  }

  /**
   *
   *
   * @returns {Observable<any>}
   * @memberof NamespacesService
   */
  async searchNamespaceFromAccountStorage$(): Promise<NamespaceStorage[]> {
    const namespaceFound = [];
    if (this.namespaceFromAccount !== null) {
      for (let element of this.namespaceFromAccount) {
        const data = this.filterNamespace(element.id);
        if (data === null || data === undefined) {
          const namespaceStorage = await this.getNamespaceFromId(element.id);
          namespaceFound.push(namespaceStorage);
        } else {
          namespaceFound.push(data);
        }
      }
    }
    return namespaceFound;
  }

  /**
   *
   *
   * @param {*} namespaces
   * @memberof NamespacesService
   */
  async setNamespaceStorage(namespacesParam: NamespaceInfo[]) {
    if (namespacesParam.length > 0) {
      //Get the storage namespace
      const namespacesStorage = this.getNamespaceFromStorage();
      const idsToSearch = [];
      // Map and get an array of ids from NamespaceInfo []
      const namespacesId = namespacesParam.map(e => { return e.id; });
      namespacesId.forEach(id => {
        // Filter if the namespace id exists in the storage
        const filterNamespace = this.filterNamespace(id);
        if (filterNamespace === undefined || filterNamespace === null) {
          idsToSearch.push(id);
        }
      });

      if (idsToSearch.length > 0) {
        // Gets array of NamespaceName for different namespaceIds
        const namespacesName = await this.getNamespacesNameAsync(idsToSearch);
        if (namespacesName) {
          namespacesParam.forEach(async element => {
            // Check if the namespace id exists in storage
            /* const existNamespace = namespacesStorage.find(k => this.proximaxProvider.getNamespaceId(k.id).toHex() === element.id.toHex());
             // If existNamespace is undefined
             if (existNamespace === undefined) {*/
            // Filter by namespaceId the namespaceName from the array of namespacesName
            const namespaceName = namespacesName.find(data => data.namespaceId.toHex() === element.id.toHex());
            if (namespaceName) {
              const data: NamespaceStorage = {
                id: [namespaceName.namespaceId.id.lower, namespaceName.namespaceId.id.higher],
                namespaceName: namespaceName,
                NamespaceInfo: element
              };
              namespacesStorage.push(data);
            }
            // }

            //Build mosaics storage
            //this.mosaicsService.buildMosaicsFromNamespace(element.id);
          });

          localStorage.setItem(this.getNameStorage(), JSON.stringify(namespacesStorage));
          //console.log(namespacesStorage);
          return namespacesStorage;
        }
      }

    }

    return [];
  }

  /**
   * Validate if a namespace is in the storage
   *
   * @param {NamespaceId} namespaceId
   * @returns {NamespaceStorage}
   * @memberof NamespacesService
   */
  filterNamespace(namespaceId: NamespaceId): NamespaceStorage {
    if (namespaceId !== undefined) {
      const namespaceStorage = this.getNamespaceFromStorage();
      if (namespaceStorage !== null && namespaceStorage !== undefined) {
        if (namespaceStorage.length > 0) {
          const filtered = namespaceStorage.find(element => {
            return this.getNamespaceId(element.id).id.toHex() === namespaceId.id.toHex();
          });

          return filtered;
        }
      }
    }

    return null;
  }

  /**
   *
   *
   * @param {(string | number[])} id
   * @returns {NamespaceId}
   * @memberof NamespacesService
   */
  getNamespaceId(id: string | number[]): NamespaceId {
    return this.proximaxProvider.getNamespaceId(id);
  }

  /**
   *
   *
   * @returns
   * @memberof NamespacesService
   */
  getNamespaceFromStorage(): NamespaceStorage[] {
    const dataStorage = localStorage.getItem(this.getNameStorage());
    return (dataStorage !== null && dataStorage !== undefined) ? JSON.parse(dataStorage) : [];
  }

  /**
   *
   *
   * @returns
   * @memberof NamespacesService
   */
  getNameStorage() {
    return `proximax-namespaces`;
  }



  resetNamespaceStorage() {
    localStorage.removeItem(this.getNameStorage());
  }
}
