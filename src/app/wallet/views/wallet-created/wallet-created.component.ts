import { Component, OnInit } from '@angular/core';
import { SimpleWallet } from 'tsjs-xpx-chain-sdk';
import { Router } from '@angular/router';
import { WalletService, AccountsInterface } from '../../services/wallet.service';
import { ProximaxProvider } from '../../../shared/services/proximax.provider';
import { AppConfig } from '../../../config/app.config';
import { SharedService } from '../../../shared/services/shared.service';

@Component({
  selector: 'app-wallet-created',
  templateUrl: './wallet-created.component.html',
  styleUrls: ['./wallet-created.component.css']
})
export class WalletCreatedComponent implements OnInit {

  address = '';
  description = 'Warning! Before proceeding, make sure store your private key in a safe place. Access to your digital assets cannot be recovered without it.';
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
    this.walletData = this.walletService.accountWalletCreated;
    if (this.walletData !== null) {
      this.subtitle = this.walletData.data.name;
      this.address = this.walletData.wallet.address.pretty();
      this.privateKey = this.proximaxProvider.decryptPrivateKey(
        this.walletData.data.algo, this.walletData.dataAccount.encrypted, this.walletData.dataAccount.iv
      ).toUpperCase();
      this.publicKey = this.proximaxProvider.getPublicAccountFromPrivateKey(this.privateKey, this.walletData.data.network).publicKey;
      this.walletData = null;
      this.walletService.accountWalletCreated = null;
    }else {
      this.router.navigate([`/${AppConfig.routes.home}`]);
    }
  }

  ngOnDestroy(): void {
    this.walletData = null;
    this.walletService.accountWalletCreated = null;
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
   */
  goToRoute() {
    // [routerLink]="[routes.backToService]"
    const nis1Info = this.walletService.getAccountInfoNis1();
    console.log('this a nis1 Info ------>', nis1Info);
    if (nis1Info.nis1Account && nis1Info.nis1Account !== null) {
      this.router.navigate([`/${AppConfig.routes.walletNis1Found}`]);
    } else {
      this.router.navigate([this.routeAuth]);
    }
  }
}
