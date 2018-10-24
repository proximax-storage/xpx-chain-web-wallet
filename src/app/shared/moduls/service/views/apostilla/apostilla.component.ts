import { Component, OnInit } from '@angular/core';
import {Account,
  Address,
  Deadline,
  UInt64,
  NetworkType} from 'nem2-sdk';
import * as crypto from 'crypto-js'
@Component({
  selector: 'app-apostilla',
  templateUrl: './apostilla.component.html',
  styleUrls: ['./apostilla.component.scss']
})
export class ApostillaComponent implements OnInit {
  optionsCrypto: Array<any>;
  optionsStorage: Array<any>;
  address: Address;
  deadline:Deadline;
  account :Account;
  uint64:UInt64;
  file: string;
  ourFile: File; // hold our file
  fileInput: any;
  nameFile: string;

  constructor() { this.optionsCrypto = [
    { value: '1', label: 'MD5' },
    { value: '2', label: 'SHA1' },
    { value: '3', label: 'SHA256' },
    { value: '4', label: 'SHA3-256' },
    { value: '5', label: 'SHA3-512' },
  ];
    this.optionsStorage = [
      { value: '1', label: 'Public ' },

    ]

  }

  ngOnInit() {
    const hash = crypto.SHA256('text')
    console.log('data',hash)
    const apostilleHashPrefix = 'fe4e545903';
  }

  /**
   * this is used to trigger the input
   */
  openInput() {
    // your can use ElementRef for this later
    document.getElementById('fileInput').click();
  }
  fileChange(files: File[], $event) {
    if (files.length > 0) {
      this.ourFile = files[0];
      this.nameFile = this.ourFile.name;
      const myReader: FileReader = new FileReader();
      myReader.onloadend = (e) => {
        this.file = myReader.result;
      };
      myReader.readAsDataURL(this.ourFile);
    }
  }


}
/*
const nem2Sdk = require("nem2-sdk");
const cryptoJS = require("crypto-js");

const Address = nem2Sdk.Address,
  Deadline = nem2Sdk.Deadline,
  Account = nem2Sdk.Account,
  UInt64 = nem2Sdk.UInt64,
  NetworkType = nem2Sdk.NetworkType,
  PlainMessage = nem2Sdk.PlainMessage,
  TransferTransaction = nem2Sdk.TransferTransaction,
  TransactionHttp = nem2Sdk.TransactionHttp,
  XEM = nem2Sdk.XEM;

/!*
sender:
  private: 7808B5B53ECF24E40BE17B8EC3D0EB5F7C3F3D938E0D95A415F855AD4C27B2A4
  public: 5D9513282B65A12A1B68DCB67DB64245721F7AE7822BE441FE813173803C512C
  address: SBWEUWON6IBHCW5IC4EI6V6SMTVJGCJWGLF57UGK
sink:
  address: SDICZ5EAOD5W6YCAJL33OS5B4Y6FUOWOUOOLCZAL
*!/

const text = '999988887777';
const title = '4433221100.txt';
const tags = ['eeeeeeee'];

const apostilleHashPrefix = 'fe4e545903';

const hash = cryptoJS.SHA256(text);
const apostilleHash = apostilleHashPrefix + hash.toString(cryptoJS.enc.Hex);

const sinkAddress = 'SDICZ5EAOD5W6YCAJL33OS5B4Y6FUOWOUOOLCZAL';
const privateKey = '7808B5B53ECF24E40BE17B8EC3D0EB5F7C3F3D938E0D95A415F855AD4C27B2A4';
const account = Account.createFromPrivateKey(privateKey,NetworkType.MIJIN_TEST);

const transferTransaction = TransferTransaction.create(
  Deadline.create(),
  Address.createFromRawAddress(sinkAddress),
  [XEM.createRelative(0)],
  PlainMessage.create(apostilleHash),
  NetworkType.MIJIN_TEST,
);
transferTransaction.fee = UInt64.fromUint(150000);
const signedTransaction = account.sign(transferTransaction);

const transactionHttp = new TransactionHttp('http://localhost:3000');

transactionHttp.announce(signedTransaction).subscribe(x => console.log(x),
  err => console.error(err));

console.log('hash:    ' + signedTransaction.hash);
console.log('signer:  ' + signedTransaction.signer);
console.log('payload: ' + signedTransaction.payload);

const date = new Date();

const nty = { "data": [
    {
      "filename": title,
      "tags": tags.join(' '),
      "fileHash": apostilleHash,
      "owner": account.address.address,
      "fromMultisig": account.address.address,
      "dedicatedAccount": sinkAddress,
      "dedicatedPrivateKey": "None (public sink)",
      "txHash": signedTransaction.hash.toLowerCase(),
      "txMultisigHash": "",
      "timeStamp": date.toUTCString()
    }
  ]};

const apostilleFilename = title.slice(0, title.lastIndexOf('.')).concat(
  ' -- Apostille TX ',
  signedTransaction.hash.toLowerCase(),
  ' -- Date ',
  date.getFullYear(),
  '-',
  ("00" + (date.getMonth() + 1)).slice(-2),
  '-',
  ("00" + (date.getDate())).slice(-2),
  title.slice(title.lastIndexOf('.'))
);

console.log(apostilleFilename);
console.log(JSON.stringify(nty));*/
