import { Component, OnInit, Input } from '@angular/core';
import { AppConfig } from "src/app/config/app.config";

@Component({
  selector: 'app-wallet-created',
  templateUrl: './wallet-created.component.html',
  styleUrls: ['./wallet-created.component.scss']
})
export class WalletCreatedComponent implements OnInit {
  messageShowPvk = 'Hide private key';
  showMessage = true;
  @Input() privateKey: string;
  @Input() address: string;
  routes = {
    login: `/${AppConfig.routes.login}`
  };

  constructor() {
  }

  ngOnInit() {
  }

  showHidePvkAddress() {
    if (this.showMessage) {
      this.messageShowPvk = 'Show private key';
      this.showMessage = false;
    }else {
      this.messageShowPvk = 'Hide private key';
      this.showMessage = true;
    }
  }
}
