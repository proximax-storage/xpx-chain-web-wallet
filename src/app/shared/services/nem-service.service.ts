import { Injectable } from "@angular/core";
import { environment } from 'src/environments/environment';
import {
  NEMLibrary,
  AccountHttp,
  Password,
  SimpleWallet,
  Address,
  AccountOwnedAssetService,
  AssetHttp,
  AssetTransferable,
  ServerConfig,
  Account,
  TransferTransaction,
  TimeWindow,
  PlainMessage,
  AssetId,
  TransactionHttp,
  MultisigTransaction,
  PublicAccount,
  Transaction
} from "nem-library";
import { Observable, Subscription } from 'rxjs';
import { timeout, first } from 'rxjs/operators';
import { WalletService } from 'src/app/wallet/services/wallet.service';
import { TransactionsService } from 'src/app/transactions/services/transactions.service';
import { AppConfig } from 'src/app/config/app.config';
import { HttpClient } from '@angular/common/http';
import * as js_joda_1 from 'js-joda';
@Injectable({
  providedIn: 'root'
})
export class NemServiceService {
  wallets: SimpleWallet[];
  accountHttp: AccountHttp;
  assetHttp: AssetHttp;
  transactionHttp: TransactionHttp;
  accountHt: AccountHttp;
  assetHt: AssetHttp;
  transactionHt: TransactionHttp;
  nodes: ServerConfig[];
  subscription: Subscription[] = [];

  /**
   * Start the connection to the NEM nodes
   * @param walletService
   * @param transactionService
   */
  constructor(
    private walletService: WalletService,
    private transactionService: TransactionsService,
    private http: HttpClient
  ) {
    //NEMLibrary.bootstrap(environment.nis1.networkType);
    this.nodes = environment.nis1.nodes;
    this.accountHttp = new AccountHttp(this.nodes);
    this.transactionHttp = new TransactionHttp(this.nodes);
    this.assetHttp = new AssetHttp(this.nodes);
  }


  /**
   *
   *
   * @param {Account} account
   * @param {string} name
   * @memberof NemServiceService
   */
  /*async getAccountInfoNis1(account: Account, name: string) {
    try {
      let cosignerOf: boolean = false;
      let cosignatoryOf: CosignatoryOf[] = [];
      const nis1AccountsMultisigInfo = [];
      const addressOwnedSwap = this.createAddressToString(account.address['value']);
      const accountInfoOwnedSwap = await this.getAccountInfo(addressOwnedSwap).pipe(first()).pipe((timeout(10000))).toPromise();
      // INFO ACCOUNTS MULTISIG
      if (accountInfoOwnedSwap['meta']['cosignatoryOf'].length > 0) {
        cosignerOf = true;
        cosignatoryOf = accountInfoOwnedSwap['meta']['cosignatoryOf'];
        console.log('cosignerAccountsInfo --->', cosignatoryOf)
        for (let multisig of cosignatoryOf) {
          try {
            const addressMultisig = this.createAddressToString(multisig.address);
            const ownedMosaic = await this.getOwnedMosaics(addressMultisig).pipe(first()).pipe((timeout(10000))).toPromise();
            console.log('ownedMosaic multisig ----> ', ownedMosaic);
            const xpxFound = ownedMosaic.find(el => el.assetId.namespaceId === 'prx' && el.assetId.name === 'xpx');
            if (xpxFound) {
              // Valida balance de las transacciones multifirma
              multisig.balance = await this.validateBalanceAccounts(xpxFound, addressMultisig);
              nis1AccountsMultisigInfo.push(multisig);
            }
          } catch (error) {
            console.log('ACCOUNT INFO MULTISIG ERROR 01---> ', error);
          }
        }
      }

      // SEARCH INFO OWNED SWAP
      try {
        console.log('nis1AccountsMultisigInfo --->', nis1AccountsMultisigInfo);
        const ownedMosaic = await this.getOwnedMosaics(addressOwnedSwap).pipe(first()).pipe((timeout(10000))).toPromise();
        const xpxFound = ownedMosaic.find(el => el.assetId.namespaceId === 'prx' && el.assetId.name === 'xpx');
        if (xpxFound) {
          // Valida balance de la cuenta que está haciendo el swap
          const balance = await this.validateBalanceAccounts(xpxFound, addressOwnedSwap);
          this.walletService.setNis1AccountsFound$({
            nameAccount: name,
            address: account.address,
            publicKey: account.publicKey,
            cosignerOf: cosignerOf,
            cosignerAccounts: cosignatoryOf,
            multisigAccountsInfo: nis1AccountsMultisigInfo,
            mosaic: xpxFound,
            isMultiSig: false,
            balance: balance
          });
        }else {
          this.walletService.setNis1AccountsFound$(null);
        }
      } catch (error) {
        console.log('----- OCURRIÓ UN ERROR 03-----', error);
        this.walletService.setNis1AccountsFound$(null);
      }
    } catch (error) {
      console.log('----- OCURRIÓ UN ERROR 02-----', error);
      this.walletService.setNis1AccountsFound$(null);
    }
  }*/

