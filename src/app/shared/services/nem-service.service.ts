import { Injectable } from '@angular/core';
import {
  NEMLibrary,
  NetworkTypes,
  AccountHttp,
  Password,
  SimpleWallet
} from 'nem-library';

@Injectable({
  providedIn: 'root'
})
export class NemServiceService {
  accountHttp: AccountHttp;
  networkType: NetworkTypes;

  constructor() {
    this.networkType = NetworkTypes.TEST_NET
    NEMLibrary.bootstrap(this.networkType);
    this.accountHttp = new AccountHttp();
    console.log('------------This is node connection NIS-1---------', this.accountHttp);
  }

  /**
   * Method to create a Simple Wallet from a private key
   * 
   * @param {string} privateKey
   * @param {string} password
   * @returns SimpleWallet
   */
  createWalletPrivateKey(privateKey, password) {
    const pass = new Password(password);
    const simpleWallet = SimpleWallet.createWithPrivateKey("simple wallet", pass, privateKey);
    console.log('this is a Simple wallet \n\n', simpleWallet);

    this.accountHttp.getFromAddress(simpleWallet.address).subscribe(element => {
      console.log('-----infoAccount----\n\n\n', element);

    });

    // let accountOwnedMosaics = new AccountOwnedMosaicsService(new AccountHttp(), new MosaicHttp());
    // accountOwnedMosaics.fromAddress(address).subscribe(mosaics => {
    //   console.log(mosaics);
    // });
  }
}
