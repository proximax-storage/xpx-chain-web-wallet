import { Component, OnInit } from '@angular/core';
import { NetworkType } from 'tsjs-xpx-chain-sdk';

@Component({
  selector: 'app-create-wallet',
  templateUrl: './create-wallet.component.html',
  styleUrls: ['./create-wallet.component.css']
})
export class CreateWalletComponent implements OnInit {

  typeNetwork = [{
    value: NetworkType.TEST_NET,
    label: 'TEST NET'
  }];


  constructor() { }

  ngOnInit() {
  }

}
