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
  showMessage = true;
  @Input() privateKey: string;
  @Input() address: string;
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
    if (this.showMessage) {
      this.messageShowPvk = 'Hide private key';
      this.showMessage = false;
    } else {
      this.messageShowPvk = 'Show private key';
      this.showMessage = true;
    }
  }

  copyMessage(message: string) {
    this.sharedService.showSuccess('', `${message} copied`);
  }
}
