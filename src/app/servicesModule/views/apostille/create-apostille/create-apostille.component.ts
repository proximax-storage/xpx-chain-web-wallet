import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import * as crypto from 'crypto-js'
import { Account, UInt64, TransferTransaction } from 'tsjs-xpx-chain-sdk';
import { KeyPair, convert } from 'js-xpx-chain-library';
import { ProximaxProvider } from '../../../../shared/services/proximax.provider';
import { ConfigurationForm, SharedService } from '../../../../shared/services/shared.service';
import { ApostilleService, NtyDataInterface } from '../services/apostille.service';
import { WalletService } from '../../../../wallet/services/wallet.service';
import { HeaderServicesInterface } from '../../../services/services-module.service';
import { AppConfig } from '../../../../config/app.config';
import { StorageService, SearchResultInterface } from '../../storage/services/storage.service';
import { SearchResult } from 'xpx2-ts-js-sdk';
import { PaginationInstance } from 'ngx-pagination';

declare const Buffer: any;

@Component({
  selector: 'app-create-apostille',
  templateUrl: './create-apostille.component.html',
  styleUrls: ['./create-apostille.component.css']
})
export class CreateApostilleComponent implements OnInit {

  apostilleFormOne: FormGroup;
  apostilleFormTwo: FormGroup;
  base64ImageString: string;
  blockBtn: boolean;
  configFileStorage: PaginationInstance = {
    id: 'fileStorage',
    itemsPerPage: 6,
    currentPage: 1
  };
  configurationForm: ConfigurationForm;
  file: string | ArrayBuffer | null;
  filesStorage: SearchResultInterface[];
  fileInputIsValidated = false;
  nameFile = 'No file selected yet...';
  ntyData: NtyDataInterface;
  originalFile: File;
  paramsHeader: HeaderServicesInterface = {
    moduleName: 'Attestation',
    componentName: 'Create',
    extraButton: 'Audit',
    routerExtraButton: `/${AppConfig.routes.audiApostille}`
  };
  processComplete = false;
  rawFileContent: any;
  storeInDfms = false;
  searching: boolean = false;
  typeEncrypted: Array<object> = [
    { value: '1', label: 'MD5' },
    { value: '2', label: 'SHA1' },
    { value: '3', label: 'SHA256' },
    { value: '4', label: 'SHA3' },
    { value: '5', label: 'SHA512' }
  ];
  extensionFile: string = '';
  files: File[] = [];
  maxFileSize = 5;

  constructor(
    private apostilleService: ApostilleService,
    private storageService: StorageService,
    private fb: FormBuilder,
    private proximaxProvider: ProximaxProvider,
    private sharedService: SharedService,
    private walletService: WalletService
  ) {
  }


  onSelect(event: any) {
    console.log(event);
    if (event.addedFiles && event.addedFiles.length > 0) {
      /*event.addedFiles.forEach((element: File) => {
        this.files.push(element);
      });*/
      this.files = event.addedFiles;
      this.fileReader(event.addedFiles);
    }
  }

  onRemove(event: any) {
    this.fileReader([]);
    /*console.log(event);
    this.files.splice(this.files.indexOf(event), 1);*/
  }


  async ngOnInit() {
    this.configurationForm = this.sharedService.configurationForm;
    this.createForm();
    // this.filesStorage = await this.storageService.getFiles();
    this.initForm();
    // this.convertToFile(this.filesStorage[0]);
    this.apostilleService.getTransactionStatus();
  }

  /**
   *
   *
   * @memberof CreateApostilleComponent
   */
  async convertToFile(element: SearchResultInterface, random: number) {
    this.files = [];
    this.apostilleFormOne.get('file').setValue('');
    this.fileReader([]);
    this.filesStorage.forEach(element => {
      if (element.random === random) {
        element.selected = true;
      } else {
        element.selected = false;
      }
    });
    this.apostilleFormOne.get('file').setValue(element.name);
    const data = await this.storageService.convertToFile(element);
    // console.log('My data in blob ---> ', data);
    const file = new File([data], element.name);
    // this.apostilleFormOne.get('file').setValue();
    // console.log('From blob to file -------->', file);
    this.fileReader([file]);
  }

  /**
   *
   *
   * @memberof CreateApostilleComponent
   */
  createForm() {
    const file: HTMLElement = document.getElementById('fileInput');
    if (file) {
      file['value'] = '';
    }
    this.file = '';
    this.fileInputIsValidated = false;
    this.nameFile = 'No file selected yet...';
    this.rawFileContent = '';

    // FORM ONE
    this.apostilleFormOne = this.fb.group({
      file: ['', [Validators.required]],
      typeFile: [true, [Validators.required]]
    });

    // FORM TWO
    this.apostilleFormTwo = this.fb.group({
      safeDFMS: [''],

      typePrivatePublic: [true, [
        Validators.required
      ]],

      tags: [[], [
        Validators.required,
        Validators.minLength(this.configurationForm.tags.minLength),
        Validators.maxLength(this.configurationForm.tags.maxLength)
      ]],

      typeEncrypted: ['3', [
        Validators.required
      ]],

      password: ['', [
        Validators.required,
        Validators.minLength(this.configurationForm.passwordWallet.minLength),
        Validators.maxLength(this.configurationForm.passwordWallet.maxLength)
      ]]
    });
  }

