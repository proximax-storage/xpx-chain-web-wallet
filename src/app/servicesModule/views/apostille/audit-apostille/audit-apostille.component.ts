import { Component, OnInit } from '@angular/core';
import { TransferTransaction } from 'tsjs-xpx-chain-sdk';
import { ProximaxProvider } from '../../../../shared/services/proximax.provider';
import { NodeService } from '../../../services/node.service';
import { Verifier } from './audit-apistille-verifier';
import { ResultAuditInterface, HeaderServicesInterface } from '../../../services/services-module.service';
import { AppConfig } from '../../../../config/app.config';
import { TransactionsService } from 'src/app/transactions/services/transactions.service';

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
  currentView: boolean = false;

  /******************************************* */
  testJAM = [
    {
      fileHash: "fe4e545903273aa70b7352093148f537fe537a6eb65a6507f03fde3fe92e415daf073515f9",
      filename: "repuestos mitsubish",
      hash: "B3BFF21E01F8459FDB5C5F1886B628F3F0DA0AAAE06BD517D6A8B749A1F82648",
      owner: "VDJLEN-BVNSVE-YZATHG-GY47KM-OVIQJH-EMM5JT-XJ56",
      result: "Document apostille",
      date: new Date().toLocaleString()
    },
    {
      fileHash: "fe4e545903273aa70b7352093148f537fe537a6eb65a6507f03fde3fe92e415daf073515f9",
      filename: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Omnis molestiae obcaecati ratione nesciunt recusandae neque, adipisci, iste cumque dolores dolor nam officiis. Quia, expedita eum deserunt exercitationem necessitatibus similique laboriosam!",
      hash: "B3BFF21E01F8459FDB5C5F1886B628F3F0DA0AAAE06BD517D6A8B749A1F82648",
      owner: "VDJLEN-BVNSVE-YZATHG-GY47KM-OVIQJH-EMM5JT-XJ56",
      result: "Document apostille",
      date: new Date().toLocaleString()
    },
    {
      fileHash: "fe4e545903273aa70b7352093148f537fe537a6eb65a6507f03fde3fe92e415daf073515f9",
      filename: "repuestos mitsubish",
      hash: "B3BFF21E01F8459FDB5C5F1886B628F3F0DA0AAAE06BD517D6A8B749A1F82648",
      owner: "VDJLEN-BVNSVE-YZATHG-GY47KM-OVIQJH-EMM5JT-XJ56",
      result: "Document apostille",
      date: new Date().toLocaleString()
    },
    {
      fileHash: "fe4e545903273aa70b7352093148f537fe537a6eb65a6507f03fde3fe92e415daf073515f9",
      filename: "repuestos mitsubish",
      hash: "B3BFF21E01F8459FDB5C5F1886B628F3F0DA0AAAE06BD517D6A8B749A1F82648",
      owner: "VDJLEN-BVNSVE-YZATHG-GY47KM-OVIQJH-EMM5JT-XJ56",
      result: "Document apostille",
      date: new Date().toLocaleString()
    },
    {
      fileHash: "fe4e545903273aa70b7352093148f537fe537a6eb65a6507f03fde3fe92e415daf073515f9",
      filename: "repuestos mitsubish",
      hash: "B3BFF21E01F8459FDB5C5F1886B628F3F0DA0AAAE06BD517D6A8B749A1F82648",
      owner: "VDJLEN-BVNSVE-YZATHG-GY47KM-OVIQJH-EMM5JT-XJ56",
      result: "Document apostille",
      date: new Date().toLocaleString()
    }
  ];
  /******************************************* */

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
      // this.verifyFiles();
    }
  }


  /**
   * Method to files verify
   */
  verifyFiles() {
    this.currentView = !this.currentView
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
        this.verifyHast(element);
      });
    }
  }

  verifyHast(transactions: TransferTransaction[]) {
    this.transactionsSearch.forEach(element => {
      const arrayName = element.name.split(' --Apostille TX ');
      const arrayHash = arrayName[1].split(' --Date ');
      const findHash = transactions.find(el => arrayHash[0].toUpperCase() === el.transactionInfo.hash);

      if (findHash !== undefined) {
        const myReader: FileReader = new FileReader();
        myReader.onloadend = (e) => {

          if (this.verify(myReader.result, findHash)) {
            let arrayExtention = arrayName[1].split('.');
            let originalName = '';

            if (arrayExtention.length > 1) {
              originalName = `${arrayName[0]}.${arrayExtention[arrayExtention.length - 1]}`;
            } else {
              originalName = arrayName[0];
            }
            this.addAuditResult({
              filename: originalName,
              owner: this.proximaxProvider.createFromRawAddress(findHash.recipient['address']).pretty(),
              fileHash: findHash.message.payload.split('"').join(''),
              result: 'Document apostille',
              hash: findHash.transactionInfo.hash,
              private: false,
              fee: this.transactionService.amountFormatterSimple(findHash.maxFee.compact()),
              height: findHash.transactionInfo.height.compact(),
              type: findHash.type,
              signer: findHash.signer,
              recipient: this.proximaxProvider.createFromRawAddress(findHash.recipient['address']),
              signature: findHash.signature,
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
    console.log('\n\n\n\nValue of this.auditResults', this.auditResults, '\n\n\n\nEnd value\n\n');
  }

  verify(data, infTrans): boolean {
    if (Verifier.isPublicApostille(infTrans.message.payload.replace(/['"]+/g, ''))) {
      return Verifier.verifyPublicApostille(data, infTrans.message.payload.replace(/['"]+/g, ''))
    }
    if (Verifier.isPrivateApostille(infTrans.message.payload.replace(/['"]+/g, ''))) {
      return Verifier.verifyPrivateApostille(infTrans.signer, data, infTrans.message.payload.replace(/['"]+/g, ''))
    }
  }

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

  // removeItem(index: number) {
  //   console.log('\n\n\n\nValue of index', index, '\n\n\n\nEnd value\n\n');
  //   console.log('\n\n\n\nValue of index', this.ourFile, '\n\n\n\nEnd value\n\n');
  //   this.ourFile.filter((value, i) => i !== index);
  //   this.ourFile.splice(index, 1);
  // }


  //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

  // /**
  //  *
  //  */
  // verifyFile(dataFile, nameFile) {
  //   this.isProcessing = true;
  //   // Remove the meta part of $fileContent string (data:application/octet-stream;base64)
  //   // let cleanedDataContent = this.file.split(/,(.+)?/)[1];
  //   // Base 64 to word array
  //   // let parsedData = crypto.enc.Base64.parse(cleanedDataContent);
  //   // if (!this.checkApostilleName(nameFile)) {
  //   //   this.addAuditResult({
  //   //     filename: nameFile,
  //   //     owner: '',
  //   //     fileHash: '',
  //   //     result: 'This file is not in apostille format',
  //   //     hash: ''
  //   //   });
  //   //   // this.showResult(this.auditResults);
  //   //   this.isProcessing = false;
  //   //   return;
  //   // }
  //   // Build an array out of the filename
  //   const nameArray = nameFile.match(/\S+\s*/g);
  //   // Recomposing the initial filename before apostille
  //   const initialNameArray = nameArray.splice(0, nameArray.length - 7);
  //   let initialFileName = "";

  //   for (let h = 0; h < initialNameArray.length; h++) {
  //     initialFileName += initialNameArray[h];
  //   }
  //   // Initial filename
  //   initialFileName = initialFileName.replace(/^\s+|\s+$/, '') + "." + nameFile.split('.').pop();
  //   // Hash of the apostille transaction
  //   const apostilleTxHash = nameArray[nameArray.length - 4].replace(/^\s+|\s+$/, '');
  //   this.proximaxProvider.getTransactions(apostilleTxHash).subscribe(
  //     async (infTrans: TransferTransaction) => {
  //       this.isProcessing = false;
  //       const data = dataFile;
  //       // console.log('\n\n\n\nValue of information transaction', infTrans, '\n\n\n\nEnd value\n\n');

  //       if (await !this.verify(data, infTrans)) {
  //         this.addAuditResult({
  //           filename: nameFile,
  //           owner: '',
  //           fileHash: '',
  //           result: 'Document not apostilled',
  //           hash: ''
  //         });
  //         // this.showResult(this.auditResults);
  //         // this.isProcessing = false;
  //         return;
  //       } else {
  //         let arrayName = nameFile.split(' --Apostille ');
  //         let arrayextention = nameFile.split('.');
  //         let originalName = '';

  //         if (arrayextention.length > 1) {
  //           originalName = `${arrayName[0]}.${arrayextention[arrayextention.length - 1]}`;
  //         } else {
  //           originalName = arrayName[0];
  //         }

  //         this.addAuditResult({
  //           filename: originalName,
  //           owner: this.proximaxProvider.createFromRawAddress(infTrans.recipient['address']).pretty(),
  //           fileHash: infTrans.message.payload.split('"').join(''),
  //           result: 'Document apostille',
  //           hash: ''
  //         });
  //         return;
  //       }
  //     },
  //     error => {
  //       this.addAuditResult({
  //         filename: nameFile,
  //         owner: '',
  //         fileHash: '',
  //         result: 'Document not apostilled',
  //         hash: ''
  //       });
  //       this.isProcessing = false;
  //       // this.sharedService.showError('', 'Apostille not found');
  //     }
  //   )
  // }



  // checkApostilleName(nameFile) {
  //   // Build an array out of the filename
  //   const nameArray = nameFile.match(/\S+\s*/g);
  //   // console.log('nameArray:', nameArray)
  //   if (nameArray[nameArray.length - 6] === undefined || nameArray[nameArray.length - 5].replace(/^\s+|\s+$/, '') !== 'TX') return false;
  //   const mark = nameArray[nameArray.length - 6].replace(/^\s+|\s+$/, '');

  //   // console.log('mark:', mark)
  //   if (mark === "--Apostille" || mark === "--ApostilleSigned") return true;
  //   return false;
  // };


  // verify(data, infTrans): boolean {
  //   if (Verifier.isPublicApostille(infTrans.message.payload.replace(/['"]+/g, ''))) {
  //     return Verifier.verifyPublicApostille(data, infTrans.message.payload.replace(/['"]+/g, ''))
  //   }
  //   if (Verifier.isPrivateApostille(infTrans.message.payload.replace(/['"]+/g, ''))) {
  //     return Verifier.verifyPrivateApostille(infTrans.signer, data, infTrans.message.payload.replace(/['"]+/g, ''))
  //   }
  // }
  // showResult(result) {
  // }
  // createResultObject(initialFileName, apostilleSigner, checksum, dataHash, isPrivate, apostilleTxHash) {
  //   return {
  //     filename: initialFileName,
  //     owner: apostilleSigner,
  //     fileHash: checksum + dataHash,
  //     result: '',
  //     hash: apostilleTxHash,
  //     private: isPrivate
  //   }
  // }

}
