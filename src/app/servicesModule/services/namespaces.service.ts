import { Injectable } from '@angular/core';
import { NamespaceInfo, NamespaceId, NamespaceName } from 'proximax-nem2-sdk';
import { NemProvider } from '../../shared/services/nem.provider';

@Injectable({
  providedIn: 'root'
})
export class NamespacesService {

  namespaceViewCache: NamespaceName[] = [];

  constructor(
    private nemProvider: NemProvider
  ) { }


  destroyNamespaceCache() {
    this.namespaceViewCache = [];
  }



  setNamespacesCache(namespaceName: NamespaceName) {
    this.namespaceViewCache.push(namespaceName);
  }


  getNamespacesCache() {
    return this.namespaceViewCache;
  }



  async searchNamespace(namespacesId: NamespaceId[]) {
    const infoNamespace = [];
    const namespaceToSearch = [];
    for (let namespaceId of namespacesId) {
      const filterNamespace = this.filterNamespace(namespaceId);
      console.log("Existe filter namespace?", filterNamespace)
      if (filterNamespace === undefined) {
        namespaceToSearch.push(namespaceId);
      } else {
        infoNamespace.push(filterNamespace);
      }
    }

    // Search info namespace
    if (namespaceToSearch.length > 0) {
      const response = await this.nemProvider.getNamespaceViewPromise(namespaceToSearch);
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
    return await this.nemProvider.namespaceHttp.getNamespacesName(namespaceId).toPromise()
  }

}
