import { Injectable } from '@angular/core';

import { BlockUI, NgBlockUI } from 'ng-block-ui';
import {
  Uploader, ConnectionConfig, BlockchainNetworkConnection, IpfsConnection,
  UploadParameter, ReadableStreamParameterData, StreamHelper,
  PrivacyType, SearchParameter, Searcher, Downloader, TransactionFilter, Protocol
} from 'tsjs-chain-xipfs-sdk';
import { Observable, BehaviorSubject } from 'rxjs';
import { PublicAccount, Address, AccountHttp, TransactionHttp, QueryParams, TransactionType, TransferTransaction, Transaction } from 'tsjs-xpx-chain-sdk';
import { DirectDownloadParameter } from 'tsjs-chain-xipfs-sdk/build/main/src/lib/download/direct-download-parameter';
import { ProximaxProvider } from '../../shared/services/proximax.provider';
import { environment } from '../../../environments/environment';
import { WalletService } from '../../wallet/services/wallet.service';
import { SharedService } from '../../shared/services/shared.service';
@Injectable({
  providedIn: 'root'
})

export class CreatePollStorageService {
  private polls: BehaviorSubject<any> = new BehaviorSubject<any>([]);
  polls$ = this.polls.asObservable();
  connectionConfig: ConnectionConfig;
  transactionResults = [];
  searcher: Searcher;
  uploader: Uploader;
  downloader: Downloader;
  pollResult: any = [];
  allPollResult: any = [];
  publicAccount: PublicAccount;
  @BlockUI() blockUI: NgBlockUI;
  transactionHttp: TransactionHttp;
  accountHttp: AccountHttp;

  constructor(
    private proximaxProvider: ProximaxProvider,
    private sharedService: SharedService,
    private walletService: WalletService,
  ) {
    this.connectionStorage();
    this.initHttpService();
  }



  connectionStorage() {
    const blockChainNetworkType = this.proximaxProvider.getBlockchainNetworkType(this.walletService.currentAccount.network);
    const blockChainHost = environment.blockchainConnection.host;
    const blockChainPort = environment.blockchainConnection.port;
    const blockChainProtocol = environment.blockchainConnection.protocol === 'https' ? Protocol.HTTPS : Protocol.HTTP;

    const storageHost = environment.storageConnection.host;
    const storagePort = environment.storageConnection.port;
    const storageOptions = environment.storageConnection.options;
    const connectionConfig = ConnectionConfig.createWithLocalIpfsConnection(
      new BlockchainNetworkConnection(blockChainNetworkType, blockChainHost, blockChainPort, blockChainProtocol),
      new IpfsConnection(storageHost, storagePort, storageOptions));
    const storageHostUploader = environment.storageConnectionUnload.host;
    const storagePortUploader = environment.storageConnectionUnload.port;
    const storageOptionsUploader = environment.storageConnectionUnload.options;
    const connectionConfigUploader = ConnectionConfig.createWithLocalIpfsConnection(
      new BlockchainNetworkConnection(blockChainNetworkType, blockChainHost, blockChainPort, blockChainProtocol),
      new IpfsConnection(storageHostUploader, storagePortUploader, storageOptionsUploader));
    this.uploader = new Uploader(connectionConfigUploader);
    this.searcher = new Searcher(connectionConfig);
    this.downloader = new Downloader(connectionConfig);

    console.log('downloader', this.downloader)
    console.log('uploader', this.uploader)
  }

  initHttpService(){
    this.transactionHttp = new TransactionHttp(this.proximaxProvider.url);
    this.accountHttp = new AccountHttp(this.proximaxProvider.url);
  }



  async sendFileStorage(fileObject: FileInterface, description: any, account: PublicAccount, privateKey: string) {
    // console.log('account',account)
    const promise = new Promise(async (resolve, reject) => {
      const fileContents = Buffer.from(JSON.stringify(fileObject.content));
      const strings: string = JSON.stringify(fileObject.content);
      const nameFile = `${fileObject.name}.${fileObject.extension}`;
      const paramData = ReadableStreamParameterData.create(
        async () => StreamHelper.string2Stream(strings),
        nameFile,
        description,
        fileObject.type,
        null
      );
      const param = UploadParameter.createForReadableStreamUpload(
        paramData,
        privateKey
      );

      const recipientPublicKey = account.publicKey;
      if (recipientPublicKey.length > 0) {
        param.withRecipientPublicKey(recipientPublicKey);
      }

      const mosaic: any = [];
      param.withTransactionMosaics(mosaic); //Update-sdk-dragon
      let recipientAddress = account.address.plain();
      if (recipientPublicKey.length > 0) {
        recipientAddress = Address.createFromPublicKey(recipientPublicKey, account.address.networkType).plain();
      }

      if (recipientAddress) {
        param.withRecipientAddress(recipientAddress);
      }

      const useSecureMessage = environment.blockchainConnection.useSecureMessage;
      if (useSecureMessage) {
        param.withUseBlockchainSecureMessage(useSecureMessage);
      }

      if (useSecureMessage) {
        param.withUseBlockchainSecureMessage(useSecureMessage);
      }
      param.withPlainPrivacy();
      param.withTransactionDeadline(12);

      this.blockUI.start();
      const result = await this.uploader.upload(param.build());
      const gridTitle = result.data.name ? result.data.name : nameFile;
      const encrypted = result.privacyType !== PrivacyType.PLAIN;
      this.transactionResults.push({
        title: gridTitle,
        type: result.data.contentType,
        privacy: result.privacyType,
        dataHash: result.data.dataHash,
        transactionHash: result.transactionHash,
        isEncrypted: encrypted
      });

      this.blockUI.stop();
      this.sharedService.showSuccess('Success', 'Record Saved Succesfully');
      resolve(this.transactionResults);
    });
    return await promise;
  }

