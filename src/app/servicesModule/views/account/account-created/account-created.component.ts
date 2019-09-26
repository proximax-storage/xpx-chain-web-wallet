import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as qrcode from 'qrcode-generator';
import * as jsPDF from 'jspdf';
import { AppConfig } from '../../../../config/app.config';
import { WalletService } from '../../../../wallet/services/wallet.service';
import { ProximaxProvider } from '../../../../shared/services/proximax.provider';
import { SharedService } from '../../../../shared/services/shared.service';

@Component({
  selector: 'app-account-created',
  templateUrl: './account-created.component.html',
  styleUrls: ['./account-created.component.css']
})
export class AccountCreatedComponent implements OnInit {

  address: any;
  algo: any;
  componentName = 'New Account Created';
  imgBackground = '';
  information = 'Make sure store your private key in a safe place. Access to your digital assets cannot be recovered without it.';
  moduleName = 'Accounts';
  routes = {
    accountNis1Found: `/${AppConfig.routes.accountNis1Found}`,
    backToService: `/${AppConfig.routes.viewAllAccount}`
  };

  name: any;
  privateKey: any;
  publicKey: any;
  viewPrivateKey = false;
  viewPublicKey = false;

  constructor(
    private walletService: WalletService,
    private proximaxProvider: ProximaxProvider,
    private sharedService: SharedService,
    private router: Router
  ) { }

  ngOnInit() {
    this.setImgBackground();
    this.algo = this.walletService.accountWalletCreated;
    if (this.algo !== null) {
      console.log('---------------------------------------account created ----------------------------');

      const accountInfoNis1 = this.walletService.getAccountInfoNis1();
      console.log('This account info nis1 ------->', accountInfoNis1);

      this.name = this.algo.data.name;
      this.address = this.algo.wallet.address.pretty();
      this.privateKey = this.proximaxProvider.decryptPrivateKey(this.algo.data.algo, this.algo.dataAccount.encrypted, this.algo.dataAccount.iv).toUpperCase();
      this.publicKey = this.proximaxProvider.getPublicAccountFromPrivateKey(this.privateKey, this.algo.data.network).publicKey;
      this.viewPublicKey = this.algo.data.fromPrivateKey;
      this.algo = null;
      this.walletService.accountWalletCreated = null;
    } else {
      this.router.navigate([`/${AppConfig.routes.home}`]);
    }
  }



  /**
   *
   *
   * @param {string} message
   * @memberof AccountCreatedComponent
   */
  copyMessage(message: string) {
    this.sharedService.showSuccess('', `${message} copied`);
  }

  /**
   *
   */
  goToRoute() {
    // [routerLink]="[routes.backToService]"
    const nis1Info = this.walletService.getNis1AccounsWallet();
    
    try {
      if (nis1Info.length > 0) {
        if (nis1Info[0].mosaic && Object.keys(nis1Info[0].mosaic).length > 0) {
          this.router.navigate([this.routes.accountNis1Found]);
        } else {
          this.router.navigate([this.routes.backToService]);
        }
      }
    } catch (error) {
      this.router.navigate([this.routes.backToService]);
    }
  }

  /**
   *
   * @param url
   * @param size
   * @param margin
   */
  qrConstruntion(url, size = 2, margin = 0) {
    let qr = qrcode(10, 'H');
    qr.addData(url);
    qr.make();
    return qr.createDataURL(size, margin);
  }

  printAccountInfo() {
    console.log(this.privateKey);
    console.log(this.address);

    let doc = new jsPDF({
      unit: 'px'
    });
    doc.addImage(this.imgBackground, 'JPEG', 120, 60, 210, 125)

    // QR Code Address
    doc.addImage(this.qrConstruntion(this.privateKey, 1, 0), 153, 102)

    // Addres number
    doc.setFontSize(8)
    doc.setTextColor('#000000')
    doc.text(this.address, 147, 159, { maxWidth: 132 })

    doc.save('Your_Paper_Wallet')
  }

  setImgBackground(){
    this.imgBackground = this.sharedService.walletCreatedCertified();
  }
}
