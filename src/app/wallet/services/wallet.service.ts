import { Injectable } from '@angular/core';
import { Router } from "@angular/router";
import { SimpleWallet, Address, PublicAccount, AccountInfo, NetworkType } from 'tsjs-xpx-chain-sdk';
import { crypto } from 'js-xpx-chain-library';
import { AbstractControl } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { SharedService } from '../../shared/services/shared.service';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { NodeService } from 'src/app/servicesModule/services/node.service';
import { AppConfig } from 'src/app/config/app.config';
import { ProximaxProvider } from 'src/app/shared/services/proximax.provider';


@Injectable({
  providedIn: 'root'
})
export class WalletService {

  algoData: {
    data: any;
    dataAccount: AccountsInterface;
    wallet: SimpleWallet
  } = null;

  /******************** */

  currentAccount: any;
  address: Address;
  current: any;
  network: any = '';
  algo: string;
  publicAccount: PublicAccount;
  private accountInfo: AccountInfo;
  private accountInfoSubject: BehaviorSubject<AccountInfo> = new BehaviorSubject<AccountInfo>(null);
  private accountInfo$: Observable<AccountInfo> = this.accountInfoSubject.asObservable();

  constructor(
    private sharedService: SharedService,
    private route: Router,
    private nodeService: NodeService,
    private proximaxProvider: ProximaxProvider
  ) {

  }


  /**
   *
   *
   * @param {string} encrypted
   * @param {string} iv
   * @param {string} address
   * @param {number} network
   * @returns {AccountsInterface}
   * @memberof WalletService
   */
  buildAccount(encrypted: string, iv: string, address: string, network: number, nameWallet: string, labelParams = 'Primary'): AccountsInterface {
    const accounts: AccountsInterface = {
      'address': address,
      'algo': 'pass:bip32',
      'brain': true,
      'encrypted': encrypted,
      'iv': iv,
      'name': nameWallet,
      'label': labelParams,
      'network': network
    }

    return accounts;
  }

  /**
   *
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
   *
   *
   * @param {string} nameWallet
   * @param {*} accountsParams
   * @memberof WalletService
   */
  saveAccountStorage(nameWallet: string, accountsParams: any) {
    const myAccounts = Object.assign(this.current.accounts);
    const othersWallet = this.getWalletStorage().filter(
      (element: any) => {
        return element.name !== this.current.name;
      }
    );

    myAccounts.push(accountsParams)
    this.current.accounts = myAccounts;
    othersWallet.push({
      name: this.current.name,
      accounts: myAccounts
    });

    localStorage.setItem(environment.nameKeyWalletStorage, JSON.stringify(othersWallet));
  }

  /**
   *
   *
   * @param {string} nameWallet
   * @param {AccountsInterface} dataAccount
   * @param {SimpleWallet} wallet
   * @memberof WalletService
   */
  saveDataWalletCreated(data: any, dataAccount: AccountsInterface, wallet: SimpleWallet) {
    this.algoData = {
      data: data,
      dataAccount: dataAccount,
      wallet: wallet
    }
  }

  /**
   *
   *
   * @param {string} user
   * @param {*} accounts
   * @memberof WalletService
   */
  saveWalletStorage(nameWallet: string, accountsParams: any) {
    let walletsStorage = JSON.parse(localStorage.getItem(environment.nameKeyWalletStorage));
    walletsStorage.push({
      name: nameWallet,
      accounts: [accountsParams]
    });

    localStorage.setItem(environment.nameKeyWalletStorage, JSON.stringify(walletsStorage));
  }


  /**
   *
   *
   * @param {AbstractControl} abstractControl
   * @returns
   * @memberof WalletService
   */
  validateNameWallet(abstractControl: AbstractControl) {
    const existWallet = this.getWalletStorage().find(
      (element: any) => {
        return element.name === abstractControl.get('nameWallet').value;
      }
    );

    if (existWallet !== undefined) {
      return {
        invalidNameWallet: true
      };
    }
  }


  /**************************************************************************************************/

  /**
   *
   *
   * @param {{ password: { length: number; }; }} common
   * @param {*} wallet
   * @returns
   * @memberof WalletService
   */
  login(common: { password: { length: number; }; }, wallet: any) {
    // console.log(wallet);
    if (!wallet) {
      this.sharedService.showError('', 'Dear user, the wallet is missing');
      return false;
    } else if (!this.nodeService.getNodeSelected()) {
      this.sharedService.showError('', 'Please, select a node.');
      this.route.navigate([`/${AppConfig.routes.selectNode}`]);
      return false;
    } else if (!this.decrypt(common, wallet.accounts[0], wallet.accounts[0].algo, wallet.accounts[0].network)) {
      // Decrypt / generate and check primary
      return false;
    } else if (wallet.accounts[0].network === NetworkType.MAIN_NET && wallet.accounts[0].algo === 'pass:6k' && common.password.length < 40) {
      this.sharedService.showError('', 'Dear user, the wallet is missing');
    }

    this.use(wallet);
    return true;
  }


  /**
   *Set a wallet as current
   *
   * @param {*} wallet
   * @returns
   * @memberof WalletService
   */
  use(wallet: any) {
    // console.log('----------------> wallet', wallet)
    if (!wallet) {
      this.sharedService.showError('', 'You can not set anything like the current wallet');
      return false;
    }
    // console.log(wallet);
    this.network = wallet.accounts[0].network;
    // Account used
    this.currentAccount = wallet.accounts[0];
    // Algo of the wallet
    this.algo = wallet.accounts[0].algo;
    // console.log(this.algo);
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
        this.sharedService.showError('', 'Invalid password');
      }, 500);
      return false;
    }

    if (common.isHW) {
      return true;
    }

    if (!this.isPrivateKeyValid(common.privateKey) || !this.proximaxProvider.checkAddress(common.privateKey, net, acct.address)) {
      setTimeout(() => {
        this.sharedService.showError('', 'Invalid password');
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
      // console.error('Private key length must be 64 or 66 characters !');
      return false;
    } else if (!this.isHexadecimal(privateKey)) {
      // console.error('Private key must be hexadecimal only !');
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
   *
   *
   * @returns {Observable<AccountInfo>}
   * @memberof WalletService
   */
  getAccountInfoAsync(): Observable<AccountInfo> {
    return this.accountInfo$;
  }

  /**
   * Destroy account info
   *
   * @memberof WalletService
   */
  destroyAccountInfo() {
    this.accountInfo = undefined;
    this.accountInfoSubject.next(null);
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
    this.accountInfoSubject.next(accountInfo);
  }

}

export interface AccountsInterface {
  brain: boolean;
  algo: string;
  encrypted: string;
  iv: string;
  address: string;
  label: string;
  name: string;
  network: number;
}

export interface WalletAccountInterface {
  name: string,
  accounts: object;
}

export interface walletInterface {
  encrypted;
  iv;
}
