import { Component, OnInit, ViewChild, HostListener, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { MdbTablePaginationComponent, MdbTableService, MdbTableDirective, BreadcrumbModule } from 'ng-uikit-pro-standard';
import { Address, PublicAccount } from 'tsjs-xpx-chain-sdk';
import { SearchParameter, ConnectionConfig, BlockchainNetworkConnection, BlockchainNetworkType, Protocol, IpfsConnection, Searcher, TransactionFilter, PrivacyType, Downloader } from 'xpx2-ts-js-sdk';
import { first } from "rxjs/operators";
import { AppConfig } from 'src/app/config/app.config';
import { TransactionsService } from 'src/app/transfer/services/transactions.service';
import { WalletService } from 'src/app/wallet/services/wallet.service';
import { ProximaxProvider } from 'src/app/shared/services/proximax.provider';
import { NodeService } from 'src/app/servicesModule/services/node.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { environment } from 'src/environments/environment';
import { SearchResultInterface } from '../services/storage.service';



@Component({
  selector: 'app-my-file',
  templateUrl: './my-file.component.html',
  styleUrls: ['./my-file.component.css']
})
export class MyFileComponent implements OnInit, AfterViewInit {

  @ViewChild(MdbTablePaginationComponent, { static: true }) mdbTablePagination: MdbTablePaginationComponent;
  @ViewChild(MdbTableDirective, { static: true }) mdbTable: MdbTableDirective;

  moduleName = 'Storage';
  componentName = 'My Files';
  goBack = `/${AppConfig.routes.service}`;
  searching = false;
  objectKeys = Object.keys;
  resultSize = 5;
  firstItemIndex;
  lastItemIndex;
  typeTransactions: any;
  fromTransactionId: string;
  typeNode = '';
  typeSearch = '';
  paramSearch = '';
  previous: any = '';
  searchText: string = '';
  elements: any = [];
  dataSelected: SearchResultInterface = null;
  headElements = ['Timestamp', 'Name', 'Action'];
  optionTypeSearch = [
    {
      'value': 'address',
      'label': 'Address'
    }, {
      'value': 'publickey',
      'label': 'Public Key'
    }, {
      'value': 'hash',
      'label': 'Hash'
    }
  ];
  searcher: Searcher;
  downloader: Downloader;


  constructor(
    private tableService: MdbTableService,
    private cdRef: ChangeDetectorRef,
    private walletService: WalletService,
    private proximaxProvider: ProximaxProvider,
    private nodeService: NodeService,
    private sharedService: SharedService,
    private transactionsService: TransactionsService
  ) { }

  @HostListener('input') oninput() {
    // this.searchItems();
    this.mdbTablePagination.searchText = this.searchText;
  }

  ngOnInit() {
    this.typeTransactions = this.transactionsService.arraTypeTransaction;
    this.initialiseStorage();
    this.getFiles();
  }

  ngAfterViewInit() {
   
    this.cdRef.detectChanges();
  }


  initialiseStorage() {
    const blockChainNetworkType = this.proximaxProvider.getBlockchainNetworkType(this.walletService.network);
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
    this.downloader = new Downloader(connectionConfig);
  }

  async getFiles(dataHash?: string, title?: string, transaction?: TransactionFilter) {
    
    console.log(this.fromTransactionId);

    const param = SearchParameter.createForPublicKey(
      this.walletService.publicAccount.publicKey
    );
    param.withResultSize(this.resultSize);

    if (dataHash) {
      param.withDataHashFilter(dataHash);
    }

    if (title) {
      param.withNameFilter(title);
    }

    if (transaction) {
      param.withTransactionFilter(transaction);
    }

    if (this.fromTransactionId) {
      param.withFromTransactionId(this.fromTransactionId);
    }

    const response = await this.searcher.search(param.build());
    console.log(response);

    if (response.toTransactionId) {
      this.fromTransactionId = response.toTransactionId;
    }

    console.log(this.fromTransactionId);



    // this.elements = [];

    response.results.forEach(el => {
      const item = {
        name: el.messagePayload.data.name === undefined ? el.messagePayload.data.dataHash : el.messagePayload.data.name,
        contentType: el.messagePayload.data.contentType,
        contentTypeIcon: this.getContentTypeIcon(el.messagePayload.data.contentType),
        encryptionType: el.messagePayload.privacyType,
        encryptionTypeIcon: this.getEncryptionMethodIcon(el.messagePayload.privacyType),
        description: el.messagePayload.data.description,
        timestamp: this.dateFormatLocal(el.messagePayload.data.timestamp),
        dataHash: el.messagePayload.data.dataHash
      }

      this.elements.push(item);
    });

  }

  searchData() {
    if (!this.searching) {

      this.elements = [];

      if (this.typeSearch === '') {
        this.sharedService.showError('', 'Please, select a type search');
        return;
      } else if (this.paramSearch === '') {
        var tp = '';
        if (this.typeSearch === 'address') {
          tp = 'a address';
        } else if (this.typeSearch === 'hash') {
          tp = 'a hash';
        } else if (this.typeSearch === 'publickey') {
          tp = 'a publickey';
        }

        this.sharedService.showError('', `Please, add ${tp}`);
        return;
      }

      this.mdbTable.setDataSource(this.elements);
      this.elements = this.mdbTable.getDataSource();
      this.previous = this.mdbTable.getDataSource();
      this.searching = true;
      if (this.typeSearch === 'address') {
        //from address
        if (this.paramSearch.length === 40 || this.paramSearch.length === 46) {
          this.proximaxProvider.getAccountInfo(Address.createFromRawAddress(this.paramSearch)).pipe(first()).subscribe(
            accountInfo => {
              this.proximaxProvider.getTransactionsFromAccount(accountInfo.publicAccount).subscribe(
                resp => {
                  // console.log('with address info ', resp);
                  this.buildTransaction(resp);
                  this.searching = false;
                },
                error => {
                  // console.log(error);
                  this.searching = false;
                }
              );
            }
          );
        } else {
          this.paramSearch = '';
          this.searching = false;
        }

      } else if (this.typeSearch === 'publickey') {
        //From publickey
        const publicAccount = this.proximaxProvider.createPublicAccount(this.paramSearch, this.walletService.network);
        this.proximaxProvider.getTransactionsFromAccount(publicAccount, this.nodeService.getNodeSelected()).subscribe(
          resp => {
            this.searching = false;
            this.buildTransaction(resp);
          },
          error => {
            this.searching = false;
            // console.log(error);
          }
        );
      } else {
        //From hash
        this.proximaxProvider.getTransactionInformation(this.paramSearch, this.nodeService.getNodeSelected()).subscribe(
          resp => {
            // console.log('with hash info', resp);
            this.searching = false;
            this.buildTransaction([resp]);
          },
          error => {
            this.searching = false;
            // console.log(error);
          }
        );
      }
    }

  }


  buildTransaction(param) {
    const data = [];
    param.forEach(element => {
      const builderTransactions = this.transactionsService.getStructureDashboard(element);
      if (builderTransactions !== null) {
        data.push(builderTransactions);
      }

      this.elements = data;
      this.mdbTable.setDataSource(data);
      this.elements = this.mdbTable.getDataSource();
      this.previous = this.mdbTable.getDataSource();
    });
  }

  searchItems() {
    const prev = this.mdbTable.getDataSource();
    if (!this.searchText) {
      this.mdbTable.setDataSource(this.previous);
      this.elements = this.mdbTable.getDataSource();
    }

    if (this.searchText) {
      this.elements = this.mdbTable.searchLocalDataBy(this.searchText);
      this.mdbTable.setDataSource(prev);
    }
  }

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

  dateFormatLocal(timestamp: number) {
    return new Date(timestamp).toUTCString();
  }

  async download(item:any) {
    console.log(item);

  }
}
