import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import {
  NamespaceInfo,
  NamespaceId,
  NamespaceName,
  Address,
  AliasActionType,
  NetworkType,
  AliasTransaction,
  Deadline,
  Namespace
} from "tsjs-xpx-chain-sdk";
import { ProximaxProvider } from "../../shared/services/proximax.provider";
import { WalletService } from '../../wallet/services/wallet.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: "root"
})
export class NamespacesService {

  namespaceViewCache: NamespaceName[] = [];
  namespaceFromAccount: NamespaceInfo[] = null;
  private namespaceFromAccountSubject: BehaviorSubject<NamespaceInfo[]> = new BehaviorSubject<NamespaceInfo[]>(null);
  private namespaceFromAccount$: Observable<NamespaceInfo[]> = this.namespaceFromAccountSubject.asObservable();

  private namespacesChangedSubject: BehaviorSubject<NamespaceStorageInterface[]> = new BehaviorSubject<NamespaceStorageInterface[]>(null);
  private namespacesChanged$: Observable<NamespaceStorageInterface[]> = this.namespacesChangedSubject.asObservable();

  constructor(
    private proximaxProvider: ProximaxProvider,
    private walletService: WalletService
  ) {
  }


  addressAliasTransaction(
    aliasActionType: AliasActionType,
    namespaceId: NamespaceId,
    address: Address,
    common: any,
    network?: NetworkType
  ) {
    network = (network !== undefined) ? network : this.walletService.currentAccount.network;
    const addressAliasTransaction = AliasTransaction.createForAddress(
      Deadline.create(),
      aliasActionType,
      namespaceId,
      address,
      network
    );

    const account = this.proximaxProvider.getAccountFromPrivateKey(common.privateKey, this.walletService.currentAccount.network);
    const signedTransaction = account.sign(addressAliasTransaction);
    // this.proximaxProvider.announce(signedTransaction)
    return signedTransaction;
  }


  /**
   *
   *
   * @param {Address[]} allAddress
   * @returns
   * @memberof NamespacesService
   */
  async searchNamespacesFromAccounts(allAddress: Address[]) {
    let allNamespaces: NamespaceInfo[] = [];
    for (let address of allAddress) {
      try {
        //Gets array of NamespaceInfo for an account
        const namespaceInfo: NamespaceInfo[] = await this.proximaxProvider.getNamespaceFromAccount(address).toPromise();
        if (namespaceInfo && namespaceInfo.length > 0) {
          namespaceInfo.forEach(element => {
            allNamespaces.push(element);
          });
        }
      } catch (error) {
        console.log('----error---', error);
      }
    }

    console.log('allNamespaces', allNamespaces);
    this.saveNamespaceStorage(allNamespaces);
  }

  /**
   *
   *
   * @param {NamespaceInfo[]} namespaceInfo
   * @memberof NamespacesService
   */
  async saveNamespaceStorage(namespaceInfo: NamespaceInfo[]) {
    // console.log('----namespaceInfo----', namespaceInfo);
    const data = localStorage.getItem(environment.nameKeyNamespaces);
    const names = await this.proximaxProvider.namespaceHttp.getNamespacesName(namespaceInfo.map(x => x.id)).toPromise();
    // console.log('----names---', names);
    const namespacesFound: NamespaceStorageInterface[] = [];
    for (let info of namespaceInfo) {
      namespacesFound.push({
        id: [info.id.id.lower, info.id.id.higher],
        idToHex: info.id.toHex(),
        namespaceName: names.find(name => name.namespaceId.toHex() === info.id.toHex()),
        namespaceInfo: info
      });
    };

    const namespaceToSaved = namespacesFound.slice(0);
    if (data !== null && data !== undefined && namespaceToSaved.length > 0) {
      for (let namespacesSaved of JSON.parse(data)) {
        const existNamespace = namespaceToSaved.find(b => b.idToHex === namespacesSaved.idToHex);
        // console.log('----existe?----', existNamespace);
        if (!existNamespace) {
          namespaceToSaved.push(namespacesSaved);
        }
      }
    }

    // console.log('-TODO LO QUE GUARDARÉ', namespaceToStorage);
    localStorage.setItem(environment.nameKeyNamespaces, JSON.stringify(namespaceToSaved));
    const currentAccount = this.walletService.getCurrentAccount();
    this.fillNamespacesDefaultAccount();
  }


  /**
   *
   *
   * @param {Address} address
   * @returns
   * @memberof NamespacesService
   */
  getFromStorageNamespacesOfAccount(address: Address) {
    const namespacesStorage = localStorage.getItem(environment.nameKeyNamespaces);
    console.log('----namespacesStorage---', JSON.parse(namespacesStorage));
    if (namespacesStorage !== null && namespacesStorage !== undefined) {
      return JSON.parse(namespacesStorage).filter((next: NamespaceStorageInterface) =>
        this.proximaxProvider.createFromRawAddress(next.namespaceInfo.owner.address['address']).pretty() ===
        address.pretty()
      );
    }
  }

  /**
   *
   *
   * @memberof NamespacesService
   */
  setNamespaceChanged(namespacesFound: NamespaceStorageInterface[]) {
    this.namespacesChangedSubject.next(namespacesFound);
  }

