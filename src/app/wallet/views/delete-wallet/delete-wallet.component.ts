import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/services/auth.service';
import { environment } from 'src/environments/environment';
import { AppConfig } from 'src/app/config/app.config';
import { HeaderServicesInterface } from 'src/app/servicesModule/services/services-module.service';
import { WalletService, WalletAccountInterface } from '../../services/wallet.service';
import { ActivatedRoute } from '@angular/router';
import { Address } from 'tsjs-xpx-chain-sdk';

@Component({
  selector: 'app-delete-wallet',
  templateUrl: './delete-wallet.component.html',
  styleUrls: ['./delete-wallet.component.css']
})
export class DeleteWalletComponent implements OnInit {

  paramsHeader: HeaderServicesInterface = {
    moduleName: 'Wallets',
    componentName: 'DELETE REQUEST'
  };
  routes = {
    viewAllWallets : `/${AppConfig.routes.viewAllWallets}`,
    deleteWalletConfirm: `/${AppConfig.routes.deleteWalletConfirm}/`,

  };
  description = 'Accounts that are associated with this device';
  texAlert= 'Would you like to delete permanently this Sirius Wallet?'
  wallet: WalletAccountInterface;
  nameWallet: string;
  constructor(
    private activateRoute: ActivatedRoute,
    private authService: AuthService,
    private walletService: WalletService) { }

  ngOnInit(

  ) {
    let name = this.activateRoute.snapshot.paramMap.get('name');


    this.wallet = this.walletService.getWalletStorageName(name)[0];
    console.log(this.wallet.name)
  }


  createFromRawAddress(address: string): string {
    return Address.createFromRawAddress(address).pretty();
  }
}
