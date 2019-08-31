import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import * as crypto from 'crypto-js'
import * as JSZip from 'jszip';
import * as qrcode from 'qrcode-generator';
// import { saveAs } from 'file-saver';
import * as jsPDF from 'jspdf';
import { saveAs } from 'file-saver';
import { Account, UInt64 } from 'tsjs-xpx-chain-sdk';
import { IpfsConnection, IpfsClient } from 'xpx2-ts-js-sdk';
import { KeyPair, convert } from 'js-xpx-chain-library';
import { ProximaxProvider } from '../../../../shared/services/proximax.provider';
import { Verifier } from '../services/audit-apistille-verifier';
import { environment } from '../../../../../environments/environment';
import { ConfigurationForm, SharedService } from '../../../../shared/services/shared.service';
import { ApostilleService } from '../services/apostille.service';
import { WalletService } from '../../../../wallet/services/wallet.service';
declare const Buffer: any;

@Component({
  selector: 'app-create-apostille',
  templateUrl: './create-apostille.component.html',
  styleUrls: ['./create-apostille.component.css']
})
export class CreateApostilleComponent implements OnInit {

  apostilleCreateForm: FormGroup;
  configurationForm: ConfigurationForm;
  componentName = 'Create';
  moduleName = 'Attestation';
  autocompleteItems = [];

  /************************* */

  fileInputIsValidated = false;
  typeEncrypted: Array<object> = [
    { value: '1', label: 'MD5' },
    { value: '2', label: 'SHA1' },
    { value: '3', label: 'SHA256' },
    { value: '4', label: 'SHA3' },
    { value: '5', label: 'SHA512' }
  ];

  // ---------- FILE ---------
  nameFile = 'Not file selected yet...';
  file: string | ArrayBuffer | null;
  rawFileContent: any;
  zip: JSZip;
  ntyData: any;
  certificatePrivate: string;
  certificatePublic: string;
  storeInDfms = false;

  constructor(
    private sharedService: SharedService,
    private fb: FormBuilder,
    private walletService: WalletService,
    private proximaxProvider: ProximaxProvider,
    private apostilleService: ApostilleService
  ) {
    this.zip = new JSZip();
  }

  ngOnInit() {
    this.configurationForm = this.sharedService.configurationForm;
    this.createForm();
  }

  /**Will move to util class **/
  async convertBlobToBuffer(blob: any) {
    /*return new Promise<Buffer>(function (resolve, reject) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const fileContent = Buffer.from(reader.result as ArrayBuffer);
        resolve(fileContent);
      };
      reader.onerror = event => reject(event);
      reader.readAsArrayBuffer(blob);
    });*/
  }

  /**
   *
   *
   * @param {*} nty
   * @memberof ApostilleCreateComponent
   */
  buildApostille(nty: any) {
    const date = new Date();
    const url = `${this.proximaxProvider.url}/transaction/${nty.signedTransaction.hash.toLowerCase()}`;
    const title = (nty.title.slice(0, nty.title.lastIndexOf('.'))).slice(0, 15);
    let qr = qrcode(10, 'H');
    qr.addData(url);
    qr.make();
    this.ntyData = {
      data: [
        {
          "filename": title,
          "tags": nty.tags.join(' '),
          "fileHash": nty.apostilleHash,
          "owner": nty.account.address,
          "fromMultisig": nty.account.address,
          "dedicatedAccount": nty.sinkAddress,
          "dedicatedPrivateKey": (this.apostilleCreateForm.get('typePrivatePublic').value == true) ? "None (public sink)" : nty.dedicatedPrivateKey,
          "txHash": nty.signedTransaction.hash.toLowerCase(),
          "txMultisigHash": "",
          "timeStamp": date.toUTCString()
        }
      ]
    };

    // Add Certificate PDF to zip
    const nameCertificate = `Certificate of ${title} -- Apostille TX ${nty.signedTransaction.hash.toLowerCase()} -- Date ${date.toUTCString()}.pdf`;
    if (Verifier.isPrivateApostille(nty.apostilleHash)) {
      this.zip.file(nameCertificate, this.pdfcertificatePrivate(qr.createDataURL(), url, nty), {});
    } else if (Verifier.isPublicApostille(nty.apostilleHash)) {
      this.zip.file(nameCertificate, this.pdfcertificatePublic(qr.createDataURL(), url, nty), {});
    }

    // Add Original File to zip
    const extensionFile = nty.title.slice(nty.title.lastIndexOf('.'));
    const dateFull = `${date.getFullYear()}-${("00" + (date.getMonth() + 1)).slice(-2)}-${("00" + (date.getDate())).slice(-2)}`;
    this.zip.file(
      `${title} -- Apostille TX ${nty.signedTransaction.hash.toLowerCase()} -- Date ${dateFull.toString()}${extensionFile}`,
      (crypto.enc.Base64.stringify(this.rawFileContent)),
      { base64: true }
    );

    this.setAccountWalletStorage(this.ntyData);
    this.downloadSignedFiles();
  }

