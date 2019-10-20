import { Component, OnInit } from '@angular/core';
import { AppConfig } from '../../../../config/app.config';
import { HeaderServicesInterface } from '../../../../servicesModule/services/services-module.service';

@Component({
  selector: 'app-selection-account-creation-type',
  templateUrl: './selection-account-creation-type.component.html',
  styleUrls: ['./selection-account-creation-type.component.css']
})
export class SelectionAccountTypeComponent implements OnInit {

  paramsHeader: HeaderServicesInterface = {
    moduleName: 'Accounts',
    componentName: 'Select Creation Type'
  };

  link = {
    createAccount: `${AppConfig.routes.createAccount}/0`,
    importAccount: `${AppConfig.routes.importAccount}/1`
  };
  title = 'Select Account Creation Type';

  constructor() {
  }

  ngOnInit() {
  }

}
