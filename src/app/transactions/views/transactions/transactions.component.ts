import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CollapseComponent } from 'ng-uikit-pro-standard';
import { Observable, Subject } from 'rxjs';
import { TransactionsService } from '../../service/transactions.service';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss']

})

export class TransactionsComponent implements OnInit {
  items: any
  @ViewChild('test') test: any;
  constructor(private transactionsService: TransactionsService) {
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