import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from "@angular/forms";
import { saveAs } from 'file-saver';
import {
  Account,
  Address,
  Deadline,
  UInt64,
  NetworkType,
  TransferTransaction,
  PlainMessage,
  XEM,
  TransactionHttp
} from 'nem2-sdk';
import * as crypto from 'crypto-js'
import * as JSZip from 'jszip';

import { NemProvider } from '../../../../services/nem.provider';
import { WalletService } from '../../../../services/wallet.service';
import { environment } from '../../../../../../environments/environment'
@Component({
  selector: 'app-apostilla',
  templateUrl: './apostilla.component.html',
  styleUrls: ['./apostilla.component.scss']
})
export class ApostillaComponent implements OnInit {
  zip: JSZip;
  ntyData:any;
  transactionHttp: TransactionHttp;
  apostillaForm: FormGroup;
  optionsCrypto: Array<any>;
  optionsStorage: Array<any>;
  address: Address;
  deadline: Deadline;
  account: Account;
  uint64: UInt64;
  file: string;
  ourFile: File; // hold our file
  fileInput: any;
  nameFile: string;
  validatefileInput = false;
  rawFileContent:any
  constructor(
    private fb: FormBuilder,
    private walletService: WalletService,
    private nemProvider: NemProvider

  ) {
    this.zip = new JSZip();
    this.transactionHttp = new TransactionHttp(environment.apiUrl)
    this.optionsCrypto = [{ value: '1', label: 'MD5' }, { value: '2', label: 'SHA1' }, { value: '3', label: 'SHA256' }, { value: '4', label: 'SHA3-256' }, { value: '5', label: 'SHA3-512' },];
    this.optionsStorage = [{ value: '1', label: 'Public ' },]
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
      storage: ['1', [Validators.required, Validators.maxLength(30)]],
      file: [''],
      titlle: [''],
      contant: ['']
    });
  }
  sendApostille() {
    // console.log(this.apostillaForm.valid)
    // console.log(this.validatefileInput)
    if (this.apostillaForm.valid && this.validatefileInput) {
      const common = {
        password: this.apostillaForm.get('password').value
      }
      if (this.walletService.decrypt(common)) {
        this.apostillepreparate(common)
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
        this.rawFileContent = crypto.enc.Base64.parse(this.file.split(/,(.+)?/)[1]);
      };
      myReader.readAsDataURL(this.ourFile);
    }
  }


  apostillepreparate(common) {
    const title = this.nameFile;
    const tags = [this.apostillaForm.get('tags').value];
    const apostilleHashPrefix = 'fe4e545903';
    const hash = crypto.SHA256(this.file);
    // console.log('data', hash)
    const apostilleHash = apostilleHashPrefix + crypto.SHA256(this.file).toString(crypto.enc.Hex);
    const sinkAddress = this.nemProvider.generateNewAccount(this.walletService.network).address.plain();
    const account = Account.createFromPrivateKey(common.privateKey, this.walletService.network);
    let transferTransaction: any

    transferTransaction = TransferTransaction.create(
      Deadline.create(10),
      Address.createFromRawAddress(sinkAddress),
      [XEM.createRelative(0)],
      PlainMessage.create(apostilleHash),
      this.walletService.network,
    );
    transferTransaction.fee = UInt64.fromUint(150000);
    const signedTransaction = account.sign(transferTransaction);
    const nty = {
      signedTransaction: signedTransaction,
      title: title,
      tags: tags,
      apostilleHash: apostilleHash,
      account: account,
      sinkAddress: sinkAddress,
    }

    this.transactionHttp.announce(signedTransaction).subscribe(
      x => {
        // console.log("exis=", x)
        this.buildApostille(nty)
      },
      err => {
        console.error(err)
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



    // console.log('hash:    ' + nty.signedTransaction.hash);
    // console.log('signer:  ' + nty.signedTransaction.signer);
    // console.log('payload: ' + nty.signedTransaction.payload);
    const date = new Date();
    const titlle1 = nty.title.slice(0, nty.title.lastIndexOf('.'))
    const titlle2 = nty.title.slice(nty.title.lastIndexOf('.'));
    const fecha = `${date.getFullYear()}-${("00" + (date.getMonth() + 1)).slice(-2)}-${("00" + (date.getDate())).slice(-2)}`
    const apostilleFilename = `${titlle1} -- Apostille TX ${nty.signedTransaction.hash.toLowerCase()} -- Date ${fecha.toString()}${titlle2}`
    let timeStamp = new Date();
    let dedicatedPrivateKey = ''
    let txMultisigHash = ''
   this.ntyData= {
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
    this.zip.file(apostilleFilename,(crypto.enc.Base64.stringify(this.rawFileContent)), {
      base64: true
    });
    this.setAccountWalletStorage(this.ntyData);
    this.downloadSignedFiles();
    console.log(JSON.stringify(this.ntyData))
  }
  downloadSignedFiles() {
    const date = new Date();
    // Trigger if at least 1 file and 1 certificate in the archive
    if (Object.keys(this.zip.files).length >0) {

      this.zip.file("Nty-file-" + date + ".nty", JSON.stringify(this.ntyData));
      this.zip.generateAsync({
        type: "blob"
      }).then((content) => {
        // Trigger download
        // console.log("contenido:", content)
        saveAs(content, `PROXIsigned -- Do not Edit --"${date.getFullYear()}-${("00" + (date.getMonth() + 1)).slice(-2)}-${("00" + (date.getDate())).slice(-2)}".zip`);
        // this._$timeout(() => {
        //     // Reset all
        //     return this.init();
        // })
      });
    }
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

}