  /**
   * Method to search mosaics of address
   * @param {Address} address address of the mosaics sought
   * @memberof NemServiceService
   * @returns Observable<AssetTransferable[]>
   */
  getOwnedMosaics(address: Address): Observable<AssetTransferable[]> {
    const accountOwnedMosaics = new AccountOwnedAssetService(this.accountHttp, this.assetHttp);
    return accountOwnedMosaics.fromAddress(address);
  }









  unsuscribe() {
    this.subscription.forEach(subscription => {
      subscription.unsubscribe();
    });
  }

  /**
   * Formatter Amount
   * @param {number} amount
   * @param {AssetId} mosaic
   * @param manualDivisibility
   * @returns amountFormatter
   * @memberof NemServiceService
   */
  amountFormatter(amountParam: number, mosaic: AssetTransferable, manualDivisibility = 0) {
    const divisibility = (manualDivisibility === 0) ? manualDivisibility : mosaic.properties.divisibility;
    const amountDivisibility = Number(
      amountParam / Math.pow(10, divisibility)
    );

    const amountFormatter = amountDivisibility.toLocaleString("en-us", {
      minimumFractionDigits: divisibility
    });
    return amountFormatter;
  }

  /**
   * Method to anounce transaction
   * @param {TransferTransaction | MultisigTransaction} transferTransaction data of transfer transaction
   * @param {Account} cosignerAccount account of consigner
   * @memberof NemServiceService
   * @returns Observable
   */
  anounceTransaction(transaction: TransferTransaction | MultisigTransaction, cosignerAccount: Account) {
    const signedTransaction = cosignerAccount.signTransaction(transaction);
    return this.http.post(`${environment.nis1.url}/transaction/announce`, signedTransaction);
  }

  /**
   * Method to create an account from privatekey
   * @param {string} privateKey account privateKey
   * @memberof NemServiceService
   * @returns Account
   */
  createAccountPrivateKey(privateKey: string): Account {
    return Account.createWithPrivateKey(privateKey);
  }

  /**
   * Method to format Address
   * @param {string} address address account
   * @memberof NemServiceService
   * @returns Address
   */
  createAddressToString(address: string): Address {
    return new Address(address);
  }

  /**
   * Create Wallet from private key
   * @param walletName wallet idenitifier for app
   * @param password wallet's password
   * @param privateKey account privateKey
   * @param selected network
   * @memberof NemServiceService
   * @return Promise with wallet created
   */
  createPrivateKeyWallet(walletName: string, password: string, privateKey: string): SimpleWallet {
    return SimpleWallet.createWithPrivateKey(
      walletName,
      new Password(password),
      privateKey
    );
  }

