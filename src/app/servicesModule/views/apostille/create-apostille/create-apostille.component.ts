import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import * as qrcode from 'qrcode-generator';
import { saveAs } from 'file-saver';
import * as jsPDF from 'jspdf';
import { Verifier } from '../audit-apostille/audit-apistille-verifier'
import { Account, Address, Deadline, UInt64, TransactionHttp } from 'tsjs-xpx-catapult-sdk';
import { KeyPair, convert } from 'js-xpx-catapult-library'
import * as crypto from 'crypto-js'
import * as JSZip from 'jszip';
import { WalletService, SharedService } from '../../../../shared';
import { ProximaxProvider } from '../../../../shared/services/proximax.provider';
import { NodeService } from '../../../services/node.service';
import { IpfsConnection, StreamHelper, IpfsClient } from 'xpx2-ts-js-sdk';
import { environment } from '../../../../../environments/environment';
import { ApostilleService } from '../services/apostille.service';


@Component({
  selector: 'app-create-apostille',
  templateUrl: './create-apostille.component.html',
  styleUrls: ['./create-apostille.component.scss']
})
export class CreateApostilleComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;

  zip: JSZip;
  ntyData: any;
  transactionHttp: TransactionHttp;
  apostillaForm: FormGroup;
  optionsCrypto: Array<any>;
  optionsStorage: Array<any>;
  address: Address;
  deadline: Deadline;
  account: Account;
  uint64: UInt64;
  file: string | ArrayBuffer | null; string;
  ourFile: File; // hold our file
  fileInput: any;
  nameFile: string;
  validatefileInput = false;
  rawFileContent: any;
  certificatePrivate: string;
  certificatePublic: string;
  url: any;
  storeInDfms = false;

  constructor(
    private fb: FormBuilder,
    private walletService: WalletService,
    private proximaxProvider: ProximaxProvider,
    private sharedService: SharedService,
    private nodeService: NodeService,
    private apostilleService: ApostilleService
  ) {
    this.url = `https://${this.nodeService.getNodeSelected()}`
    this.zip = new JSZip();
    this.transactionHttp = new TransactionHttp(this.url)
    this.optionsCrypto = [{ value: '1', label: 'MD5' }, { value: '2', label: 'SHA1' }, { value: '3', label: 'SHA256' }, { value: '4', label: 'SHA3-256' }, { value: '5', label: 'SHA3-512' },];
    this.optionsStorage = [
      { value: '1', label: 'Public ' },
      { value: '2', label: 'Private' }]
    this.createForm();
  }
  ngOnInit() {


    this.apostillaForm.get('password').valueChanges.subscribe(
      password => {
      });

  }
  createForm() {
    this.apostillaForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(30)]],
      tags: ['', [Validators.required, Validators.maxLength(30)]],
      hash: ['3', [Validators.required, Validators.maxLength(30)]],
      storage: ['2', [Validators.required, Validators.maxLength(30)]],
      file: [''],
      titlle: [''],
      contant: [''],
      saveInDFMS: ['']
    });
  }
  sendApostille() {

    if (this.apostillaForm.valid && this.validatefileInput) {
      const common = {
        password: this.apostillaForm.get('password').value
      }
      if (this.walletService.decrypt(common)) {
        if (this.apostillaForm.get('storage').value == '1') {
          this.apostillepreparate(common);
        } else {
          this.apostillepreparatePrivate(common);
        }
      }
    }
  }
  getError(param, formControl?) {
    if (this.apostillaForm.get(param).getError('required')) {
      return `This field is required`;
    } else if (this.apostillaForm.get(param).getError('minlength')) {
      return `This field must contain minimum ${this.apostillaForm.get(param).getError('minlength').requiredLength} characters`;
    } else if (this.apostillaForm.get(param).getError('maxlength')) {
      return `This field must contain maximum ${this.apostillaForm.get(param).getError('maxlength').requiredLength} characters`;
    }
  }

  /**
   * This is used to trigger the input
   *
   * @memberof ApostillaComponent
   */
  openInput() {
    // your can use ElementRef for this later
    document.getElementById('fileInput').click();
  }

  fileChange(files: File[], $event) {
    if (files.length > 0) {
      this.validatefileInput = true;
      this.ourFile = files[0];
      this.nameFile = this.ourFile.name;
      const myReader: FileReader = new FileReader();
      myReader.onloadend = (e) => {
        this.file = myReader.result;
        this.rawFileContent = crypto.enc.Base64.parse((<String>this.file).split(/,(.+)?/)[1]);
      };
      myReader.readAsDataURL(this.ourFile);
    }
  }
  hexStringToByte(str) {
    if (!str) {
      return new Uint8Array();
    }
    var a = [];
    for (var i = 0, len = str.length; i < len; i += 2) {
      a.push(parseInt(str.substr(i, 2), 16));
    }
    return new Uint8Array(a);
  }

  apostillepreparatePrivate(common) {
    this.blockUI.start('Loading...'); // Start blocking
    const contentHash = crypto.SHA256(this.file);
    const title = this.nameFile;
    const tags = [this.apostillaForm.get('tags').value];
    const apostilleHashPrefix = 'fe4e545983';

    const ownerAccount = Account.createFromPrivateKey(common.privateKey, this.walletService.network);
    const ownerKeypair = KeyPair.createKeyPairFromPrivateKeyString(common.privateKey);
    const fileHash = this.hexStringToByte(contentHash.toString(crypto.enc.Hex))

    const contentHashSig = KeyPair.sign(ownerKeypair, fileHash);

    const apostilleHash = apostilleHashPrefix + convert.uint8ToHex(contentHashSig).toLowerCase();
    const filenameHash = crypto.SHA256(title);
    const filenameHashSig = KeyPair.sign(ownerKeypair, filenameHash.toString(crypto.enc.Hex));
    const dedicatedPrivateKey = convert.uint8ToHex(filenameHashSig.slice(0, 32));


    const dedicatedAccount = Account.createFromPrivateKey(dedicatedPrivateKey, this.walletService.network);
    let transferTransaction: any

    transferTransaction = this.proximaxProvider.sendTransaction(this.walletService.network, dedicatedAccount.address.plain(), JSON.stringify(apostilleHash))
    transferTransaction.fee = UInt64.fromUint(0);
    const signedTransaction = ownerAccount.sign(transferTransaction);

    const date = new Date();
    const nty = {
      signedTransaction: signedTransaction,
      title: title,
      tags: tags,
      apostilleHash: apostilleHash,
      account: ownerAccount,
      sinkAddress: dedicatedAccount.address.plain(),
      dedicatedPrivateKey: dedicatedAccount.privateKey.toLowerCase(),
      Owner: ownerAccount.address.plain(),

    }
    this.proximaxProvider.announce(signedTransaction).subscribe(
      x => {
        this.blockUI.stop(); // Stop blocking
        this.buildApostille(nty)
        this.sharedService.showSuccess('success', 'apostille sent')
      },
      err => {
        this.blockUI.stop(); // Stop blocking
        console.error(err)
        this.sharedService.showError('Error', '¡unexpected error!');
        this.downloadSignedFiles();
      });
  }
  apostillepreparate(common) {
    this.blockUI.start('Loading...'); // Start blocking
    const title = this.nameFile;
    const tags = [this.apostillaForm.get('tags').value];
    const apostilleHashPrefix = 'fe4e545903';
    const hash = crypto.SHA256(this.file);
    const apostilleHash = apostilleHashPrefix + crypto.SHA256(this.file).toString(crypto.enc.Hex);
    const sinkAddress = this.proximaxProvider.generateNewAccount(this.walletService.network).address.plain();
    const account = Account.createFromPrivateKey(common.privateKey, this.walletService.network);
    let transferTransaction: any

    transferTransaction = this.proximaxProvider.sendTransaction(this.walletService.network, sinkAddress, JSON.stringify(apostilleHash))
    transferTransaction.fee = UInt64.fromUint(0);
    const signedTransaction = account.sign(transferTransaction);
    const nty = {
      signedTransaction: signedTransaction,
      title: title,
      tags: tags,
      apostilleHash: apostilleHash,
      account: account,
      sinkAddress: sinkAddress,
      dedicatedPrivateKey: "",
      Owner: account.address.plain()

    }
    this.proximaxProvider.announce(signedTransaction).subscribe(
      x => {
        this.blockUI.stop(); // Stop blocking
        // console.log("exis=", x)
        this.buildApostille(nty)
        this.sharedService.showSuccess('success', 'apostille sent')
      },
      err => {
        this.blockUI.stop(); // Stop blocking
        console.error(err)
        this.sharedService.showError('Error', '¡unexpected error!');
        this.downloadSignedFiles();
      });
  }

  /**
  * Create a wallet array
  * by: roimerj_vzla
  *
  * @param {string} user
  * @param {any} accounts
  * @memberof WalletService
  */
  setAccountWalletStorage(nty) {
    let proxinty = JSON.parse(localStorage.getItem('proxi-nty'));
    if (!proxinty) {
      localStorage.setItem('proxi-nty', JSON.stringify(nty))
    } else {
      proxinty.data.push(nty.data)
      localStorage.setItem('proxi-nty', JSON.stringify(proxinty))
    }
  }

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

    let timeStamp = new Date();
    let dedicatedPrivateKey = ''
    let txMultisigHash = ''


    if (this.apostillaForm.get('storage').value == '1') {
      this.ntyData = {
        "data": [
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
        "data": [
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




    if (Verifier.isPrivateApostille(nty.apostilleHash)) {
      this.zip.file("Certificate of " + titlle1 + " -- Apostille TX " + nty.signedTransaction.hash.toLowerCase() + " -- Date " + date.toUTCString() + ".pdf",
        this.pdfcertificatePrivate(base64ImageString, url, nty)), {
        };
    }
    if (Verifier.isPublicApostille(nty.apostilleHash)) {
      this.zip.file("Certificate of " + titlle1 + " -- Apostille TX " + nty.signedTransaction.hash.toLowerCase() + " -- Date " + date.toUTCString() + ".pdf",
        this.pdfcertificatePublic(base64ImageString, url, nty)), {
        };
    }


    this.zip.file(apostilleFilename, (crypto.enc.Base64.stringify(this.rawFileContent)), {
      base64: true
    });
    this.setAccountWalletStorage(this.ntyData);
    this.downloadSignedFiles();
  }
  downloadSignedFiles() {
    const date = new Date();
    if (Object.keys(this.zip.files).length > 1) {
      this.zip.generateAsync({
        type: "blob"
      }).then(async (content) => {

        if (this.storeInDfms) {
          const bufferContent = await this.convertBlobToBuffer(content);
          const streamContent = await StreamHelper.buffer2Stream(bufferContent);

          const ipfConnection = new IpfsConnection(environment.storageConnection.host, environment.storageConnection.port, environment.storageConnection.options);
          const ifpsClient = new IpfsClient(ipfConnection);
          ifpsClient.addStream(streamContent).subscribe(hash => {
            // console.log(hash);
            saveAs(content, hash + '.zip');
          });
          this.reset();
        } else {

          saveAs(content, `PROXIsigned -- Do not Edit --"${date.getFullYear()}-${("00" + (date.getMonth() + 1)).slice(-2)}-${("00" + (date.getDate())).slice(-2)}".zip`);
          this.reset();
        }


      });
    }
  }

  pdfcertificatePrivate(base64ImageString, url, nty) {
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

  pdfcertificatePublic(base64ImageString, url, nty) {
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

    doc.text(42, 159, nty.sinkAddress);
    doc.text(42, 181, nty.account.address.plain());
    doc.setFontSize(10.9);
    doc.text(42, 204, nty.signedTransaction.hash.toLowerCase());
    doc.setFontSize(7);
    doc.text(42, 225, nty.apostilleHash);
    return doc.output('blob');
  }

  createNotaryData = function (filename, tags, fileHash, txHash, txMultisigHash, owner, fromMultisig, dedicatedAccount, dedicatedPrivateKey) {
    let d = new Date();
    return {
      "data": [{
        "filename": filename,
        "tags": tags,
        "fileHash": fileHash,
        "owner": owner,
        "fromMultisig": fromMultisig,
        "dedicatedAccount": dedicatedAccount,
        "dedicatedPrivateKey": dedicatedPrivateKey,
        "txHash": txHash,
        "txMultisigHash": txMultisigHash,
        "timeStamp": d.toUTCString()
      }]
    };
  }

  imagenesBase65() {
    this.certificatePrivate = this.apostilleService.getCertificatePrivate();
    this.certificatePublic = this.apostilleService.getCertificatePublic();
  }
  reset() {
    const file: any = document.getElementById('fileInput')
    file.value = '';
    // this.nameFile = "";
    // this.ourFile = File[''];
    this.apostillaForm.reset();
    // location.reload();
  }

  /**
 *
 *
 * @param {*} event
 * @memberof CreateApostilleComponent
 */
  onSaveInDFMSChanged(event) {
    this.storeInDfms = event.checked;
  }

  /**Will move to util class */
  async convertBlobToBuffer(blob) {
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
}
