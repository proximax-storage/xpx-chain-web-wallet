import { Component, OnInit } from '@angular/core';
import { AppConfig } from 'src/app/config/app.config';

@Component({
  selector: 'app-nis1-account-found',
  templateUrl: './nis1-account-found.component.html',
  styleUrls: ['./nis1-account-found.component.css']
})
export class Nis1AccountFoundComponent implements OnInit {

  routeGoBack = `/${AppConfig.routes.home}`;
  routeGoNext = ``;
  //swapAccountNis1Found

  constructor() { }

  ngOnInit() {
  }

}
