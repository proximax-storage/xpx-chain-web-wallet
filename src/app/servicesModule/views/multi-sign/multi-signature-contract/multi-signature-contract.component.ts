import { Component, OnInit } from '@angular/core';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { AppConfig } from 'src/app/config/app.config';

@Component({
  selector: 'app-multi-signature-contract',
  templateUrl: './multi-signature-contract.component.html',
  styleUrls: ['./multi-signature-contract.component.css']
})
export class MultiSignatureContractComponent implements OnInit {

  @BlockUI() blockUI: NgBlockUI;
  moduleName = 'Multi signature';
  componentName = 'CREATE';
  backToService = `/${AppConfig.routes.service}`;
  constructor() { }

  ngOnInit() {
  }

}
