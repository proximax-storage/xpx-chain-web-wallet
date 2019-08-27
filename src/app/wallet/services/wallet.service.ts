import { Injectable } from '@angular/core';
import { SimpleWallet, PublicAccount, AccountInfo, MultisigAccountInfo } from 'tsjs-xpx-chain-sdk';
import { crypto } from 'js-xpx-chain-library';
import { AbstractControl } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { SharedService } from '../../shared/services/shared.service';
import { ProximaxProvider } from '../../shared/services/proximax.provider';


@Injectable({
  providedIn: 'root'
})
export class WalletService {

  accountWalletCreated: {
    data: any;
    dataAccount: AccountsInterface;
    wallet: SimpleWallet
  } = null;

  accountsInfo: AccountsInfoInterface[] = [];
  currentAccount: AccountsInterface = null;
  currentWallet: CurrentWalletInterface = null;


  currentAccountObs: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  currentAccountObs$: Observable<any> = this.currentAccountObs.asObservable();

  accountsInfoSubject: BehaviorSubject<AccountsInfoInterface[]> = new BehaviorSubject<AccountsInfoInterface[]>(null);
  accountsInfo$: Observable<AccountsInfoInterface[]> = this.accountsInfoSubject.asObservable();

  constructor(
    private sharedService: SharedService,
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
  buildAccount(data: any): AccountsInterface {
    return {
      algo: 'pass:bip32',
      address: data.address,
      brain: true,
      default: data.byDefault,
      encrypted: data.encrypted,
      firstAccount: data.firstAccount,
      iv: data.iv,
      name: data.nameAccount,
      network: data.network,
      publicAccount: data.publicAccount,
      isMultisign: null
    }
  }

  /**
   *
   *
   * @param {string} name
   * @memberof WalletService
   */
  changeAsPrimary(name: string) {
    const myAccounts: AccountsInterface[] = Object.assign(this.currentWallet.accounts);
    const othersWallet: CurrentWalletInterface[] = this.getWalletStorage().filter(
      (element: any) => {
        return element.name !== this.currentWallet.name;
      }
    );

    myAccounts.forEach((element: AccountsInterface) => {
      if (element.name === name) {
        element.default = true;
        this.setCurrentAccount$(element);
      } else {
        element.default = false;
      }
    });

    this.currentWallet.accounts = myAccounts;
    othersWallet.push({
      name: this.currentWallet.name,
      accounts: myAccounts
    });

    localStorage.setItem(environment.nameKeyWalletStorage, JSON.stringify(othersWallet));
  }

  /**
   *
   *
   * @param {string} oldName
   * @param {string} newName
   * @memberof WalletService
   */
  changeName(oldName: string, newName: string) {
    const myAccounts = Object.assign(this.currentWallet.accounts);
    const othersWallet = this.getWalletStorage().filter(
      (element: any) => {
        return element.name !== this.currentWallet.name;
      }
    );

    myAccounts.forEach(element => {
      if (element.name === oldName) {
        element.name = newName;
      }
    });

    this.currentWallet.accounts = myAccounts;
    othersWallet.push({
      name: this.currentWallet.name,
      accounts: myAccounts
    });

    localStorage.setItem(environment.nameKeyWalletStorage, JSON.stringify(othersWallet));
  }

  /**
*
*
* @param {string} name
* @param {string} isMultisig
* @memberof WalletService
*/
  changeIsMultiSign(name: string, isMultisig: MultisigAccountInfo) {
    const myAccounts: AccountsInterface[] = Object.assign(this.currentWallet.accounts);
    const othersWallet: CurrentWalletInterface[] = this.getWalletStorage().filter(
      (element: any) => {
        return element.name !== this.currentWallet.name;
      }
    );
    myAccounts.forEach((element: AccountsInterface) => {
      if (element.name === name) {
        element.isMultisign = isMultisig
        // this.setCurrentAccount$(element);
      }
    });

    this.currentWallet.accounts = myAccounts;
    othersWallet.push({
      name: this.currentWallet.name,
      accounts: myAccounts
    });

    localStorage.setItem(environment.nameKeyWalletStorage, JSON.stringify(othersWallet));
  }

  /**
   *
   *
   * @memberof WalletService
   */
  destroyAll() {
    // console.log('desteoty all');
    this.currentWallet = null;
    this.setCurrentAccount$(null);
    this.setAccountsInfo(null);
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

  decrypt(common: any, account: AccountsInterface = null) {
    const acct = (account) ? account : this.currentAccount;
    const net = (account) ? account.network : this.currentAccount.network;
    const alg = (account) ? account.algo : this.currentAccount.algo;
    if (!crypto.passwordToPrivatekey(common, acct, alg)) {
      this.sharedService.showError('', 'Invalid password');
      return false;
    }

    if (common.isHW) {
      return true;
    }

    if (!this.isPrivateKeyValid(common.privateKey) || !this.proximaxProvider.checkAddress(common.privateKey, net, acct.address)) {
      this.sharedService.showError('', 'Invalid password');
      return false;
    }

    return true;
  }

  /**
   * Destroy account info
   *
   * @memberof WalletService
   */
  destroyAccountInfo() {
    // this.accountInfo = undefined;
    // this.accountInfoSubject.next(null);
  }

  /**
   *
   *
   * @param {string} nameAccount
   * @returns
   * @memberof WalletService
   */
  filterAccountInfo(nameAccount?: string): AccountsInfoInterface {
    if (this.accountsInfo && this.accountsInfo.length > 0) {
      if (nameAccount) {
        // console.log('---nameAccount---', nameAccount);
        return this.accountsInfo.find(next => next.name === nameAccount);
      } else {
        return this.accountsInfo.find(next => next.name === this.currentAccount.name);
      }
    }
  }

  /**
  *
  *
  * @param {*} wallet
  * @returns
  * @memberof WalletService
  */
  getAccountDefault(wallet?: WalletAccountInterface): AccountsInterface {
    if (wallet) {
      return wallet.accounts.find(x => x.default === true);
    } else if (this.currentWallet && this.currentWallet.accounts.length > 0) {
      return this.currentWallet.accounts.find(x => x.default === true);
    }
  }

  /**
 *
 *
 * @returns {AccountsInfoInterface[]}
 * @memberof WalletService
 */
  getAccountsInfo(): AccountsInfoInterface[] {
    return this.accountsInfo;
  }

  /**
   *
   *
   * @returns {Observable<AccountsInfoInterface[]>}
   * @memberof WalletService
   */
  getAccountsInfo$(): Observable<AccountsInfoInterface[]> {
    return this.accountsInfo$;
  }

  /**
  *
  *
  * @returns {CurrentWalletInterface}
  * @memberof WalletService
  */
  getCurrentWallet(): CurrentWalletInterface {
    return this.currentWallet;
  }


  /**
   *
   *
   * @returns {AccountsInterface}
   * @memberof WalletService
   */
  getCurrentAccount(): AccountsInterface {
    return this.currentAccount;
  }

  /**
   *
   */
  getNameAccount$(): Observable<any> {
    return this.currentAccountObs$;
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
    const myAccounts = Object.assign(this.currentWallet.accounts);
    const othersWallet = this.getWalletStorage().filter(
      (element: any) => {
        return element.name !== this.currentWallet.name;
      }
    );

    myAccounts.push(accountsParams)
    this.currentWallet.accounts = myAccounts;
    othersWallet.push({
      name: this.currentWallet.name,
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
    this.accountWalletCreated = {
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
   * @memberof WalletService
   */
  setAccountsInfo(accountsInfo: AccountsInfoInterface[], pushed = false) {
    let accounts = (this.accountsInfo && this.accountsInfo.length > 0) ? this.accountsInfo.slice(0) : [];
    if (pushed) {
      for (let element of accountsInfo) {
        accounts = accounts.filter(x => x.name !== element.name);
        accounts.push(element);
      }
      this.accountsInfo = accounts;
    } else {
      this.accountsInfo = accountsInfo;
    }

    // console.log('accountinfo', this.accountsInfo);
    this.accountsInfoSubject.next(this.accountsInfo);
  }

  /**
   *
   *
   * @param {*} currentAccount
   * @memberof WalletService
   */
  setCurrentAccount$(currentAccount: AccountsInterface) {
    this.currentAccountObs.next(currentAccount);
  }

  /**
   *
   *
   * @returns
   * @memberof WalletService
   */
  validateNameAccount(nameWallet: string) {
    const nameAccount = nameWallet;
    const existAccount = Object.keys(this.currentWallet.accounts).find(elm => this.currentWallet.accounts[elm].name === nameAccount);
    if (existAccount !== undefined) {
      return true;
    } else {
      return false;
    }
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
   *Set a wallet as current
   *
   * @param {*} wallet
   * @returns
   * @memberof WalletService
   */
  use(wallet: any) {
    if (!wallet) {
      this.sharedService.showError('', 'You can not set anything like the current wallet');
      return false;
    }

    this.currentWallet = wallet;
    this.currentAccount = this.getAccountDefault(wallet);
    this.setCurrentAccount$(this.currentAccount);
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
   *
   *
   * @param {string} byName
   * @param {boolean} [byDefault=null]
   * @returns
   * @memberof WalletService
   */
  filterAccount(byName: string, byDefault: boolean = null): AccountsInterface {
    if (byDefault !== null && byName === '') {
      return this.currentWallet.accounts.find(elm => elm.default === true);
    } else {
      return this.currentWallet.accounts.find(elm => elm.name === byName);
    }
  }

  /**
   * Set account info
   *
   * @param {AccountInfo} accountInfo
   * @memberof WalletService
   */
  setAccountInfo(accountInfo: AccountInfo) {
    // this.accountInfo = accountInfo
    // this.accountInfoSubject.next(accountInfo);
  }

}

export interface CurrentWalletInterface {
  name: string;
  accounts: AccountsInterface[],
}


export interface AccountsInterface {
  address: any;
  algo: string;
  brain: boolean;
  default: boolean;
  encrypted: string;
  firstAccount: boolean;
  iv: string;
  name: string;
  network: number;
  publicAccount: PublicAccount;
  isMultisign: MultisigAccountInfo;
}


export interface AccountsInfoInterface {
  name: string;
  accountInfo: AccountInfo;
  multisigInfo: MultisigAccountInfo;
}

export interface WalletAccountInterface {
  name: string,
  accounts: AccountsInterface[];
}

export interface walletInterface {
  encrypted;
  iv;
}
