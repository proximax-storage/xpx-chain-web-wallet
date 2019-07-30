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
  itemsMenu: [];
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
    let x = document.getElementById("myTopnav");
    if (x.className === "topnav") {
      x.className += " responsive";
    } else {
      x.className = "topnav";
    }
  }
}
