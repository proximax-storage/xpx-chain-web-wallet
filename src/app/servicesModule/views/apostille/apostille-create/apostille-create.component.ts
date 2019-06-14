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

@Component({
  selector: 'app-apostille-create',
  templateUrl: './apostille-create.component.html',
  styleUrls: ['./apostille-create.component.scss']
})
export class ApostilleCreateComponent implements OnInit {

  apostilleCreateForm: FormGroup;
  configurationForm = {
    documentTitle: {
      minLength: 1,
      maxLength: 64
    },
    content: {
      minLength: 0,
      maxLength: 240
    },
    tags: {
      minLength: 1,
      maxLength: 240
    },
    password: {
      minLength: 8,
      maxLength: 64
    }
  }

  fileInputIsValidated = false;
  typeEncrypted: Array<object> = [
    {
      value: '1',
      label: 'MD5',
      selected: false,
      disabled: false
    },
    {
      value: '2',
      label: 'SHA1',
      selected: false,
      disabled: false
    },
    {
      value: '3',
      label: 'SHA256',
      selected: false,
      disabled: false
    },
    {
      value: '4',
      label: 'SHA3-256',
      selected: false,
      disabled: false
    }
  ];

  // ---------- FILE ---------
  ourFile: File;
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
    const titlle1 = nty.title.slice(0, nty.title.lastIndexOf('.'))
    const titlle2 = nty.title.slice(nty.title.lastIndexOf('.'));
    const fecha = `${date.getFullYear()}-${("00" + (date.getMonth() + 1)).slice(-2)}-${("00" + (date.getDate())).slice(-2)}`

    const url = `${this.proximaxProvider.url}/transaction/${nty.signedTransaction.hash.toLowerCase()}`;
    let qr = qrcode(10, 'H');

    qr.addData(url);
    qr.make();
    let base64ImageString = qr.createDataURL()
    const apostilleFilename = `${titlle1} -- Apostille TX ${nty.signedTransaction.hash.toLowerCase()} -- Date ${fecha.toString()}${titlle2}`
    if (this.apostilleCreateForm.get('typePrivatePublic').value == '1') {
      this.ntyData = {
        data: [
          {
            "filename": nty.title,
            "tags": nty.tags.join(' '),
            "fileHash": nty.apostilleHash,
            "owner": nty.account.address,
            "fromMultisig": nty.account.address,
            "dedicatedAccount": nty.sinkAddress,
            "dedicatedPrivateKey": "None (public sink)",
            "txHash": nty.signedTransaction.hash.toLowerCase(),
            "txMultisigHash": "",
            "timeStamp": date.toUTCString()
          }
        ]
      };
    } else {
      this.ntyData = {
        data: [
          {
            "filename": nty.title,
            "tags": nty.tags.join(' '),
            "fileHash": nty.apostilleHash,
            "owner": nty.account.address,
            "fromMultisig": nty.account.address,
            "dedicatedAccount": nty.sinkAddress,
            "dedicatedPrivateKey": nty.dedicatedPrivateKey,
            "txHash": nty.signedTransaction.hash.toLowerCase(),
            "txMultisigHash": "",
            "timeStamp": date.toUTCString()
          }
        ]
      };
    }

    // Apostille public
    if (Verifier.isPrivateApostille(nty.apostilleHash)) {
      this.zip.file(
        `Certificate of ${titlle1} -- Apostille TX ${nty.signedTransaction.hash.toLowerCase()} -- Date ${date.toUTCString()}.pdf`,
        this.pdfcertificatePrivate(base64ImageString, url, nty)
      ), {};
    }

    // Apostille public
    if (Verifier.isPublicApostille(nty.apostilleHash)) {
      this.zip.file(
        `Certificate of ${titlle1} -- Apostille TX ${nty.signedTransaction.hash.toLowerCase()} -- Date ${date.toUTCString()}.pdf`,
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

      typePrivatePublic: [false, [
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
        if (this.apostilleCreateForm.get('typePrivatePublic').value == '1') {
          this.prepareApostillePublic(common);
        } else {
          // this.apostillepreparatePrivate(common);
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
          saveAs(
            content,
            `PROXIsigned -- Do not Edit --"${date.getFullYear()}-${("00" + (date.getMonth() + 1)).slice(-2)}-${("00" + (date.getDate())).slice(-2)}".zip`
          );
        }
      });
    }
  }

  /**
   *
   *
   * @param {File[]} files
   * @memberof ApostilleCreateComponent
   */
  fileChange(files: File[]) {
    if (files.length > 0) {
      this.fileInputIsValidated = true;
      this.ourFile = files[0];
      this.nameFile = this.ourFile.name;
      const myReader: FileReader = new FileReader();
      myReader.readAsDataURL(this.ourFile);
      myReader.onloadend = (e) => {
        this.file = myReader.result;
        this.rawFileContent = crypto.enc.Base64.parse((<String>this.file).split(/,(.+)?/)[1]);
      };
    }
  }

  /**
   *
   *
   * @memberof ApostilleCreateComponent
   */
  imagenesBase65() {
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
   *
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
    this.imagenesBase65()

    var doc = new jsPDF()
    doc.addImage(this.certificatePrivate, 'JPEG', 0, 0, 210, 298)
    doc.addImage(base64ImageString, 'gif', 45, 244, 51, 50)
    doc.setFontType('normal');
    doc.setTextColor(0, 0, 0)
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
    console.log(nty);
    let date = new Date();
    this.imagenesBase65()

    var doc = new jsPDF()
    doc.addImage(this.certificatePublic, 'JPEG', 0, 0, 210, 298)
    doc.addImage(base64ImageString, 'gif', 45, 244, 51, 50)
    doc.setFontType('normal');
    doc.setTextColor(0, 0, 0)
    doc.text(80, 89, nty.title);

    doc.text(80, 99, date.toUTCString());
    doc.setFontSize(13);
    doc.text(80, 109, nty.Owner);
    doc.text(80, 120, nty.tags.join(' '));
    doc.setFontSize(12);

    doc.text(42, 159, nty.sinkAddress.pretty());
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
  prepareApostillePublic(common: any) {
    console.log(this.file);
    //create a hash prefix
    const apostilleHashPrefix = 'fe4e545903';
    //create an encrypted hash in sha256
    const hash = crypto.SHA256(this.file.toString());
    //concatenates the hash prefix with SHA256 and the result gives the apostilleHash
    const apostilleHash = apostilleHashPrefix + crypto.SHA256(this.file.toString()).toString(crypto.enc.Hex);
    //Generates an account to send you a transaction with apostilleHash message
    const sinkAddress = this.proximaxProvider.createFromRawAddress(this.proximaxProvider.generateNewAccount(this.walletService.network).address.plain());
    //Create an account from my private key
    const account = Account.createFromPrivateKey(common.privateKey, this.walletService.network);
    //Arm the transaction type transfer
    let transferTransaction: any = this.proximaxProvider.buildTransferTransaction(this.walletService.network, sinkAddress, JSON.stringify(apostilleHash));
    //Zero fee is added
    transferTransaction.fee = UInt64.fromUint(0);
    //Sign the transaction
    const signedTransaction = account.sign(transferTransaction);
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
          account: account,
          sinkAddress: sinkAddress,
          dedicatedPrivateKey: "",
          Owner: account.address.plain()
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
    const file: any = document.getElementById('fileInput')
    file.value = '';
    // this.nameFile = "";
    // this.ourFile = File[''];
    this.apostilleCreateForm.reset();
    // location.reload();
  }


}
