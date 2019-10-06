import { Component, OnInit } from "@angular/core";
import { AuthService } from "src/app/auth/services/auth.service";
import { environment } from "src/environments/environment";
import { AppConfig } from "src/app/config/app.config";
import { WalletService } from "../../services/wallet.service";

@Component({
  selector: "app-view-all-wallets",
  templateUrl: "./view-all-wallets.component.html",
  styleUrls: ["./view-all-wallets.component.css"]
})
export class ViewAllWalletsComponent implements OnInit {

  description: string;
  routes = {
    home: AppConfig.routes.home,
    deleteWallet: `/${AppConfig.routes.deleteWallet}/`
  };

  title: string;
  wallets: Array<any>;


  constructor(
    private walletService: WalletService
  ) {}

  ngOnInit() {
    this.title = "Wallets";
    this.description =
      "These are the Sirius Wallets available in the local cache of your device.";
    this.wallets = this.walletService.getWalletStorage();
  }
}
