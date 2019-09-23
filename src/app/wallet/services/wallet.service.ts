import { Injectable } from '@angular/core';
import { SimpleWallet, PublicAccount, AccountInfo, MultisigAccountInfo, NamespaceId, MosaicId } from 'tsjs-xpx-chain-sdk';
import { crypto } from 'js-xpx-chain-library';
import { AbstractControl } from '@angular/forms';
import { BehaviorSubject, Observable, timer, Subject } from 'rxjs';

import { environment } from '../../../environments/environment';
import { SharedService } from '../../shared/services/shared.service';
import { ProximaxProvider } from '../../shared/services/proximax.provider';
import { first } from 'rxjs/operators';

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

  accountInfoNis1: any = null;
  accountSelectedWalletNis1: any = null;
  nis1AccountSeleted: any = null;
  nis1AccounsWallet: any = [];
  unconfirmedTransactions: any = [];

  currentAccountObs: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  currentAccountObs$: Observable<any> = this.currentAccountObs.asObservable();

  accountsInfoSubject: BehaviorSubject<AccountsInfoInterface[]> = new BehaviorSubject<AccountsInfoInterface[]>(null);
  accountsInfo$: Observable<AccountsInfoInterface[]> = this.accountsInfoSubject.asObservable();

  accountsPushedSubject: BehaviorSubject<AccountsInterface[]> = new BehaviorSubject<AccountsInterface[]>(null);
  accountsPushedSubject$: Observable<AccountsInterface[]> = this.accountsPushedSubject.asObservable();

  constructor(
    private sharedService: SharedService,
    private proximaxProvider: ProximaxProvider
  ) { }

  /**
   *
   * @param data
   */
  setAccountSelectedWalletNis1(account) {
    this.accountSelectedWalletNis1 = account;
  }

  /**
   *
   */
  getAccountSelectedWalletNis1() {
    return this.accountSelectedWalletNis1;
  }

  /**
  *
  * @param accounts
  * @param pushed
  */
  async searchAccountsInfo(accounts: AccountsInterface[]) {//: Promise<AccountsInfoInterface[]> {
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

            const newAccounts = this.changeIsMultiSign(element.name, isMultisig);
            if (newAccounts.length > 0) {
              console.log('=== NEW ACCOUNTS TO SEARCH ===', newAccounts);
              // Issue changes to new accounts
              this.setAccountsPushedSubject(newAccounts);
              // Delete the change of the new accounts
              this.setAccountsPushedSubject([]);
            }

            this.setAccountsInfo([accountInfoBuilded], true);
            counter = counter + 1;
            if (accounts.length === counter) {
              resolve({
                mosaicsId: mosaicsIds,
                accountsInfo: accountsInfo
              });
            }
          }, error => {
            const accountInfoBuilded = {
              name: element.name,
              accountInfo: null,
              multisigInfo: null
            };

            accountsInfo.push(accountInfoBuilded);
            this.setAccountsInfo([accountInfoBuilded], true);
            counter = counter + 1;
            if (accounts.length === counter) {
              resolve({
                mosaicsId: mosaicsIds,
                accountsInfo: accountsInfo
              });
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
   * @memberof WalletService
   */
  clearNis1AccounsWallet() {
    this.nis1AccounsWallet = [];
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

    this.accountsInfo.forEach(element => {
      if (element.name === oldName) {
        element.name = newName;
      }
    });

    if (this.currentAccount.name === oldName) {
      this.currentAccount.name = newName;
    }

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
    const newAccount = [];
    if (isMultisig) {
      // si es multifirma, preguntar
      if (isMultisig.multisigAccounts.length > 0) {
        const myAccounts = this.currentWallet.accounts;
        isMultisig.multisigAccounts.forEach(multisigAccount => {
          const exist = myAccounts.find(x => x.address === multisigAccount.address.plain());
          if (!exist) {
            const accountBuilded: AccountsInterface = this.buildAccount({
              address: multisigAccount.address.plain(),
              byDefault: false,
              encrypted: '',
              firstAccount: false,
              isMultisign: null,
              iv: '',
              network: multisigAccount.address.networkType,
              nameAccount: `MULTISIG-${multisigAccount.address.plain().slice(36, 40)}`,
              publicAccount: multisigAccount,
            });

            newAccount.push(accountBuilded);
            this.saveAccountWalletStorage(accountBuilded);
            /*this.proximaxProvider.getAccountInfo(multisigAccount.address).pipe(first()).subscribe(async (accountInfo: AccountInfo) => {
              const mosaicsIds: (NamespaceId | MosaicId)[] = [];
              if (accountInfo) {
                accountInfo.mosaics.map(n => n.id).forEach(id => {
                  const pushea = mosaicsIds.find(next => next.id.toHex() === id.toHex());
                  if (!pushea) {
                    mosaicsIds.push(id);
                  }
                });
              }

              try {
                accountBuilded.isMultisign = await this.proximaxProvider.getMultisigAccountInfo(multisigAccount.address).toPromise();
              } catch (error) {
                accountBuilded.isMultisign = null
              }

              const accountInfoBuilded = {
                name: accountBuilded.name,
                accountInfo: accountInfo,
                multisigInfo: accountBuilded.isMultisign
              };

            console.log('\n\n---ACOUNT BUILDED---', accountInfoBuilded);
              this.setAccountsInfo([accountInfoBuilded], true);
              this.saveAccountWalletStorage(accountBuilded);
            });*/
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
    return newAccount;
  }

  /**
   *
   *
   * @memberof WalletService
   */
  destroyDataWalletAccount() {
    this.currentWallet = null;
    this.setCurrentAccount$(null);
    this.setAccountsInfo(null);
  }

  /**
   *
   *
   * @param {*} common
   * @param {AccountsInterface} [account=null]
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

        // return this.accountsInfo.find(next => (next.accountInfo) ? next.accountInfo.address.pretty() === account : []);
        return found;
      }

      if (account) {
        return this.accountsInfo.find(next => next.name === account);
      }

      return this.accountsInfo.find(next => next.name === this.currentAccount.name);
    }

    return null;
  }

  /**
   *
   *
   * @param {string} byName
   * @param {boolean} [byDefault=null]
   * @returns
   * @memberof WalletService
   */
  filterAccountWallet(byName: string = '', byDefault: boolean = null, byAddress = ''): AccountsInterface {
    if (this.currentWallet && this.currentWallet.accounts && this.currentWallet.accounts.length > 0) {
      if (byDefault !== null && byName === '') {
        return this.currentWallet.accounts.find(elm => elm.default === true);
      } else if (byName !== '') {
        return this.currentWallet.accounts.find(elm => elm.name === byName);
      } else {
        return this.currentWallet.accounts.find(elm => this.proximaxProvider.createFromRawAddress(elm.address).pretty() === byAddress);
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
   * @param data
   */
  getAccountInfoNis1() {
    return this.accountInfoNis1;
  }


  /**
   *
   * @param data
   */
  getNis1AccountSelected() {
    return this.nis1AccountSeleted;
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
   *
   * @returns {Observable<any>}
   * @memberof WalletService
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
  getNis1AccounsWallet() {
    return this.nis1AccounsWallet;
  }

  /**
   *
   *
   * @returns
   * @memberof WalletService
   */
  getAccountsPushedSubject() {
    return this.accountsPushedSubject$;
  }


  /**
   *
   *
   * @returns
   * @memberof WalletService
   */
  getWalletStorage(): WalletAccountInterface[] {
    let walletsStorage = JSON.parse(localStorage.getItem(environment.nameKeyWalletStorage));
    if (walletsStorage === undefined || walletsStorage === null) {
      localStorage.setItem(environment.nameKeyWalletStorage, JSON.stringify([]));
      walletsStorage = JSON.parse(localStorage.getItem(environment.nameKeyWalletStorage));
    }
    return walletsStorage;
  }

  /**
   *
   */
  getUnconfirmedTransaction() {
    return this.unconfirmedTransactions;
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
   * @param {string} account
   * @memberof WalletService
   */
  removeAccountWallet(name: string) {
    const myAccounts: AccountsInterface[] = Object.assign(this.currentWallet.accounts);
    // console.log('=== myAccounts ===', myAccounts);
    const othersAccount = myAccounts.filter(x => x.name !== name);
    // console.log('==== othersAccount ====', othersAccount);
    this.currentWallet.accounts = othersAccount;
    // console.log('==== currentWallet ====', this.currentWallet);
    const accountsInfo = [];
    this.accountsInfo.filter(x => x.name !== name);
    this.setAccountsInfo(accountsInfo);
    this.saveAccountWalletStorage(null, this.currentWallet);
    this.validateMultisigAccount(this.currentWallet.accounts);
  }

  /**
   *
   *
   * @param {string} nameWallet
   * @param {*} accountsParams
   * @memberof WalletService
   */
  saveAccountWalletStorage(accountsParams: AccountsInterface, replaceWallet?: WalletAccountInterface) {
    const othersWallet = this.getWalletStorage().filter((element: WalletAccountInterface) => {
      return element.name !== this.currentWallet.name;
    });

    if (accountsParams) {
      const myAccounts = Object.assign(this.currentWallet.accounts);
      myAccounts.push(accountsParams)
      this.currentWallet.accounts = myAccounts;
      othersWallet.push({
        name: this.currentWallet.name,
        accounts: myAccounts
      });

      localStorage.setItem(environment.nameKeyWalletStorage, JSON.stringify(othersWallet));
    } else if (replaceWallet) {
      othersWallet.push(replaceWallet);
      // console.log('=== othersWallet === ', othersWallet);
      localStorage.setItem(environment.nameKeyWalletStorage, JSON.stringify(othersWallet));
    }
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
  saveWalletStorage(nameWallet: string, accountsParams: any, contacts?: any) {
    let walletsStorage = JSON.parse(localStorage.getItem(environment.nameKeyWalletStorage));
    walletsStorage.push({
      name: nameWallet,
      accounts: [accountsParams],
      book: contacts
    });

    localStorage.setItem(environment.nameKeyWalletStorage, JSON.stringify(walletsStorage));
  }


  /**
    *
    * @param data
    */
  setNis1AccountSelected(account: any) {
    this.nis1AccountSeleted = account;
  }


  /**
   *
   * @param data
   */
  setAccountInfoNis1(account: any) {
    this.accountInfoNis1 = account;
  }

  /**
   *
   *
   * @returns
   * @memberof WalletService
   */
  setAccountsPushedSubject(accountsInfo: AccountsInterface[]) {
    return this.accountsPushedSubject.next(accountsInfo);
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
   * @param data
   */
  setNis1AccounsWallet(account) {
    this.nis1AccounsWallet.push(account);
  }

  /**
   *
   * @param transactions
   */
  setUnconfirmedTransaction(transactions: any) {
    this.unconfirmedTransactions = transactions;
  }

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

  /**
   *
   *
   * @param {AccountsInfoInterface[]} accountsInfo
   * @param {AccountsInterface[]} accounts
   * @memberof WalletService
   */
  validateMultisigAccount(accounts: AccountsInterface[]) {
    // console.log('----LA DATA QUE RECIBO-----> ', accounts);
    const exist = accounts.filter(x => x.encrypted === '');
    if (exist) {
      exist.forEach(account => {
        let remove = true;
        // console.log('====account====', account);
        if (account.encrypted === '') {
          // console.log('PROCESO DE VERIFICACION');
          if (account.isMultisign !== null) {
            if (account.isMultisign.cosignatories.length > 0) {
              account.isMultisign.cosignatories.forEach(cosignatorie => {
                // console.log('==== COSIGNATARIOS ====', cosignatorie);
                const exist = this.filterAccountWallet('', null, cosignatorie.address.pretty());
                // console.log('==== EXISTE? ====', exist);
                if (exist) {
                  remove = false;
                }
              });
            }
          }
        } else {
          remove = false;
        }

        if (remove) {
          // console.log('==== REMOVER ====', account);
          this.removeAccountWallet(account.name);
        }
      });
    }
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
