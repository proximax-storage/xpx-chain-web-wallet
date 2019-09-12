import { Component, OnInit } from '@angular/core';
import { AppConfig } from '../../../../config/app.config';

@Component({
  selector: 'app-nis1-accounts-list',
  templateUrl: './nis1-accounts-list.component.html',
  styleUrls: ['./nis1-accounts-list.component.css']
})
export class Nis1AccountsListComponent implements OnInit {

  list: object[] = [
    {
      name: 'Element 1',
      address: 'VDBTDK-B55BPX-VSDQR7-AX3WX7-WFUZC3-65CTGJ-X2I5'
    },
    {
      name: 'Element 2',
      address: 'VDBTDK-B55BPX-VSDQR7-AX3WX7-WFUZC3-65CTGJ-X2I5'
    }
  ];
  goBack: string = `/${AppConfig.routes.service}`;
  goList: string = `/${AppConfig.routes.accountList}`;

  constructor() { }

  ngOnInit() {
  }

}
