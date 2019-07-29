import { Component, OnInit } from '@angular/core';
import { SimpleWallet } from 'tsjs-xpx-chain-sdk';
import { WalletService, AccountsInterface } from '../../services/wallet.service';
import { ProximaxProvider } from '../../../shared/services/proximax.provider';
import { Router } from '@angular/router';
import { AppConfig } from 'src/app/config/app.config';

@Component({
  selector: 'app-wallet-created',
  templateUrl: './wallet-created.component.html',
  styleUrls: ['./wallet-created.component.css']
})
export class WalletCreatedComponent implements OnInit {


  address = '';
  algo: {
    data: any,
    dataAccount: AccountsInterface;
    wallet: SimpleWallet
  } = null;
  description = 'Warning! before proceeding, make sure store your private key in a safe place. Access to your digital assets cannot be recovered without it.';
  publicKey = '';
  privateKey = '';
  title = 'Congratulations!';
  titleDescription = 'Your wallet has been created successfully';
  subtitle = '';

  constructor(
    private walletService: WalletService,
    private proximaxProvider: ProximaxProvider,
    private router: Router
  ) { }

  ngOnInit() {
    this.algo = this.walletService.algo;
    if (this.algo !== null) {
      this.subtitle = this.algo.data.name;
      this.address = this.algo.wallet.address.pretty();
      this.privateKey = this.proximaxProvider.decryptPrivateKey(this.algo.data.algo, this.algo.dataAccount.encrypted, this.algo.dataAccount.iv).toUpperCase();
      this.publicKey = this.proximaxProvider.getPublicAccountFromPrivateKey(this.privateKey, this.algo.data.network).publicKey;
      this.algo = null;
      this.walletService.algo = null;
    }else {
      this.router.navigate([`/${AppConfig.routes.home}`]);
    }
  }

  ngOnDestroy(): void {
    this.algo = null;
    this.walletService.algo = null;
  }
}