  /**
   *
   *
   * @param {number} type
   * @memberof CreateApostilleComponent
   */
  clearForm(type: number) {
    if (type === 1) {
      this.apostilleFormOne.reset();
      this.apostilleFormOne.get('typeFile').setValue(true);
    } else {
      this.apostilleFormTwo.reset();
      this.apostilleFormTwo.get('typePrivatePublic').setValue(true);
      this.apostilleFormTwo.get('typeEncrypted').setValue('3');
    }
  }

  /**
   * The FileReader object lets web applications asynchronously read the contents of files (or raw data buffers)
   * stored on the user's computer, using File or Blob objects to specify the file or data to read.
   *
   * @param {File[]} files
   * @memberof ApostilleCreateComponent
   */
  fileReader(files: File[]) {
    if (files.length > 0) {
      this.extensionFile = '';
      this.nameFile = files[0].name;
      if (files[0].type !== '') {
        this.nameFile = files[0].name.slice(0, files[0].name.lastIndexOf('.'));
        this.extensionFile = `.${this.sharedService.getFileExtension(files[0].name)}`;
      }

      console.log('----> this.extensionFile ', this.extensionFile);
      console.log('----> this.nameFile ', this.nameFile);


      this.apostilleFormOne.get('file').setValue(files[0].name);
      this.originalFile = files[0];
      this.fileInputIsValidated = true;
      // Get name the file

      const myReader: FileReader = new FileReader();
      // Read and convert the file to base64
      myReader.readAsDataURL(files[0]);
      myReader.onloadend = (e) => {
        // Get the base64 and assign it to this.file
        this.file = myReader.result;
        // Transform base64 into bytes
        this.rawFileContent = crypto.enc.Base64.parse((this.file.toString()).split(/,(.+)?/)[1]);
      };
    } else {
      this.filesStorage.forEach(element => {
        element.selected = false;
      });

      this.files = [];
      this.apostilleFormOne.get('file').setValue('');
      this.fileInputIsValidated = false;
      this.nameFile = 'No file selected yet...';
      this.file = '';
      this.rawFileContent = '';
    }
  }

  /**
   *
   *
   * @memberof CreateApostilleComponent
   */
  async initForm() {
    this.searching = true;
    this.processComplete = false;
    this.blockBtn = false
    this.filesStorage = await this.storageService.getFiles();
    this.searching = false;
  }

  /**
   *
   *
   * @memberof ApostilleCreateComponent
   */
  sendTransaction() {
    this.blockBtn = true;
    if (this.apostilleFormOne.valid && this.apostilleFormTwo.valid) {
      const pw: any = { password: this.apostilleFormTwo.get('password').value }
      if (this.walletService.decrypt(pw)) {
        this.apostilleService.loadFileStorage(this.originalFile, pw.privateKey);
        if (this.apostilleFormTwo.get('typePrivatePublic').value === true) {
          this.preparePublicApostille(pw);
          this.createForm();
        } else {
          this.preparePrivateApostille(pw);
          this.createForm();
        }
      } else {
        this.blockBtn = false;
      }
    } else {
      this.blockBtn = false;
    }
  }


  /**
   *
   *
   * @param {*} event
   * @memberof ApostilleCreateComponent
   */
  onSaveInDFMSChanged(event: { checked: boolean; }) {
    this.storeInDfms = event.checked;
  }

  /**
   * Execute event click on input type file
   *
   * @memberof ApostilleCreateComponent
   */
  openInput() {
    document.getElementById('fileInput').click();
  }

  /**
   *
   *
   * @param {*} item
   * @memberof CreateApostilleComponent
   */
  onBlur(item: string) {
    if (item !== '' && item !== undefined) {
      const data = this.apostilleFormTwo.get('tags').value;
      const x = this.apostilleFormTwo.get('tags').value.find((x: { display: string, value: string }) => x.value === item);
      if (!x) {
        data.push({ display: item, value: item });
        this.apostilleFormTwo.get('tags').setValue(data);
      }
    }
  }

