import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CollapseComponent } from 'ng-uikit-pro-standard';
import { Observable, Subject } from 'rxjs';
import { TransactionsService } from '../../service/transactions.service';
import {NemProvider} from "../../../shared/services/nem.provider";
import {WalletService} from "../../../shared";

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss']

})

export class TransactionsComponent implements OnInit {
  items: any
  @ViewChild('test') test: any;
  constructor(
    private transactionsService: TransactionsService,
    private nemProvider: NemProvider,
    private walletService: WalletService
  ) {
    this.nemProvider.getAllTransactionsFromAnAccount(this.walletService.publicAccount, this.walletService.network).subscribe(
      trans => {
        console.log("aca")
        console.log("asdasdasdasdasdasd:",trans)
        this.transactionsService.setTransConfirm$(trans);
      },
      error => {
        console.error(error);
      })
    this.items = [{ 'valor': '2' }, { 'valor': '3' }, { 'valor': '4' }, { 'valor': '5' }, { 'valor': '6' }, { 'valor': '7' }]
  }

  ngOnInit() {



    this.transactionsService.getTransConfirm$().subscribe(
      tran => {
        console.log('transacciones --', tran.length)
      },
      error => {
        console.error(error)
      }
    )


  }

}
