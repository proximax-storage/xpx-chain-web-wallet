import { Component, OnInit } from '@angular/core';
import { mergeMap } from "rxjs/operators";
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { NemProvider } from "../../../shared/services/nem.provider";
import { WalletService, SharedService } from "../../../shared";
import { LoginService } from "../../../login/services/login.service";

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {

  @BlockUI() blockUI: NgBlockUI;
  showPanelPrivateKey = false;
  mosaic = 'XPX';
  titleAccountInformation = 'Account information';
  titlePrivateKey = 'Private key';
  descriptionPrivateKey = `Your private key holds all the power of your account.
  It is a priority to make sure it is stored safely somewhere offline.`;
  descriptionBackupWallet = `It is very important that you have backups of your wallets to log in with or your ${this.mosaic} will be lost.`;
  address = this.walletService.address.pretty();
  privateKey = '';
  publicKey = '';
  importanceScore = '';
  vestedBalance = null;
  password = '';

  constructor(
    private nemProvider: NemProvider,
    private walletService: WalletService,
    private sharedService: SharedService,
    private loginService: LoginService
  ) {
  }

  ngOnInit() {
    //this.getBalance();
    this.blockUI.start('Loading...'); // Start blocking
    this.nemProvider.getAccountInfo(this.walletService.address).subscribe(
      next => {
        console.log(next);
        //this.vestedBalance = next['mosaics'][0].amount.compact();
        //this.publicKey = next.publicKey;
        this.publicKey = this.walletService.publicAccount.publicKey;
        this.blockUI.stop();
      }, error => {
        //this.vestedBalance = '0';
        //this.publicKey = 'You need to make a transaction to get a public key';
        this.publicKey = this.walletService.publicAccount.publicKey;
        this.blockUI.stop();
      }
    );
  }

  copyMessage() {
    this.sharedService.showSuccess('', 'Address copied');
  }

  decryptWallet() {
    const currentAccount = this.walletService.currentAccount;
    const common = { password: this.password };
    if (this.walletService.decrypt(common)) {
      this.privateKey = common['privateKey'].toUpperCase();
      this.password = '';
      return;
    }
    this.password = '';
    this.privateKey = '';
    return;
  }

  getBalance() {
    this.nemProvider.getBalance(this.walletService.address).pipe(
      mergeMap((_) => _)
    ).subscribe(
      next => {
        console.log('You have', next, next.fullName());
      },
      err => {
        this.vestedBalance = '0';
        console.error(err);
      }
    );
  }
}
