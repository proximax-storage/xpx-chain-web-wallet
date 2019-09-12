import { Component, OnInit } from '@angular/core';
import { Balance } from 'nem-library';

@Component({
  selector: 'app-nis1-account-details',
  templateUrl: './nis1-account-details.component.html',
  styleUrls: ['./nis1-account-details.component.css']
})
export class Nis1AccountDetailsComponent implements OnInit {

  list: object[] = [
    {
      name: 'Element 1',
      address: 'VDBTDK-B55BPX-VSDQR7-AX3WX7-WFUZC3-65CTGJ-X2I5',
      balance: '50.000'
    },
    {
      name: 'Element 2',
      address: 'VDBTDK-B55BPX-VSDQR7-AX3WX7-WFUZC3-65CTGJ-X2I5',
      balance: '30.000'
    }
  ];

  constructor() { }

  ngOnInit() {
  }

}
