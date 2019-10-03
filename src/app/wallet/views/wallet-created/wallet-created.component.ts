import { Component, OnInit } from '@angular/core';
import { SimpleWallet } from 'tsjs-xpx-chain-sdk';
import { Router } from '@angular/router';
import { WalletService, AccountsInterface } from '../../services/wallet.service';
import { ProximaxProvider } from '../../../shared/services/proximax.provider';
import { AppConfig } from '../../../config/app.config';
import { SharedService } from '../../../shared/services/shared.service';
import * as qrcode from 'qrcode-generator';
import * as jsPDF from 'jspdf';

@Component({
  selector: 'app-wallet-created',
  templateUrl: './wallet-created.component.html',
  styleUrls: ['./wallet-created.component.css']
})
export class WalletCreatedComponent implements OnInit {

  address = '';
  description = 'Warning! Before proceeding, make sure store your private key in a safe place. Access to your digital assets cannot be recovered without it.';
  imgBackground = '';
  publicKey = '';
  privateKey = '';
  title = 'Congratulations';
  titleDescription = 'Your wallet has been successfully created';
  subtitle = '';
  viewPrivateKey = false;
  routeAuth = `/${AppConfig.routes.auth}`;
  walletData: {
    data: any,
    dataAccount: AccountsInterface;
    wallet: SimpleWallet
  } = null;


  constructor(
    private walletService: WalletService,
    private proximaxProvider: ProximaxProvider,
    private sharedService: SharedService,
    private router: Router
  ) { }

  ngOnInit() {
    this.getImageBackground();
    this.walletData = this.walletService.accountWalletCreated;
    if (this.walletData !== null) {
      this.subtitle = this.walletData.data.name;
      this.address = this.walletData.wallet.address.pretty();
      this.privateKey = this.proximaxProvider.decryptPrivateKey(
        this.walletData.data.algo, this.walletData.dataAccount.encrypted, this.walletData.dataAccount.iv
      ).toUpperCase();
      this.publicKey = this.proximaxProvider.getPublicAccountFromPrivateKey(this.privateKey, this.walletData.data.network).publicKey;
      this.walletData = null;
    } else {
      this.router.navigate([`/${AppConfig.routes.home}`]);
    }
  }

  ngOnDestroy(): void {
    this.walletData = null;
  }

  /**
   *
   *
   * @param {string} message
   * @memberof WalletCreatedComponent
   */
  copyMessage(message: string) {
    this.sharedService.showSuccess('', `${message} copied`);
  }

  /**
   *
   *
   * @memberof WalletCreatedComponent
   */
  getImageBackground() {
    this.imgBackground = this.sharedService.walletCreatedCertified();
  }

  /**
   *
   */
  goToRoute() {
    // [routerLink]="[routes.backToService]"
    const nis1Info = this.walletService.getNis1AccounsWallet();
    // console.log('nnis1Info ------>', nis1Info);
    try {
      if (nis1Info.length > 0) {
        // console.log('nis1Info.lengh ------>', nis1Info.length);
        if (nis1Info[0].mosaic && Object.keys(nis1Info[0].mosaic).length > 0) {
          // console.log('REDIRECCIONAME A ACCOUNT NIS1 FOUND');
          this.router.navigate([`/${AppConfig.routes.walletNis1Found}`]);
        } else {
          this.walletService.accountWalletCreated = null;
          this.router.navigate([this.routeAuth]);
        }
      } else {
        this.walletService.accountWalletCreated = null;
        this.router.navigate([this.routeAuth]);
      }
    } catch (error) {
      this.walletService.accountWalletCreated = null;
      this.router.navigate([this.routeAuth]);
    }
  }

  qrConstruntion(url, size = 2, margin = 0) {
    let qr = qrcode(10, 'H');
    qr.addData(url);
    qr.make();
    return qr.createDataURL(size, margin);
  }

  printAccountInfo() {
    // console.log(this.privateKey);
    // console.log(this.address);

    let doc = new jsPDF({
      unit: 'px'
    });
    doc.addImage(this.imgBackground, 'JPEG', 120, 60, 205, 132);

    // QR Code Address
    doc.addImage(this.qrConstruntion(this.privateKey, 1, 0), 151.5, 105);

    // Addres number
    doc.setFontSize(8);
    doc.setTextColor('#000000');
    doc.text(this.address, 146, 164, { maxWidth: 132 });

    doc.save('Your_Paper_Wallet');
  }
}
