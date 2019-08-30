import { Component, OnInit } from '@angular/core';
import { PublicAccount } from 'tsjs-xpx-chain-sdk';
import { environment } from 'src/environments/environment';
import { WalletService } from 'src/app/wallet/services/wallet.service';

@Component({
  selector: 'app-create-poll',
  templateUrl: './create-poll.component.html',
  styleUrls: ['./create-poll.component.css']
})
export class CreatePollComponent implements OnInit {
  publicAccount: PublicAccount;


  constructor(
    private walletService: WalletService, ) { }

  ngOnInit() {

    this.publicAccount = PublicAccount.createFromPublicKey(environment.pollsContent.public_key, this.walletService.currentAccount.network);
  }

}