  async loadPollTransactions(publicAccount?: PublicAccount, address?: Address, fromTransactionId?: string) {
    this.transactionResults = [];
    this.pollResult = [];
    const promise = new Promise(async (resolve, reject) => {
      let searchParam: any

        if (publicAccount) {
          //console.log("search by public Acount")
          searchParam = publicAccount;
        } else if (address) {
          //console.log("search by address")
          searchParam = address
        }

        let queryParams: QueryParams;
        let pageSize = 10;

        if(fromTransactionId){
          queryParams =  fromTransactionId ? new QueryParams(pageSize, fromTransactionId) : new QueryParams(pageSize);
        }
   
        const searchResult = await this.accountHttp.incomingTransactions(searchParam, queryParams).toPromise();
       // console.log('searchResult', searchResult)

        let startTransactionId: string;
        let endTransactionId: string;
        
        if (searchResult.length > 0) {

          startTransactionId = searchResult[0].transactionInfo.id;
          endTransactionId = searchResult[searchResult.length - 1].transactionInfo.id;

          for (const resultItem of searchResult) {

            if(resultItem.type !== TransactionType.TRANSFER){
              continue;
            }

            let message = resultItem['message'].payload;

            try{
              let pollData = JSON.parse(message);

              if (pollData['type'] === 'poll') {
                this.transactionResults.push({
                  title:pollData['name'], type: pollData['type'],
                  transactionHash: pollData['hash']
                });
              }
            }catch(err){
              continue;
            }
          }

          if(this.transactionResults.length === 0){
            resolve(undefined);
          }

          for (const data of this.transactionResults) {
              
              let aggregateTransaction = await this.transactionHttp.getTransaction(data.transactionHash).toPromise();

              if(aggregateTransaction && aggregateTransaction.type === TransactionType.AGGREGATE_COMPLETE){

                let innerTransaction:Transaction[] = aggregateTransaction['innerTransactions'];

                let hexString = '';
                let pollContent = {};

                for(var tx of innerTransaction){
                  if(tx.type === TransactionType.TRANSFER){
                    hexString += tx['message'].payload;
                  }
                }

                if(hexString){
                  pollContent = JSON.parse(Buffer.from(hexString, "hex").toString("utf8"));
                }
                
                this.pollResult.push(pollContent);
                this.allPollResult.push(pollContent);
                resolve({ result: pollContent, size: this.transactionResults.length, 
                  fromTransactionId: startTransactionId, toTransactionId: endTransactionId });

                this.setPolls$({ result: pollContent, size: this.transactionResults.length,
                  fromTransactionId: startTransactionId, toTransactionId: endTransactionId });
                
              }
    
          }
        } else {
          resolve(undefined);
        }
        
    });
    return await promise;
  }

  ab2str(buf) {
    return JSON.parse(buf);
    // return JSON.parse(String.fromCharCode.apply(null, new Uint16Array(buf)));
  }

  getPolls$(): Observable<any> {
    return this.polls$;
  }
  setPolls$(value) {
    this.polls.next(value);
  }

  /**
   *
   *
   * @param {number} byId
   * @returns
   * @memberof WalletService
   */
  filterPoll(byId: number, name: string): PollInterface {
    return this.allPollResult.find(elm => elm.id === byId && elm.name == name);
  }

  /**
   *
   *
   * @returns
   * @memberof WalletService
   */
  resetPoll(): void {
    this.allPollResult = [];
  }
}
export interface FileInterface {
  name: string;
  content: any;
  type: string;
  extension: string;
}

export interface PollInterface {
  name: string;
  description: string;
  id: string;
  type: number;
  isPrivate: boolean,
  isMultiple: boolean,
  options: optionsPoll[];
  whiteList: Object[];
  blackList?: Object[];
  startDate: Date;
  endDate: Date;
  createdDate: Date;
  quantityOption: number;
}

export interface optionsPoll {
  name: string;
  publicAccount: PublicAccount
}
export interface FileInterface {
  name: string;
  content: any;
  type: string;
  extension: string;
}