  /**
   *
   *
   * @param {*} common
   * @memberof ApostilleCreateComponent
   */
  preparePrivateApostille(common: any) {
    //Create an account from my private key
    const ownerAccount = Account.createFromPrivateKey(common.privateKey, this.walletService.currentAccount.network);
    //create an encrypted hash
    const hash = this.apostilleService.encryptData(this.file.toString());
    // The string contentHash is converted to byte
    const fileHash = this.apostilleService.hexStringToByte(hash.toString());
    // Create pair of owner keys
    const ownerKeypair = KeyPair.createKeyPairFromPrivateKeyString(common.privateKey);
    // FileHash is signed with ownerKeypair
    const contentHashSig = KeyPair.sign(ownerKeypair, fileHash);
    // create a prefix hash
    const apostilleHashPrefix = 'fe4e545983';
    // Concatenates the hash prefix and the result gives the apostille hash
    const apostilleHash = apostilleHashPrefix + convert.uint8ToHex(contentHashSig).toLowerCase();
    // Encrypt the title
    const fileNameHash = this.apostilleService.encryptData(this.nameFile);
    // Sign the fileNameHash with the ownerKeypair
    const fileNameHashSign = KeyPair.sign(ownerKeypair, this.apostilleService.hexStringToByte(fileNameHash.toString()));
    // Take the first 32 UINT8 to get the private key
    const dedicatedPrivateKey = convert.uint8ToHex(fileNameHashSign.slice(0, 32));
    // Create an account from the dedicatedPrivateKey to send a transaction with apostilleHash message
    const dedicatedAccount = Account.createFromPrivateKey(dedicatedPrivateKey, this.walletService.currentAccount.network);
    // Build the transfer type transaction
    let transferTransaction: TransferTransaction = this.proximaxProvider.buildTransferTransaction(
      this.walletService.currentAccount.network,
      this.proximaxProvider.createFromRawAddress(dedicatedAccount.address.plain()),
      JSON.stringify(apostilleHash)
    );
    // Zero fee is added
    transferTransaction['fee'] = UInt64.fromUint(0);
    // Sign the transaction
    const signedTransaction = ownerAccount.sign(transferTransaction);
    const date = new Date();
    this.ntyData = {
      fileName: this.nameFile,
      extensionFile: this.extensionFile,
      tags: this.apostilleFormTwo.get('tags').value,
      fileHash: apostilleHash,
      owner: ownerAccount.address,
      fromMultisig: ownerAccount.address,
      dedicatedAccount: dedicatedAccount.address.plain(),
      dedicatedPrivateKey: 'Not show',// (this.apostilleCreateForm.get('typePrivatePublic').value == true) ? None (public sink) : nty.dedicatedPrivateKey,
      txHash: signedTransaction.hash.toLowerCase(),
      txMultisigHash: '',
      timeStamp: date.toUTCString()
    };

    const apostilleBuilder = this.apostilleService.buildApostille(this.ntyData, this.rawFileContent);
    this.base64ImageString = apostilleBuilder.qrCode;
    // announce the transaction
    this.apostilleService.setWhiteList({
      signedTransaction: signedTransaction,
      storeInDfms: this.storeInDfms,
      zip: apostilleBuilder.zipFile,
      nty: this.ntyData
    });


    this.proximaxProvider.announce(signedTransaction).subscribe(
      x => {
        // If everything went OK, build and build the certificate
        this.blockBtn = false;
        this.processComplete = true;
      },
      err => {
        console.error(err)
        // this.downloadSignedFiles();
      });
  }

  /**
   *
   *
   * @param {*} common
   * @memberof preparePublicApostille
   */
  preparePublicApostille(common: any) {
    console.log(this.nameFile);

    //create a hash prefix (dice si es privado o publico)
    const apostilleHashPrefix = 'fe4e545903';
    //create an encrypted hash (contenido del archivo)
    const hash = this.apostilleService.encryptData(this.file.toString());
    //concatenates the hash prefix and the result gives the apostilleHash
    const apostilleHash = apostilleHashPrefix + hash.toString();
    //Generate an account to send the transaction with the apostilleHash
    const sinkAddress = this.proximaxProvider.createFromRawAddress(
      this.proximaxProvider.generateNewAccount(this.walletService.currentAccount.network).address.plain()
    );
    //Create an account from my private key
    const myAccount = Account.createFromPrivateKey(common.privateKey, this.walletService.currentAccount.network);
    //Arm the transaction type transfer
    let transferTransaction: any = this.proximaxProvider.buildTransferTransaction(
      this.walletService.currentAccount.network,
      sinkAddress,
      JSON.stringify(apostilleHash)
    );
    // Zero fee is added
    transferTransaction['fee'] = UInt64.fromUint(0);

    // Sign the transaction
    const signedTransaction = myAccount.sign(transferTransaction);
    const date = new Date();
    this.ntyData = {
      fileName: this.nameFile,
      extensionFile: this.extensionFile,
      tags: this.apostilleFormTwo.get('tags').value,
      fileHash: apostilleHash,
      owner: myAccount.address,
      fromMultisig: myAccount.address,
      dedicatedAccount: sinkAddress.plain(),
      dedicatedPrivateKey: 'Not show',
      txHash: signedTransaction.hash.toLowerCase(),
      txMultisigHash: '',
      timeStamp: date.toUTCString()
    };

    // console.log(this.ntyData);
    const apostilleBuilder = this.apostilleService.buildApostille(this.ntyData, this.rawFileContent);
    this.base64ImageString = apostilleBuilder.qrCode;
    this.apostilleService.setWhiteList({
      signedTransaction: signedTransaction,
      storeInDfms: this.storeInDfms,
      zip: apostilleBuilder.zipFile,
      nty: this.ntyData
    });

    this.proximaxProvider.announce(signedTransaction).subscribe(
      x => {
        this.blockBtn = false;
        this.processComplete = true;
      },
      err => {
        console.error(err)
        // this.downloadSignedFiles();
      });
  }
}
