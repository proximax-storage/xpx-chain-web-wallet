import { Component, OnInit } from '@angular/core';
import { ItemsHeaderInterface, SharedService } from '../../../services/shared.service';
import { AppConfig } from '../../../../config/app.config';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-sidebar-auth',
  templateUrl: './sidebar-auth.component.html',
  styleUrls: ['./sidebar-auth.component.css']
})
export class SidebarAuthComponent implements OnInit {

  itemsHeader: ItemsHeaderInterface;
  keyObject = Object.keys;
  version = '';
  constructor(
    private sharedService: SharedService
  ) {
    this.version = environment.version;
  }

  ngOnInit() {
    this.itemsHeader = {
      home: this.sharedService.buildHeader('default', 'Home', '', '', false, `/${AppConfig.routes.home}`, true, {}, false),
      auth: this.sharedService.buildHeader('default', 'Sign In', '', '', false, `/${AppConfig.routes.auth}`, true, {}, false),
      wallet: this.sharedService.buildHeader('dropdown', 'Wallet', 'ml-m05rem', '', false, ``, false, {
        create: this.sharedService.buildHeader('default', 'Create', '', '', false, `/${AppConfig.routes.createWallet}`, true, {}, false),
        import: this.sharedService.buildHeader('default', 'Import', '', '', false, `/${AppConfig.routes.importWallet}`, true, {}, false)
      }, false),
    }
  }
}
