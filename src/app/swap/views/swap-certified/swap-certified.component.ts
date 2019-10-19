import { Component, OnInit, Input } from '@angular/core';
import * as qrcode from 'qrcode-generator';
import * as jsPDF from 'jspdf';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-swap-certified',
  templateUrl: './swap-certified.component.html',
  styleUrls: ['./swap-certified.component.css']
})
export class SwapCertifiedComponent implements OnInit {

  @Input() params: any;
  checked: boolean = false;
  explorerUrl = `${environment.nis1.urlExplorer}`;



  img: any;
  address: any;
  timestamp: any;
  publicKey: any;
  transactionHash: any;
  qrSrc: string;

  constructor() { }

  ngOnInit() {
    this.qrSrc = this.qrCreate();
  }


  /**
   *
   *
   * @memberof SwapCertifiedComponent
   */
  goToNemExplorer() {
    window.open(this.explorerUrl);
  }

  goToRoute() {

  }

  /**
   *
   *
   * @memberof SwapCertifiedComponent
   */
  printCertificate() {
    let doc = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [800, 475]
    });

    doc.addImage(this.img, 'JPEG', 0, 0, 600, 360);
    doc.setFontSize(24);
    doc.setTextColor('#000000');
    doc.text('Swap Certificate', 30, 50);
    doc.line(30, 60, 300, 60, 'S');

    doc.setFontSize(14);
    doc.setFontType('bold');
    doc.text('Sirius Account:', 30, 90);
    doc.setFontType('normal');
    doc.text(this.address, 30, 105);

    doc.setFontSize(14);
    doc.setFontType('bold');
    doc.text('NIS1 Timestamp:', 30, 130);
    doc.setFontType('normal');
    doc.text(this.timestamp, 130, 131);

    doc.setFontSize(14);
    doc.setFontType('bold');
    doc.text('NIS1 Public Key:', 30, 155);
    doc.setFontType('normal');
    doc.text(this.publicKey, 30, 170, { maxWidth: 370 });

    doc.addImage(this.qrCreate(), 'jpg', 30, 210, 100, 100);

    doc.setFontType('bold');
    doc.text('NIS1 Transaction Hash:', 140, 230);
    doc.setFontType('normal');
    doc.text(this.transactionHash, 140, 245, { maxWidth: 280 });

    doc.text('Note: the swap process may take a several hours to complete.', 30, 330);

    doc.save('Swap_Certificate.pdf');
  }

  /**
   *
   *
   * @returns
   * @memberof SwapCertifiedComponent
   */
  qrCreate() {
    let qr = qrcode(10, 'H')
    let url = this.explorerUrl;
    qr.addData(url);
    qr.make();

    return qr.createDataURL();
  }

}
