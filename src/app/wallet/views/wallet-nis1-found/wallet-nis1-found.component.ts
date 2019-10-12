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
    if (this.walletService.getNis1AccounsWallet() === null || this.walletService.getNis1AccounsWallet() === undefined || this.walletService.getNis1AccounsWallet().length === 0 ) {
      this.router.navigate([`/${AppConfig.routes.home}`]);
    }
  }

  goToRoute() {
    const nis1Info = this.walletService.getNis1AccounsWallet();
    if (nis1Info[0].consignerOf) {
      this.walletService.setAccountInfoNis1(nis1Info[0]);
      this.router.navigate([`/${AppConfig.routes.walletNis1AccountConsigner}`]);
    } else {
      this.walletService.setNis1AccountSelected(nis1Info[0]);
      this.router.navigate([`/${AppConfig.routes.transferXpx}`]);
    }
  }

  goToBack() {
    this.walletService.setAccountInfoNis1(null);
    this.walletService.setAccountSelectedWalletNis1(null);
    // this.walletService.setAccountMosaicsNis1(null);
    this.walletService.setNis1AccountSelected(null);
    this.router.navigate([this.goSignIn]);
  }

}