  /**
   * Method to create public account
   * @param {string} publicKey
   * @memberof NemServiceService
   * @returns PublicAccount
   */
  createPublicAccount(publicKey: string): PublicAccount {
    return PublicAccount.createWithPublicKey(publicKey);
  }


  /**
   * Method to create transaction
   * @param {PlainMessage} message Transfer transaction message
   * @param {AssetId} assetId Mosaics transferable
   * @param {number} quantity quantity of mosaics to transfer
   * @memberof NemServiceService
   * @returns TransferTransaction
   */
  async createTransaction(message: PlainMessage, assetId: AssetId, quantity: number) {
    const resultAssets = await this.assetHttp.getAssetTransferableWithRelativeAmount(assetId, quantity).toPromise();
    return TransferTransaction.createWithAssets(
      this.createWithDeadline(),
      new Address(environment.nis1.address),
      [resultAssets],
      message
    );
  }

  /**
   * Method to anounce transaction
   * @param transaction data of transfer transaction
   * @param publicAccounMulti account of consigner
   * @param cosignerAccount account of consigner
   * @memberof NemServiceService
   * @returns Observable
   */
  async createTransactionMultisign(transaction: TransferTransaction, publicAccounMulti: PublicAccount) {
    return MultisigTransaction.create(
      this.createWithDeadline(),
      transaction,
      publicAccounMulti
    );
  }

  /**
   * Method to calculate the deadline
   * @param deadline
   * @param chronoUnit
   * @memberof NemServiceService
   * @returns TimeWindow
   */
  createWithDeadline(deadline = 2, chronoUnit = js_joda_1.ChronoUnit.HOURS): TimeWindow {
    const currentTimeStamp = (new Date()).getTime() - 600000;
    const timeStampDateTime = js_joda_1.LocalDateTime.ofInstant(js_joda_1.Instant.ofEpochMilli(currentTimeStamp), js_joda_1.ZoneId.SYSTEM);
    const deadlineDateTime = timeStampDateTime.plus(deadline, chronoUnit);
    if (deadline <= 0) {
      throw new Error("deadline should be greater than 0");
    }
    else if (timeStampDateTime.plus(24, js_joda_1.ChronoUnit.HOURS).compareTo(deadlineDateTime) != 1) {
      throw new Error("deadline should be less than 24 hours");
    }
    return new TimeWindow(timeStampDateTime, deadlineDateTime);
  }

  /**
   * Method to get Account Info Address
   * @param address account address
   * @memberof NemServiceService
   * @return
   */
  getAccountInfo(address: Address) {
    return this.http.get(`${environment.nis1.url}/account/get?address=${address.plain()}`);
  }


