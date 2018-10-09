import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CollapseComponent } from 'ng-uikit-pro-standard';
import { Address, Transaction, AccountHttp } from 'nem2-sdk';
import { Observable, Subject } from 'rxjs';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']

})


export class TransactionsComponent implements OnInit {
  items: any
  accountHttp: AccountHttp;
  @ViewChild('test') test: any;
  // direccion :Address;
  constructor() {
    this.accountHttp = new AccountHttp('http://192.168.10.38:3000');
    this.items = [{ 'valor': '2' }, { 'valor': '3' }, { 'valor': '4' }, { 'valor': '5' }, { 'valor': '6' }, { 'valor': '7' }]
  }

  ngOnInit() {
    console.log(this.accountHttp);
  }

  /**
   * Get all confirmed transactions of an account
   * @param address account Address
   * @return Promise with account transactions
   */
  public getaddresss(address: Address): Observable<any> {
    return this.accountHttp.getAccountInfo(address);
  }
}