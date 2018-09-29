import { Injectable } from '@angular/core';
import { SimpleWallet, Password, NetworkType, Account, Address, EncryptedPrivateKey } from 'nem2-sdk';
import { crypto } from 'nem2-library';
import { SharedService } from './shared.service';
import { commonInterface, walletInterface } from '../interfaces/shared.interfaces';

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  currentAccount: string;
  network: any;
  algo: string;

  constructor(private sharedService: SharedService) { }

  public login(common, wallet) {
    if (!wallet) {
      this.sharedService.showError('Error', '¡Dear user, the wallet is missing!');
      return false;
    }
    // Decrypt / generate and check primary
    if (!this.decrypt(common, wallet.accounts[0], wallet.accounts[0].algo, wallet.accounts[0].network)) { return false; }

    if (wallet.accounts[0].network === NetworkType.MAIN_NET && wallet.accounts[0].algo === 'pass:6k' && common.password.length < 40) {
      this.sharedService.showError('Error', '¡Dear user, the wallet is missing!');
    }
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
      // this._mdboostrap.closeToastr();
      return true;
    }
    if (!this.isPrivateKeyValid(common.privateKey) || !this.checkAddress(common.privateKey, net, acct.address)) {
      //   this._mdboostrap.closeToastr();
      setTimeout(() => {
        this.sharedService.showError('Error', '¡Invalid password!');
      }, 500);
      return false;
    }
    // this._mdboostrap.closeToastr();
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
   * 
   * 
   * @param {any} str 
   * @returns 
   * @memberof WalletService
   */
  isHexadecimal(str) {
    return str.match('^(0x|0X)?[a-fA-F0-9]+$') !== null;
  }

  /**
    * Check if Address it is correct
    * @param privateKey privateKey
    * @param address address
    * @return checkAddress
    */
  checkAddress(privateKey: string, net: any, address: any): boolean {
    return (Account.createFromPrivateKey(privateKey, net).address.plain() === address) ? true : false;
  }


  /**
   * Decrypt and return private key
   * @param password 
   * @param encryptedKey 
   * @param iv 
   */
  decryptPrivateKey(password: Password, encryptedKey: string, iv): string {
    const common: commonInterface = {
      password: password.value,
      privateKey: ''
    };

    const wallet: walletInterface = {
      encrypted: encryptedKey,
      iv: iv,
    };
    
    crypto.passwordToPrivatekey(common, wallet, 'pass:bip32');
    return common.privateKey;
  }



}

