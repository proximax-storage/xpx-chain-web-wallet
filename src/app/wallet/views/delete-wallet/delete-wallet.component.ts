import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Address } from 'tsjs-xpx-chain-sdk';
import { AuthService } from '../../../auth/services/auth.service';
import { AppConfig } from '../../../config/app.config';
import { HeaderServicesInterface } from '../../../servicesModule/services/services-module.service';
import { WalletService, WalletAccountInterface } from '../../services/wallet.service';


@Component({
  selector: 'app-delete-wallet',
  templateUrl: './delete-wallet.component.html',
  styleUrls: ['./delete-wallet.component.css']
})
export class DeleteWalletComponent implements OnInit {

  paramsHeader: HeaderServicesInterface = {
    moduleName: 'Wallet',
    componentName: 'Delete'
  };

  routes = {
    viewAllWallets: `/${AppConfig.routes.viewAllWallets}`,
    deleteWalletConfirm: `/${AppConfig.routes.deleteWalletConfirm}/`,
  };

  description = 'Accounts that are associated with this device';
  texAlert = 'Would you like to delete permanently this Sirius Wallet?'
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
    // console.log(this.wallet.name)
  }


  createFromRawAddress(address: string): string {
    return Address.createFromRawAddress(address).pretty();
  }
}
