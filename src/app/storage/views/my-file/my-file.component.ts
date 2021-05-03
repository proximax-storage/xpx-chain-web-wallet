import { Component, OnInit, ViewChild, HostListener, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { MdbTablePaginationComponent, MdbTableDirective, ModalDirective } from 'ng-uikit-pro-standard';
import {
  SearchParameter,
  ConnectionConfig,
  BlockchainNetworkConnection,
  Protocol,
  IpfsConnection,
  Searcher,
  PrivacyType,
  Downloader,
  DirectDownloadParameter,
  StreamHelper
} from 'tsjs-chain-xipfs-sdk';
import { saveAs } from 'file-saver';
import { FormGroup, Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { AppConfig } from '../../../config/app.config';
import { TransactionsService } from '../../../transactions/services/transactions.service';
import { WalletService } from '../../../wallet/services/wallet.service';
import { ProximaxProvider } from '../../../shared/services/proximax.provider';
import { SharedService, ConfigurationForm } from '../../../shared/services/shared.service';
import { environment } from '../../../../environments/environment';
import { SearchResultInterface } from '../services/storage.service';
import { HeaderServicesInterface } from '../../../servicesModule/services/services-module.service';


@Component({
  selector: 'app-my-file',
  templateUrl: './my-file.component.html',
  styleUrls: ['./my-file.component.css']
})
export class MyFileComponent implements OnInit, AfterViewInit {

  @ViewChild(MdbTablePaginationComponent, { static: true }) mdbTablePagination: MdbTablePaginationComponent;
  @ViewChild(MdbTableDirective, { static: true }) mdbTable: MdbTableDirective;
  @ViewChild(ModalDirective, { static: true }) basicModal: ModalDirective;
  @ViewChild('mdbModalPassword', { static: true }) mdbModalPassword: ModalDirective;
  paramsHeader: HeaderServicesInterface = {
    moduleName: 'Storage',
    componentName: 'Files',
    extraButton: 'Upload a New File',
    routerExtraButton: `/${AppConfig.routes.uploadFile}`
  };
  configurationForm: ConfigurationForm = {};
  downloadForm: FormGroup;
  passwordForm: FormGroup;
  searching = false;
  downloading = false;
  objectKeys = Object.keys;
  resultSize = 10;
  typeTransactions: any;
  fromTransactionId: string;
  downloadPrivate = false;
  typeNode = '';
  typeSearch = '';
  paramSearch = '';
  previous: any = '';
  searchText: string = '';
  elements: any = [];
  common: any;
  passwordMain = 'password';
  dataSelected: SearchResultInterface = null;
  headElements = ['Date', 'Name', 'Action'];
  optionTypeSearch = [{
    value: 'name',
    label: 'File Name'
  }, {
    value: 'dataHash',
    label: 'Data Hash'
  }, {
    value: 'custom',
    label: 'Private (Encrypted)'
  }];
  searcher: Searcher;
  downloader: Downloader;


  constructor(
    private cdRef: ChangeDetectorRef,
    private fb: FormBuilder,
    private walletService: WalletService,
    private proximaxProvider: ProximaxProvider,
    private sharedService: SharedService,
    private transactionsService: TransactionsService
  ) { }

  @HostListener('input') oninput() {
    // this.searchItems();

  }

  ngOnInit() {
    this.configurationForm = this.sharedService.configurationForm;
    this.typeTransactions = this.transactionsService.arraTypeTransaction;
    this.createForm();
    this.initialiseStorage();
    this.getFiles();
  }
  ngOnDestroy(): void {
    this.common = undefined
  }

  ngAfterViewInit() {

    this.cdRef.detectChanges();
  }
  /**
    *
    *
    * @param {*} inputType
    * @memberof AuthComponent
    */
  changeInputType(inputType) {
    let newType = this.sharedService.changeInputType(inputType)
    this.passwordMain = newType;
  }
  createForm() {
    this.downloadForm = this.fb.group({
      encryptionPassword: ['', [
        Validators.minLength(this.configurationForm.passwordWallet.minLength),
        Validators.maxLength(this.configurationForm.passwordWallet.maxLength)
      ]],
    });
    this.passwordForm = this.fb.group({
      password: ['']
    });

    // cosignatorieSign: [''],
  }

  clearForm(nameInput: string = '', nameControl: string = '') {
    if (nameInput !== '') {
      if (nameControl !== '') {
        this.downloadForm.controls[nameControl].get(nameInput).reset();
        return;
      }

      this.downloadForm.get(nameInput).reset();
      return;
    }

    this.downloadForm.reset();
    return;
  }
  /**
     *
     *
     * @param {string} [nameInput='']
     * @param {string} [nameControl='']
     * @param {string} [nameValidation='']
     * @returns
     * @memberof AuthComponent
     */
  validateInputPasswordForm(nameInput: string = '', nameControl: string = '', nameValidation: string = '') {
    let validation: AbstractControl = null;
    if (nameInput !== '' && nameControl !== '') {
      validation = this.passwordForm.controls[nameControl].get(nameInput);
    } else if (nameInput === '' && nameControl !== '' && nameValidation !== '') {
      validation = this.passwordForm.controls[nameControl].getError(nameValidation);
    } else if (nameInput !== '') {
      validation = this.passwordForm.get(nameInput);
    }
    return validation;
  }
  validateInput(nameInput: string = '', nameControl: string = '', nameValidation: string = '') {
    let validation: AbstractControl = null;
    if (nameInput !== '' && nameControl !== '') {
      validation = this.downloadForm.controls[nameControl].get(nameInput);
    } else if (nameInput === '' && nameControl !== '' && nameValidation !== '') {
      validation = this.downloadForm.controls[nameControl].getError(nameValidation);
    } else if (nameInput !== '') {
      validation = this.downloadForm.get(nameInput);
    }
    return validation;
  }

  onDownloadFormOpen(event: any) {
    this.downloadForm.get('encryptionPassword').setValue('');
  }

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
    this.downloader = new Downloader(connectionConfig);
  }

  async getFiles(dataHash?: string, title?: string, downloadPrivate: Boolean = false) {

    // console.log(this.fromTransactionId);
    // if
    let param = null
    if (!downloadPrivate) {
      param = SearchParameter.createForPublicKey(
        this.walletService.currentAccount.publicAccount.publicKey
      );
    } else {
      param = SearchParameter.createForPrivateKey(this.common.privateKey);
    }
    // const param = SearchParameter.createForPublicKey(
    //   this.walletService.currentAccount.publicAccount.publicKey
    // );
    param.withResultSize(this.resultSize);

    if (dataHash) {
      param.withDataHashFilter(dataHash);
    }

    if (title) {
      param.withNameFilter(title);
    }

    if (this.fromTransactionId) {
      param.withFromTransactionId(this.fromTransactionId);
    }


    const response = await this.searcher.search(param.build());
    // console.log(response);

    if (response.toTransactionId) {
      this.fromTransactionId = response.toTransactionId;
    }

    // console.log(this.fromTransactionId);
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

  async clearData() {
    this.elements = [];
    this.paramSearch = '';
    this.fromTransactionId = undefined;
    await this.getFiles();
  }
  mdbModalPasswordClose() {
    this.mdbModalPassword.hide() 
    this.passwordForm.reset()
  }
  async getFilesCustom() {
    this.common = { password: this.passwordForm.get('password').value };
    this.searching = true;
    // const decrypt = ;
    if (this.walletService.decrypt(this.common)) {
      this.passwordForm.reset()
      this.mdbModalPassword.hide()
      const response = await this.getFiles(undefined, this.paramSearch, this.downloadPrivate);
      this.searching = false;
    }

  }
  async searchData() {
    this.passwordForm.controls['password'].setValidators([]);
    this.passwordForm.controls['password'].updateValueAndValidity({ emitEvent: false, onlySelf: true });
    if (!this.searching) {

      this.elements = [];
      this.fromTransactionId = undefined;
      if (this.typeSearch === '') {
        this.sharedService.showError('', 'Please select a search type');
        return;
      } else if (this.paramSearch === '') {
        var tp = '';
        if (this.typeSearch === 'dataHash') {
          tp = 'a dataHash';
        } else if (this.typeSearch === 'name') {
          tp = 'a name';
        }
        if (this.typeSearch !== 'custom') {
          this.sharedService.showError('', `Please, add ${tp}`);
          return;
        }

      }

      this.mdbTable.setDataSource(this.elements);
      this.elements = this.mdbTable.getDataSource();
      this.searching = true;
      if (this.typeSearch === 'dataHash') {
        try {
          const response = await this.getFiles(this.paramSearch);
          // console.log(response);
          this.searching = false;
        } catch (err) {
          this.searching = false;
          this.sharedService.showError("Warning", err);
        }
      } else if (this.typeSearch === 'name') {
        try {
          const response = await this.getFiles(undefined, this.paramSearch);
          //console.log(response);
          this.searching = false;
        } catch (err) {
          this.searching = false;
          this.sharedService.showError("Warning", err);
        }
      } else if (this.typeSearch === 'custom') {
        try {
          this.downloadPrivate = true;
          const validators = [Validators.required,
          Validators.minLength(this.configurationForm.passwordWallet.minLength),
          Validators.maxLength(this.configurationForm.passwordWallet.maxLength)];
          this.passwordForm.controls['password'].setValidators(validators);
          this.passwordForm.controls['password'].updateValueAndValidity({ emitEvent: false, onlySelf: true });

          this.mdbModalPassword.show();

          // const response = await this.getFiles(undefined,  this.paramSearch, this.downloadPrivate);
          this.searching = false;
        } catch (err) {
          this.searching = false;
          this.sharedService.showError("Warning", err);
        }
      }
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

  async download(item: any) {
    // console.log(item);
    // console.log(this.downloadForm.valid);
    // this.downloadForm.markAsDirty();

    if (this.downloadForm.valid) {
      this.downloading = true;
      if (item.dataHash) {

        try {
          const param = DirectDownloadParameter.createFromDataHash(item.dataHash);
          if (item.encryptionType === PrivacyType.PASSWORD) {
            param.withPasswordPrivacy(this.downloadForm.get('encryptionPassword').value);
          } else if (item.encryptionType === PrivacyType.PLAIN) {
            param.withPlainPrivacy();
          }
          // console.log('Downloading ...');
          const response = await this.downloader.directDownload(param.build());
          // console.log(response);

          const downloadBuffer = await StreamHelper.stream2Buffer(response);
          const downloableFile = new Blob([downloadBuffer], { type: item.contentType });
          saveAs(downloableFile, item.name);
          this.downloading = false;
          this.basicModal.hide();
        } catch (err) {
          //console.log(err);
          this.downloading = false;
          this.sharedService.showError("Unable to download", err);
        }
      }
    }
  }
}
