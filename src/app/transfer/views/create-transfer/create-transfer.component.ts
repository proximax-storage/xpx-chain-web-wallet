import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-create-transfer',
  templateUrl: './create-transfer.component.html',
  styleUrls: ['./create-transfer.component.css']
})
export class CreateTransferComponent implements OnInit {

  title = 'Make a transfer';

  accountSelect = [
    {
      value: 'pwaoidupaowidpowaiudowaiud',
      label: 'Primary'
    },
    {
      value: 'waid8hwao8dhawidh',
      label: 'TEST'
    },
    {
      value: 'waydoiuawydoauwd',
      label: 'TEST-JAM'
    }
  ];

  mosaicSelect = [
    {
      value: '87687dy',
      label: 'xpx'
    },
    {
      value: '892d9jw9d8',
      label: 'storage'
    }
  ];

  constructor() { }

  ngOnInit() {
  }

}
