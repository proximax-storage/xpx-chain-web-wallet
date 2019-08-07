import { Component, OnInit } from '@angular/core';
import { NgBlockUI, BlockUI } from 'ng-block-ui';
import { AppConfig } from 'src/app/config/app.config';

@Component({
  selector: 'app-create-multi-signature',
  templateUrl: './create-multi-signature.component.html',
  styleUrls: ['./create-multi-signature.component.css']
})
export class CreateMultiSignatureComponent implements OnInit {
  headElements = ['Address', 'Action', 'Remove'];

  constructor() { }

  ngOnInit() {
  }

}
