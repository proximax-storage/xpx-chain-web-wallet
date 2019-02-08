import { Injectable } from '@angular/core';
import { first } from "rxjs/operators";
import { Listener, MosaicInfo } from "proximax-nem2-sdk";
import { WalletService } from "./wallet.service";
import { TransactionsService } from "../../transactions/service/transactions.service";
import { environment } from '../../../environments/environment';
import { NemProvider } from './nem.provider';
import { ProximaxProvider } from './proximax.provider';
import { NodeService } from '../../servicesModule/services/node.service';
import { SharedService } from './shared.service';

@Injectable({
  providedIn: 'root'
})
export class DataBridgeService {

  url: any
  connector: Listener;
  constructor(
    private walletService: WalletService,
    private transactionsService: TransactionsService,
    private nemProvider: NemProvider,
    private proximaxProvider: ProximaxProvider,
    private nodeService: NodeService,
    private sharedService: SharedService,
  ) { }


  /**
   * Connect to websocket
   *
   * @param {string} node
   * @returns
   * @memberof DataBridgeService
   */
  connectnWs(node?: string) {
    console.log("Connect to websocket");
    const route = (node === undefined) ? this.nodeService.getNodeSelected() : node;
    this.url = `${environment.protocolWs}://${route}`;
    console.log(this.url);
    this.connector = new Listener(this.url, WebSocket);
    // Try to open the connection
    this.openConnection(this.connector);
    return;
  }

  /**
   * Close connection websocket
   *
   * @memberof DataBridgeService
   */
  closeConenection() {
    this.transactionsService.destroyAllTransactions();
    if (this.connector !== undefined) {
      this.connector.close();
    }
  }


  /**
   * Destroy unconfirmed transaction
   *
   * @param {*} element
   * @memberof DataBridgeService
   */
  destroyUnconfirmedTransaction(element) {
    this.transactionsService.getTransactionsUnconfirmedCache$().pipe(first()).subscribe(
      response => {
        if (response.length > 0) {
          let allTransactionUnConfirmed = response;
          let unconfirmed = [];
          for (const elementUnconfirmed of allTransactionUnConfirmed) {
            if (elementUnconfirmed.transactionInfo.hash !== element.transactionInfo.hash) {
              unconfirmed.unshift(element);
            }
          }
          this.transactionsService.setTransactionsUnconfirmed$(unconfirmed);
        }
      });
  }


  /**
   * Open websocket connection
   *
   * @param {*} connector
   * @memberof DataBridgeService
   */
  openConnection(connector: Listener) {
    connector.open().then(() => {
      console.log("aqui abre una nueva conexión");
      const audio = new Audio('assets/audio/ding2.ogg');
      this.getTransactionsConfirmedSocket(connector, audio);
      this.getTransactionsUnConfirmedSocket(connector, audio);
      this.getStatusSocket(connector, audio);
    }, (error) => {
      console.error("errroooor de soquer", error);
      this.reconnect(connector);
    });
  }


  /**
   * Get the confirmed transactions from the socket
   *
   * @param {Listener} connector
   * @param {HTMLAudioElement} audio
   * @memberof DataBridgeService
   */
  getTransactionsConfirmedSocket(connector: Listener, audio: HTMLAudioElement) {
    connector.confirmed(this.walletService.address).subscribe(incomingTransaction => {
      console.log("Transacciones confirmadas entrantes", incomingTransaction);
      this.transactionsService.getConfirmedTransactionsCache$().pipe(first()).subscribe(
        async allTransactionConfirmed => {
          const transactionPushed = allTransactionConfirmed.slice(0);
          const response = await this.transactionsService.buildTransactions([incomingTransaction]);
          response.forEach(element => {
            audio.play();
            transactionPushed.unshift(element);
            this.transactionsService.setConfirmedTransaction$(transactionPushed);
            this.destroyUnconfirmedTransaction(element);
          });
        });
    }, err => {
      console.error(err)
    });
  }


  /**
   * Get the unconfirmed transactions from the socket
   *
   * @param {Listener} connector
   * @param {HTMLAudioElement} audio
   * @memberof DataBridgeService
   */
  getTransactionsUnConfirmedSocket(connector: Listener, audio: HTMLAudioElement) {
    //Get transactions unconfirmed
    connector.unconfirmedAdded(this.walletService.address).subscribe(transaction => {
      this.transactionsService.getTransactionsUnconfirmedCache$().pipe(first()).subscribe(
        async transactionsUnconfirmed => {
          console.log("transactionsUnconfirmed", transactionsUnconfirmed);
          const transactionsUnconfirmedCopy = transactionsUnconfirmed.slice(0);
          const response = await this.transactionsService.buildTransactions([transaction]);
          response.forEach(element => {
            audio.play();
            transactionsUnconfirmedCopy.unshift(element);
            this.transactionsService.setTransactionsUnconfirmed$(transactionsUnconfirmedCopy);
          });
        }, err => {
          console.error(err);
        });
    });
  }

  /**
   * Get the status from the socket
   *
   * @param {Listener} connector
   * @param {HTMLAudioElement} audio
   * @memberof DataBridgeService
   */
  getStatusSocket(connector: Listener, audio: HTMLAudioElement) {
    console.log("Estableciendo conexión con status");
    connector.status(this.walletService.address).subscribe(res => {
      console.log("Status::::: ", res);
      this.sharedService.showWarning('Warning', res.status)
    }, err => {
      this.sharedService.showError('Error', err);
      console.error("err::::::", err)
    });
  }


  /**
   * Reconnect
   *
   * @param {Listener} connector
   * @returns
   * @memberof DataBridgeService
   */
  reconnect(connector: Listener) {
    // Close connector
    connector.close();
    this.openConnection(connector);
    return;
  }

  /**
   *  reconnection to the  websodestroyUnconfirmedTransaction(element) {
    this.transactionsService.getTransactionsUnconfirmedCache$().pipe(first()).subscribe(
      response => {
        if (response.length > 0) {
          let allTransactionUnConfirmed = response;
          let unconfirmed = [];
          for (const elementUnconfirmed of allTransactionUnConfirmed) {
            if (elementUnconfirmed.transactionInfo.hash !== element.transactionInfo.hash) {
              unconfirmed.unshift(element);
            }
          }
          this.transactionsService.setTransactionsUnconfirmed$(unconfirmed);
        }
      });
  }
   *
   * @param {*} connector
   * @returns
   * @memberof DataBridgeServicedestroyUnconfirmedTransaction(element) {
    this.transactionsService.getTransactionsUnconfirmedCache$().pipe(first()).subscribe(
      response => {
        if (response.length > 0) {
          let allTransactionUnConfirmed = response;
          let unconfirmed = [];
          for (const elementUnconfirmed of allTransactionUnConfirmed) {
            if (elementUnconfirmed.transactionInfo.hash !== element.transactionInfo.hash) {
              unconfirmed.unshift(element);
            }
          }
          this.transactionsService.setTransactionsUnconfirmed$(unconfirmed);
        }
      });
  }
   */



}
