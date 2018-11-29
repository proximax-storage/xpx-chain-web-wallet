import { Injectable } from '@angular/core';
import { NetworkType, PublicAccount } from "proximax-nem2-sdk";
import { crypto } from 'nem2-library';
import { Router } from "@angular/router";
import { BehaviorSubject, Observable } from "rxjs";
import { AccountsInterface } from '..';
import { commonInterface, walletInterface } from '../interfaces/shared.interfaces';
import { NemProvider } from './nem.provider';
import { SharedService } from './shared.service';
import { NodeService } from '../../servicesModule/services/node.service';
import { AppConfig } from "../../config/app.config";

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  currentAccount: any;
  address: any;
  current: any;
  network: any = '';
  algo: string;
  publicAccount: PublicAccount;

  constructor(
    private sharedService: SharedService,
    private nemProvider: NemProvider,
    private nodeService: NodeService,
    private route: Router
  ) {

  }

  public login(common, wallet) {
    if (!wallet) {
      this.sharedService.showError('Error', '¡Dear user, the wallet is missing!');
      return false;
    }

    if (!this.nodeService.getNodeSelected()) {
      //Check if exist nodeStorage
      if (this.nodeService.existArrayNodes() === null) {
        this.sharedService.showError('', 'Please, create a node.');
        this.route.navigate([`/${AppConfig.routes.addNode}`]);
      }else {
        this.sharedService.showError('', 'Please, select a node.');
        this.route.navigate([`/${AppConfig.routes.selectNode}`]);
      }

      return false;
    }
    // Decrypt / generate and check primary
    if (!this.decrypt(common, wallet.accounts[0], wallet.accounts[0].algo, wallet.accounts[0].network)) { return false; }

    if (wallet.accounts[0].network === NetworkType.MAIN_NET && wallet.accounts[0].algo === 'pass:6k' && common.password.length < 40) {
      this.sharedService.showError('Error', '¡Dear user, the wallet is missing!');
    }
    this.use(wallet);
    return true;
  }


  /**
   * Build and return a json with account structure
   *
   * @param {any} encrypted
   * @param {any} iv
   * @param {any} address
   * @param {any} network
   * @returns {AccountsInterface}
   * @memberof WalletService
   */
  buildAccount(encrypted, iv, address, network): AccountsInterface {
    const accounts: AccountsInterface = {
      'brain': true,
      'algo': 'pass:bip32',
      'encrypted': encrypted,
      'iv': iv,
      'address': address,
      'label': 'Primary',
      'network': network
    }
    return accounts
  }

  /**
   *Set a wallet as current
   *
   * @param {*} wallet
   * @returns
   * @memberof WalletService
   */
  public use(wallet) {
    if (!wallet) {
      this.sharedService.showError('Error', '¡you can not set anything like the current wallet!');
      return false;
    }
    this.network = wallet.accounts[0].network;
    // Account used
    this.currentAccount = wallet.accounts[0];
    // Algo of the wallet

    this.algo = wallet.accounts[0].algo;
    // Adress and newwork
    this.address = this.nemProvider.createFromRawAddress(wallet.accounts[0].address);

    this.current = wallet;
    // this.contacts = this._AddressBook.getContacts(wallet);
    return true;
  }

  /**
   *
   *
   * @param {*} common
   * @param {*} [account='']
   * @param {*} [algo='']
   * @param {*} [network='']
   * @returns
   * @memberof WalletService
   */

  decrypt(common: any, account: any = '', algo: any = '', network: any = '') {

    const acct = account || this.currentAccount;
    const net = network || this.network;
    const alg = algo || this.algo;
    // Try to generate or decrypt key

    if (!crypto.passwordToPrivatekey(common, acct, alg)) {
      console.log("sssss")
      setTimeout(() => {
        this.sharedService.showError('Error', '¡Invalid password!');
      }, 500);
      return false;
    }

    if (common.isHW) {
      // this._mdboostrap.closeToastr();

      return true;
    }

    console.log(common.privateKey)
    if (!this.isPrivateKeyValid(common.privateKey) || !this.nemProvider.checkAddress(common.privateKey, net, acct.address)) {
      //   this._mdboostrap.closeToastr();
      setTimeout(() => {
        this.sharedService.showError('Error', '¡Invalid password!');
      }, 500);
      return false;
    }

    //Get public account from private key
    this.publicAccount = this.nemProvider.getPublicAccountFromPrivateKey(common.privateKey, net)
    return true;
  }

  /**
   *
   *
   * @param {any} privateKey
   * @returns
   * @memberof WalletService
   */
  isPrivateKeyValid(privateKey) {
    if (privateKey.length !== 64 && privateKey.length !== 66) {
      console.error('Private key length must be 64 or 66 characters !');
      return false;
    } else if (!this.isHexadecimal(privateKey)) {
      console.error('Private key must be hexadecimal only !');
      return false;
    } else {
      return true;
    }
  }

  /**
   * Verify if a string is hexadecimal
   * by: roimerj_vzla
   *
   * @param {any} str
   * @returns
   * @memberof WalletService
   */
  isHexadecimal(str) {
    return str.match('^(0x|0X)?[a-fA-F0-9]+$') !== null;
  }



  /**
   * Create a wallet array or return existing ones
   * by: roimerj_vzla
   *
   * @returns
   * @memberof WalletService
   */
  getWalletStorage() {
    let walletsStorage = JSON.parse(localStorage.getItem('proxi-wallets'));
    if (walletsStorage === undefined || walletsStorage === null) {
      localStorage.setItem('proxi-wallets', JSON.stringify([]));
      walletsStorage = JSON.parse(localStorage.getItem('proxi-wallets'));
    }
    return walletsStorage;
  }

  /**
   * Create a wallet array
   * by: roimerj_vzla
   *
   * @param {string} user
   * @param {any} accounts
   * @memberof WalletService
   */
  setAccountWalletStorage(user: string, accounts) {
    let walletsStorage = JSON.parse(localStorage.getItem('proxi-wallets'));
    walletsStorage.push({ name: user, accounts: { '0': accounts } });
    localStorage.setItem('proxi-wallets', JSON.stringify(walletsStorage));
  }

}

