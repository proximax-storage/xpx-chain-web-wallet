import { Component, OnInit } from '@angular/core';
import { AppConfig } from 'src/app/config/app.config';
import { WalletService } from 'src/app/wallet/services/wallet.service';

@Component({
  selector: 'app-account-nis1-transfer-xpx',
  templateUrl: './account-nis1-transfer-xpx.component.html',
  styleUrls: ['./account-nis1-transfer-xpx.component.css']
})
export class AccountNis1TransferXpxComponent implements OnInit {

  showCertificate: boolean = false;
  transactionSuccess: any;
  routeCertificate: string;
  title: string = 'Swap Process';
  subtitle: string = null;
  routeEvent: string = `/${AppConfig.routes.viewAllAccount}`;
  // mosaics: any;
  constructor(
    private walletService: WalletService
  ) { }

  ngOnInit() {
    // this.mosaics = this.walletService.getAccountMosaicsNis1();
    const account = this.walletService.getNis1AccountSelected();
    if (account.mosaic === null) {
      this.routeEvent = `/${AppConfig.routes.nis1AccountList}`;
    }
  }

  viewCertificate(event): void {
    this.title = 'Congratulations!';
    this.subtitle = 'The swap process has already started.';
    this.showCertificate = !this.showCertificate;
    this.transactionSuccess = event;
    this.routeCertificate = event.route;
    // console.log("this.transactionSuccess", this.transactionSuccess);
  }

}
