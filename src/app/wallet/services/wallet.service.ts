import { Injectable } from '@angular/core';
import { SimpleWallet, PublicAccount, AccountInfo, MultisigAccountInfo, NamespaceId, MosaicId } from 'tsjs-xpx-chain-sdk';
import { crypto } from 'js-xpx-chain-library';
import { AbstractControl } from '@angular/forms';
import { BehaviorSubject, Observable, timer } from 'rxjs';

import { environment } from '../../../environments/environment';
import { SharedService } from '../../shared/services/shared.service';
import { ProximaxProvider } from '../../shared/services/proximax.provider';
import { first } from 'rxjs/operators';
import { resolve } from 'q';


@Injectable({
  providedIn: 'root'
})
export class WalletService {
  canVote = true;
  subscribeLogged = undefined;
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
      isMultisign: null,
      nis1Account: data.nis1Account
    }
  }

  /**
   *
   *
   * @memberof WalletService
   */
  countTimeVote() {
    this.canVote = false;
    let t = timer(1, 1000);
    this.subscribeLogged = t.subscribe(t => {
      if (t >= 20) {
        this.canVote = true;
        this.subscribeLogged.unsubscribe();
      } else {
        this.canVote = false;
      }
    });
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
  changeIsMultiSign(name: string, isMultisig: MultisigAccountInfo, publicAccount: PublicAccount) {
    if (isMultisig) {
      // si es multifirma, preguntar
      if (isMultisig.multisigAccounts.length > 0) {
        const myAccounts = this.currentWallet.accounts;
        isMultisig.multisigAccounts.forEach(element => {
          const exist = myAccounts.find(x => x.address === element.address.plain());
          if (!exist) {
            console.log('ESTA CUENTA NO EXISTE ===> ', element, '\n\n\n\n\n\n');
            const accountBuilded: AccountsInterface = this.buildAccount({
              address: element.address.plain(),
              byDefault: false,
              encrypted: '',
              firstAccount: false,
              isMultisign: isMultisig,
              iv: '',
              network: element.address.networkType,
              nameAccount: `MULTIFIRMA-${element.address.plain().slice(36, 40)}`,
              publicAccount: publicAccount,
            });

            console.log('\n\n---ACOUNT BUILDED---', accountBuilded);
            this.saveAccountStorage(accountBuilded);
          }
        });
      }
    }

    const myAccounts: AccountsInterface[] = Object.assign(this.currentWallet.accounts);
    const othersWallet: CurrentWalletInterface[] = this.getWalletStorage().filter(
      (element: any) => {
        return element.name !== this.currentWallet.name;
      }
    );

    myAccounts.forEach((element: AccountsInterface) => {
      if (element.name === name) {
        element.isMultisign = isMultisig
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
  filterAccountInfo(account?: string, byAddress?: boolean): AccountsInfoInterface {
    if (this.accountsInfo && this.accountsInfo.length > 0) {
      if (byAddress) {
        let found = null;
        this.accountsInfo.forEach(element => {
          if (element.accountInfo) {
            if (element.accountInfo.address.pretty() === account) {
              found = element;
            }
          }
        });

        return found;
        // return this.accountsInfo.find(next => (next.accountInfo) ? next.accountInfo.address.pretty() === account : []);
      }

      if (account) {
        return this.accountsInfo.find(next => next.name === account);
      } else {
        return this.accountsInfo.find(next => next.name === this.currentAccount.name);
      }
    }

    return null;
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
  saveAccountStorage(accountsParams: AccountsInterface) {
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
   * @param accounts
   * @param pushed
   */
  async searchAccountsInfo(accounts: AccountsInterface[], pushed = false) {//: Promise<AccountsInfoInterface[]> {
    let counter = 0;
    const mosaicsIds: (NamespaceId | MosaicId)[] = [];
    const accountsInfo: AccountsInfoInterface[] = [];
    const promise = new Promise(async (resolve, reject) => {
      accounts.forEach((element, i) => {
        this.proximaxProvider.getAccountInfo(this.proximaxProvider.createFromRawAddress(element.address)).pipe(first()).subscribe(
          async accountInfo => {
            if (accountInfo) {
              accountInfo.mosaics.map(n => n.id).forEach(id => {
                const pushea = mosaicsIds.find(next => next.id.toHex() === id.toHex());
                if (!pushea) {
                  mosaicsIds.push(id);
                }
              });
            }

            // this.mosaicServices.searchMosaics(mosaicsIds);
            let isMultisig: MultisigAccountInfo = null;
            try {
              isMultisig = await this.proximaxProvider.getMultisigAccountInfo(this.proximaxProvider.createFromRawAddress(element.address)).toPromise();
            } catch (error) {
              isMultisig = null
            }
            const accountInfoBuilded = {
              name: element.name,
              accountInfo: accountInfo,
              multisigInfo: isMultisig
            };

            accountsInfo.push(accountInfoBuilded);
            const publicAccount = this.proximaxProvider.createPublicAccount(element.publicAccount.publicKey, element.publicAccount.address.networkType);
            this.changeIsMultiSign(element.name, isMultisig, publicAccount)
            this.setAccountsInfo([accountInfoBuilded], true);
            counter = counter + 1;
            if (accounts.length === counter && mosaicsIds.length > 0) {
              resolve({
                mosaicsId: mosaicsIds,
                accountsInfo: accountsInfo
              });
            }
          }, error => {
            const accountsInfo = [{
              name: element.name,
              accountInfo: null,
              multisigInfo: null
            }];

            this.setAccountsInfo(accountsInfo, true);

            counter = counter + 1;
            if (accounts.length === counter && mosaicsIds.length > 0) {
              resolve(mosaicsIds);
            }
          }
        );
      });
    });

    return await promise;
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
  filterAccount(byName: string = '', byDefault: boolean = null, byAddress = ''): AccountsInterface {
    if (byDefault !== null && byName === '') {
      return this.currentWallet.accounts.find(elm => elm.default === true);
    } else if (byName !== '') {
      return this.currentWallet.accounts.find(elm => elm.name === byName);
    } else {
      return this.currentWallet.accounts.find(elm => this.proximaxProvider.createFromRawAddress(elm.address).pretty() === byAddress);
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
  nis1Account: any;
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
