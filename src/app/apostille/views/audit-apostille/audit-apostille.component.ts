import { Component, OnInit, ViewChild } from '@angular/core';
import { TransactionInfo, TransferTransaction, UInt64 } from 'tsjs-xpx-chain-sdk';
import { ProximaxProvider } from '../../../shared/services/proximax.provider';
import { NodeService } from '../../../servicesModule/services/node.service';
import { Verifier } from './audit-apistille-verifier';
import { ResultAuditInterface, HeaderServicesInterface } from '../../../servicesModule/services/services-module.service';
import { AppConfig } from '../../../config/app.config';
import { TransactionsService, TransactionsInterface } from '../../../transactions/services/transactions.service';
import { ModalDirective } from 'ng-uikit-pro-standard';
import { PaginationInstance } from 'ngx-pagination';
import * as JSZip from 'jszip';
import { environment } from '../../../../environments/environment';
import { StorageService } from '../../../storage/views/services/storage.service';
import { DataBridgeService } from 'src/app/shared/services/data-bridge.service';
import { formatDate } from '@angular/common';
@Component({
  selector: 'app-audit-apostille',
  templateUrl: './audit-apostille.component.html',
  styleUrls: ['./audit-apostille.component.css']
})

export class AuditApostilleComponent implements OnInit {

  paramsHeader: HeaderServicesInterface = {
    moduleName: 'Attestation',
    componentName: 'Audit',
    extraButton: 'Create',
    routerExtraButton: `/${AppConfig.routes.createApostille}`
  };

  zipFile: JSZip = new JSZip();
  hashsSearch = [];
  fileZip: any;
  headElements = ['File name', 'Owner', 'Hash file', 'Result'];
  validatefileInput = false;
  ourFile: File[] = [];
  nameFile: string;
  file: any;
  auditResults: ResultAuditInterface[] = [];
  transactionsSearch = [];
  isProcessing = false;
  p = 1;
  url: any;
  currentView = true;
  modalInfo: TransactionsInterface = null;
  searching = false;
  configFilesSelected: PaginationInstance = {
    id: 'fileStorage',
    itemsPerPage: 6,
    currentPage: 1
  };

  @ViewChild('basicModal', { static: true }) modalAudit: ModalDirective;

  constructor(
    private dataBridge: DataBridgeService,
    private proximaxProvider: ProximaxProvider,
    private nodeService: NodeService,
    private transactionService: TransactionsService,
    private storageService: StorageService
  ) {
    this.url = `${environment.protocol}://${this.nodeService.getNodeSelected()}`;
  }

  ngOnInit() { }

  /**
   * This is used to trigger the input
   *
   * @memberof ApostillaComponent
   */
  openInput() {
    // your can use ElementRef for this later
    document.getElementById('fileInput').click();
  }

  /**
   * Method to take the selected file
   * @param {File} files file array
   * @param {Event} $event get the html element
   */
  fileChange(files: File[], $event) {
    if (files.length > 0) {
      for (const element of files) {
        // this.validatefileInput = true;
        let find = this.ourFile.filter(el => el.name === element.name && el.size === element.size && el.type === element.type);

        if (find.length === 0) {
          this.ourFile.push(element);
        }
      }
    }
  }


  /**
   * Method to files verify
   */
  async verifyFiles() {
    this.currentView = !this.currentView
    this.searching = true;
    const hash = await this.fileTour();
    // console.log('------> hashs');
    if (hash.length > 0) {
      this.proximaxProvider.getTransactions(hash).subscribe(element => {
        this.verifyHash(element);
      });
    } else {
      this.searching = false;
    }
  }
  getHashName(name: string): GetHashName {
    let dataR: any = {
      sussces: false,
      hash: null
    }
    let arrayName = name.split("TX")
    let arrayNameV = arrayName.map(x => x.trim().slice(0, 64)).find(x => this.returnHexaNumber(x) && x.length == 64)
    if (arrayNameV) {
      dataR = {
        sussces: true,
        hash: arrayNameV
      }
    }
    return dataR
  }
  returnHexaNumber(s: any) {
    var regExp = /^[-+]?[0-9A-Fa-f]+\.?[0-9A-Fa-f]*?$/;
    return (typeof s === 'string' && regExp.test(s));
  }
  toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
  async fileTour() {
    const hash = [];
    for (let index = 0; index < this.ourFile.length; index++) {
      const el = this.ourFile[index];
      if (el.type === 'application/zip') {
        const jszip = new JSZip();
        await jszip.loadAsync(el).then(async (zip) => {
          if (Object.keys(zip.files).length >= 2) {
            for (let filename of Object.keys(zip.files)) {
              await zip.files[filename].async('blob').then(async (blobFile) => {
                const blobClone = Object.assign({}, blobFile);
                blobClone.type = await zip.files[filename].comment;
                const file = await new File([blobClone], zip.files[filename].name, { type: zip.files[filename].comment });
                let verifiName = file.name.substr(0, 15);
                if (verifiName !== 'Certificate of ') {
                  const file = await new File([blobFile], zip.files[filename].name, { type: zip.files[filename].comment });
                const uploadedFileContent = await this.toBase64(file)
                  const hashName: GetHashName = this.getHashName(file.name)
                  if (hashName.sussces) {
                    this.ourFile[index] = file;
                    this.transactionsSearch.push({ file: file, resultData: uploadedFileContent, hash: hashName.hash });
                    hash.push(hashName.hash);
                  } else {
                    this.addAuditResult({
                      filename: el.name,
                      owner: '',
                      fileHash: '',
                      result: 'the filename does not contain the hash located in the certificate',
                      hash: ''
                    });
                  }
                }
              });
            }
          } else {
            this.addAuditResult({
              filename: el.name,
              owner: '',
              fileHash: '',
              result: 'The file does not contain valid data to audit',
              hash: ''
            });
          }
        });
      } else {
        const hashName: GetHashName = this.getHashName(el.name)
        if (hashName.sussces) {
          const uploadedFileContent = await this.toBase64(el)
          this.transactionsSearch.push({ file: el, resultData: uploadedFileContent, hash: hashName.hash });
          hash.push(hashName.hash);
        } else {
          this.addAuditResult({
            filename: el.name,
            owner: '',
            fileHash: '',
            result: 'the filename does not contain the hash located in the certificate',
            hash: ''
          });
        }
      }
    }
    return hash;
  }
  convertDateTimeFormat(dateTime: string): string {
    let dateFormat = "MM-dd-yyyy";
    let date = new Date(dateTime);
    let timezone = - date.getTimezoneOffset();

    return formatDate(date, dateFormat, 'en-us', timezone.toString());
  }

