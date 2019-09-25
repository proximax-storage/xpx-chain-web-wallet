import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/services/auth.service';
import { environment } from 'src/environments/environment';
import { AppConfig } from 'src/app/config/app.config';

@Component({
  selector: 'app-view-all-wallets',
  templateUrl: './view-all-wallets.component.html',
  styleUrls: ['./view-all-wallets.component.css']
})
export class ViewAllWalletsComponent implements OnInit {
  title: string;
  description: string;
  wallets: Array<any>;

  routes = {
    selectTypeCreationWallet: AppConfig.routes.selectTypeCreationWallet,
    deleteWallet: `/${AppConfig.routes.deleteWallet}/`,

  };
  constructor(private authService: AuthService, ) { }

  ngOnInit(

  ) {
    this.title = 'Wallets available';
    this.description = 'This are Proximax Sirius Wallet available on your device'
    this.wallets = this.authService.walletsOption(JSON.parse(localStorage.getItem(environment.nameKeyWalletStorage)));
  }

}
