import { Component, OnInit } from '@angular/core';
import * as crypto from 'crypto-js'
import { TransferTransaction, Message } from 'tsjs-xpx-chain-sdk';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { ProximaxProvider } from '../../../../shared/services/proximax.provider';
import { SharedService } from '../../../../shared';
import { NodeService } from '../../../services/node.service';
import { Verifier } from './audit-apostille-verifier'

@Component({
  selector: 'app-audit-apostille',
  templateUrl: './audit-apostille.component.html',
  styleUrls: ['./audit-apostille.component.css']
})
export class AuditApostilleComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;
  headElements = ['file name', 'Owner', 'Hash file', 'Result'];
  validatefileInput = false;
  ourFile: any;
  nameFile: string;
  file: any;
  rawFileContent: any;
  isProcessing = false;
  auditResults = [];
  messa: Message;
  initialFileName: any;
  url: any;
  constructor(
    private proximaxProvider: ProximaxProvider,
    private sharedService: SharedService,
    private nodeService: NodeService
  ) {
    this.url = `https://${this.nodeService.getNodeSelected()}`;

  }

  ngOnInit() {
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
        this.processFile();
        // this.rawFileContent = crypto.enc.Base64.parse(this.file.split(/,(.+)?/)[1]);
      };
      myReader.readAsDataURL(this.ourFile);
    }
  }
  checkApostilleName() {
    // Build an array out of the filename
    let nameArray = this.nameFile.match(/\S+\s*/g);
    // console.log('nameArray:', nameArray)
    if (nameArray[nameArray.length - 6] === undefined || nameArray[nameArray.length - 5].replace(/^\s+|\s+$/, '') !== 'TX') return false;
    let mark = nameArray[nameArray.length - 6].replace(/^\s+|\s+$/, '');

    // console.log('mark:', mark)
    if (mark === "Apostille" || mark === "ApostilleSigned") return true;
    return false;
  };

  processFile() {
    this.isProcessing = true;
    // Remove the meta part of $fileContent string (data:application/octet-stream;base64)
    let cleanedDataContent = this.file.split(/,(.+)?/)[1];
    // Base 64 to word array
    let parsedData = crypto.enc.Base64.parse(cleanedDataContent);
    if (!this.checkApostilleName()) {
      this.auditResults.push({
        'filename': this.nameFile,
        'owner': '',
        'fileHash': '',
        'result': 'This file is not in apostille format!',
        'hash': ''
      });
      this.showResult(this.auditResults);
      this.isProcessing = false;
      return;
    }
    // Build an array out of the filename
    let nameArray = this.nameFile.match(/\S+\s*/g);
    // Recomposing the initial filename before apostille
    let initialNameArray = nameArray.splice(0, nameArray.length - 7);
    let initialFileName = "";

    for (let h = 0; h < initialNameArray.length; h++) {
      initialFileName += initialNameArray[h];
    }
    // Initial filename
    initialFileName = initialFileName.replace(/^\s+|\s+$/, '') + "." + this.nameFile.split('.').pop();
    // Hash of the apostille transaction
    let apostilleTxHash = nameArray[nameArray.length - 4].replace(/^\s+|\s+$/, '');
    // console.log("signedTransaction.hash:", apostilleTxHash);
    this.blockUI.start('Loading...'); // Start blocking
    this.proximaxProvider.getTransaction(apostilleTxHash).subscribe((infTrans: TransferTransaction) => {
      const apostilleHashPrefix = 'fe4e545903';
      const data = this.file
      this.blockUI.stop(); // Stop blocking

      if (!this.verify(data, infTrans)) {
        this.auditResults
        this.auditResults.push({
          'filename': this.nameFile,
          'owner': '',
          'fileHash': '',
          'result': 'document not apostilled!',
          'hash': ''
        });
        this.showResult(this.auditResults);
        this.isProcessing = false;
        return;
      } else {
        this.auditResults.push({
          'filename': this.nameFile,
          'owner': infTrans.recipient,
          'fileHash': Verifier.Hash,
          'result': 'Document apostille!',
          'hash': ''
        });
        this.showResult(this.auditResults);
        this.isProcessing = true;
        return;

      }
    },
      error => {
        this.sharedService.showError('Error', '¡unexpected error!');
        this.blockUI.stop(); // Stop blocking
        console.error(error);
      }
    )

  }
  verify(data, infTrans): boolean {

    if (Verifier.isPublicApostille(infTrans.message.payload.replace(/['"]+/g, ''))) {
      return Verifier.verifyPublicApostille(data, infTrans.message.payload.replace(/['"]+/g, ''))
    }
    if (Verifier.isPrivateApostille(infTrans.message.payload.replace(/['"]+/g, ''))) {
      return Verifier.verifyPrivateApostille(infTrans.signer, data, infTrans.message.payload.replace(/['"]+/g, ''))

    }
  }
  showResult(result) {
  }
  createResultObject(initialFileName, apostilleSigner, checksum, dataHash, isPrivate, apostilleTxHash) {
    return {
      'filename': initialFileName,
      'owner': apostilleSigner,
      'fileHash': checksum + dataHash,
      'private': isPrivate,
      'result': '',
      'hash': apostilleTxHash
    }
  }

}
