import { Component, OnInit, ViewChild } from '@angular/core';
import { ItemsHeaderInterface, SharedService, MenuInterface } from '../../../services/shared.service';
import { AppConfig } from '../../../../config/app.config';
import { environment } from '../../../../../environments/environment';
import { ModalDirective } from 'ng-uikit-pro-standard';

@Component({
  selector: 'app-sidebar-auth',
  templateUrl: './sidebar-auth.component.html',
  styleUrls: ['./sidebar-auth.component.css']
})
export class SidebarAuthComponent implements OnInit {

  @ViewChild('modalAuth', { static: true }) modalAuth: ModalDirective;
  itemsHeader: ItemsHeaderInterface;
  keyObject = Object.keys;
  version = '';
  constructor(
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

   /* const paramsSignIn: MenuInterface = {
      type: 'default',
      name: 'Sign In',
      class: '',
      icon: '',
      rol: false,
      link: `/${AppConfig.routes.auth}`,
      view: true,
      subMenu: {},
      selected: false
    }*/

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
      name: 'Wallet',
      class: '',
      icon: '',
      rol: false,
      link: `/${AppConfig.routes.viewAllWallets}`,
      view: true,
      subMenu: {},
      selected: false
    }

    const paramsWallet: MenuInterface = {
      type: 'dropdown',
      name: 'Wallets',
      class: 'ml-m05rem',
      icon: '',
      rol: false,
      link: ``,
      view: true,
      subMenu: {
        createWallet,
        importWallet,
        deleteWallet
      },
      selected: false
    }

    this.itemsHeader = {
      home: this.sharedService.buildHeader(paramsHome),
      wallet: this.sharedService.buildHeader(deleteWallet)
      // auth: this.sharedService.buildHeader(paramsSignIn),
      // wallet: this.sharedService.buildHeader(paramsWallet),
    }
  }

  showModal() {
    this.modalAuth.show();
  }
}
