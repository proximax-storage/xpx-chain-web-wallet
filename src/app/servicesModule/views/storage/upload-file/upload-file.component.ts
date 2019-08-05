import { Component, OnInit, ChangeDetectorRef, AfterViewInit, EventEmitter } from '@angular/core';
import { AppConfig } from 'src/app/config/app.config';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { ConfigurationForm, SharedService } from 'src/app/shared/services/shared.service';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ProximaxProvider } from 'src/app/shared/services/proximax.provider';
import { WalletService } from 'src/app/wallet/services/wallet.service';
import { DataBridgeService } from 'src/app/shared/services/data-bridge.service';
import { TransactionsService } from 'src/app/transfer/services/transactions.service';
import { Uploader, PrivacyType, Uint8ArrayParameterData, UploadParameter, Protocol, ConnectionConfig, BlockchainNetworkConnection, IpfsConnection } from 'xpx2-ts-js-sdk';
import { UploadInput, humanizeBytes, UploadOutput, UploadFile, FasDirective } from 'ng-uikit-pro-standard';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-upload-file',
  templateUrl: './upload-file.component.html',
  styleUrls: ['./upload-file.component.css']
})
export class UploadFileComponent implements OnInit,AfterViewInit {

  @BlockUI() blockUI: NgBlockUI;
  moduleName = 'Storage';
  componentName = 'Upload File';
  backToService = `/${AppConfig.routes.service}`;
  myFiles = `/${AppConfig.routes.myFile}`;
  configurationForm: ConfigurationForm = {};
  uploadForm: FormGroup;
  blockUpload: boolean = false;
  uploading:false;
  files: any[];
  uploadInput: any;
  humanizeBytes: (bytes: number) => string;
  optionsEncryptionMethods: Array<any>;
  dragOver: boolean;
  showEncryptionPassword: boolean;
  showEncryptionKeyPair: boolean;
  signerPrivateKey: any;
  privacyType: any;
  uploader: Uploader;

  constructor(
    private cdRef: ChangeDetectorRef,
    private fb: FormBuilder,
    private route: Router,
    private walletService: WalletService,
    private proximaxProvider: ProximaxProvider,
    private sharedService: SharedService,
    private transactionsService: TransactionsService
  ) { 
    this.files = [];
    this.uploadInput = new EventEmitter<UploadInput>();
    this.humanizeBytes = humanizeBytes;
  }


  ngOnInit() {
    this.createForm();
    this.initialiseStorage();
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

 
    this.uploader = new Uploader(connectionConfig);
  }

  ngAfterViewInit() {
    this.cdRef.detectChanges();
  }

  createForm() {
    this.optionsEncryptionMethods = [
      { value: PrivacyType.PLAIN, name: 'DO NOT ENCRYPT' },
      { value: PrivacyType.PASSWORD, name: 'PASSWORD' },
     /* { value: PrivacyType.NEM_KEYS, name: 'KEY PAIR' }*/
    ];

    this.uploadForm = this.fb.group({
      title: [''],
      description: [''],
      filePath: [''],
      recipientAddress: [''],
      recipientPublicKey: ['', [Validators.minLength(64), Validators.maxLength(64)]],
      secureMessage: [''],
      usePasswordPrivacy: [''],
      walletPassword: [''],
      password: ['', [Validators.minLength(8), Validators.maxLength(30)]],
      fileInput: [''],
      privateKey: [''],
      useSecureMessage: [''],
      encryptionMethod: [''],
      encryptionPassword: ['', [Validators.minLength(10), Validators.maxLength(20)]],
      recipientPrivateKey: ['', [Validators.minLength(64), Validators.maxLength(64)]]
    });

  }

  clearForm(nameInput: string = '', nameControl: string = '') {
    if (nameInput !== '') {
      if (nameControl !== '') {
        this.uploadForm.controls[nameControl].get(nameInput).reset();
        return;
      }

      this.uploadForm.get(nameInput).reset();
      return;
    }
    this.files = [];
    this.uploadForm.reset();
    return;
  }

