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

  /**
   *
   *
   * @param {AddressAliasTransactionInterface} param
   * @returns {SignedTransaction}
   * @memberof NamespacesService
   */
  addressAliasTransaction(param: AddressAliasTransactionInterface): SignedTransaction {
    const network = (param.network !== undefined) ? param.network : this.walletService.currentAccount.network;
    const addressAliasTransaction = AliasTransaction.createForAddress(
      Deadline.create(),
      param.aliasActionType,
      param.namespaceId,
      param.address,
      network
    );

    console.log('addressAliasTransaction', addressAliasTransaction);

    const account = this.proximaxProvider.getAccountFromPrivateKey(param.common.privateKey, this.walletService.currentAccount.network);
    console.log('account', account);

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
          // console.log('----Search namespaces from accounts error----', error);
        }
      }

      this.getNamespaceFromId(namespaceId, false);
    }

    return dataFound;
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
        // console.log('----Search namespaces from accounts error----', error);
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
 * @memberof NamespacesService
 */
  destroyDataNamespace() {
    this.namespaceFromAccountSubject.next(null);
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
   * @param {NamespaceId} namespaceId
   * @returns
   * @memberof NamespacesService
   */
  filterNamespaceFromId(namespaceId: NamespaceId): NamespaceStorageInterface {
    const namespacesStorage: NamespaceStorageInterface[] = this.getNamespacesStorage();
    if (namespacesStorage.length > 0) {
      return namespacesStorage.find(x => x.idToHex === namespaceId.toHex());
    }

    return null;
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
   * @returns {Observable<NamespaceStorageInterface[]>}
   * @memberof NamespacesService
   */
  getNamespaceChanged(): Observable<NamespaceStorageInterface[]> {
    return this.namespacesChanged$;
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

  /**
   *
   *
   * @param {NamespaceId} parentNamespaceId
   * @param {number} parent
   * @memberof NamespacesService
   */
  async getNameParentNamespace(namespaceStorage: NamespaceStorageInterface) {
    switch (namespaceStorage.namespaceInfo.depth) {
      case 1:
        return namespaceStorage.namespaceName.name;
      case 2:
        const nameParentTwo = namespaceStorage.namespaceName.name;
        const parentOneNamespaceId = this.getNamespaceId([
          namespaceStorage.namespaceInfo['parentId']['id'].lower,
          namespaceStorage.namespaceInfo['parentId']['id'].higher
        ]);

        const parentOne = await this.filterNamespaceFromId(parentOneNamespaceId);
        return (parentOne) ? `${parentOne.namespaceName.name}.${nameParentTwo}` : nameParentTwo;
      case 3:
        const nameParentThree = namespaceStorage.namespaceName.name;
        const parentTwoNamespaceId = this.getNamespaceId([
          namespaceStorage.namespaceInfo['parentId']['id'].lower,
          namespaceStorage.namespaceInfo['parentId']['id'].higher
        ]);

        const parentTwo = await this.filterNamespaceFromId(parentTwoNamespaceId);
        const nameTwo = await this.getNameParentNamespace(parentTwo);
        return `${nameTwo}.${nameParentThree}`;
    }
  }


  /**
   *
   *
   * @memberof NamespacesService
   */
  resetNamespaceStorage() {
    localStorage.removeItem(environment.nameKeyNamespaces);
  }


  /**
   *
   *
   * @memberof NamespacesService
   */
  setNamespaceChanged(namespacesFound: NamespaceStorageInterface[]) {
    this.namespacesChangedSubject.next(namespacesFound);
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