  /**
   * Method to get Account Info Address
   * @param address account address
   * @memberof NemServiceService
   */
  async getAccountsInfoAccountNew(account: any, name: string) {
    const address = this.createAddressToString(account.address.value);
    try {
      const infoMultisig = [];
      const accountInfo = await this.getAccountInfo(address).pipe(first()).pipe((timeout(10000))).toPromise();
      console.log('GET ACCOUNT INFO NIS1 --->', accountInfo);
      let cosignerOf: boolean = false;
      let cosignerAccountsInfo: CosignatoryOf[] = [];
      if (accountInfo['meta']['cosignatoryOf'].length > 0) {
        cosignerOf = true;
        cosignerAccountsInfo = accountInfo['meta']['cosignatoryOf'];
        try {
          for (let multisig of cosignerAccountsInfo) {
            const addressMultisig = this.createAddressToString(multisig.address);
            //const accountInfoMultisig = await this.getAccountInfo(addressMultisig).pipe(first()).pipe((timeout(10000))).toPromise();
            const ownedMosaic = await this.getOwnedMosaics(addressMultisig).pipe(first()).pipe((timeout(10000))).toPromise();
            console.log('ownedMosaic multisig ----> ', ownedMosaic);
            const xpxFound = ownedMosaic.find(el => el.assetId.namespaceId === 'prx' && el.assetId.name === 'xpx');
            if (xpxFound) {
              const balance = await this.validateBalanceAccounts(xpxFound, addressMultisig);
              console.log('Balance Multisig --->', balance);
            } else {
              // this.walletService.setNis1AccountsWallet$(null);
            }
          }

          console.log('ACCOUNT INFO MULTISIG ---> ', infoMultisig);
        } catch (error) {
          console.log('ACCOUNT INFO MULTISIG ERROR---> ', error);
        }
      }

      const ownedMosaic = await this.getOwnedMosaics(address).pipe(first()).pipe((timeout(10000))).toPromise();
      console.log('ownedMosaic multisig ----> ', ownedMosaic);
      const xpxFound = ownedMosaic.find(el => el.assetId.namespaceId === 'prx' && el.assetId.name === 'xpx');
      if (xpxFound) {
        const balance = await this.validateBalanceAccounts(xpxFound, address);
        console.log('Balance Multisig --->', balance);
        const accountNis1 = {
          nameAccount: name,
          address: account.address,
          publicKey: account.publicKey,
          consignerOf: cosignerOf,
          consignerAccounts: cosignerAccountsInfo,
          mosaic: xpxFound,
          multiSign: false,
          balance: balance,
          route: `/${AppConfig.routes.viewAllAccount}`
        }

        const accounts = this.walletService.getNis1AccountsWallet();
        console.log('accounts ----------->', accounts);
        console.log('accountNis1 ----------->', accountNis1);
        accounts.push(accountNis1);
        this.walletService.setNis1AccountsWallet$(accounts);
        this.walletService.setNis1AccounsWallet(accountNis1);
      } else {
        this.walletService.setNis1AccountsWallet$(null);
      }
    } catch (error) {
      console.log('----- OCURRIÓ UN ERROR 01-----', error);
      const accountNis1 = {
        nameAccount: name,
        address: account.address,
        publicKey: account.publicKey,
        consignerOf: false,
        consignerAccounts: [],
        mosaic: null,
        multiSign: false,
        balance: '0.000000',
        route: `/${AppConfig.routes.viewAllAccount}`
      }

      const accounts = this.walletService.getNis1AccountsWallet();
      accounts.push(accountNis1);
      this.walletService.setNis1AccountsWallet$(accounts);
      this.walletService.setNis1AccounsWallet(accountNis1);
    }
  }

  /**
   *
   *
   * @param {AssetTransferable} xpxFound
   * @param {Address} addressMultisig
   * @returns
   * @memberof NemServiceService
   */
  async validateBalanceAccounts(xpxFound: AssetTransferable, addressMultisig: Address) {
    console.log('addressMultisig ---> ', addressMultisig);
    const quantityFillZeros = this.transactionService.addZeros(xpxFound.properties.divisibility, xpxFound.quantity);
    const realQuantity: any = this.amountFormatter(quantityFillZeros, xpxFound, xpxFound.properties.divisibility);
    const transactions = await this.getUnconfirmedTransaction(addressMultisig);
    console.log('transactions multisig ----> ', transactions);
    if (transactions.length > 0) {
      let relativeAmount = realQuantity;
      for (const item of transactions) {
        if (item.type === 257 && item['signer']['address']['value'] === addressMultisig['value']) {
          if (item['_assets'].length > 0) {
            const existMosaic = item['_assets'].find(mosaic => mosaic.assetId.namespaceId === 'prx' && mosaic.assetId.name === 'xpx');
            if (existMosaic) {
              const quantity = parseFloat(this.amountFormatter(existMosaic.quantity, xpxFound, xpxFound.properties.divisibility));
              const quantitywhitoutFormat = relativeAmount.split(',').join('');
              const quantityFormat = this.amountFormatter(parseInt((quantitywhitoutFormat - quantity).toString().split('.').join('')), xpxFound, xpxFound.properties.divisibility);
              relativeAmount = quantityFormat;
            }
          }
        }
      }

      return relativeAmount;
    } else {
      return realQuantity;
    }
  }


