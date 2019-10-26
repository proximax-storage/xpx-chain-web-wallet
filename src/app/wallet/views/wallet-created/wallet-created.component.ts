import { Component, OnInit } from '@angular/core';
import { SimpleWallet } from 'tsjs-xpx-chain-sdk';
import { Router } from '@angular/router';
import * as qrcode from 'qrcode-generator';
import * as jsPDF from 'jspdf';
import { Subscription } from 'rxjs';
import { WalletService, AccountsInterface } from '../../services/wallet.service';
import { ProximaxProvider } from '../../../shared/services/proximax.provider';
import { AppConfig } from '../../../config/app.config';
import { SharedService } from '../../../shared/services/shared.service';
import { NemProviderService } from '../../../swap/services/nem-provider.service';

@Component({
  selector: 'app-wallet-created',
  templateUrl: './wallet-created.component.html',
  styleUrls: ['./wallet-created.component.css']
})
export class WalletCreatedComponent implements OnInit {

  address = '';
  description = 'Warning! Before proceeding, make sure store your private key in a safe place. Access to your digital assets cannot be recovered without it.';
  disabledContinue: boolean = true;
  imgBackground = '';
  publicKey = '';
  privateKey = '';
  routeAuth = `/${AppConfig.routes.home}`;
  routeContinue = `/${AppConfig.routes.home}`;
  subTitle = '';
  subscription: Subscription[] = [];
  title = 'Congratulations!';
  titleDescription = 'Your wallet has been successfully created.';
  viewPrivateKey = false;
  walletData: {
    data: any,
    dataAccount: AccountsInterface;
    wallet: SimpleWallet
  } = null;


  constructor(
    private nemProvider: NemProviderService,
    private proximaxProvider: ProximaxProvider,
    private router: Router,
    private sharedService: SharedService,
    private walletService: WalletService
  ) { }


  ngOnInit() {
    this.getImageBackground();
    this.walletData = this.walletService.accountWalletCreated;
    // this.walletService.accountWalletCreated = null;
    this.checkDataWallet();
  }


  ngOnDestroy(): void {
    this.walletData = null;
    this.subscription.forEach(subscription => {
      subscription.unsubscribe();
    });
  }


  /**
   *
   *
   * @memberof WalletCreatedComponent
   */
  checkDataWallet() {
    if (this.walletData !== null) {
      this.subTitle = this.walletData.data.name;
      this.address = this.walletData.wallet.address.pretty();
      this.privateKey = this.proximaxProvider.decryptPrivateKey(this.walletData.data.algo, this.walletData.dataAccount.encrypted, this.walletData.dataAccount.iv).toUpperCase();
      this.publicKey = this.proximaxProvider.getPublicAccountFromPrivateKey(this.privateKey, this.walletData.data.network).publicKey;
      if (this.walletData.dataAccount.nis1Account !== null) {
        this.subscription.push(this.nemProvider.getNis1AccountsFound$().subscribe(next => {
          if (next) {
            this.nemProvider.setSelectedNis1Account(next);
            this.routeContinue = `/${AppConfig.routes.swapAccountNis1Found}`;
          } else {
            this.routeContinue = `/${AppConfig.routes.home}`;
          }
          this.disabledContinue = false;
        }, error => {
          this.disabledContinue = false
          this.routeContinue = `/${AppConfig.routes.home}`;
        }));
      } else {
        this.disabledContinue = false;
        this.routeContinue = `/${AppConfig.routes.home}`;
      }
    } else {
      this.router.navigate([`/${AppConfig.routes.home}`]);
    }
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
   *
   * @memberof WalletCreatedComponent
   */
  printAccountInfo() {
    let doc = new jsPDF({ unit: 'px' });
    doc.addImage(this.imgBackground, 'JPEG', 120, 60, 205, 132);
    // QR Code Address
    doc.addImage(this.qrConstruntion(this.privateKey, 1, 0), 151.5, 105);
    // Addres number
    doc.setFontSize(8);
    doc.setTextColor('#000000');
    doc.text(this.address, 146, 164, { maxWidth: 132 });
    doc.save('Your_Paper_Wallet');
  }

  /**
   *
   *
   * @param {*} url
   * @param {number} [size=2]
   * @param {number} [margin=0]
   * @returns
   * @memberof WalletCreatedComponent
   */
  qrConstruntion(url, size = 2, margin = 0) {
    let qr = qrcode(10, 'H');
    qr.addData(url);
    qr.make();
    return qr.createDataURL(size, margin);
  }
}
