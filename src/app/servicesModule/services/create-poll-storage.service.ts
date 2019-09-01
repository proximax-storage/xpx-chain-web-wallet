import { Injectable } from '@angular/core';

import { BlockUI, NgBlockUI } from 'ng-block-ui';
import {
  Uploader, ConnectionConfig, BlockchainNetworkConnection, IpfsConnection,
  UploadParameter, ReadableStreamParameterData, StreamHelper,
  PrivacyType, SearchParameter, Searcher, Downloader, TransactionFilter, Protocol
} from 'xpx2-ts-js-sdk';
import { ProximaxProvider } from 'src/app/shared/services/proximax.provider';
import { DirectDownloadParameter } from 'xpx2-ts-js-sdk/build/main/src/lib/download/direct-download-parameter';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { WalletService } from 'src/app/wallet/services/wallet.service';
import { PublicAccount, Address, Mosaic, MosaicId, UInt64, Account } from 'tsjs-xpx-chain-sdk';
import { SharedService } from 'src/app/shared/services/shared.service';
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
  publicAccount: PublicAccount;
  @BlockUI() blockUI: NgBlockUI;

  constructor(
    private proximaxProvider: ProximaxProvider,
    private sharedService: SharedService,
    private walletService: WalletService,
  ) {
    this.connectionStorage();
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

    this.uploader = new Uploader(connectionConfig);
    this.searcher = new Searcher(connectionConfig);
    this.downloader = new Downloader(connectionConfig);
  }



  async sendFileStorage(fileObject: FileInterface, description: any, account: Account, privateKey: string) {
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

      const recipientPublicKey = account.publicAccount.publicKey;
      if (recipientPublicKey.length > 0) {
        param.withRecipientPublicKey(recipientPublicKey);
      }
      param.withTransactionMosaics([new Mosaic(new MosaicId(environment.mosaicXpxInfo.id), UInt64.fromUint(0))]);
      let recipientAddress = account.publicAccount.address.plain();
      if (recipientPublicKey.length > 0) {
        recipientAddress = Address.createFromPublicKey(recipientPublicKey, account.publicAccount.address.networkType).plain();
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
      this.sharedService.showSuccess('Success', 'Record saved succesfully');
      resolve(this.transactionResults);
    });
    return await promise;
  }


  async loadTransactions(publicAccount: PublicAccount) {
    this.transactionResults = [];
    this.pollResult = [];
    const promise = new Promise(async (resolve, reject) => {
      if (this.searcher) {
        const searchParam = SearchParameter.createForPublicKey(publicAccount.publicKey);

        searchParam.withTransactionFilter(TransactionFilter.ALL);
        // searchParam.withResultSize(100);
        const searchResult = await this.searcher.search(searchParam.build());
        if (searchResult.results.length > 0) {
          for (const resultItem of searchResult.results.reverse()) {
            const encrypted = resultItem.messagePayload.privacyType !== PrivacyType.PLAIN;

            if (resultItem.messagePayload.data.description === 'poll') {
              this.transactionResults.push({
                title: resultItem.messagePayload.data.name, type: resultItem.messagePayload.data.contentType,
                privacy: resultItem.messagePayload.privacyType,
                dataHash: resultItem.messagePayload.data.dataHash,
                transactionHash: resultItem.transactionHash, isEncrypted: encrypted
              });
            }
          }
          for (const data of this.transactionResults) {
            if (data.privacy === PrivacyType.PLAIN) {
              const paramData = DirectDownloadParameter.createFromDataHash(data.dataHash);
              paramData.withPlainPrivacy();
              const downloadResult = await this.downloader.directDownload(paramData.build());
              const dataBuffer = await StreamHelper.stream2String(downloadResult);
              const downloableFile = new Blob([dataBuffer], { type: data.type });
              // resultData.push();

              this.pollResult.push(this.ab2str(dataBuffer));
              resolve({ result: this.ab2str(dataBuffer), size: searchResult.results.length });

              this.setPolls$({ result: this.ab2str(dataBuffer), size: searchResult.results.length });
            }
          }
        } else {
          resolve([]);
        }


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
  filterPoll(byId: number): PollInterface {
    return this.pollResult.find(elm => elm.id === byId);
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
  desciption: string;
  id: string;
  type: number;
  isPrivate: boolean,
  isMultiple: boolean,
  options: optionsPoll[];
  witheList: Object[];
  blacklist?: Object[];
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