import { Component, OnInit } from '@angular/core';
import { AppConfig, Config } from '../config/app.config';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  showFiller = false;
  routes = {
    login: `/${AppConfig.routes.login}`,
    createWallet: `/${AppConfig.routes.createWallet}`
  };

  constructor() {
  }

  ngOnInit() {
  }

}
