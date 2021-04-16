import { Injectable } from '@angular/core';
import { MosaicInfo, QueryParams, PublicAccount, Transaction } from 'tsjs-xpx-chain-sdk';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth/services/auth.service';
import { DataBridgeService } from '../../shared/services/data-bridge.service';
import { NamespacesService } from '../../servicesModule/services/namespaces.service';
import { WalletService } from '../../wallet/services/wallet.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  processComplete = false;
  isLogged$: Observable<boolean>;
  isIncrementViewDashboard = 0;
  searchComplete = false;


  infoMosaic: MosaicInfo;
  subscriptions = [
    'transactionsUnconfirmed',
    'transactionsConfirmed',
    'isLogged',
    'getAllTransactions'
  ];

  constructor(
    private authService: AuthService,
    private walletService: WalletService,
    private dataBridgeService: DataBridgeService,
    private namespaceService: NamespacesService
  ) { }

  /**
   * Destroy all subscriptions
   *
   * @memberof DashboardService
   */
  destroySubscription() {
    this.subscriptions.forEach(element => {
      if (this.subscriptions[element] !== undefined) {
        this.subscriptions[element].unsubscribe();
      }
    });
  }


  /**
   * Subscribe if logged
   *
   * @memberof DashboardService
   */
  subscribeLogged() {
    if (this.isIncrementViewDashboard === 1) {
      this.isLogged$ = this.authService.getIsLogged();
      this.subscriptions['isLogged'] = this.isLogged$.subscribe(
        response => {
          if (response === false) {
            // DESTROY SUBSCRIPTION WHEN IS NOT LOGIN
            this.searchComplete = false;
            this.isIncrementViewDashboard = 0;
            this.destroySubscription();
            // this.subscriptions['isLogged'].unsubscribe();
            this.dataBridgeService.closeConection();
            this.walletService.destroyAccountInfo();
            this.namespaceService.destroyDataNamespace();
            return;
          }
        }
      );
    }
  }

  /**
   *
   *
   * @returns {number}
   * @memberof DashboardService
   */
  getCantViewDashboard(): number {
    return this.isIncrementViewDashboard;
  }


  /**
   * Verify if the dashboard was loaded once
   *
   * @memberof DashboardService
   */
  incrementViewDashboard() {
    this.isIncrementViewDashboard++;
  }

  /**
   *
   * @memberof DashboardService
   */
  saveBlockTimestamp(genHash: string, block: number, timestamp: string) {

    let blockTimestampStorage = this.getBlockTimestampStorage();
    let blockTimestampStorageSingle = this.filterBlockTimestampStorage(genHash);

    let blockTimestamp = blockTimestampStorageSingle ? blockTimestampStorageSingle : { genHash: genHash, blockTimestampInfo: []};
    let blockTimestampInfo = blockTimestamp['blockTimestampInfo'];

    let blockTimestampToSave = {
      block : block,
      timestamp: timestamp
    };

    if (blockTimestampInfo.length > 0) {
      const existBlock = blockTimestampInfo.findIndex(b => b.block === blockTimestampToSave.block);

      if (existBlock < 0) {
        blockTimestampInfo.push(blockTimestampToSave);
      }
      else{
        blockTimestampInfo[existBlock] = blockTimestampToSave;
      }
    }
    else{
      blockTimestampInfo.push(blockTimestampToSave);
    }

    blockTimestamp['blockTimestampInfo'] = blockTimestampInfo;

    const existGenHash = blockTimestampStorage.findIndex(b => b.genHash === genHash);

    if (existGenHash < 0) {
      blockTimestampStorage.push(blockTimestamp);
    }
    else{
      blockTimestampStorage[existGenHash] = blockTimestamp;
    }

    localStorage.setItem(environment.nameKeyBlockTimestamp, JSON.stringify(blockTimestampStorage));
  }

  /**
   *
   * @memberof DashboardService
   */
  saveChainTimestamp(genHash: string, blockTimestampInfo: BlockTimestamp[]) {

    let blockTimestampStorage = this.getBlockTimestampStorage();
    let blockTimestampStorageSingle = this.filterBlockTimestampStorage(genHash);

    let blockTimestamp = blockTimestampStorageSingle ? blockTimestampStorageSingle : { genHash: genHash, blockTimestampInfo: []};

    blockTimestamp['blockTimestampInfo'] = blockTimestampInfo;

    const existGenHash = blockTimestampStorage.findIndex(b => b.genHash === genHash);

    if (existGenHash < 0) {
      blockTimestampStorage.push(blockTimestamp);
    }
    else{
      blockTimestampStorage[existGenHash] = blockTimestamp;
    }

    localStorage.setItem(environment.nameKeyBlockTimestamp, JSON.stringify(blockTimestampStorage));
  }

  /**
   *
   * @returns BlockChainTimestamp
   * @memberof DashboardService
   */
  filterBlockTimestampStorage(genHash: string): BlockChainTimestamp {
    
    let blockTimestampStorage = JSON.parse(localStorage.getItem(environment.nameKeyBlockTimestamp)) || [];

    const existGenHash = blockTimestampStorage.findIndex(b => b.genHash === genHash);

    return existGenHash >= 0 ? blockTimestampStorage[existGenHash]: null;

  }

  /**
   *
   * @returns BlockChainTimestamp[]
   * @memberof DashboardService
   */
  getBlockTimestampStorage(): BlockChainTimestamp[]{
    
    let blockTimestampStorage = JSON.parse(localStorage.getItem(environment.nameKeyBlockTimestamp)) || [];

    return blockTimestampStorage;
  }

  /**
   *
   * @returns any
   * @memberof DashboardService
   */
  getStorageBlockTimestamp(genHash: string, block: number): any {
    
    let blockTimestampStorage = JSON.parse(localStorage.getItem(environment.nameKeyBlockTimestamp)) || [];

    if(blockTimestampStorage.length > 0){
      const existGenHash = blockTimestampStorage.findIndex(b => b.genHash === genHash);

      if(existGenHash >= 0){
        const chainBlockTimestamp = blockTimestampStorage[existGenHash];
        const existBlock = chainBlockTimestamp['blockTimestampInfo'].findIndex(b => b.block === block);

        return existBlock >= 0 ? chainBlockTimestamp['blockTimestampInfo'][existBlock].timestamp: null;
      }
      else{
        return null;
      }
    }
    else{
      return null;
    }
  }

  /**
   * @memberof DashboardService
   */
  resetStorageBlockTimestamp(genHash: string): any {
    
    let blockTimestampStorage = JSON.parse(localStorage.getItem(environment.nameKeyBlockTimestamp)) || [];

    if(blockTimestampStorage.length > 0){
      const existGenHash = blockTimestampStorage.findIndex(b => b.genHash === genHash);

      if(existGenHash >= 0){
        let chainBlockTimestamp = blockTimestampStorage[existGenHash];
        let newChainBlockTimestamp = [];

        for(var i=0; i < chainBlockTimestamp['blockTimestampInfo'].length; i++){
          let blockTime = "";

          try{
            var date = new Date(chainBlockTimestamp['blockTimestampInfo'][i].timestamp);

            blockTime = date.toISOString();

            let blockTimestamp: BlockTimestamp = {
              block: chainBlockTimestamp['blockTimestampInfo'][i].block,
              timestamp: blockTime
            };

            newChainBlockTimestamp.push(blockTimestamp);

          }catch(error){

          }
        }

        this.saveChainTimestamp(genHash, newChainBlockTimestamp);
      }
    }
  }

  checkLocalTimestamp(dateTimeString: string){
    let date = new Date(dateTimeString);

    return date.toISOString() === dateTimeString;
  }

  checkSavedDateTimeFormat(){
    let blockChainsTimestamp: BlockChainTimestamp[] = this.getBlockTimestampStorage();
    
    for (const blockChainDateTime of blockChainsTimestamp) {
       
        let isCorrectFormat = this.checkLocalTimestamp(blockChainDateTime.blockTimestampInfo[0].timestamp);

        if(!isCorrectFormat){
          this.resetStorageBlockTimestamp(blockChainDateTime.genHash);
        }
    }
  }
}

interface BlockChainTimestamp{
  genHash: string,
  blockTimestampInfo: BlockTimestamp[];
}

interface BlockTimestamp{
  block: number,
  timestamp: string;
}

export interface DashboardNamespaceInfo {
  id: string;
  name: string;
  linkType: string;
  linkedInfo: string;
  active: boolean;
}

export interface DashboardMosaicInfo {
  owner: boolean;
  id: string;
  namespaceId: string;
  name: string;
  quantity: string;
  active: boolean;
}