import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-create-wallet',
  templateUrl: './create-wallet.component.html',
  styleUrls: ['./create-wallet.component.css']
})
export class CreateWalletComponent implements OnInit {

  typeRed = [{
    value: 'asdasd',
    label: 'TEST'
  }];


  constructor() { }

  ngOnInit() {
  }

}
