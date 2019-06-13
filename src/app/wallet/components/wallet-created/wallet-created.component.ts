import { Component, OnInit, Input } from '@angular/core';
import { AppConfig } from "src/app/config/app.config";
import { SharedService } from '../../../shared';

@Component({
  selector: 'app-wallet-created',
  templateUrl: './wallet-created.component.html',
  styleUrls: ['./wallet-created.component.scss']
})
export class WalletCreatedComponent implements OnInit {
  messageShowPvk = 'Show private key';
  privateKeyIsShow = false;
  @Input() privateKey: string;
  @Input() address: string;
  @Input() walletName: string;
  @Input() publicKey: string;
  routes = {
    login: `/${AppConfig.routes.login}`
  };

  constructor(
    private sharedService: SharedService
  ) {
  }

  ngOnInit() {
  }

  showHidePvkAddress() {
    if (!this.privateKeyIsShow) {
      this.privateKeyIsShow = true;
      this.messageShowPvk = 'HIDE YOUR PRIVATE KEY';
    } else {
      this.privateKeyIsShow = false;
      this.messageShowPvk = 'SHOW YOUR PRIVATE KEY';
    }
  }

  copyMessage(message: string) {
    this.sharedService.showSuccess('', `${message} copied`);
  }
}
