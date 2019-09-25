import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/services/auth.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-delete-wallet',
  templateUrl: './delete-wallet.component.html',
  styleUrls: ['./delete-wallet.component.css']
})
export class DeleteWalletComponent implements OnInit {
  title: string;
  description: string;
  wallets: Array<any>;
  constructor(private authService: AuthService,) { }

  ngOnInit(
    
  ) {

    this.title = 'Delete Wallet';
    this.wallets = this.authService.walletsOption(JSON.parse(localStorage.getItem(environment.nameKeyWalletStorage)));
  }

}
