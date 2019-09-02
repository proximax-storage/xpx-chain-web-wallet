import { PrivacyType, Uint8ArrayParameterData, UploadParameter, Protocol, ConnectionConfig, BlockchainNetworkConnection, IpfsConnection, Uploader, UploadResult, Searcher, SearchParameter } from 'xpx2-ts-js-sdk';
import { Injectable } from '@angular/core';
import { ProximaxProvider } from 'src/app/shared/services/proximax.provider';
import { WalletService } from 'src/app/wallet/services/wallet.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  files: any[];
  uploader: Uploader;
  searcher: Searcher;
  resultSize: number = 20;


  constructor(
    private proximaxProvider: ProximaxProvider,
    private walletService: WalletService
  ) {

  }

  /**
   *
   *
   * @param {File} file
   * @param {string} b6
   * @memberof StorageService
   */
  async buildDataStorage(file: File, b6: string): Promise<UploadResult> {
    // console.log('only file --->', file);
    const uploadedFile = file;
    // console.log(uploadedFile);
    const uploadedFileType = uploadedFile.type;
    // console.log(uploadedFileType);
    const uploadedFileContent = await this.readFile(uploadedFile);
    const fileName = file.name;
    // console.log(uploadedFile.name);
    // const optionalFileName =  fileName ===  undefined ? uploadedFile.name: fileName;
    //console.log(optionalFileName);
    // const optionalFileName = uploadedFile.name;
    const metaParams = Uint8ArrayParameterData.create(uploadedFileContent, fileName, '', uploadedFileType);
    // console.log('---metaParams---', metaParams);
    const uploadParams = UploadParameter.createForUint8ArrayUpload(metaParams, b6);
    // console.log('uploadParams -->', uploadParams);
    const encryptionMethod = PrivacyType.PLAIN;
    // console.log(encryptionMethod);
    uploadParams.withPlainPrivacy();
    if (!this.uploader) {
      this.initialiseStorage();
    }

    const result = await this.uploader.upload(uploadParams.build());
    console.log(result);
    return result;
  }

  /**
   *
   *
   * @memberof StorageService
   */
  initialiseStorage() {
    const blockChainNetworkType = this.proximaxProvider.getBlockchainNetworkType(this.walletService.currentAccount.network);
    const blockChainHost = environment.blockchainConnection.host;
    const blockChainPort = environment.blockchainConnection.port;
    const blockChainProtocol = environment.blockchainConnection.protocol === 'https' ? Protocol.HTTPS : Protocol.HTTP;

    const storageHost = environment.storageConnection.host;
    const storagePort = environment.storageConnection.port;
    const storageOptions = environment.storageConnection.options;
    const connectionConfig = ConnectionConfig.createWithLocalIpfsConnection(
      new BlockchainNetworkConnection(blockChainNetworkType, blockChainHost, blockChainPort, blockChainProtocol),
      new IpfsConnection(storageHost, storagePort, storageOptions)
    );

    this.searcher = new Searcher(connectionConfig);
    this.uploader = new Uploader(connectionConfig);
  }

  readFile(file: Blob) {
    return new Promise<Uint8Array>(function (resolve, reject) {
      const reader = new FileReader();
      reader.onload = () => {
        const fileContent = reader.result as ArrayBuffer;
        resolve(new Uint8Array(fileContent));
      };
      reader.onerror = event => reject(event);
      reader.readAsArrayBuffer(file);
    });
  }
  
  async getFiles() {
    const param = SearchParameter.createForPublicKey(
      this.walletService.currentAccount.publicAccount.publicKey
    );
    param.withResultSize(this.resultSize);
  
    if (!this.searcher) {
      this.initialiseStorage();
    }
    return await this.searcher.search(param.build());
    // console.log(response);  
    // console.log(this.fromTransactionId);
    // this.elements = [];
  
    // response.results.forEach(el => {
    //   const item = {
    //     name: el.messagePayload.data.name === undefined ? el.messagePayload.data.dataHash : el.messagePayload.data.name,
    //     contentType: el.messagePayload.data.contentType,
    //     contentTypeIcon: this.getContentTypeIcon(el.messagePayload.data.contentType),
    //     encryptionType: el.messagePayload.privacyType,
    //     encryptionTypeIcon: this.getEncryptionMethodIcon(el.messagePayload.privacyType),
    //     description: el.messagePayload.data.description,
    //     timestamp: this.dateFormatLocal(el.messagePayload.data.timestamp),
    //     dataHash: el.messagePayload.data.dataHash
    //   }
  
    //   this.elements.push(item);
    // });
  
  }
}


export interface SearchResultInterface {
  name: string;
  contentType: string;
  contentTypeIcon: string;
  encryptionType: PrivacyType;
  encryptionTypeIcon: string;
  description: string;
  timestamp: string;
  dataHash: string;
}
