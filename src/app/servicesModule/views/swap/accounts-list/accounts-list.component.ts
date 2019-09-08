import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-accounts-list',
  templateUrl: './accounts-list.component.html',
  styleUrls: ['./accounts-list.component.css']
})
export class AccountsListComponent implements OnInit {

  accountInfo = {
    name: 'Selected Account',
    address: 'VDBTDK-B55BPX-VSDQR7-AX3WX7-WFUZC3-65CTGJ-X2I5',
    balance: '50.000'
  };

  list: object[] = [
    {
      name: 'Selected Account',
      address: 'VDBTDK-B55BPX-VSDQR7-AX3WX7-WFUZC3-65CTGJ-X2I5',
      balance: '50.000'
    }
  ];

  constructor() { }

  ngOnInit() {
  }

}
