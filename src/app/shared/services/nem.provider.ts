import { Injectable } from '@angular/core';
import { Listener, Password, SimpleWallet, PublicAccount } from "nem2-sdk/dist";
import { crypto } from 'nem2-library';
import { environment } from '../../../environments/environment';
import { commonInterface, walletInterface } from '..';

@Injectable({
  providedIn: 'root'
})
export class NemProvider {
  websocketIsOpen = false;
  connectionWs: Listener;

  constructor() { }

  openConnectionWs() {
    this.websocketIsOpen = true;
    const listener = new Listener(environment.socket, WebSocket);
    return listener;
  }

  getConnectionWs() {
    if (!this.websocketIsOpen) {
      this.connectionWs = this.openConnectionWs();
      return this.connectionWs;
    }
    return this.connectionWs;
  }

 /**
  * Create account simple
  *
  * @param {string} user
  * @param {Password} password
  * @param {number} network
  * @returns {SimpleWallet}
  * @memberof NemProvider
  */
 createAccountSimple(user: string, password: Password, network: number): SimpleWallet{
    return SimpleWallet.create(user, password, network);
  }

  /**
   * Create account simple
   *
   * @param {string} nameWallet
   * @param {Password} password
   * @param {string} privateKey
   * @param {number} network
   * @returns {SimpleWallet}
   * @memberof NemProvider
   */
  createAccountFromPrivateKey(nameWallet: string, password: Password, privateKey: string, network:number): SimpleWallet{
    return SimpleWallet.createFromPrivateKey(nameWallet, password, privateKey, network);
  }

  /**
   * Create a password with at least 8 characters
   *
   * @param {string} value
   * @returns {Password}
   * @memberof NemProvider
   */
  createPassword(value: string): Password{
    const password = new Password(value);
    return password;
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


  /**
   * createPublicAccount
   * @param publicKey 
   * @param network 
   * @returns {PublicAccount}
   */
  createPublicAccount(publicKey, network): PublicAccount{
    return PublicAccount.createFromPublicKey(publicKey, network);
  }

}