  /**
   *
   *
   * @returns {Observable<NamespaceStorageInterface[]>}
   * @memberof NamespacesService
   */
  getNamespaceChanged(): Observable<NamespaceStorageInterface[]> {
    return this.namespacesChanged$;
  }


  fillNamespacesDefaultAccount() {
    let namespacesCurrentAccount = [];
    const namespacesStorage = JSON.parse(localStorage.getItem(environment.nameKeyNamespaces));
    if (namespacesStorage !== null && namespacesStorage !== undefined) {
      namespacesCurrentAccount = namespacesStorage.filter((next: NamespaceStorageInterface) =>
        this.proximaxProvider.createFromRawAddress(next.namespaceInfo.owner.address['address']).pretty() ===
        this.proximaxProvider.createFromRawAddress(this.walletService.getAccountDefault().address).pretty()
      );
    }
    this.setNamespaceChanged(namespacesCurrentAccount);
  }


  /**
   *
   * (NO SE ESTA USANDO)
   * @param {NamespaceId} idNamespace
   * @returns
   * @memberof NamespacesService
   */
  filterNamespaceStorage(idNamespace: NamespaceId) {
    const dataStorage = localStorage.getItem(environment.nameKeyNamespaces);
    const allNamespacesSaved = (dataStorage !== null && dataStorage !== undefined) ? JSON.parse(dataStorage) : [];
    return (allNamespacesSaved.length > 0) ? allNamespacesSaved.find(x => new NamespaceId(x.id).toHex() === idNamespace.toHex()) : [];
  }

  // ---------------------------------------------------------------------------------------------

  /**
   *
   *
   * @param {NamespaceId} namespaceId
   * @returns {Promise<NamespaceStorageInterface>}
   * @memberof NamespacesService
   */
  async getNamespaceFromId(namespaceId: NamespaceId): Promise<NamespaceStorageInterface> {
    const data = this.filterNamespace(namespaceId);
    if (data !== null && data !== undefined) {
      return data;
    }

    try {
      const namespaceInfo = await this.proximaxProvider.getNamespace(namespaceId).toPromise();
      if (namespaceInfo && Object.keys(namespaceInfo).length > 0) {
        await this.setNamespaceStorage([namespaceInfo]);
        return this.filterNamespace(namespaceId);
      }
    } catch (error) {
      //Nothing!
      return null;
    }

    return null;
  }

  /**
   *
   *
   * @param {NamespaceId[]} namespaceIds
   * @returns {Promise<NamespaceName[]>}
   * @memberof NamespacesService
   */
  async getNamespacesNameAsync(namespaceIds: NamespaceId[]): Promise<NamespaceName[]> {
    try {
      //Gets array of NamespaceName for an account
      const NamespaceName = await this.proximaxProvider.namespaceHttp.getNamespacesName(namespaceIds).toPromise();
      return NamespaceName;
    } catch (error) {
      //Nothing!
      return [];
    }
  }

  /**
   *
   *
   * @returns {Observable<any>}
   * @memberof NamespacesService
   */
  async searchNamespaceFromAccountStorage$(): Promise<NamespaceStorageInterface[]> {
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
      const idsToSearch = [];
      //Get the storage namespace
      const namespacesStorage = this.getNamespaceFromStorage();
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
              const data: NamespaceStorageInterface = {
                id: [namespaceName.namespaceId.id.lower, namespaceName.namespaceId.id.higher],
                idToHex: namespaceName.namespaceId.toHex(),
                namespaceName: namespaceName,
                namespaceInfo: element
              };
              namespacesStorage.push(data);
            }
            // }

            //Build mosaics storage
            //this.mosaicsService.buildMosaicsFromNamespace(element.id);
          });

          localStorage.setItem(environment.nameKeyNamespaces, JSON.stringify(namespacesStorage));
          //console.log(namespacesStorage);
          return namespacesStorage;
        }
      }
    }

    return [];
  }

  /**
   *
   *
   * @memberof NamespacesService
   */
  destroyDataNamespace() {
    this.namespaceFromAccountSubject.next(null);
  }

  /**
   * Validate if a namespace is in the storage
   *
   * @param {NamespaceId} namespaceId
   * @returns {NamespaceStorage}
   * @memberof NamespacesService
   */
  filterNamespace(namespaceId: NamespaceId): NamespaceStorageInterface {
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
  getNamespaceFromStorage(): NamespaceStorageInterface[] {
    const dataStorage = localStorage.getItem(environment.nameKeyNamespaces);
    return (dataStorage !== null && dataStorage !== undefined) ? JSON.parse(dataStorage) : [];
  }

  /**
   *
   *
   * @returns {Observable<NamespaceInfo[]>}
   * @memberof NamespacesService
   */
  getNamespaceFromAccountAsync(): Observable<NamespaceInfo[]> {
    return this.namespaceFromAccount$;
  }

  /**
   *
   *
   * @memberof NamespacesService
   */
  resetNamespaceStorage() {
    localStorage.removeItem(environment.nameKeyNamespaces);
  }
}

export interface NamespacesOfAccountsInterface {
  nameAccount: string;
  namespaces: NamespaceStorageInterface[]
}

export interface NamespaceStorageInterface {
  id: number[];
  idToHex: string;
  namespaceName: NamespaceName;
  namespaceInfo: NamespaceInfo;
}
