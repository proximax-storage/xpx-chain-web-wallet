import { Component, OnInit, ViewChild } from '@angular/core';
import { TransferTransaction } from 'tsjs-xpx-chain-sdk';
import { ProximaxProvider } from '../../../../shared/services/proximax.provider';
import { NodeService } from '../../../services/node.service';
import { Verifier } from './audit-apistille-verifier';
import { ResultAuditInterface, HeaderServicesInterface } from '../../../services/services-module.service';
import { AppConfig } from '../../../../config/app.config';
import { TransactionsService, TransactionsInterface } from 'src/app/transactions/services/transactions.service';
import { ModalDirective } from 'ng-uikit-pro-standard';
import { PaginationInstance } from 'ngx-pagination';


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
  currentView: boolean = true;
  modalInfo: TransactionsInterface = null;
  searching: boolean = false;
  configFilesSelected: PaginationInstance = {
    id: 'fileStorage',
    itemsPerPage: 6,
    currentPage: 1
  };

  @ViewChild('basicModal', { static: true }) modalAudit: ModalDirective;

  constructor(
    private proximaxProvider: ProximaxProvider,
    private nodeService: NodeService,
    private transactionService: TransactionsService
  ) {
    this.url = `https://${this.nodeService.getNodeSelected()}`;
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
  verifyFiles() {
    this.currentView = !this.currentView
    this.searching = true;
    const hasts = [];
    this.ourFile.forEach(el => {
      let arrayName = el.name.split(' --Apostille TX ');
      if (arrayName.length > 1) {
        let arrayDate = arrayName[1].split(' --Date ');
        this.transactionsSearch.push(el);
        hasts.push(arrayDate[0]);

      } else {
        this.addAuditResult({
          filename: el.name,
          owner: '',
          fileHash: '',
          result: 'Document not apostilled',
          hash: ''
        })
      }
    });

    if (hasts.length > 0) {
      this.proximaxProvider.getTransactions(hasts).subscribe(element => {
        this.verifyHash(element);
      });
    } else {
      this.searching = false;
    }
  }

  /**
   * Method to verify hash of documents uploaded
   * @param transactions transactions found
   */
  verifyHash(transactions: TransferTransaction[]) {
    this.searching = false;
    this.transactionsSearch.forEach(element => {
      const arrayName = element.name.split(' --Apostille TX ');
      const arrayHash = arrayName[1].split(' --Date ');
      const arrayDate = arrayHash[1].split(' ');
      const findHash = transactions.find(el => arrayHash[0].toUpperCase() === el.transactionInfo.hash);

      if (findHash !== undefined) {
        const myReader: FileReader = new FileReader();
        myReader.onloadend = (e) => {
          if (this.verify(myReader.result, findHash)) {
            let originalName = '';
            let method = '';
            if (element.type !== '') {
              let arrayExtention = arrayName[1].split('.');
              originalName = `${arrayName[0]}.${arrayExtention[arrayExtention.length - 1]}`;
            } else {
              originalName = arrayName[0];
            }
            console.log('\n\n\n\nValue of element', element, '\n\n\n\nEnd value\n\n');
            const apostillePrivatePrefix = 'fe4e545983';
            const apostillePublicPrefix = 'fe4e545903';
            const prefixHash = findHash.message.payload.split('"').join('').substr(0, 10);


            let transaction = this.transactionService.getStructureDashboard(findHash);
            transaction.dateFile = arrayDate[0];
            transaction.fileName = originalName;

            if (prefixHash === apostillePublicPrefix) {
              transaction.privateFile = false;
            } else if (prefixHash === apostillePrivatePrefix) {
              transaction.privateFile = true;
            }

            this.addAuditResult({
              filename: originalName,
              owner: this.proximaxProvider.createFromRawAddress(findHash.recipient['address']).pretty(),
              fileHash: findHash.message.payload.split('"').join(''),
              result: 'Document apostille',
              hash: findHash.transactionInfo.hash,
              date: arrayDate[0],
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
        };
        myReader.readAsDataURL(element);
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
