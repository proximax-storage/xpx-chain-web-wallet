import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import * as qrcode from 'qrcode-generator';
import * as jsPDF from 'jspdf';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { SharedService } from '../../../shared/services/shared.service';
import { TransactionsNis1Interface } from '../../services/nem-provider.service';
import { AppConfig } from '../../../config/app.config';

@Component({
  selector: 'app-swap-certified',
  templateUrl: './swap-certified.component.html',
  styleUrls: ['./swap-certified.component.css']
})
export class SwapCertifiedComponent implements OnInit {

  @Input() transactionNis1: TransactionsNis1Interface;
  @Input() routeContinue: string;

  checked: boolean = false;
  explorerUrl: string;
  img: string;
  qrSrc: string;

  constructor(
    private router: Router,
    private sharedService: SharedService
  ) { }

  ngOnInit() {
    if (this.transactionNis1) {
      this.explorerUrl = `${environment.nis1.urlExplorer}${this.transactionNis1.nis1TransactionHash}`;
      this.qrSrc = this.qrCreate();
      this.img = this.sharedService.walletCertifiedSwap();
    } else {
      this.router.navigate([`/${AppConfig.routes.home}`]);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // console.log(this.transactionNis1);
  }


  /**
   *
   *
   * @memberof SwapCertifiedComponent
   */
  goToNemExplorer() {
    window.open(this.explorerUrl);
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
    doc.text(this.transactionNis1.siriusAddres, 30, 105);

    doc.setFontSize(14);
    doc.setFontType('bold');
    doc.text('NIS1 Timestamp:', 30, 130);
    doc.setFontType('normal');
    doc.text(this.transactionNis1.nis1Timestamp, 130, 131);

    doc.setFontSize(14);
    doc.setFontType('bold');
    doc.text('NIS1 Public Key:', 30, 155);
    doc.setFontType('normal');
    doc.text(this.transactionNis1.nis1PublicKey, 30, 170, { maxWidth: 370 });

    doc.addImage(this.qrCreate(), 'jpg', 30, 210, 100, 100);

    doc.setFontType('bold');
    doc.text('NIS1 Transaction Hash:', 140, 230);
    doc.setFontType('normal');
    doc.text(this.transactionNis1.nis1TransactionHash, 140, 245, { maxWidth: 280 });

    doc.text('Note: Swap process may take several hours to complete.', 30, 330);

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
