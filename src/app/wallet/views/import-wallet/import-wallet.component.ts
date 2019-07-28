import { Component, OnInit } from '@angular/core';
import { NetworkType } from 'tsjs-xpx-chain-sdk';

@Component({
  selector: 'app-import-wallet',
  templateUrl: './import-wallet.component.html',
  styleUrls: ['./import-wallet.component.css']
})
export class ImportWalletComponent implements OnInit {

  typeNetwork = [{
    value: NetworkType.TEST_NET,
    label: 'TEST NET'
  }];

  constructor() { }

  ngOnInit() {
  }

}
