import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import * as crypto from 'crypto-js'
import * as JSZip from 'jszip';
import * as qrcode from 'qrcode-generator';
import { saveAs } from 'file-saver';
import * as jsPDF from 'jspdf';
import { Account, UInt64 } from 'tsjs-xpx-catapult-sdk';
import { IpfsConnection, StreamHelper, IpfsClient } from 'xpx2-ts-js-sdk';
import { WalletService } from '../../../../shared';
import { ProximaxProvider } from '../../../../shared/services/proximax.provider';
import { Verifier } from '../services/audit-apistille-verifier';
import { ApostilleService } from '../services/apostille.service';
import { environment } from '../../../../../environments/environment';
import { KeyPair, convert } from 'js-xpx-catapult-library';

@Component({
  selector: 'app-apostille-create',
  templateUrl: './apostille-create.component.html',
  styleUrls: ['./apostille-create.component.scss']
})
export class ApostilleCreateComponent implements OnInit {

  apostilleCreateForm: FormGroup;
  configurationForm = {
    documentTitle: {
      minLength: 1, maxLength: 64
    },
    content: {
      minLength: 0, maxLength: 240
    },
    tags: {
      minLength: 1, maxLength: 240
    },
    password: {
      minLength: 8, maxLength: 64
    }
  }

  fileInputIsValidated = false;
  typeEncrypted: Array<object> = [
    { value: '1', label: 'MD5' },
    { value: '2', label: 'SHA1' },
    { value: '3', label: 'SHA256' },
    { value: '4', label: 'SHA3-256' },
    { value: '5', label: 'SHA3-512' }
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
    private fb: FormBuilder,
    private walletService: WalletService,
    private proximaxProvider: ProximaxProvider,
    private apostilleService: ApostilleService
  ) {
    this.zip = new JSZip();
  }

  ngOnInit() {
    this.createForm();
  }