  getUTCDateTime = (transactionInfo: TransactionInfo) => new Promise((resolve, reject) => {
    const height = transactionInfo.height.compact();
    let UTCDateTime = "";
    if (typeof (height) === 'number') {
      const existBlock = this.dataBridge.filterBlockStorage(height);
      if (existBlock) {
        UTCDateTime = `${this.transactionService.dateFormatPureUTC(new UInt64([existBlock.timestamp.lower, existBlock.timestamp.higher]))}`;
        UTCDateTime = this.convertDateTimeFormat(UTCDateTime);
        resolve(UTCDateTime);
      } else {
        this.proximaxProvider.getBlockInfo(height).subscribe(
          next => {
            this.dataBridge.validateBlock(next);
            UTCDateTime = `${this.transactionService.dateFormatPureUTC(next.timestamp)}`;
            UTCDateTime = this.convertDateTimeFormat(UTCDateTime);
            resolve(UTCDateTime);
          }
        );
      }
    }

    // return UTCDateTime
  });
  /**
   * Method to verify hash of documents uploaded
   * @param transactions transactions found
   */
  async verifyHash(transactions: TransferTransaction[]) {
    // console.log('\n\n\n\nValue of trasaction', transactions, '\n\n\n\nEnd value\n\n');
    this.searching = false;
    this.transactionsSearch.forEach(async element => {
      const arrayName = element.file.name;
      const findHash = transactions.find(el => element.hash.toUpperCase() === el.transactionInfo.hash);
      if (findHash !== undefined) {
        const dateFile = await this.getUTCDateTime(findHash.transactionInfo)
        if (this.verify(element.resultData, findHash)) {
          let originalName = '';
          let method = '';
          originalName = arrayName
          const apostillePrivatePrefix = 'fe4e545983';
          const apostillePublicPrefix = 'fe4e545903';
          const prefixHash = findHash.message.payload.replace(/['"]+/g, '').substr(0, 10);


          let transaction = this.transactionService.getStructureDashboard(findHash);
          transaction.dateFile = String(dateFile) ;
          transaction.fileName = originalName;

          if (prefixHash === apostillePublicPrefix) {
            transaction.privateFile = false;
          } else if (prefixHash === apostillePrivatePrefix) {
            transaction.privateFile = true;
          }

          this.addAuditResult({
            filename: originalName,
            owner: this.proximaxProvider.createFromRawAddress(findHash.recipient['address']).pretty(),
            fileHash: findHash.message.payload.replace(/['"]+/g, ''),
            result: 'Document apostille',
            hash: findHash.transactionInfo.hash,
            date: String(dateFile) ,
            method: method,
            transaction: transaction,
          }, findHash.transactionInfo.hash);
        } else {

          this.addAuditResult({
            filename: element.name,
            owner: '',
            fileHash: '',
            result: 'Modified document',
            hash: ''
          });
        }
      } else {
        this.addAuditResult({
          filename: element.name,
          owner: '',
          fileHash: '',
          result: 'No result found',
          hash: ''
        });
      }
    });
  }

  /**
   * Method to verify transaction info
   * @param data document data
   * @param infTrans transaction info
   */
  verify(data, infTrans): boolean {
    if (Verifier.isPublicApostille(infTrans.message.payload.replace(/['"]+/g, ''))) {
      return Verifier.verifyPublicApostille(data, infTrans.message.payload.replace(/['"]+/g, ''))
    }
    if (Verifier.isPrivateApostille(infTrans.message.payload.replace(/['"]+/g, ''))) {
      return Verifier.verifyPrivateApostille(infTrans.signer, data, infTrans.message.payload.replace(/['"]+/g, ''))
    }
  }

  /**
   * Method to load data on the card
   * @param result data to load on the card
   * @param hash transactions hash
   */
  addAuditResult(result: ResultAuditInterface, hash?) {
    let find = [];
    if (hash) {
      find = this.auditResults.filter(el => el.hash === result.hash);
    } else {
      find = this.auditResults.filter(el => el.filename === result.filename);
    }
    if (find.length === 0) {
      this.auditResults.push(result);
    }
  }

  /**
   * Method to modal show
   * @param transaction transaction information
   */
  verifyModal(transaction: TransactionsInterface) {
    if (transaction) {
      this.modalInfo = transaction;
      this.modalAudit.show();
    }
  }

  tooltipAction(hash) {
    let message
    if (hash !== '') {
      message = 'Click to show transaction detail'
    } else {
      message = 'This card has no information to show'
    }

    return message
  }
}
export interface GetHashName {
  sussces: boolean,
  hash: string
}