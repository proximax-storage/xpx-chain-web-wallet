import { Component, OnInit } from '@angular/core';
import { WalletService } from 'src/app/wallet/services/wallet.service';
import { NemServiceService } from 'src/app/shared/services/nem-service.service';

@Component({
  selector: 'app-transfer-assets',
  templateUrl: './transfer-assets.component.html',
  styleUrls: ['./transfer-assets.component.css']
})
export class TransferAssetsComponent implements OnInit {

  accountListVisible: boolean = false;

  element = {
    name: 'Element',
    address: 'VDBTDK-B55BPX-VSDQR7-AX3WX7-WFUZC3-65CTGJ-X2I5',
    balance: '50.000'
  };
  quantity: string;
  accountCreated: any;

  constructor(
    private walletService: WalletService,
    private nemService: NemServiceService
  ) {
    this.accountCreated = this.walletService.accountWalletCreated;
    this.quantity = this.walletService.accountInfoNis1.quantity;
    console.log('\n\n\n\nValue of this.walletService.accountInfoNis1', this.walletService.accountInfoNis1, '\n\n\n\nEnd value\n\n');
    console.log('\n\n\n\nValue of this.accountCreated', this.accountCreated, '\n\n\n\nEnd value\n\n');
  }

  ngOnInit() {
  }

  changeVisibility() {
    this.accountListVisible = !this.accountListVisible;
  }
}