  /**Will move to util class **/
  async convertBlobToBuffer(blob: any) {
    return new Promise<Buffer>(function (resolve, reject) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const fileContent = Buffer.from(reader.result as ArrayBuffer);
        resolve(fileContent);
      };
      reader.onerror = event => reject(event);
      reader.readAsArrayBuffer(blob);
    });
  }

  /**
   *
   *
   * @param {*} nty
   * @memberof ApostilleCreateComponent
   */
  buildApostille(nty: any) {
    const date = new Date();
    const title = nty.title.slice(0, nty.title.lastIndexOf('.'));
    const extension = nty.title.slice(nty.title.lastIndexOf('.'));
    const dateFull = `${date.getFullYear()}-${("00" + (date.getMonth() + 1)).slice(-2)}-${("00" + (date.getDate())).slice(-2)}`
    const url = `${this.proximaxProvider.url}/transaction/${nty.signedTransaction.hash.toLowerCase()}`;
    let qr = qrcode(10, 'H');
    qr.addData(url);
    qr.make();
    // const apostilleFilename = `${title} -- Apostille TX ${nty.signedTransaction.hash.toLowerCase()} -- Date ${dateFull.toString()}${title2}`;
    const apostilleFilename = `${title} -- Apostille TX ${nty.signedTransaction.hash.toLowerCase()} -- Date ${date.toUTCString()}${extension}`;
    const validation = (this.apostilleCreateForm.get('typePrivatePublic').value == true);
    this.ntyData = {
      data: [
        {
          "filename": nty.title,
          "tags": nty.tags.join(' '),
          "fileHash": nty.apostilleHash,
          "owner": nty.account.address,
          "fromMultisig": nty.account.address,
          "dedicatedAccount": nty.sinkAddress,
          "dedicatedPrivateKey": validation ? "None (public sink)" : nty.dedicatedPrivateKey,
          "txHash": nty.signedTransaction.hash.toLowerCase(),
          "txMultisigHash": "",
          "timeStamp": date.toUTCString()
        }
      ]
    };

    const base64ImageString = qr.createDataURL();
    // Apostille public
    if (Verifier.isPrivateApostille(nty.apostilleHash)) {
      this.zip.file(
        `Certificate of ${apostilleFilename}.pdf`,
        this.pdfcertificatePrivate(base64ImageString, url, nty)
      ), {};
    }

    // Apostille public
    if (Verifier.isPublicApostille(nty.apostilleHash)) {
      this.zip.file(
        `Certificate of ${apostilleFilename}.pdf`,
        this.pdfcertificatePublic(base64ImageString, url, nty)
      ), {};
    }

    this.zip.file(apostilleFilename, (crypto.enc.Base64.stringify(this.rawFileContent)), {
      base64: true
    });

    this.setAccountWalletStorage(this.ntyData);
    this.downloadSignedFiles();
  }

  /**
   *
   *
   * @memberof ApostilleCreateComponent
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

      file: [''],

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
  }

  /**
   *
   *
   * @memberof ApostilleCreateComponent
   */
  createApostille() {
    if (this.apostilleCreateForm.valid && this.fileInputIsValidated) {
      const common = { password: this.apostilleCreateForm.get('password').value }
      //Decrypt the private key
      if (this.walletService.decrypt(common)) {
        //Get the value of the type of apostille
        if (this.apostilleCreateForm.get('typePrivatePublic').value === true) {
          this.preparePublicApostille(common);
        } else {
          console.log('is privated!');
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
          const streamContent = await StreamHelper.buffer2Stream(bufferContent);
          const ipfConnection = new IpfsConnection(environment.storageConnection.host, environment.storageConnection.port, environment.storageConnection.options);
          const ifpsClient = new IpfsClient(ipfConnection);
          ifpsClient.addStream(streamContent).subscribe(hash => {
            saveAs(content, `${hash}.zip`);
          });
          this.reset();
        } else {
          this.reset();
          const dateFull = `${date.getFullYear()}-${("00" + (date.getMonth() + 1)).slice(-2)}-${("00" + (date.getDate())).slice(-2)}`;
          saveAs(
            content,
            `PROXIsigned -- Do not Edit --"${date.toUTCString()}".zip`
          );
        }
      });
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
   * @param {Event} event
   * @memberof ApostilleCreateComponent
   */
  optionSelected(event: Event) {

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
    doc.text(80, 89, nty.title);

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
    doc.text(80, 89, nty.title);

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
    //Obtiene el nombre del archivo
    const title = this.nameFile;
    //Create an account from my private key
    const ownerAccount = Account.createFromPrivateKey(common.privateKey, this.walletService.network);
    //create an encrypted hash in sha256
    const hash = crypto.SHA256(this.file.toString());
    // El contentHash se convierte a byte
    const fileHash = this.hexStringToByte(hash.toString());
    //Crea par de llaves del owner
    const ownerKeypair = KeyPair.createKeyPairFromPrivateKeyString(common.privateKey);
    // Se firma fileHash con el ownerKeypair
    const contentHashSig = KeyPair.sign(ownerKeypair, fileHash);
    //create a hash prefix
    const apostilleHashPrefix = 'fe4e545903';
    //Concatena el prefijo de hash con SHA256 y el resultado da el hash del apostille
    const apostilleHash = apostilleHashPrefix + convert.uint8ToHex(contentHashSig).toLowerCase();
    // Encripta el titulo con sha256
    const fileNameHash = crypto.SHA256(title);
    //Firma el fileNameHash con el ownerKeypair
    const fileNameHashSign = KeyPair.sign(ownerKeypair, this.hexStringToByte(fileNameHash.toString()));
    console.log('----fileNameHashSign----', fileNameHashSign);
    console.log('----fileNameHashSign.slice(0, 32)----', fileNameHashSign.slice(0, 32));
    // QUE HACE???
    const dedicatedPrivateKey = convert.uint8ToHex(fileNameHashSign.slice(0, 32));
    // Crea una cuenta a partir de la dedicatedPrivateKey para enviarle una transacción con mensaje del apostilleHash
    const dedicatedAccount = Account.createFromPrivateKey(dedicatedPrivateKey, this.walletService.network);
    let transferTransaction: any;
    //Arma la transacción tipo transfer
    transferTransaction = this.proximaxProvider.buildTransferTransaction(
      this.walletService.network,
      this.proximaxProvider.createFromRawAddress(dedicatedAccount.address.plain()),
      JSON.stringify(apostilleHash)
    );
    // Se agrega fee cero
    transferTransaction.fee = UInt64.fromUint(0);
    // Firma la transacción
    const signedTransaction = ownerAccount.sign(transferTransaction);
    //announce the transaction
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
   * @param {*} common
   * @memberof preparePublicApostille
   */
  preparePublicApostille(common: any) {
    console.log(this.file.toString());
    //create a hash prefix
    const apostilleHashPrefix = 'fe4e545903';
    //create an encrypted hash in sha256
    const hash = crypto.SHA256(this.file.toString());
    //concatenates the hash prefix with SHA256 and the result gives the apostilleHash
    const apostilleHash = apostilleHashPrefix + hash.toString();
    //Generate an account to send the transaction with the apostilleHash
    const sinkAddress = this.proximaxProvider.createFromRawAddress(this.proximaxProvider.generateNewAccount(this.walletService.network).address.plain());
    //Create an account from my private key
    const myAccount = Account.createFromPrivateKey(common.privateKey, this.walletService.network);
    //Arm the transaction type transfer
    let transferTransaction: any = this.proximaxProvider.buildTransferTransaction(this.walletService.network, sinkAddress, JSON.stringify(apostilleHash));
    //Zero fee is added
    transferTransaction.fee = UInt64.fromUint(0);
    //Sign the transaction
    const signedTransaction = myAccount.sign(transferTransaction);
    //announce the transaction
    this.proximaxProvider.announce(signedTransaction).subscribe(
      x => {
        // Aqui falta validar si la transacción fue aceptada por el blockchain
        //Create arrangement to assemble the certificate
        const nty = {
          signedTransaction: signedTransaction,
          title: this.nameFile,
          tags: [this.apostilleCreateForm.get('tags').value],
          apostilleHash: apostilleHash,
          account: myAccount,
          sinkAddress: sinkAddress,
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
    this.nameFile = 'Not file selected yet...';
    this.apostilleCreateForm.reset();
    // location.reload();
  }
}
