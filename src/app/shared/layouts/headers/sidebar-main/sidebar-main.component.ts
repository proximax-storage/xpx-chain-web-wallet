import { Component, OnInit } from '@angular/core';
import { ItemsHeaderInterface, SharedService } from '../../../services/shared.service';
import { AppConfig } from 'src/app/config/app.config';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-sidebar-main',
  templateUrl: './sidebar-main.component.html',
  styleUrls: ['./sidebar-main.component.css']
})

export class SidebarMainComponent implements OnInit {

  changeMenu = true;
  itemsHeader: ItemsHeaderInterface;
  itemsMenu = [
    {
      label: 'DASHBOARD',
      url: `/${AppConfig.routes.dashboard}`
    },
    {
      label: 'TRANSACTIONS',
      url: `/${AppConfig.routes.createTransfer}`
    },
    {
      label: 'ACCOUNT',
      url: `/${AppConfig.routes.dashboard}`
    },
    {
      label: 'SERVICES',
      url: `/${AppConfig.routes.dashboard}`
    },
  ];
  keyObject = Object.keys;
  version = '';
  constructor(
    private sharedService: SharedService
  ) {
    this.version = environment.version;
  }

  ngOnInit() {
    this.itemsHeader = {
      signout: this.sharedService.buildHeader('default', 'LOG OUT', '', '', false, `/${AppConfig.routes.home}`, true, {}, false),
    }
  }

  myFunction() {
    let menuNav = document.getElementById("myTopnav");

    if (menuNav.classList.contains('responsive')) {
      menuNav.classList.remove('responsive');
    } else {
      menuNav.classList.add('responsive');
    }
  }
}
