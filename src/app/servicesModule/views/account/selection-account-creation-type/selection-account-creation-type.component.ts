import { Component, OnInit } from '@angular/core';
import { AppConfig } from '../../../../config/app.config';

@Component({
  selector: 'app-selection-account-creation-type',
  templateUrl: './selection-account-creation-type.component.html',
  styleUrls: ['./selection-account-creation-type.component.css']
})
export class SelectionAccountTypeComponent implements OnInit {


  link = {
    createAccount: `${AppConfig.routes.createAccount}/0`,
    importAccount: `${AppConfig.routes.importAccount}/1`
  };
  title = 'Select account creation type';

  constructor() {
  }

  ngOnInit() {
  }

}
