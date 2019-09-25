import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth/services/auth.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-view-all-wallets',
  templateUrl: './view-all-wallets.component.html',
  styleUrls: ['./view-all-wallets.component.css']
})
export class ViewAllWalletsComponent implements OnInit {
  title: string;
  description: string;
  wallets: Array<any>;
  constructor(private authService: AuthService,) { }

  ngOnInit(
    
    ) {
      this.title = 'List wallets';
      this.wallets = this.authService.walletsOption(JSON.parse(localStorage.getItem(environment.nameKeyWalletStorage)));
    }

}
