import { Component, OnInit } from '@angular/core';
import { AppConfig } from '../../../config/app.config';
import { NemProviderService } from '../../services/nem-provider.service';
import { WalletService } from '../../../wallet/services/wallet.service';

@Component({
  selector: 'app-nis1-account-found',
  templateUrl: './nis1-account-found.component.html',
  styleUrls: ['./nis1-account-found.component.css']
})
export class Nis1AccountFoundComponent implements OnInit {

  routeGoBack = `/${AppConfig.routes.home}`;
  routeContinue = ``;

  constructor(
    private nemProvider: NemProviderService,
    private walletService: WalletService
  ) { }

  ngOnInit() {
    const data = Object.assign({}, this.nemProvider.getSelectedNis1Account());
    if (this.walletService.getCurrentWallet()) {
      if (data.cosignerAccounts.length > 0) {
        this.routeContinue = `/${AppConfig.routes.swapListCosigners}`;
      } else {
        this.routeContinue = `/${AppConfig.routes.swapTransferAssetsLogged}/${data.address.pretty()}/1/0`;
      }
    } else {
      if (data.cosignerAccounts.length > 0) {
        this.routeContinue = `/${AppConfig.routes.swapListCosignerNis1}`;
      } else {
        this.routeContinue = `/${AppConfig.routes.swapTransferAssets}/${data.address.pretty()}/1/0`;
      }
    }
  }

}
