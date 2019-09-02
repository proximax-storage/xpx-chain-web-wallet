import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-nis1-accounts-list',
  templateUrl: './nis1-accounts-list.component.html',
  styleUrls: ['./nis1-accounts-list.component.css']
})
export class Nis1AccountsListComponent implements OnInit {

  list: object[] = [
    {
      name: 'Elemento 1',
      address: 'VDBTDK-B55BPX-VSDQR7-AX3WX7-WFUZC3-65CTGJ-X2I5'
    },
    {
      name: 'Elemento 2',
      address: 'VDBTDK-B55BPX-VSDQR7-AX3WX7-WFUZC3-65CTGJ-X2I5'
    }
  ];

  constructor() { }

  ngOnInit() {
  }

}
