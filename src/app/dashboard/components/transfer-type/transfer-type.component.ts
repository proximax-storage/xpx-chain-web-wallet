import { Component, OnInit, Input, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-transfer-type',
  templateUrl: './transfer-type.component.html',
  styleUrls: ['./transfer-type.component.scss']
})
export class TransferTypeComponent implements OnInit {

  @Input() transferTransaction: any;

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes);
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.

  }

}
