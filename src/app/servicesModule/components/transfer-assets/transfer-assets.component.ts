import { Component, OnInit } from '@angular/core';

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

  constructor() { }

  ngOnInit() {
  }

  changeVisibility() {
    this.accountListVisible = !this.accountListVisible;
  }
}
