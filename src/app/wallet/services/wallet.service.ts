import { Injectable } from '@angular/core';
import { Router } from "@angular/router";
import { SimpleWallet } from 'tsjs-xpx-chain-sdk';
import { AbstractControl } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { SharedService } from '../../shared/services/shared.service';


@Injectable({
  providedIn: 'root'
})
export class WalletService {

  algo: any = {};

  constructor(
    private sharedService: SharedService,
    private route: Router
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
   * @param {AccountsInterface} dataAccount
   * @param {SimpleWallet} wallet
   * @memberof WalletService
   */
  saveDataWalletCreated(nameWallet: string, dataAccount: AccountsInterface, wallet: SimpleWallet) {
    this.algo = {
      name: nameWallet,
      account: dataAccount,
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
  saveAccountStorage(user: string, accounts: any) {
    let walletsStorage = JSON.parse(localStorage.getItem(environment.nameKeyWalletStorage));
    walletsStorage.push({ name: user, accounts: { '0': accounts } });
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


  /**********************************************************/


}

export interface AccountsInterface {
  brain: boolean;
  algo: string;
  encrypted: string;
  iv: string;
  address: string;
  label: string;
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
