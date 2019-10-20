import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppConfig } from '../../../config/app.config';
import { WalletService } from '../../services/wallet.service';

@Component({
  selector: 'app-wallet-nis1-found',
  templateUrl: './wallet-nis1-found.component.html',
  styleUrls: ['./wallet-nis1-found.component.css']
})
export class WalletNis1FoundComponent implements OnInit {

  goSignIn: string = `/${AppConfig.routes.home}`;
  privateKey: string;

  constructor(
    private router: Router,
    private walletService: WalletService
  ) {
  }

  ngOnInit() {
    if (
      this.walletService.getNis1AccountsWallet() === null ||
      this.walletService.getNis1AccountsWallet() === undefined ||
      this.walletService.getNis1AccountsWallet().length === 0
    ) {
      this.router.navigate([`/${AppConfig.routes.home}`]);
    }
  }

  /**
   *
   *
   * @memberof WalletNis1FoundComponent
   */
  goToRoute() {
    const nis1Info = this.walletService.getNis1AccountsWallet();
    console.log('-----nis1Info----', nis1Info);
    if (nis1Info[0].consignerOf) {
      this.walletService.setAccountInfoNis1(nis1Info[0]);
      this.router.navigate([`/${AppConfig.routes.walletNis1AccountConsigner}`]);
    } else {
      this.walletService.setNis1AccountSelected(nis1Info[0]);
      this.router.navigate([`/${AppConfig.routes.transferXpx}`]);
    }
  }

  /**
   *
   *
   * @memberof WalletNis1FoundComponent
   */
  goToBack() {
    this.walletService.setAccountInfoNis1(null);
    this.walletService.setAccountSelectedWalletNis1(null);
    // this.walletService.setAccountMosaicsNis1(null);
    this.walletService.setNis1AccountSelected(null);
    this.router.navigate([this.goSignIn]);
  }

}
