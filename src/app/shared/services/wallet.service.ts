import { Injectable } from '@angular/core';
import { NetworkType, PublicAccount, AccountInfo, Address } from "tsjs-xpx-catapult-sdk";
import { crypto } from 'js-xpx-catapult-library';
import { Router } from "@angular/router";
import { AccountsInterface } from '..';
import { ProximaxProvider } from './proximax.provider';
import { SharedService } from './shared.service';
import { NodeService } from '../../servicesModule/services/node.service';
import { AppConfig } from "../../config/app.config";
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WalletService {

  currentAccount: any;
  address: Address;
  current: any;
  network: any = '';
  algo: string;
  publicAccount: PublicAccount;
  private accountInfo: AccountInfo;

  constructor(
    private sharedService: SharedService,
    private proximaxProvider: ProximaxProvider,
    private nodeService: NodeService,
    private route: Router
  ) {

  }


  /**
   *
   *
   * @param {{ password: { length: number; }; }} common
   * @param {*} wallet
   * @returns
   * @memberof WalletService
   */
  login(common: { password: { length: number; }; }, wallet: any) {
    if (!wallet) {
      this.sharedService.showError('Error', '¡Dear user, the wallet is missing!');
      return false;
    } else if (!this.nodeService.getNodeSelected()) {
      this.sharedService.showError('', 'Please, select a node.');
      this.route.navigate([`/${AppConfig.routes.selectNode}`]);
      return false;
    } else if (!this.decrypt(common, wallet.accounts[0], wallet.accounts[0].algo, wallet.accounts[0].network)) {
      // Decrypt / generate and check primary
      return false;
    } else if (wallet.accounts[0].network === NetworkType.MAIN_NET && wallet.accounts[0].algo === 'pass:6k' && common.password.length < 40) {
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
  buildAccount(encrypted: string, iv: string, address: string, network: number): AccountsInterface {
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
  use(wallet: any) {
    console.log('----------------> wallet', wallet)
    if (!wallet) {
      this.sharedService.showError('Error', '¡you can not set anything like the current wallet!');
      return false;
    }
    // console.log(wallet);
    this.network = wallet.accounts[0].network;
    // Account used
    this.currentAccount = wallet.accounts[0];
    // Algo of the wallet
    this.algo = wallet.accounts[0].algo;
    console.log(this.algo);
    // Adress and newwork
    this.address = this.proximaxProvider.createFromRawAddress(wallet.accounts[0].address);
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
      setTimeout(() => {
        this.sharedService.showError('Error', '¡Invalid password!');
      }, 500);
      return false;
    }

    if (common.isHW) {
      return true;
    }

    if (!this.isPrivateKeyValid(common.privateKey) || !this.proximaxProvider.checkAddress(common.privateKey, net, acct.address)) {
      setTimeout(() => {
        this.sharedService.showError('Error', '¡Invalid password!');
      }, 500);
      return false;
    }

    //Get public account from private key
    this.publicAccount = this.proximaxProvider.getPublicAccountFromPrivateKey(common.privateKey, net);
    return true;
  }

  /**
   *
   *
   * @param {any} privateKey
   * @returns
   * @memberof WalletService
   */
  isPrivateKeyValid(privateKey: any) {
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
  isHexadecimal(str: { match: (arg0: string) => any; }) {
    return str.match('^(0x|0X)?[a-fA-F0-9]+$') !== null;
  }

  /**
   * Get account info
   *
   * @returns
   * @memberof WalletService
   */
  getAccountInfo() {
    return this.accountInfo;
  }

  /**
     * Create a wallet array or return existing ones
     * by: roimerj_vzla
     *
     * @returns
     * @memberof WalletService
     */
  getWalletStorage() {
    let walletsStorage = JSON.parse(localStorage.getItem(environment.nameKeyWalletStorage));
    if (walletsStorage === undefined || walletsStorage === null) {
      localStorage.setItem(environment.nameKeyWalletStorage, JSON.stringify([]));
      walletsStorage = JSON.parse(localStorage.getItem(environment.nameKeyWalletStorage));
    }
    return walletsStorage;
  }

  /**
   * Destroy account info
   *
   * @memberof WalletService
   */
  destroyAccountInfo() {
    this.accountInfo = undefined;
  }

  /**
   * Create a wallet array
   * by: roimerj_vzla
   *
   * @param {string} user
   * @param {any} accounts
   * @memberof WalletService
   */
  setAccountWalletStorage(user: string, accounts: any) {
    let walletsStorage = JSON.parse(localStorage.getItem(environment.nameKeyWalletStorage));
    walletsStorage.push({ name: user, accounts: { '0': accounts } });
    localStorage.setItem(environment.nameKeyWalletStorage, JSON.stringify(walletsStorage));
  }

  /**
   * Set account info
   *
   * @param {AccountInfo} accountInfo
   * @memberof WalletService
   */
  setAccountInfo(accountInfo: AccountInfo) {
    this.accountInfo = accountInfo
  }
}