  /**
   *
   *
   * @param {(string | (string | number)[])} [custom]
   * @param {(string | number)} [formControl]
   * @returns
   * @memberof CreateApostilleComponent
   */
  clearForm(custom?: string | (string | number)[], formControl?: string | number) {
    const file: HTMLElement = document.getElementById('fileInput');
    file['value'] = '';
    this.apostilleCreateForm.get('file').setValue('');
    this.file = '';
    this.fileInputIsValidated = false;
    this.nameFile = 'Not file selected yet...';
    this.rawFileContent = '';
    this.zip = new JSZip();
    if (custom !== undefined) {
      if (formControl !== undefined) {
        this.apostilleCreateForm.controls[formControl].get(custom).reset();
        return;
      }
      this.apostilleCreateForm.get(custom).reset();
      return;
    }

    this.apostilleCreateForm.reset();
    return;
  }

  /**
   *
   *
   * @memberof CreateApostilleComponent
   */
  createForm() {
    this.apostilleCreateForm = this.fb.group({
      documentTitle: ['', [
        Validators.required,
        Validators.minLength(this.configurationForm.documentTitle.minLength),
        Validators.maxLength(this.configurationForm.documentTitle.maxLength)
      ]],

      content: ['', [
        Validators.minLength(this.configurationForm.content.minLength),
        Validators.maxLength(this.configurationForm.content.maxLength)
      ]],

      file: ['', [Validators.required]],

      safeDFMS: [''],

      typePrivatePublic: [true, [
        Validators.required
      ]],

      tags: ['', [
        Validators.required,
        Validators.minLength(this.configurationForm.content.minLength),
        Validators.maxLength(this.configurationForm.content.maxLength)
      ]],

      typeEncrypted: ['3', [
        Validators.required
      ]],

      password: ['', [
        Validators.required,
        Validators.minLength(this.configurationForm.documentTitle.minLength),
        Validators.maxLength(this.configurationForm.documentTitle.maxLength)
      ]],
    });

    console.log(this.apostilleCreateForm);

  }

  /**
   *
   *
   * @memberof ApostilleCreateComponent
   */
  createApostille() {
    if (!this.fileInputIsValidated) {
      this.sharedService.showWarning('', 'Please upload or validate a file');
      return;
    }

    if (this.apostilleCreateForm.valid) {
      const common = { password: this.apostilleCreateForm.get('password').value }
      //Decrypt the private key
      if (this.walletService.decrypt(common)) {
        //Get the value of the type of apostille
        if (this.apostilleCreateForm.get('typePrivatePublic').value === true) {
          this.preparePublicApostille(common);
        } else {
          this.preparePrivateApostille(common);
        }
      }
    }
  }

  /**
   *
   *
   * @memberof ApostilleCreateComponent
   */
  downloadSignedFiles() {
    const date = new Date();
    if (Object.keys(this.zip.files).length > 1) {
      this.zip.generateAsync({
        type: "blob"
      }).then(async (content: any) => {
        if (this.storeInDfms) {
          const bufferContent = await this.convertBlobToBuffer(content);
          const streamContent = null; /*await StreamHelper.buffer2Stream(bufferContent);*/
          const ipfConnection = new IpfsConnection(
            environment.storageConnection.host,
            environment.storageConnection.port,
            environment.storageConnection.options
          );
          const ifpsClient = new IpfsClient(ipfConnection);
          ifpsClient.addStream(streamContent).subscribe(hash => {
            saveAs(content, `${hash}.zip`);
          });
          this.clearForm();
        } else {
          this.clearForm();
          const dateFull = `${date.getFullYear()}-${("00" + (date.getMonth() + 1)).slice(-2)}-${("00" + (date.getDate())).slice(-2)}`;
          saveAs(
            content,
            `PROXIsigned -- Do not Edit --"${dateFull}".zip`
          );
        }
      });
    }
  }


