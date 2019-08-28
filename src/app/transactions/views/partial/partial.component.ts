import { Component, OnInit } from '@angular/core';
import { AppConfig } from '../../../config/app.config';
import { PaginationInstance } from 'ngx-pagination';

@Component({
  selector: 'app-partial',
  templateUrl: './partial.component.html',
  styleUrls: ['./partial.component.css']
})
export class PartialComponent implements OnInit {


  componentName = 'Partial';
  config: PaginationInstance = {
    id: 'advanced',
    itemsPerPage: 10,
    currentPage: 1
  };
  filter: string = '';
  goBack = `/${AppConfig.routes.service}`;
  moduleName = 'Transactions';
  elements: any = [
    {
      status: 'Action Required!',
      deadline: '2019-07-10 20:38:04',
      fee: '0.000000',
      accountLinked: 'VDAE5R-ORTVTM-Y6M5EU-MLYQ5E-LQ7WWX-2AIFRO-Z3YN',
      hash: 'F416F7FA16AB94878D135F7AFD815A5DAB664F0588FD90592A7DB082C28A438C',
      statusBoolean: true
    },
    {
      status: 'Pending!',
      deadline: '2019-08-10 20:38:04',
      fee: '0.000000',
      accountLinked: 'VDAE5R-ORTVTM-Y6M5EU-MLYQ5E-LQ7WWX-2AIFRO-Z3YN',
      hash: 'F416F7FA16AB94878D135F7AFD815A5DAB664F0588FD90592A7DB082C28A438C',
      statusBoolean: false
    },
    {
      status: 'Action Required!',
      deadline: '2019-09-10 20:38:04',
      fee: '0.000000',
      accountLinked: 'VDAE5R-ORTVTM-Y6M5EU-MLYQ5E-LQ7WWX-2AIFRO-Z3YN',
      hash: 'F416F7FA16AB94878D135F7AFD815A5DAB664F0588FD90592A7DB082C28A438C',
      statusBoolean: true
    },
    {
      status: 'Action Required!',
      deadline: '2019-10-10 20:38:04',
      fee: '0.000000',
      accountLinked: 'VDAE5R-ORTVTM-Y6M5EU-MLYQ5E-LQ7WWX-2AIFRO-Z3YN',
      hash: 'F416F7FA16AB94878D135F7AFD815A5DAB664F0588FD90592A7DB082C28A438C',
      statusBoolean: true
    },
  ];

  headElements = ['Status', 'Deadline', 'Fee', 'Account linked to the transaction', 'Hash'];
  objectKeys = Object.keys;

  constructor() { }

  ngOnInit() {
  }

}
