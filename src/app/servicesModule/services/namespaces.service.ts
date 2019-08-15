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
  SignedTransaction
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


  addressAliasTransaction(param: AddressAliasTransactionInterface): SignedTransaction {
    const network = (param.network !== undefined) ? param.network : this.walletService.currentAccount.network;
    const addressAliasTransaction = AliasTransaction.createForAddress(
      Deadline.create(),
      param.aliasActionType,
      param.namespaceId,
      param.address,
      network
    );

    const account = this.proximaxProvider.getAccountFromPrivateKey(param.common.privateKey, this.walletService.currentAccount.network);
    return account.sign(addressAliasTransaction);
  }

  /**
   *
   *
   * @param {NamespaceId} namespaceId
   * @memberof NamespacesService
   */
  async getNamespaceFromId(namespaceId: NamespaceId[], recursive: boolean = true): Promise<NamespaceStorageInterface[]> {
    const dataFound: NamespaceStorageInterface[] = [];
    const missingId: NamespaceId[] = [];
    const namespacesStorage: NamespaceStorageInterface[] = this.getNamespacesStorage();
    if (namespacesStorage.length > 0 && namespaceId.length > 0) {
      for (let id of namespaceId) {
        const x = namespacesStorage.find(next => next.idToHex === id.toHex());
        if (x && Object.keys(x).length > 0) {
          dataFound.push(x);
        } else {
          missingId.push(id);
        }
      }
    }


    if (missingId.length > 0 && recursive) {
      for (let id of missingId) {
        try {
          //Gets array of NamespaceInfo for an account
          const namespaceInfo: NamespaceInfo = await this.proximaxProvider.getNamespace(id).toPromise();
          if (namespaceInfo && Object.keys(namespaceInfo).length > 0) {
            await this.saveNamespaceStorage([namespaceInfo]);
          }
        } catch (error) {
          console.log('----Search namespaces from accounts error----', error);
        }
      }

      this.getNamespaceFromId(namespaceId, false);
    }

    return dataFound;
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
        console.log('----Search namespaces from accounts error----', error);
      }
    }

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
    const namespacesStorage: NamespaceStorageInterface[] = this.getNamespacesStorage();
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
    if (namespacesStorage.length > 0 && namespaceToSaved.length > 0) {
      for (let namespacesSaved of namespacesStorage) {
        const existNamespace = namespaceToSaved.find(b => b.idToHex === namespacesSaved.idToHex);
        // console.log('----existe?----', existNamespace);
        if (!existNamespace) {
          namespaceToSaved.push(namespacesSaved);
        }
      }
    }

    // console.log('-TODO LO QUE GUARDARÉ', namespaceToStorage);
    localStorage.setItem(environment.nameKeyNamespaces, JSON.stringify(namespaceToSaved));
    this.fillNamespacesDefaultAccount();
  }


  /**
   *
   *
   * @param {Address} address
   * @returns
   * @memberof NamespacesService
   */
  getNamespacesFromAccountStorage(address: Address) {
    const namespacesStorage: NamespaceStorageInterface[] = this.getNamespacesStorage();
    if (namespacesStorage.length > 0) {
      return namespacesStorage.filter((next: NamespaceStorageInterface) =>
        this.proximaxProvider.createFromRawAddress(next.namespaceInfo.owner.address['address']).pretty() === address.pretty()
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


  /**
   *
   *
   * @memberof NamespacesService
   */
  fillNamespacesDefaultAccount() {
    let namespacesCurrentAccount = [];
    const namespacesStorage: NamespaceStorageInterface[] = this.getNamespacesStorage();
    const currentAccount = this.proximaxProvider.createFromRawAddress(this.walletService.getAccountDefault().address).pretty();
    if (namespacesStorage.length > 0) {
      namespacesCurrentAccount = namespacesStorage.filter((next: NamespaceStorageInterface) =>
        this.proximaxProvider.createFromRawAddress(next.namespaceInfo.owner.address['address']).pretty() === currentAccount
      );
    }

    this.setNamespaceChanged(namespacesCurrentAccount);
  }

  /**
   *
   *
   * @param {NamespaceId[]} namespaceIds
   * @returns
   * @memberof NamespacesService
   */
  async getNamespacesName(namespaceIds: NamespaceId[]) {
    try {
      //Gets array of NamespaceName for an account
      const namespaceName = await this.proximaxProvider.namespaceHttp.getNamespacesName(namespaceIds).toPromise();
      return namespaceName;
    } catch (error) {
      //Nothing!
      return [];
    }
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
  getNamespacesStorage(): NamespaceStorageInterface[] {
    const namespacesStorage = localStorage.getItem(environment.nameKeyNamespaces);
    return (namespacesStorage !== null && namespacesStorage !== undefined) ? JSON.parse(namespacesStorage) : [];
  }






















  // ---------------------------------------------------------------------------------------------

  /**
   *************** REFACTORIZAR!
   *
   * @param {NamespaceId} namespaceId
   * @returns {Promise<NamespaceStorageInterface>}
   * @memberof NamespacesService
   */
  async getNamespaceFromId2(namespaceId: NamespaceId) {
    /* const data = this.filterNamespace(namespaceId);
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

     return null;*/
  }

  /**
    *************** REFACTORIZAR!
   *
   * @returns {Observable<any>}
   * @memberof NamespacesService
   */
  async searchNamespaceFromAccountStorage$() {
    /* const namespaceFound = [];
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
     return namespaceFound;*/
  }

  /**
   *
   *
   * @param {*} namespaces
   * @memberof NamespacesService
   */
  async setNamespaceStorage(namespacesParam: NamespaceInfo[]) {
    /*if (namespacesParam.length > 0) {
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
             if (existNamespace === undefined) {/****
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

    return [];*/
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
  filterNamespace(namespaceId: NamespaceId) {
    /* if (namespaceId !== undefined) {
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

     return null;*/
  }



  /**
   *
   *
   * @returns
   * @memberof NamespacesService
   */
  getNamespaceFromStorage() {
    /* const dataStorage = localStorage.getItem(environment.nameKeyNamespaces);
     return (dataStorage !== null && dataStorage !== undefined) ? JSON.parse(dataStorage) : [];*/
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

export interface AddressAliasTransactionInterface {
  aliasActionType: AliasActionType;
  namespaceId: NamespaceId;
  address: Address;
  common: any;
  network?: NetworkType;
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
