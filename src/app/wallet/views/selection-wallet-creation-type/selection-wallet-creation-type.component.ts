import { Component, OnInit } from '@angular/core';
import { AppConfig } from '../../../config/app.config';

@Component({
  selector: 'app-selection-wallet-creation-type',
  templateUrl: './selection-wallet-creation-type.component.html',
  styleUrls: ['./selection-wallet-creation-type.component.css']
})
export class SelectionWalletCreationTypeComponent implements OnInit {


  link = {
    createWallet: AppConfig.routes.createWallet,
    importWallet: AppConfig.routes.importWallet
  };
  title = 'Select wallet creation type'
  constructor() { }

  ngOnInit() {
  }

}