  validateInput(nameInput: string = '', nameControl: string = '', nameValidation: string = '') {
    let validation: AbstractControl = null;
    if (nameInput !== '' && nameControl !== '') {
      validation = this.uploadForm.controls[nameControl].get(nameInput);
    } else if (nameInput === '' && nameControl !== '' && nameValidation !== '') {
      validation = this.uploadForm.controls[nameControl].getError(nameValidation);
    } else if (nameInput !== '') {
      validation = this.uploadForm.get(nameInput);
    }
    return validation;
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

  encryptionMethodSelect(event: { value: any; }) {
    // console.log(event);
    switch (event.value) {
      case PrivacyType.PASSWORD:
        this.showEncryptionPassword = true;
        this.showEncryptionKeyPair = false;
        this.uploadForm.controls['encryptionPassword'].setValidators([Validators.required, Validators.minLength(10), Validators.maxLength(20)]);
       
        break;
      case PrivacyType.NEM_KEYS:
        this.showEncryptionPassword = false;
        this.showEncryptionKeyPair = true;
        this.uploadForm.controls['recipientPrivateKey'].setValidators([Validators.required, Validators.minLength(64), Validators.maxLength(64)]);
        this.uploadForm.controls['recipientPublicKey'].setValidators([Validators.required, Validators.minLength(64), Validators.maxLength(64)]);
        break;
      default:
        this.showEncryptionPassword = false;
        this.showEncryptionKeyPair = false;
    }
    this.privacyType = event.value;

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

  readFileToBuffer(file: Blob) {
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

  doValidate() {
    this.blockUpload = false;
    const encryptionMethod = this.uploadForm.get('encryptionMethod').value;
    const walletPassword = this.uploadForm.get('walletPassword').value;
    console.log(encryptionMethod);
    if (walletPassword.length <= 0) {
      this.blockUpload = true;
      this.sharedService.showError('Attention', 'Please enter the wallet password');
    } else if (this.files.length <= 0) {
      this.blockUpload = true;
      this.sharedService.showError('Attention', 'Please choose file to upload');
    } else if (encryptionMethod.length <= 0) {
      this.blockUpload = true;
      this.sharedService.showError('Attention', 'Please choose the encryption method');
    } else {
      switch (encryptionMethod) {
        case PrivacyType.PASSWORD:
          const encryptionPassword = this.uploadForm.get('encryptionPassword').value;
          if (encryptionPassword.length <= 0) {
            this.blockUpload = true;
            this.sharedService.showError('Attention', 'Please enter the encryption password');
          }
          break;
        case PrivacyType.NEM_KEYS:
          const publicKey = this.uploadForm.get('recipientPublicKey').value;
          const privateKey = this.uploadForm.get('recipientPrivateKey').value;
          if (publicKey.length <= 0) {
            this.blockUpload = true;
            this.sharedService.showError('Attention', 'Please enter the encryption public key');
          } else if (privateKey.length <= 0) {
            this.blockUpload = true;
            this.sharedService.showError('Attention', 'Please enter the encryption private key');
          }
          break;
      };
      //this.blockUpload = false;
    }
  }
  
  async upload() {

    this.doValidate();

    if (this.uploadForm.valid && !this.blockUpload) {

      const common = {
        password: this.uploadForm.get('walletPassword').value,
        privateKey: ''
      }

      if (this.walletService.decrypt(common)) {
        this.blockUpload = true;
  
        const account = this.proximaxProvider.getAccountFromPrivateKey(common.privateKey, this.walletService.network);
        console.log(account);

        try {
          const uploadedFile = this.files[0].nativeFile;
          //console.log(uploadedFile);
          const uploadedFileType = uploadedFile.type;
          //console.log(uploadedFileType);
          const uploadedFileContent = await this.readFile(uploadedFile);
          const fileName = this.uploadForm.get('filePath').value;
         // console.log(uploadedFile.name);
         // const optionalFileName =  fileName ===  undefined ? uploadedFile.name: fileName;
          //console.log(optionalFileName);
          const optionalFileName = uploadedFile.name;
          const metaParams = Uint8ArrayParameterData.create(uploadedFileContent, optionalFileName, '', uploadedFileType);

          const uploadParams = UploadParameter.createForUint8ArrayUpload(metaParams, account.privateKey);

          const encryptionMethod = this.uploadForm.get('encryptionMethod').value;
          console.log(encryptionMethod);

          switch (encryptionMethod) {
            case PrivacyType.PLAIN:
              uploadParams.withPlainPrivacy();
              break;
            case PrivacyType.PASSWORD:
              const encryptionPassword = this.uploadForm.get('encryptionPassword').value;
              console.log(encryptionPassword);
              uploadParams.withPasswordPrivacy(encryptionPassword);
              break;
            case PrivacyType.NEM_KEYS:
              const publicKey = this.uploadForm.get('recipientPublicKey').value;
              const privateKey = this.uploadForm.get('recipientPrivateKey').value;
              // const recipientAccount = this.proximaxProvider.getAccountFromPrivateKey(privateKey, this.walletService.network);
              // console.log(publicKey);
              // console.log(privateKey);
              // console.log(recipientAccount);
              uploadParams.withNemKeysPrivacy(privateKey, publicKey);
              uploadParams.withRecipientPublicKey(publicKey);
              break;
          }

          const result = await this.uploader.upload(uploadParams.build());
          console.log(result);
          this.clearForm();
          this.sharedService.showSuccessTimeout('Upload','Upload successfully.',8000);
          this.blockUpload = false;
        } catch (error) {
          this.blockUpload = false;
          this.sharedService.showError('Error', error);
        }
      }
      else {
        this.blockUpload = false;
      }
    } else {
      //show error here

    }
  }
}
