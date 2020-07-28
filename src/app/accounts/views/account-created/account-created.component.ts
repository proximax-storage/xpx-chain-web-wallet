import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as qrcode from 'qrcode-generator';
import * as jsPDF from 'jspdf';
import { Subscription } from 'rxjs';
import { AppConfig } from '../../../config/app.config';
import { WalletService } from '../../../wallet/services/wallet.service';
import { ProximaxProvider } from '../../../shared/services/proximax.provider';
import { SharedService } from '../../../shared/services/shared.service';
import { NemProviderService } from '../../../swap/services/nem-provider.service';

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
  information = 'Make sure you store your private key in a safe place. Access to your digital assets cannot be recovered without it.';
  moduleName = 'Accounts';
  routes = {
    accountNis1Found: `/${AppConfig.routes.swapAccountNis1Found}`,
    backToService: `/${AppConfig.routes.viewAllAccount}`
  };

  name: any;
  privateKey: any;
  publicKey: any;
  routeContinue = `/${AppConfig.routes.viewAllAccount}`;
  viewPrivateKey = false;
  viewPublicKey = true;
  disabledContinue = true;
  subscription: Subscription[] = [];

  constructor(
    private nemProvider: NemProviderService,
    private walletService: WalletService,
    private proximaxProvider: ProximaxProvider,
    private sharedService: SharedService,
    private router: Router
  ) { }

  ngOnInit() {
    this.setImgBackground();
    this.algo = this.walletService.accountWalletCreated;

    if (this.algo !== null) {
      this.name = this.algo.data.name;
      this.address = this.algo.wallet.address.pretty();
      this.privateKey = this.proximaxProvider.decryptPrivateKey(this.algo.data.algo, this.algo.dataAccount.encrypted, this.algo.dataAccount.iv).toUpperCase();
      this.publicKey = this.proximaxProvider.getPublicAccountFromPrivateKey(this.privateKey, this.algo.data.network).publicKey;
      if (this.algo.dataAccount.nis1Account !== null) {
        this.subscription.push(this.nemProvider.getNis1AccountsFound$().subscribe(next => {
          if (next) {
            this.nemProvider.setSelectedNis1Account(next);
            this.routeContinue = `/${AppConfig.routes.swapAccountFound}`;
          } else {
            this.routeContinue = `/${AppConfig.routes.viewAllAccount}`;
          }
          this.disabledContinue = false;
        }, error => {
          this.disabledContinue = false;
          this.routeContinue = `/${AppConfig.routes.viewAllAccount}`;
        }));
      } else {
        this.disabledContinue = false;
        this.routeContinue = `/${AppConfig.routes.viewAllAccount}`;
      }

      // this.viewPublicKey = this.algo.data.fromPrivateKey;
      this.algo = null;
    } else {
      this.router.navigate([`/${AppConfig.routes.home}`]);
    }
  }

  ngOnDestroy(): void {
    this.subscription.forEach(subscription => {
      subscription.unsubscribe();
    });
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
   * @param url
   * @param size
   * @param margin
   */
  qrConstruntion(url, size = 2, margin = 0) {
    const qr = qrcode(10, 'H');
    qr.addData(url);
    qr.make();
    return qr.createDataURL(size, margin);
  }

  /**
   *
   *
   * @memberof AccountCreatedComponent
   */
  printAccountInfo() {
    // console.log(this.privateKey);
    // console.log(this.address);

    const doc = new jsPDF({
      unit: 'px'
    });
    doc.addImage(this.imgBackground, 'JPEG', 120, 60, 210, 125);

    // QR Code Address
    doc.addImage(this.qrConstruntion(this.privateKey, 1, 0), 153, 102);

    // Addres number
    doc.setFontSize(8);
    doc.setTextColor('#000000');
    doc.text(this.address, 147, 159, { maxWidth: 132 });

    doc.save('Your_Paper_Wallet');
  }

  setImgBackground() {
    this.imgBackground = this.sharedService.walletCreatedCertified();
  }
}