  /**
   *
   *
   * @returns
   * @memberof ApostilleCreateComponent
   */
  encryptData(data: string) {
    switch (this.apostilleCreateForm.get('typeEncrypted').value) {
      case "1":
        return crypto.MD5(data);
      case "2":
        return crypto.SHA1(data);
      case "3":
        return crypto.SHA256(data);
      case "4":
        return crypto.SHA3(data);
      case "5":
        return crypto.SHA512(data);
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
    console.log(files);
    if (files.length > 0) {
      this.fileInputIsValidated = true;
      // Get name the file
      this.nameFile = files[0].name;
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
      this.apostilleCreateForm.get('file').setValue('');
      this.fileInputIsValidated = false;
      this.nameFile = 'Not file selected yet...';
      this.file = '';
      this.rawFileContent = '';
    }
  }

  /**
   *
   *
   * @param {*} str
   * @returns
   * @memberof ApostilleCreateComponent
   */
  hexStringToByte(data: string) {
    if (!data) {
      return new Uint8Array();
    }
    var a = [];
    for (var i = 0, len = data.length; i < len; i += 2) {
      a.push(parseInt(data.substr(i, 2), 16));
    }
    return new Uint8Array(a);
  }

  /**
   *
   *
   * @memberof ApostilleCreateComponent
   */
  imageBase64() {
    this.certificatePrivate = this.apostilleService.getCertificatePrivate();
    this.certificatePublic = this.apostilleService.getCertificatePublic();
  }

  /**
   *
   *
   * @param {*} nty
   * @memberof ApostilleCreateComponent
   */
  setAccountWalletStorage(nty: any) {
    let proxinty = JSON.parse(localStorage.getItem('proxi-nty'));
    if (!proxinty) {
      localStorage.setItem('proxi-nty', JSON.stringify(nty))
    } else {
      proxinty.data.push(nty.data)
      localStorage.setItem('proxi-nty', JSON.stringify(proxinty))
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
   * @param {*} base64ImageString
   * @param {*} url
   * @param {*} nty
   * @returns
   * @memberof ApostilleCreateComponent
   */
  pdfcertificatePrivate(base64ImageString: string, url: string, nty: any) {
    let date = new Date();
    this.imageBase64();
    var doc = new jsPDF();
    doc.addImage(this.certificatePrivate, 'JPEG', 0, 0, 210, 298);
    doc.addImage(base64ImageString, 'gif', 45, 244, 51, 50);
    doc.setFontType('normal');
    doc.setTextColor(0, 0, 0);
    doc.text(80, 89, (nty.title.slice(0, nty.title.lastIndexOf('.'))).slice(0, 40));

    doc.text(80, 99, date.toUTCString());
    doc.setFontSize(13);
    doc.text(80, 109, nty.Owner);
    doc.text(80, 120, nty.tags.join(' '));
    doc.setFontSize(12);

    doc.text(42, 155, nty.sinkAddress);
    doc.text(42, 173, nty.account.address.plain());
    doc.setFontSize(10.9);
    doc.text(42, 193, nty.dedicatedPrivateKey);
    doc.text(42, 212, nty.signedTransaction.hash.toLowerCase());
    doc.setFontSize(7);
    doc.text(42, 230, nty.apostilleHash);
    return doc.output('blob');
  }

  /**
   *
   *
   * @param {string} base64ImageString
   * @param {string} url
   * @param {*} nty
   * @returns
   * @memberof ApostilleCreateComponent
   */
  pdfcertificatePublic(base64ImageString: string, url: string, nty: any) {
    let date = new Date();
    this.imageBase64();
    var doc = new jsPDF()
    doc.addImage(this.certificatePublic, 'JPEG', 0, 0, 210, 298);
    doc.addImage(base64ImageString, 'gif', 45, 244, 51, 50);
    doc.setFontType('normal');
    doc.setTextColor(0, 0, 0);
    doc.text(80, 89, (nty.title.slice(0, nty.title.lastIndexOf('.'))).slice(0, 40));

    doc.text(80, 99, date.toUTCString());
    doc.setFontSize(13);
    doc.text(80, 109, nty.Owner);
    doc.text(80, 120, nty.tags.join(' '));
    doc.setFontSize(12);

    doc.text(42, 159, nty.sinkAddress);
    doc.text(42, 181, nty.account.address.plain());
    doc.setFontSize(10.9);
    doc.text(42, 204, nty.signedTransaction.hash.toLowerCase());
    doc.setFontSize(7);
    doc.text(42, 225, nty.apostilleHash);
    return doc.output('blob');
  }

  /**
   *
   *
   * @param {*} common
   * @memberof ApostilleCreateComponent
   */
  preparePrivateApostille(common: any) {
    //Get the name of the file
    const title = this.nameFile;
    //Create an account from my private key
    const ownerAccount = Account.createFromPrivateKey(common.privateKey, this.walletService.currentAccount.network);
    //create an encrypted hash
    const hash = this.encryptData(this.file.toString());
    // The string contentHash is converted to byte
    const fileHash = this.hexStringToByte(hash.toString());
    // Create pair of owner keys
    const ownerKeypair = KeyPair.createKeyPairFromPrivateKeyString(common.privateKey);
    // FileHash is signed with ownerKeypair
    const contentHashSig = KeyPair.sign(ownerKeypair, fileHash);
    // create a prefix hash
    const apostilleHashPrefix = 'fe4e545903';
    // Concatenates the hash prefix and the result gives the apostille hash
    const apostilleHash = apostilleHashPrefix + convert.uint8ToHex(contentHashSig).toLowerCase();
    // Encrypt the title
    const fileNameHash = this.encryptData(title);
    // Sign the fileNameHash with the ownerKeypair
    const fileNameHashSign = KeyPair.sign(ownerKeypair, this.hexStringToByte(fileNameHash.toString()));
    // Take the first 32 UINT8 to get the private key
    const dedicatedPrivateKey = convert.uint8ToHex(fileNameHashSign.slice(0, 32));
    // Create an account from the dedicatedPrivateKey to send a transaction with apostilleHash message
    const dedicatedAccount = Account.createFromPrivateKey(dedicatedPrivateKey, this.walletService.currentAccount.network);
    let transferTransaction: any;
    // Build the transfer type transaction
    transferTransaction = this.proximaxProvider.buildTransferTransaction(
      this.walletService.currentAccount.network,
      this.proximaxProvider.createFromRawAddress(dedicatedAccount.address.plain()),
      JSON.stringify(apostilleHash)
    );
    // Zero fee is added
    transferTransaction.fee = UInt64.fromUint(0);
    // Sign the transaction
    const signedTransaction = ownerAccount.sign(transferTransaction);
    // announce the transaction
    this.proximaxProvider.announce(signedTransaction).subscribe(
      x => {
        // Aqui falta validar si la transacción fue aceptada por el blockchain

        //Create arrangement to assemble the certificate
        const nty = {
          signedTransaction: signedTransaction,
          title: title,
          tags: [this.apostilleCreateForm.get('tags').value],
          apostilleHash: apostilleHash,
          account: ownerAccount,
          sinkAddress: dedicatedAccount.address.plain(),
          dedicatedPrivateKey: dedicatedAccount.privateKey.toLowerCase(),
          Owner: ownerAccount.address.plain(),
        }

        // If everything went OK, build and build the certificate
        this.buildApostille(nty)
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
    //create a hash prefix (dice si es privado o publico)
    const apostilleHashPrefix = 'fe4e545903';
    //create an encrypted hash (contenido del archivo)
    const hash = this.encryptData(this.file.toString());
    console.log('--- Hash encrypted ----', hash.toString());
    //concatenates the hash prefix and the result gives the apostilleHash
    const apostilleHash = apostilleHashPrefix + hash.toString();
    console.log('--- apostilleHash ----', apostilleHash);
    //Generate an account to send the transaction with the apostilleHash
    const sinkAddress = this.proximaxProvider.createFromRawAddress(
      this.proximaxProvider.generateNewAccount(this.walletService.currentAccount.network).address.plain()
    );
    //Create an account from my private key
    const myAccount = Account.createFromPrivateKey(common.privateKey, this.walletService.currentAccount.network);
    //Arm the transaction type transfer
    let transferTransaction: any = this.proximaxProvider.buildTransferTransaction(this.walletService.currentAccount.network, sinkAddress, JSON.stringify(apostilleHash));
    //Zero fee is added
    transferTransaction.fee = UInt64.fromUint(0);
    //Sign the transaction
    const signedTransaction = myAccount.sign(transferTransaction);
    //announce the transaction
    console.log('-----signedTransaction----', signedTransaction);
    this.proximaxProvider.announce(signedTransaction).subscribe(
      x => {
        let tags = '';
        if (this.apostilleCreateForm.get('tags').value !== '' && this.apostilleCreateForm.get('tags').value.length > 0) {
          tags = this.apostilleCreateForm.get('tags').value.map(next => next.value);
        }
        // Aqui falta validar si la transacción fue aceptada por el blockchain
        //Create arrangement to assemble the certificate
        const nty = {
          signedTransaction: signedTransaction,
          title: this.nameFile,
          tags: tags,
          apostilleHash: apostilleHash,
          account: myAccount,
          sinkAddress: sinkAddress.plain(),
          dedicatedPrivateKey: "",
          Owner: myAccount.address.plain()
        }

        // Si todo fue OK, construye y arma el certificado
        this.buildApostille(nty)
      },
      err => {
        console.error(err)
        // this.downloadSignedFiles();
      });
  }



  /**
   *
   *
   * @memberof ApostilleCreateComponent
   */
  reset() {
    const file: HTMLElement = document.getElementById('fileInput');
    file['value'] = '';
    this.zip = new JSZip();
    this.nameFile = 'Not file selected yet...';
    // this.apostilleCreateForm.reset();
    this.apostilleCreateForm.get('file').patchValue('');
  }
}
