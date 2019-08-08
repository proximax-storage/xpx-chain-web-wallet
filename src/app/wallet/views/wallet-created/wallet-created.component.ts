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
  algo: {
    data: any,
    dataAccount: AccountsInterface;
    wallet: SimpleWallet
  } = null;
  description = 'Warning! before proceeding, make sure store your private key in a safe place. Access to your digital assets cannot be recovered without it.';
  publicKey = '';
  privateKey = '';
  title = 'Congratulations';
  titleDescription = 'Your wallet has been created successfully';
  subtitle = '';
  viewPrivateKey = false;
  routeAuth = AppConfig.routes.auth;

  constructor(
    private walletService: WalletService,
    private proximaxProvider: ProximaxProvider,
    private sharedService: SharedService,
    private router: Router
  ) { }

  ngOnInit() {
    this.algo = this.walletService.algoData;
    if (this.algo !== null) {
      this.subtitle = this.algo.data.name;
      this.address = this.algo.wallet.address.pretty();
      this.privateKey = this.proximaxProvider.decryptPrivateKey(this.algo.data.algo, this.algo.dataAccount.encrypted, this.algo.dataAccount.iv).toUpperCase();
      this.publicKey = this.proximaxProvider.getPublicAccountFromPrivateKey(this.privateKey, this.algo.data.network).publicKey;
      this.algo = null;
      this.walletService.algoData = null;
    }else {
      this.router.navigate([`/${AppConfig.routes.home}`]);
    }
  }

  ngOnDestroy(): void {
    this.algo = null;
    this.walletService.algoData = null;
  }

  copyMessage(message: string) {
    this.sharedService.showSuccess('', `${message} copied`);
  }
}
