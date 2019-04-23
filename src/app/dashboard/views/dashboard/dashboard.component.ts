import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  confirmedSelected = true;
  count = 0;
  cantConfirmed = 0;
  cantUnconfirmed = 0;
  dataSelected: any = {};
  iconReloadDashboard = false;
  searching = true;
  transactionsConfirmed: any = [];
  transactionsUnconfirmed: any;
  unconfirmedSelected = false;
  // confirmedSelected = true;
  // unconfirmedSelected = false;
  // searching = true;
  // iconReloadDashboard = false;

  // headElements = ['Type', 'Timestamp', 'Fee', 'Sender', 'Recipient'];
  // subscriptions = [
  //   'getConfirmedTransactionsCache',
  //   'transactionsUnconfirmed',
  //   'getAllTransactions',
  //   'transactionsConfirmed'
  // ];
  // infoMosaic: MosaicInfo;
  // typeTransactions: any;


  constructor() { }

  ngOnInit() {
  }


  /**
   * Select tab
   *
   * @param {*} param
   * @memberof DashboardComponent
   */
  selectTab(param: any) {
    if (param === 1) {
      this.confirmedSelected = true;
      this.unconfirmedSelected = false;
    } else {
      this.confirmedSelected = false;
      this.unconfirmedSelected = true;
    }
  }

}
