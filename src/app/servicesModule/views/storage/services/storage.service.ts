import { PrivacyType, Uint8ArrayParameterData, UploadParameter, Protocol, ConnectionConfig, BlockchainNetworkConnection, IpfsConnection, Uploader, UploadResult, Searcher, SearchParameter, DirectDownloadParameter, Downloader, StreamHelper, SearchResult } from 'xpx2-ts-js-sdk';
import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver';
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
  downloader: Downloader;

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
   * @param {*} data
   * @param {string} pwd
   * @memberof StorageService
   */
  async convertToFile(data: any, pwd: string = ''): Promise<Blob> {
    const param = DirectDownloadParameter.createFromDataHash(data.dataHash);
    if (data.encryptionType === PrivacyType.PASSWORD) {
      param.withPasswordPrivacy(pwd);
    } else if (data.encryptionType === PrivacyType.PLAIN) {
      param.withPlainPrivacy();
    }

    console.log('Downloading ...');
    const response = await this.downloader.directDownload(param.build());
    console.log(response);

    const downloadBuffer = await StreamHelper.stream2Buffer(response);
    const downloableFile = new Blob([downloadBuffer], { type: data.contentType });
    console.log('---------> downloableFile ----------- \n', downloableFile);
    // saveAs(downloableFile, data.name);
    return downloableFile;
  }

  /**
   *
   *
   * @returns
   * @memberof StorageService
   */
  async getFiles(): Promise<SearchResultInterface[]> {
    const elements: SearchResultInterface[] = [];
    const param = SearchParameter.createForPublicKey(
      this.walletService.currentAccount.publicAccount.publicKey
    );

    param.withResultSize(this.resultSize);
    if (!this.searcher) {
      this.initialiseStorage();
    }

    const response = await this.searcher.search(param.build());
    response.results.forEach(el => {
      const item: SearchResultInterface = {
        random: Math.floor(Math.random() * 1455654),
        name: el.messagePayload.data.name === undefined ? el.messagePayload.data.dataHash : el.messagePayload.data.name,
        contentType: el.messagePayload.data.contentType,
        contentTypeIcon: this.getContentTypeIcon(el.messagePayload.data.contentType),
        encryptionType: el.messagePayload.privacyType,
        encryptionTypeIcon: this.getEncryptionMethodIcon(el.messagePayload.privacyType),
        description: el.messagePayload.data.description,
        timestamp: this.dateFormatLocal(el.messagePayload.data.timestamp),
        dataHash: el.messagePayload.data.dataHash,
        selected: false
      }

      elements.push(item);
    });

    return elements;
  }

  /**
   *
   *
   * @param {number} timestamp
   * @returns
   * @memberof StorageService
   */
  dateFormatLocal(timestamp: number) {
    return new Date(timestamp).toUTCString();
  }

  /**
   *
   *
   * @param {string} contentType
   * @returns
   * @memberof StorageService
   */
  getContentTypeIcon(contentType: string) {
    const baseAsset = 'assets/images/img/';
    let iconUrl = baseAsset + 'icon-doc-type-unknown-16h-proximax-sirius-wallet.svg';
    switch (contentType) {
      case 'application/msword':
        iconUrl = baseAsset + 'icon-doc-type-doc-16h-proximax-sirius-wallet.svg';
        break;
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        iconUrl = baseAsset + 'icon-doc-type-docx-16h-proximax-sirius-wallet.svg';
        break;
      case 'application/vnd.ms-powerpoint':
        iconUrl = baseAsset + 'icon-doc-type-ppt-16h-proximax-sirius-wallet.svg';
        break;
      case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
        iconUrl = baseAsset + 'icon-doc-type-pptx-16h-proximax-sirius-wallet.svg';
        break;
      case 'application/vnd.ms-excel':
        iconUrl = baseAsset + 'icon-doc-type-xlsx-16h-proximax-sirius-wallet.svg';
        break;
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        iconUrl = baseAsset + 'icon-doc-type-xlsx-16h-proximax-sirius-wallet.svg';
        break;
      case 'application/x-tar':
        iconUrl = baseAsset + 'icon-doc-type-tar-16h-proximax-sirius-wallet.svg';
        break;
      case 'application/zip':
        iconUrl = baseAsset + 'icon-doc-type-zip-16h-proximax-sirius-wallet.svg';
        break;
      case 'application/vnd.oasis.opendocument.text':
        iconUrl = baseAsset + 'icon-doc-type-odt-16h-proximax-sirius-wallet.svg';
        break;
      case 'application/vnd.oasis.opendocument.spreadsheet':
        iconUrl = baseAsset + 'icon-doc-type-ods-16h-proximax-sirius-wallet.svg';
        break;
      case 'application/vnd.oasis.opendocument.presentation':
        iconUrl = baseAsset + 'icon-doc-type-ppt-16h-proximax-sirius-wallet.svg';
        break;
      case 'application/pdf':
        iconUrl = baseAsset + 'icon-doc-type-pdf-16h-proximax-sirius-wallet.svg';
        break;
      case 'image/jpeg':
        iconUrl = baseAsset + 'icon-doc-type-jpg-16h-proximax-sirius-wallet.svg';
        break;
      case 'image/gif':
        iconUrl = baseAsset + 'icon-doc-type-gif-16h-proximax-sirius-wallet.svg';
        break;
      case 'image/png':
        iconUrl = baseAsset + 'icon-doc-type-png-16h-proximax-sirius-wallet.svg';
        break;
      default:
        iconUrl = iconUrl;

    }
    return iconUrl;
  }

  /**
   *
   *
   * @param {PrivacyType} privacyType
   * @returns
   * @memberof StorageService
   */
  getEncryptionMethodIcon(privacyType: PrivacyType) {
    const baseAsset = 'assets/images/img/';
    let iconUrl = baseAsset + 'assets/images/img/';
    switch (privacyType) {
      case PrivacyType.PLAIN:
        iconUrl = '';
        break;
      case PrivacyType.PASSWORD:
        iconUrl = baseAsset + 'icon-encrypt-password-green-16h-proximax-sirius-wallet.svg';
        break;
      case PrivacyType.NEM_KEYS:
        iconUrl = baseAsset + 'icon-private-key-green-16h-proximax-sirius-wallet.svg';
        break;
    }
    return iconUrl;
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
    this.downloader = new Downloader(connectionConfig);
  }

  /**
   *
   *
   * @param {Blob} file
   * @returns
   * @memberof StorageService
   */
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
}


export interface SearchResultInterface {
  random?: number;
  name: string;
  contentType: string;
  contentTypeIcon: string;
  encryptionType: PrivacyType;
  encryptionTypeIcon: string;
  description: string;
  timestamp: string;
  dataHash: string;
  selected?: boolean;
}
