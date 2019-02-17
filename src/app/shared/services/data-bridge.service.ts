import { Injectable } from '@angular/core';
import { first } from "rxjs/operators";
import { Listener } from "proximax-nem2-sdk";
import { WalletService } from "./wallet.service";
import { TransactionsService } from "../../transactions/service/transactions.service";
import { environment } from '../../../environments/environment';
import { NodeService } from '../../servicesModule/services/node.service';
import { SharedService } from './shared.service';
import { MessageService } from './message.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataBridgeService {
  block: number;
  url: any
  connector: Listener;
  blockSubject: BehaviorSubject<number> = new BehaviorSubject<number>(this.block);
  block$: Observable<number> = this.blockSubject.asObservable();
  constructor(
    private walletService: WalletService,
    private transactionsService: TransactionsService,
    private nodeService: NodeService,
    private sharedService: SharedService,
    private messageService: MessageService
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
    console.log("Destruye conexion con el websocket");
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
      const audio = new Audio('assets/audio/ding2.ogg');
      this.getTransactionsConfirmedSocket(connector, audio);
      this.getTransactionsUnConfirmedSocket(connector, audio);
      this.getStatusSocket(connector, audio);
      this.getBlockSocket(connector)
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
            this.messageService.changeMessage('balanceChanged');
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
 * Get the status from the block
 *
 * @param {Listener} connector
 * @param {HTMLAudioElement} audio
 * @memberof DataBridgeService
 */
  getBlockSocket(connector: Listener) {
    connector.newBlock().subscribe(res => {
      console.log("block::::: ", res.height.lower);
      this.setblock(res.height.lower)
    }, err => {
      this.sharedService.showError('Error', err);
      console.error("err::::::", err)
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
   * Allow to load the component in the routing
   *
   * @param {*} params
   * @memberof DataBridgeService
   */
  setblock(params: any) {
    this.block = params;
    this.blockSubject.next(this.block);
  }
  /**
  *Set value to log in and block
  *
  * @returns
  * @memberof DataBridgeService
  */
  getIblock() {
    return this.block$;
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
