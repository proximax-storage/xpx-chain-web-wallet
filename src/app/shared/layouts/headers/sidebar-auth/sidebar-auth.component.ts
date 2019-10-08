import { Component, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { ModalDirective } from 'ng-uikit-pro-standard';
import { ItemsHeaderInterface, SharedService, MenuInterface } from '../../../services/shared.service';
import { AppConfig } from '../../../../config/app.config';
import { environment } from '../../../../../environments/environment';
import { AuthService } from '../../../../auth/services/auth.service';

@Component({
  selector: 'app-sidebar-auth',
  templateUrl: './sidebar-auth.component.html',
  styleUrls: ['./sidebar-auth.component.css']
})
export class SidebarAuthComponent implements OnInit {

  @ViewChild('modalAuth', { static: true }) modalAuth: ModalDirective;
  eventNumber: number = 0;
  itemsHeader: ItemsHeaderInterface;
  keyObject = Object.keys;
  subscription: Subscription[] = [];
  version = '';

  constructor(
    private authService: AuthService,
    private sharedService: SharedService
  ) {
    this.version = environment.version;
  }

  ngOnInit() {
    const paramsHome: MenuInterface = {
      type: 'default',
      name: 'Home',
      class: '',
      icon: '',
      rol: false,
      link: `/${AppConfig.routes.home}`,
      view: true,
      subMenu: {},
      selected: false
    }

    const createWallet: MenuInterface = {
      type: 'default',
      name: 'Create',
      class: '',
      icon: '',
      rol: false,
      link: `/${AppConfig.routes.createWallet}`,
      view: false,
      subMenu: {},
      selected: false
    }

    const importWallet: MenuInterface = {
      type: 'default',
      name: 'Import',
      class: '',
      icon: '',
      rol: false,
      link: `/${AppConfig.routes.importWallet}`,
      view: false,
      subMenu: {},
      selected: false
    }

    const deleteWallet: MenuInterface = {
      type: 'default',
      name: 'Wallets',
      class: '',
      icon: '',
      rol: false,
      link: `/${AppConfig.routes.viewAllWallets}`,
      view: true,
      subMenu: {},
      selected: false
    }

    this.itemsHeader = {
      home: this.sharedService.buildHeader(paramsHome),
      wallet: this.sharedService.buildHeader(deleteWallet)
    }

    this.receiveEventShowModal();
  }


  receiveEventShowModal() {
    this.subscription.push(this.authService.getEventShowModal().subscribe(
      next => {
        if (next !== 0) {
          this.showModal();
        }
      }
    ));
  }


  /**
   *
   *
   * @memberof SidebarAuthComponent
   */
  showModal() {
    this.eventNumber = this.eventNumber + 1;
    this.modalAuth.show();
  }
}
