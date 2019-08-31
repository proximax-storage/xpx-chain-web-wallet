import { Component, OnInit } from '@angular/core';
import * as crypto from 'crypto-js'
import { TransferTransaction, Message } from 'tsjs-xpx-chain-sdk';
import { ProximaxProvider } from '../../../../shared/services/proximax.provider';
import { NodeService } from '../../../services/node.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { Verifier } from './audit-apistille-verifier';
import { ResultAuditInterface, HeaderServicesInterface } from '../../../services/services-module.service';

@Component({
  selector: 'app-audit-apostille',
  templateUrl: './audit-apostille.component.html',
  styleUrls: ['./audit-apostille.component.css']
})

export class AuditApostilleComponent implements OnInit {

  paramsHeader: HeaderServicesInterface = {
    moduleName: 'Attestation',
    componentName: 'AUDIT'
  };
  headElements = ['file name', 'Owner', 'Hash file', 'Result'];
  validatefileInput = false;
  ourFile: any;
  nameFile: string;
  file: any;
  auditResults: ResultAuditInterface[] = [];
  p = 1;


  //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  rawFileContent: any;
  // isProcessing = false;
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
      this.validatefileInput = true;
      this.ourFile = files[0];
      this.nameFile = this.ourFile.name;
      const myReader: FileReader = new FileReader();
      myReader.onloadend = (e) => {
        this.file = myReader.result;
        this.verifyFile();
      };
      myReader.readAsDataURL(this.ourFile);
    }
  }

  /**
   *
   */
  verifyFile() {
    // this.isProcessing = true;
    // Remove the meta part of $fileContent string (data:application/octet-stream;base64)
    // let cleanedDataContent = this.file.split(/,(.+)?/)[1];
    // Base 64 to word array
    // let parsedData = crypto.enc.Base64.parse(cleanedDataContent);
    if (!this.checkApostilleName()) {
      this.auditResults.push({
        filename: this.nameFile,
        owner: '',
        fileHash: '',
        result: 'This file is not in apostille format!',
        hash: ''
      });
      // this.showResult(this.auditResults);
      // this.isProcessing = false;
      return;
    }
    // Build an array out of the filename
    const nameArray = this.nameFile.match(/\S+\s*/g);
    // Recomposing the initial filename before apostille
    const initialNameArray = nameArray.splice(0, nameArray.length - 7);
    let initialFileName = "";

    for (let h = 0; h < initialNameArray.length; h++) {
      initialFileName += initialNameArray[h];
    }
    // Initial filename
    initialFileName = initialFileName.replace(/^\s+|\s+$/, '') + "." + this.nameFile.split('.').pop();
    // Hash of the apostille transaction
    const apostilleTxHash = nameArray[nameArray.length - 4].replace(/^\s+|\s+$/, '');
    this.proximaxProvider.getTransaction(apostilleTxHash).subscribe((infTrans: TransferTransaction) => {
      // const apostilleHashPrefix = 'fe4e545903';
      console.log('\n\n\n\nValue of information transaction', infTrans, '\n\n\n\nEnd value\n\n');
      const data = this.file

      if (!this.verify(data, infTrans)) {
        this.auditResults
        this.auditResults.push({
          filename: this.nameFile,
          owner: '',
          fileHash: '',
          result: 'document not apostilled!',
          hash: ''
        });
        // this.showResult(this.auditResults);
        // this.isProcessing = false;
        return;
      } else {
        const apostilleHashPrefix = 'fe4e545903';
        let arrayName = this.nameFile.split(' --Apostille ');
        let arrayextention = this.nameFile.split('.');

        const originalName = `${arrayName[0]}.${arrayextention[arrayextention.length - 1]}`;
        this.auditResults.push({
          filename: originalName,
          owner: this.proximaxProvider.createFromRawAddress(infTrans.recipient['address']).pretty(),
          fileHash: `${apostilleHashPrefix}${Verifier.Hash}`,
          result: 'Document apostille!',
          hash: ''
        });
        // this.showResult(this.auditResults);
        // this.isProcessing = true;
        return;

      }
    },
      error => {
        this.sharedService.showError('Error', '¡unexpected error!');
        console.error(error);
      }
    )
  }

  checkApostilleName() {
    // Build an array out of the filename
    const nameArray = this.nameFile.match(/\S+\s*/g);
    console.log('nameArray:', nameArray)
    if (nameArray[nameArray.length - 6] === undefined || nameArray[nameArray.length - 5].replace(/^\s+|\s+$/, '') !== 'TX') return false;
    const mark = nameArray[nameArray.length - 6].replace(/^\s+|\s+$/, '');

    console.log('mark:', mark)
    if (mark === "--Apostille" || mark === "--ApostilleSigned") return true;
    return false;
  };


  verify(data, infTrans): boolean {

    if (Verifier.isPublicApostille(infTrans.message.payload.replace(/['"]+/g, ''))) {
      return Verifier.verifyPublicApostille(data, infTrans.message.payload.replace(/['"]+/g, ''))
    }
    if (Verifier.isPrivateApostille(infTrans.message.payload.replace(/['"]+/g, ''))) {
      return Verifier.verifyPrivateApostille(infTrans.signer, data, infTrans.message.payload.replace(/['"]+/g, ''))

    }
  }
  // showResult(result) {
  // }
  createResultObject(initialFileName, apostilleSigner, checksum, dataHash, isPrivate, apostilleTxHash) {
    return {
      filename: initialFileName,
      owner: apostilleSigner,
      fileHash: checksum + dataHash,
      result: '',
      hash: apostilleTxHash,
      private: isPrivate
    }
  }

}
