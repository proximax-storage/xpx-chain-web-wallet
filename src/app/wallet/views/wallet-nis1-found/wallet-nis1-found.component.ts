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

  privateKey: string;
  goSignIn: string = `/${AppConfig.routes.auth}`;
  constructor(
    private router: Router,
    private walletService: WalletService
  ) {
  }

  ngOnInit() {
  }

  goToRoute() {
    this.router.navigate([`/${AppConfig.routes.transferXpx}`]);
  }

  goToBack() {
    this.walletService.setAccountInfoNis1(null);
    this.walletService.setAccountMosaicsNis1(null);
    this.router.navigate([this.goSignIn]);
  }

}
