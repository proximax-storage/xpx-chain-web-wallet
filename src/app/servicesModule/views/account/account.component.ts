import { Component, OnInit } from '@angular/core';
import { NemProvider } from "../../../shared/services/nem.provider";
import { WalletService } from "../../../shared";

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {


  mosaic = 'XPX';
  titleAccountInformation = 'Account information';
  titlePrivateKey = 'Private key';
  descriptionPrivateKey = `Your private key holds all the power of your account.
  It is a priority to make sure it is stored safely somewhere offline: password encrypted into a .wlt file,
  written on a piece of paper, and on a picture or download the export wallet QR`;
  descriptionBackupWallet = `It is very important that you have backups of your wallets to log in with or your ${this.mosaic} will be lost.`;
  address = this.walletService.address.address;
  publicKey = '';
  importanceScore = '';
  vestedBalance = '';

  constructor(
    private nemProvider: NemProvider,
    private walletService: WalletService
  ) {
    console.log(this.address);
  }

  ngOnInit() {
    console.log(this.walletService.publicAccount);
    console.log(this.walletService.currentAccount);
    this.nemProvider.getAccountInfo(this.walletService.address).subscribe(
      next => {
        if (next['codde'] === 'ResourceNotFound') {
          console.log(next);
        }
        console.log(next);
      }, error => {
        console.log('error', error);
      }
    );
  }

}
