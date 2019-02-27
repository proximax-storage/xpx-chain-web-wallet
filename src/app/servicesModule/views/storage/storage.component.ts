import { Component, OnInit, ElementRef, Renderer2, EventEmitter, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UploadFile, UploadInput, UploadOutput, humanizeBytes, ModalDirective, BreadcrumbModule } from 'ng-uikit-pro-standard';
import { SharedService } from '../../../shared/services/shared.service';
import { WalletService } from '../../../shared/services/wallet.service';
import { environment } from '../../../../environments/environment';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Uploader, ConnectionConfig, BlockchainNetworkConnection, IpfsConnection, UploadParameter, ReadableStreamParameterData, StreamHelper, PrivacyType, SearchParameter, Searcher, SearchResultItem, Downloader, DownloadParameter, TransactionFilter, DirectDownloadParameter } from 'xpx2-ts-js-sdk';
import { saveAs } from 'file-saver';
import { crypto } from "proximax-nem2-library";
import { Address, UInt64, Mosaic, MosaicId, Account, PublicAccount } from 'proximax-nem2-sdk';
import { FileInterface } from 'src/app/shared';
import { ProximaxProvider } from '../../../shared/services/proximax.provider';




@Component({
  selector: 'app-storage',
  templateUrl: './storage.component.html',
  styleUrls: ['./storage.component.scss']
})
export class StorageComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;
  @ViewChild('frame') frame: ModalDirective;
  @ViewChild('dlframe') dlframe: ModalDirective;

  addRecordForm: FormGroup;
  downloadRecordForm: FormGroup;

  formData: FormData;
  files: UploadFile[];
  uploadInput: EventEmitter<UploadInput>;
  humanizeBytes: Function;
  dragOver: boolean;

  connectionConfig: ConnectionConfig;
  uploader: Uploader;
  downloader: Downloader;
  searcher: Searcher;

  headElements = ['Title', 'Transaction', 'Type'];
  transactionResults = [];
  searchName = '';
  searching = false;
  showRecordEntry = false;
  showPassword = false;
  showEncryptionPassword = false;
  showDecryptionPassword = false;
  showEncryptionKeyPair = false;
  showDecryptionKeyPair = false;
  signerPrivateKey = '';
  optionsEncryptionMethods: Array<any>;
  privacyType = PrivacyType.PLAIN;

  downloadFile: FileInterface;

  constructor(private fb: FormBuilder,
    private _el: ElementRef,
    private _r: Renderer2,
    private sharedService: SharedService,
    private walletService: WalletService,
    private proximaxProvider: ProximaxProvider) {

    this.files = [];
    this.uploadInput = new EventEmitter<UploadInput>();
    this.humanizeBytes = humanizeBytes;
    this.optionsEncryptionMethods = [{ value: PrivacyType.PLAIN, label: 'PLAIN' }, { value: PrivacyType.PASSWORD, label: 'PASSWORD' }, { value: PrivacyType.NEM_KEYS, label: 'KEY PAIR' },];
    if (this.walletService.network) {
      const blockChainNetworkType = this.proximaxProvider.getBlockchainNetworkType(this.walletService.network);

      this.connectionConfig = ConnectionConfig.createWithLocalIpfsConnection(
        new BlockchainNetworkConnection(
          blockChainNetworkType,
          environment.blockchainConnection.host,
          environment.blockchainConnection.port,
          environment.blockchainConnection.protocol
        ),
        //new IpfsConnection(environment.storageConnection.host, environment.storageConnection.port)
        new IpfsConnection(environment.storageConnection.host, environment.storageConnection.port, environment.storageConnection.options)
      );

      this.uploader = new Uploader(this.connectionConfig);
      this.searcher = new Searcher(this.connectionConfig);
      this.downloader = new Downloader(this.connectionConfig);

    }
  }

  ngOnInit() {

    this.createForm();
    this.loadTransactions();

  }

  async loadTransactions() {

    if (this.searcher) {
      //this.transactionResults = [];
      //const searchParam = SearchParameter.createForAddress(environment.senderAccount.address);
      
      console.log(this.walletService.publicAccount);
      const searchParam = SearchParameter.createForPublicKey(this.walletService.publicAccount.publicKey);
      //const searchParam = SearchParameter.createForAddress(this.walletService.publicAccount.address.plain());
      searchParam.withResultSize(10);
    
      console.log('Loading transactions ...');
      const searchResult = await this.searcher.search(searchParam.build());
      console.log(searchResult);
      for (let resultItem of searchResult.results.reverse()) {
        const isEncrypted = resultItem.messagePayload.privacyType !== PrivacyType.PLAIN;
        this.transactionResults.push({
          title: resultItem.messagePayload.data.name, type: resultItem.messagePayload.data.contentType,
          privacy: resultItem.messagePayload.privacyType,
          dataHash: resultItem.messagePayload.data.dataHash,
          transactionHash: resultItem.transactionHash, isEncrypted: isEncrypted
        });
      }

    }

  }

  async searchRecord() {

    if (this.searchName != null) {
      try {
        this.transactionResults = [];
        this.searching = true;

        //const searchParam = SearchParameter.createForAddress(environment.senderAccount.address);
        const searchParam = SearchParameter.createForAddress(this.walletService.publicAccount.address.plain());
        searchParam.withNameFilter(this.searchName);
        // searchParam.withFromTransactionId(this.transactionHash);

        const searchResult = await this.searcher.search(searchParam.build());

        for (let resultItem of searchResult.results) {
          const isEncrypted = resultItem.messagePayload.privacyType !== PrivacyType.PLAIN;
          this.transactionResults.push({
            title: resultItem.messagePayload.data.name, type: resultItem.messagePayload.data.contentType,
            privacy: resultItem.messagePayload.privacyType,
            dataHash: resultItem.messagePayload.data.dataHash,
            transactionHash: resultItem.transactionHash, isEncrypted: isEncrypted
          });
        }
        this.searching = false;
      }
      catch (error) {
        this.searching = false;
        this.sharedService.showError("Attention!", error);
      }

    }

  }


  /**
   * create add record form
   */
  createForm() {
    this.addRecordForm = this.fb.group({
      title: [''],
      description: [''],
      recipientAddress: [''],
      recipientPublicKey: [''],
      secureMessage: [''],
      usePasswordPrivacy: [''],
      password: ['', [Validators.minLength(8), Validators.maxLength(20)]],
      fileInput: [''],
      privateKey: [''],
      useSecureMessage: [''],
      encryptionMethod: [''],
      encryptionPasword: [''],
      recipientPrivateKey: ['']
    });

    this.downloadRecordForm = this.fb.group({
      decryptionPassword: ['', [Validators.required]],
      downloadDatahash: [''],
      decryptionPrivateKey: [''],
      decryptionPublicKey: ['']
    });
  }

  showFiles() {
    let files = '';
    for (let i = 0; i < this.files.length; i++) {
      files += this.files[i].name;
      if (!(this.files.length - 1 === i)) {
        files += ',';
      }
    }
    return files;
  }

  onUploadOutput(output: UploadOutput | any): void {

    if (output.type === 'allAddedToQueue') {
    } else if (output.type === 'addedToQueue') {
      this.files = [];
      this.files.push(output.file); // add file to array when added
    } else if (output.type === 'uploading') {
      // update current data in files array for uploading file
      const index = this.files.findIndex(file => file.id === output.file.id);
      this.files[index] = output.file;
    } else if (output.type === 'removed') {
      // remove file from array when removed
      this.files = this.files.filter((file: UploadFile) => file !== output.file);
    } else if (output.type === 'dragOver') {
      this.dragOver = true;
    } else if (output.type === 'dragOut') {
    } else if (output.type === 'drop') {
      this.dragOver = false;
    }
    this.showFiles();
  }

  getError(control, formControl?) {
    if (formControl === undefined) {
      if (this.addRecordForm.get(control).getError('required')) {
        return `This field is required`;
      } else if (this.addRecordForm.get(control).getError('minlength')) {
        return `This field must contain minimum ${this.addRecordForm.get(control).getError('minlength').requiredLength} characters`;
      } else if (this.addRecordForm.get(control).getError('maxlength')) {
        return `This field must contain maximum ${this.addRecordForm.get(control).getError('maxlength').requiredLength} characters`;
      }
    } else {
      if (this.addRecordForm.controls[formControl].get(control).getError('required')) {
        return `This field is required`;
      } else if (this.addRecordForm.controls[formControl].get(control).getError('minlength')) {
        return `This field must contain minimum ${this.addRecordForm.controls[formControl].get(control).getError('minlength').requiredLength} characters`;
      } else if (this.addRecordForm.controls[formControl].get(control).getError('maxlength')) {
        return `This field must contain maximum ${this.addRecordForm.controls[formControl].get(control).getError('maxlength').requiredLength} characters`;
      } else if (this.addRecordForm.controls[formControl].getError('noMatch')) {
        return `Password doesn't match`;
      }
    }
  }



  cleanForm(custom?, formControl?) {
    if (custom !== undefined) {
      if (formControl !== undefined) {
        this.addRecordForm.controls[formControl].get(custom).reset();
        return;
      }
      this.addRecordForm.get(custom).reset();
      return;
    }
    this.files = [];
    this.addRecordForm.reset();
    this.showRecordEntry = false;
    this.showPassword = true;
    return;
  }

  async addRecord() {
    if (this.addRecordForm.valid) {
      if (this.files.length <= 0) {
        this.sharedService.showError('Attention', 'Please choose file to upload');
      } else if (this.connectionConfig === null) {
        this.sharedService.showError('Attention', 'Your network configuration is invalid');
      } else {
        try {
          if (this.signerPrivateKey && this.signerPrivateKey.length <= 0) {
            this.showPassword = true;
            this.showRecordEntry = false;
          } else {
            const title = this.addRecordForm.get('title').value;
           

            const selectedFile = this.files[0].nativeFile;
            const fileType = selectedFile.type;
            const fileContents = await this.readFileToBuffer(selectedFile);
            const name = title ? title : selectedFile.name;

            const paramData = ReadableStreamParameterData.create(
              async () => StreamHelper.buffer2Stream(fileContents),
              name,
              null,
              fileType,
              null
            );

            const param = UploadParameter.createForReadableStreamUpload(
              paramData,
              this.signerPrivateKey
            );

            let recipientPublicKey = this.walletService.publicAccount.publicKey;
            console.log('Default Public Key' + recipientPublicKey);
            const recipientPublicKeyInput = this.addRecordForm.get('recipientPublicKey').value;

            if (this.showEncryptionKeyPair && recipientPublicKeyInput.length > 0) {
              recipientPublicKey = recipientPublicKeyInput;
            }

            console.log('Current Public Key' + recipientPublicKey);

            if (recipientPublicKey.length > 0) {
              param.withRecipientPublicKey(recipientPublicKey);
            }

            param.withTransactionMosaics([new Mosaic(new MosaicId('prx:xpx'), UInt64.fromUint(0))]);

            let recipientAddress = this.walletService.address.plain();
            console.log('default recipientAddress' + recipientAddress);
            if (recipientPublicKey.length > 0) {
              recipientAddress = Address.createFromPublicKey(recipientPublicKey, this.walletService.network).plain();
            }
            console.log('current recipientAddress' + recipientAddress);
            if (recipientAddress) {
              param.withRecipientAddress(recipientAddress);
            }

            let useSecureMessage = environment.blockchainConnection.useSecureMessage;

            if (useSecureMessage) {
              param.withUseBlockchainSecureMessage(useSecureMessage);
            }
            console.log('useSecureMessage ' + useSecureMessage);


            switch (this.privacyType) {
              case PrivacyType.PASSWORD:
                const encryptionPassword = this.addRecordForm.get('encryptionPasword').value;
                if (this.showEncryptionPassword && encryptionPassword.length > 0) {
                  param.withPasswordPrivacy(encryptionPassword);
                } else {
                  this.sharedService.showWarning("Warning", "Please enter your encryption password");
                }
                console.log('encryptionPassword' + encryptionPassword);

                break;
              case PrivacyType.NEM_KEYS:
                if (this.showEncryptionKeyPair) {
                  const privateKey = this.addRecordForm.get('recipientPrivateKey').value;
                  const publicKey = this.addRecordForm.get('recipientPublicKey').value;
                  param.withNemKeysPrivacy(privateKey, publicKey);
                }
                break;
              default:
                param.withPlainPrivacy();
            }

            //default deadline
            param.withTransactionDeadline(12);

            this.blockUI.start('uploading record ...');
            const result = await this.uploader.upload(param.build());

            const gridTitle = result.data.name ? result.data.name : selectedFile.name;
            const isEncrypted = result.privacyType !== PrivacyType.PLAIN;
            console.log(result);
            this.transactionResults.push({
              title: gridTitle,
              type: result.data.contentType,
              privacy: result.privacyType,
              dataHash: result.data.dataHash,
              transactionHash: result.transactionHash,
              isEncrypted: isEncrypted
            });

            //this.loadTransactions();
            this.blockUI.stop();
            this.frame.hide();
            this.sharedService.showSuccess('Success', 'Record saved succesfully');
          }


        } catch (error) {
          this.blockUI.stop();
          this.sharedService.showError('Error', error);
        }
      }
    }
  }

  grabPKey(common) {
    return common.privateKey
  }

  openRecordDialog() {
    this.cleanForm();
    this.frame.show();
    this.showEncryptionKeyPair = false;
    this.showEncryptionPassword = false;
  }


  onEncryptionMethodSelected(event) {
    console.log(event);
    switch (event.value) {
      case PrivacyType.PASSWORD:
        this.showEncryptionPassword = true;
        this.showEncryptionKeyPair = false;
        break;
      case PrivacyType.NEM_KEYS:
        this.showEncryptionPassword = false;
        this.showEncryptionKeyPair = true;
        this.addRecordForm.get('recipientPrivateKey').setValue(this.signerPrivateKey.toUpperCase());
        this.addRecordForm.get('recipientPublicKey').setValue(this.walletService.publicAccount.publicKey);
        break;
      default:
        this.showEncryptionPassword = false;
        this.showEncryptionKeyPair = false;
    }
    this.privacyType = event.value;

  }
  showRecordEntryPassword() {

    const common = {
      password: this.addRecordForm.get('password').value
    };
    const privateKey = crypto.passwordToPrivatekey(common, this.walletService.currentAccount, this.walletService.algo);
    this.signerPrivateKey = this.grabPKey(common);
    console.log(this.signerPrivateKey);

    if (this.signerPrivateKey.length > 0) {
      this.showRecordEntry = true;
      this.showPassword = false;
    } else {
      this.showRecordEntry = false;
      this.showPassword = true;
      this.sharedService.showError("Invalid password", "You entered the invalid password");
    }
  }

  readFile(file) {
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

  readFileToBuffer(file) {
    return new Promise<Buffer>(function (resolve, reject) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const fileContent = Buffer.from(reader.result as ArrayBuffer);
        resolve(fileContent);
      };
      reader.onerror = event => reject(event);
      reader.readAsArrayBuffer(file);
    });
  }


  async downloadWithDecryptionPassword() {
    const decryptionPassword = this.downloadRecordForm.get('decryptionPassword').value;
    console.log(decryptionPassword);
    const dataHash = this.downloadRecordForm.get('downloadDatahash');
    console.log(dataHash.value);
    if (!decryptionPassword || decryptionPassword.length <= 10) {
      this.sharedService.showError('Invalid decryption password!', 'The password must be greater than 10 characters');
    } else if (!this.downloadFile) {
      this.sharedService.showError('Something wrong!', 'Unable to download file');
    } else {

      try {
        console.log(this.downloadFile);
        const paramData = DirectDownloadParameter.createFromDataHash(this.downloadFile.dataHash);
        paramData.withPasswordPrivacy(decryptionPassword);
        const downloadResult = await this.downloader.directDownload(paramData.build());
        const dataBuffer = await StreamHelper.stream2Buffer(downloadResult);
        const downloableFile = new Blob([dataBuffer], { type: this.downloadFile.contentType });
        saveAs(downloableFile, this.downloadFile.name);
      } catch (error) {
        this.sharedService.showError('Failure', error);
      }
    }
  }

  async downloadWithDecryptionKeyPair() {
    const privateKey = this.downloadRecordForm.get('decryptionPrivateKey').value;
    const publicKey = this.downloadRecordForm.get('decryptionPublicKey').value;
  
    if (!privateKey || !publicKey) {
      this.sharedService.showError('Invalid decryption key pair!', 'Please enter decryption private key and public key');
    } else if (!this.downloadFile) {
      this.sharedService.showError('Something wrong!', 'Unable to download file');
    } else {

      try {
        console.log(this.downloadFile);
        const paramData = DirectDownloadParameter.createFromDataHash(this.downloadFile.dataHash);
        paramData.withNemKeysPrivacy(privateKey,publicKey);
        const downloadResult = await this.downloader.directDownload(paramData.build());
        const dataBuffer = await StreamHelper.stream2Buffer(downloadResult);
        const downloableFile = new Blob([dataBuffer], { type: this.downloadFile.contentType });
        saveAs(downloableFile, this.downloadFile.name);
      } catch (error) {
        this.sharedService.showError('Failure', error);
      }
    }
  }

  async downloadRecord(dataHash, type, name, transactionHash, privacyType) {
    /*console.log(dataHash);
    console.log(type);
    console.log(name);
    console.log(transactionHash);
    console.log(privacyType);*/
    this.downloadFile = { dataHash: dataHash, contentType: type, name: name };
    try {

      if (privacyType === PrivacyType.PLAIN) {

        const paramData = DirectDownloadParameter.createFromDataHash(dataHash);
        paramData.withPlainPrivacy();
        const downloadResult = await this.downloader.directDownload(paramData.build());
        const dataBuffer = await StreamHelper.stream2Buffer(downloadResult);
        const downloableFile = new Blob([dataBuffer], { type: type });
        saveAs(downloableFile, name);
      } else {

        const dataHashInput = this.downloadRecordForm.get('downloadDatahash');
        dataHashInput.setValue(dataHash);

        if (privacyType === PrivacyType.PASSWORD) {
          this.downloadRecordForm.get('decryptionPassword').reset();
          this.showDecryptionPassword = true;
          this.showDecryptionKeyPair = false;
        } else if (privacyType === PrivacyType.NEM_KEYS) {
          this.downloadRecordForm.get('decryptionPrivateKey').setValue(this.signerPrivateKey.toUpperCase());
          this.downloadRecordForm.get('decryptionPublicKey').setValue(this.walletService.publicAccount.publicKey);
          this.showDecryptionPassword = false;
          this.showDecryptionKeyPair = true;
        }
        this.dlframe.show();

      }


    } catch (error) {
      this.sharedService.showError('Failure', 'Unable to download data');
    }


  }
}
