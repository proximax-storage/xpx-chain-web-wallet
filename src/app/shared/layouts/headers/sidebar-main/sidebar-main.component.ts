import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { ItemsHeaderInterface, SharedService } from '../../../services/shared.service';
import { AppConfig } from 'src/app/config/app.config';
import { environment } from 'src/environments/environment.prod';
import { DashboardService } from '../../../../dashboard/services/dashboard.service';
import { AuthService } from '../../../../auth/services/auth.service';

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
      label: 'TRANSFER',
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
    private sharedService: SharedService,
    private route: Router,
    private authService: AuthService,
    private dashboardService: DashboardService,
  ) {
    this.version = environment.version;
  }

  ngOnInit() {
    this.itemsHeader = {
      signout: this.sharedService.buildHeader('default', 'LOG OUT', '', '', false, `/${AppConfig.routes.home}`, false, {}, false),
    }
  }

  /**
   *
   *
   * @param {String} [param]
   * @memberof HeaderComponent
   */
  logout(param?: String) {
    this.dashboardService.processComplete = false;
    this.authService.setLogged(false);
    this.authService.destroyNodeSelected();
    this.route.navigate([`/${param}`]);
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