  dos(address, account) {
    this.getAccountInfo(address).pipe(first()).pipe((timeout(10000))).subscribe(async next => {
      console.log('GET ACCOUNT INFO NIS1 --->', next);
      let consignerOf: boolean = false;
      let consignerAccountsInfo: any = [];

      this.getOwnedMosaics(address).pipe(first()).pipe((timeout(10000))).subscribe(async next => {
        console.log('GET OWNED MOSAIC NIS1 --->', next);
        const xpxFound = next.find(el => el.assetId.namespaceId === 'prx' && el.assetId.name === 'xpx');
        console.log('XPX IS FOUND?? ---> ', xpxFound);
        if (xpxFound) {
          const quantityFillZeros = this.transactionService.addZeros(xpxFound.properties.divisibility, xpxFound.quantity);
          const realQuantity: any = this.amountFormatter(quantityFillZeros, xpxFound, xpxFound.properties.divisibility);
          const transactions = await this.getUnconfirmedTransaction(account.address);
          let balance = 0;
          if (transactions.length > 0) {
            let relativeAmount = realQuantity;
            for (const item of transactions) {
              if (item.type === 257 && item['signer']['address']['value'] === address['value']) {
                for (const mosaic of item['_assets']) {
                  if (mosaic.assetId.namespaceId === 'prx' && mosaic.assetId.name === 'xpx') {
                    const quantity = parseFloat(this.amountFormatter(mosaic.quantity, xpxFound, xpxFound.properties.divisibility));
                    const quantitywhitoutFormat = relativeAmount.split(',').join('');
                    const quantityFormat = this.amountFormatter(parseInt((quantitywhitoutFormat - quantity).toString().split('.').join('')), xpxFound, xpxFound.properties.divisibility);
                    relativeAmount = quantityFormat;
                  }
                }
              }
            }

            balance = relativeAmount;
          } else {
            balance = realQuantity;
          }

          const accountNis1 = {
            nameAccount: name,
            address: account.address,
            publicKey: account.publicKey,
            consignerOf: consignerOf,
            consignerAccounts: consignerAccountsInfo,
            mosaic: xpxFound,
            multiSign: false,
            balance: balance,
            route: `/${AppConfig.routes.viewAllAccount}`
          }

          const accounts = this.walletService.getNis1AccountsWallet();
          accounts.push(accountNis1);
          this.walletService.setNis1AccountsWallet$(accounts);
          this.walletService.setNis1AccounsWallet(accountNis1);
        } else {
          // DOES NOT HAVE XPX
          // this.walletService.setNis1AccountsWallet$(null);
        }
      }, async error => {
        const accountNis1 = {
          nameAccount: name,
          address: account.address,
          publicKey: account.publicKey,
          consignerOf: consignerOf,
          consignerAccounts: consignerAccountsInfo,
          mosaic: null,
          multiSign: false,
          balance: '0.000000',
          route: `/${AppConfig.routes.viewAllAccount}`
        };

        const accounts = this.walletService.getNis1AccountsWallet();
        accounts.push(accountNis1);
        this.walletService.setNis1AccountsWallet$(accounts);
        this.walletService.setNis1AccounsWallet(accountNis1);
      });
    })

    /* console.log('SIGUIÓ DIRECTO!');
     this.getOwnedMosaics(address).pipe(first()).pipe((timeout(10000))).subscribe(async next => {
       console.log('GET OWNED MOSAIC NIS1 --->', next);
       const xpxFound = next.find(el => el.assetId.namespaceId === 'prx' && el.assetId.name === 'xpx');
       console.log('XPX IS FOUND?? ---> ', xpxFound);
       if (xpxFound) {
         const quantityFillZeros = this.transactionService.addZeros(xpxFound.properties.divisibility, xpxFound.quantity);
         const realQuantity: any = this.amountFormatter(quantityFillZeros, xpxFound, xpxFound.properties.divisibility);
         const transactions = await this.getUnconfirmedTransaction(account.address);
         let balance = 0;
         if (transactions.length > 0) {
           let relativeAmount = realQuantity;
           for (const item of transactions) {
             if (item.type === 257 && item['signer']['address']['value'] === address['value']) {
               for (const mosaic of item['_assets']) {
                 if (mosaic.assetId.namespaceId === 'prx' && mosaic.assetId.name === 'xpx') {
                   const quantity = parseFloat(this.amountFormatter(mosaic.quantity, xpxFound, xpxFound.properties.divisibility));
                   const quantitywhitoutFormat = relativeAmount.split(',').join('');
                   const quantityFormat = this.amountFormatter(parseInt((quantitywhitoutFormat - quantity).toString().split('.').join('')), xpxFound, xpxFound.properties.divisibility);
                   relativeAmount = quantityFormat;
                 }
               }
             }
           }

           balance = relativeAmount;
         } else {
           balance = realQuantity;
         }

         const accountNis1 = {
           nameAccount: name,
           address: account.address,
           publicKey: account.publicKey,
           consignerOf: consignerOf,
           consignerAccounts: consignerAccountsInfo,
           mosaic: xpxFound,
           multiSign: false,
           balance: balance,
           route: `/${AppConfig.routes.viewAllAccount}`
         }

         const accounts = this.walletService.getNis1AccountsWallet();
         accounts.push(accountNis1);
         this.walletService.setNis1AccountsWallet$(accounts);
         this.walletService.setNis1AccounsWallet(accountNis1);
       } else {
         // DOES NOT HAVE XPX
         this.walletService.setNis1AccountsWallet$(null);
       }
     }, async error => {
       const accountNis1 = {
         nameAccount: name,
         address: account.address,
         publicKey: account.publicKey,
         consignerOf: consignerOf,
         consignerAccounts: consignerAccountsInfo,
         mosaic: null,
         multiSign: false,
         balance: '0.000000',
         route: `/${AppConfig.routes.viewAllAccount}`
       };

       const accounts = this.walletService.getNis1AccountsWallet();
       accounts.push(accountNis1);
       this.walletService.setNis1AccountsWallet$(accounts);
       this.walletService.setNis1AccounsWallet(accountNis1);
     });
   }, async error => {
     const accountNis1 = {
       nameAccount: name,
       address: account.address,
       publicKey: account.publicKey,
       consignerOf: false,
       consignerAccounts: [],
       mosaic: null,
       multiSign: false,
       balance: '0.000000',
       route: `/${AppConfig.routes.viewAllAccount}`
     }

     const accounts = this.walletService.getNis1AccountsWallet();
     accounts.push(accountNis1);
     this.walletService.setNis1AccountsWallet$(accounts);
     this.walletService.setNis1AccounsWallet(accountNis1);
   })*/
  }



  /**
   * Method to get Unconfirmed transactions of an account
   * @param address
   * @memberof NemServiceService
   * @returns Observable<Transaction[]>
   */
  getUnconfirmedTransaction(address: Address): Promise<Transaction[]> {
    return this.accountHttp.unconfirmedTransactions(address).toPromise();
  }

  /**
   *
   *
   * @param {*} account
   * @memberof NemServiceService
   */
  getAccountInfoMultisig(account) {
    const address = this.createAddressToString(account.address.value);
    this.getAccountInfo(address).pipe(first()).pipe((timeout(10000))).subscribe(next => {

    });
  }
}


export interface CosignatoryOf {
  address: string;
  balance: number;
  harvestedBlocks: number;
  importance: number;
  label: any;
  multisigInfo: {
    cosignatoriesCount: number;
    minCosignatories: number;
  },
  publicKey: string;
  vestedBalance: number;
}
