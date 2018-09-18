import { Injectable } from '@angular/core';
import { SimpleWallet, Password, NetworkType, Account, Address } from 'nem2-sdk';
import { crypto } from 'nem2-library';
@Injectable({
  providedIn: 'root'
})
export class WalletService {
  currentAccount: string;
  network: any;
  algo: string;

  constructor() { }

  public login(common, wallet) {
    if (!wallet) {
      // this._mdboostrap.showToastr('4', this.genericMessage.error, this.genericMessage.alertWallt2);
      console.error('¡Estimado usuario, le falta la wallet.!');
      return false;
    }
    // Decrypt / generate and check primary
    if (!this.decrypt(common, wallet.accounts[0], wallet.accounts[0].algo, wallet.accounts[0].network)) { return false; }

    if (wallet.accounts[0].network === NetworkType.MAIN_NET && wallet.accounts[0].algo === 'pass:6k' && common.password.length < 40) {
      console.log('Tu cartera parece débil');
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

  public decrypt(common: any, account: any = '', algo: any = '', network: any = '') {
    const acct = account || this.currentAccount;
    const net = network || this.network;
    const alg = algo || this.algo;
    // Try to generate or decrypt key
    if (!crypto.passwordToPrivatekey(common, acct, alg)) {
      // this._mdboostrap.closeToastr();
      setTimeout(() => {
        console.log('contraseña invalida');
        // this._mdboostrap.showToastr('4', this.genericMessage.error, this.genericMessage.invalidpassword);
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
        // this._mdboostrap.showToastr('4', this.genericMessage.error, this.genericMessage.invalidpassword);
        console.log('contraseña invalida');
      }, 500);
      return false;
    }
    // this._mdboostrap.closeToastr();
    return true;
  }
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
}

