import { Component, OnInit } from '@angular/core';
import { NetworkType } from 'tsjs-xpx-chain-sdk';

@Component({
  selector: 'app-create-wallet',
  templateUrl: './create-wallet.component.html',
  styleUrls: ['./create-wallet.component.css']
})
export class CreateWalletComponent implements OnInit {


  description = 'This wallet makes it easy to access your crypto and interact with blockchain. ProximaX does not have access to your funds.';
  title = 'Create Wallet';
  typeNetwork = [{
    value: NetworkType.TEST_NET,
    label: 'TEST NET'
  }];


  constructor() { }

  ngOnInit() {
  }

}
