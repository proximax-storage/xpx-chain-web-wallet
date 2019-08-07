import { Component, OnInit } from '@angular/core';
import { NetworkType } from 'tsjs-xpx-chain-sdk';
import { WalletService } from '../../../../wallet/services/wallet.service';
import { environment } from '../../../../../environments/environment';
import { ProximaxProvider } from '../../../../shared/services/proximax.provider';

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.css']
})
export class CreateAccountComponent implements OnInit {

  constructor(
    private walletService: WalletService,
    private proximaxProvider: ProximaxProvider
  ) { }

  ngOnInit() {
    let walletsStorage = JSON.parse(localStorage.getItem(environment.nameKeyWalletStorage));
    console.log(walletsStorage);
    const othersAccounts = walletsStorage.filter(elm => elm.name !== this.walletService.current.name);
    console.log(othersAccounts);
    console.log(this.walletService.current);
    this.createAccount();
  }

  /**
   *
   *
   * @memberof CreateAccountComponent
   */
  createAccount () {
    const nameWallet = 'jperaza';
    const network = NetworkType.TEST_NET;
    const password = this.proximaxProvider.createPassword('12345678');
    const newAccount = this.proximaxProvider.createAccountSimple(nameWallet, password, network);
    const accountBuilded = this.walletService.buildAccount(
      newAccount.encryptedPrivateKey.encryptedKey,
      newAccount.encryptedPrivateKey.iv,
      newAccount.address['address'],
      newAccount.network,
      nameWallet,
      nameWallet
    );

    console.log('accountBuilded', accountBuilded)
  }

}
