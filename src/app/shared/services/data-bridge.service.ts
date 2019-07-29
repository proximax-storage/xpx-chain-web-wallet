import { Injectable } from '@angular/core';
import { first } from "rxjs/operators";
import { BehaviorSubject, Observable } from 'rxjs';
import { Listener, Transaction, TransactionStatus } from "tsjs-xpx-chain-sdk";
import { environment } from '../../../environments/environment';
import { NodeService } from '../../servicesModule/services/node.service';
import { SharedService } from './shared.service';
import { WalletService } from '../../wallet/services/wallet.service';
import { TransactionsService, TransactionsInterface } from '../../transfer/services/transactions.service';


@Injectable({
  providedIn: 'root'
})
export class DataBridgeService {
  block: number;
  url: any
  connector: Listener;
  destroyConection = false;
  blockSubject: BehaviorSubject<number> = new BehaviorSubject<number>(this.block);
  block$: Observable<number> = this.blockSubject.asObservable();
  transactionSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  transaction$: Observable<any> = this.transactionSubject.asObservable();


  constructor(
    private walletService: WalletService,
    private transactionsService: TransactionsService,
    private nodeService: NodeService,
    private sharedService: SharedService
  ) { }



  /**
   * Connect to websocket
   *
   * @param {string} node
   * @returns
   * @memberof DataBridgeService
   */
  connectnWs(node?: string) {
    const route = (node === undefined) ? this.nodeService.getNodeSelected() : node;
    this.url = `${environment.protocolWs}://${route}`;
    // console.log(this.url);
    this.connector = new Listener(this.url, WebSocket);
    // Try to open the connection
    this.destroyConection = false;
    this.openConnection();
    return;
  }

  /**
   * Close connection websocket
   *
   * @memberof DataBridgeService
   */
  closeConenection() {
    // console.log("Destruye conexion con el websocket");
    this.destroyConection = true;
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
  destroyUnconfirmedTransaction(element: TransactionsInterface) {
    this.transactionsService.getTransactionsUnConfirmed$().pipe(first()).subscribe(
      response => {
        if (response.length > 0) {
          let allTransactionUnConfirmed = response;
          let unconfirmed = [];
          for (const elementUnconfirmed of allTransactionUnConfirmed) {
            if (elementUnconfirmed.data.transactionInfo.hash !== element.data.transactionInfo.hash) {
              unconfirmed.unshift(element);
            }
          }
          this.transactionsService.setTransactionsUnConfirmed$(unconfirmed);
        }
      });
  }


  /**
   * Open websocket connection
   *
   * @param {*} connector
   * @memberof DataBridgeService
   */
  openConnection() {
    if (!this.destroyConection) {
      this.connector.open().then(() => {
        const audio = new Audio('assets/audio/ding.ogg');
        const audio2 = new Audio('assets/audio/ding2.ogg');
        this.getSocketTransactionsConfirmed(this.connector, audio2);
        this.getSocketTransactionsUnConfirmed(this.connector, audio);
        this.getSocketStatusError(this.connector, audio);
        this.getBlockSocket(this.connector);
      }, (error) => {
        this.sharedService.showWarning('', 'Error connecting to the node');
        this.reconnect(this.connector);
      });
    }

  }

  /**
  *
  * @returns
  * @memberof DataBridgeService
  */
  getBlock() {
    return this.block$;
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
      this.setblock(res.height.compact())
    }, err => {
      this.sharedService.showError('Error', err);
    });
  }


  /**
   * Get the confirmed transactions from the socket
   *
   * @param {Listener} connector
   * @param {HTMLAudioElement} audio
   * @memberof DataBridgeService
   */
  getSocketTransactionsConfirmed(connector: Listener, audio: HTMLAudioElement) {
    connector.confirmed(this.walletService.address).subscribe((incomingTransaction: Transaction) => {
      this.setTransactionStatus({
        'type': 'confirmed',
        'data': incomingTransaction
      });
      this.transactionsService.getTransactionsConfirmed$().pipe(first()).subscribe(allTransactionConfirmed => {
        const transactionPushed = allTransactionConfirmed.slice(0);
        const transactionFormatter = this.transactionsService.getStructureDashboard(incomingTransaction);
        if (transactionFormatter !== null) {
          transactionPushed.unshift(transactionFormatter);
          this.destroyUnconfirmedTransaction(transactionFormatter);
          this.transactionsService.setTransactionsConfirmed$(transactionPushed);
          audio.play();
          // this.messageService.changeMessage('balanceChanged');
          this.transactionsService.validateTypeTransaction(incomingTransaction.type);
          // this.namespaceService.buildNamespaceStorage();
          // this.transactionsService.updateBalance();
        }
      });
    }, err => {
      // console.error(err)
    });
  }

  /**
   * Get the unconfirmed transactions from the socket
   *
   * @param {Listener} connector
   * @param {HTMLAudioElement} audio
   * @memberof DataBridgeService
   */
  getSocketTransactionsUnConfirmed(connector: Listener, audio: HTMLAudioElement) {
    connector.unconfirmedAdded(this.walletService.address).subscribe(unconfirmedTransaction => {
      this.setTransactionStatus({
        'type': 'unconfirmed',
        'data': unconfirmedTransaction
      });
      this.transactionsService.getTransactionsUnConfirmed$().pipe(first()).subscribe(
        async transactionsUnconfirmed => {
          const transactionPushed = transactionsUnconfirmed.slice(0);
          const transactionFormatter = this.transactionsService.getStructureDashboard(unconfirmedTransaction);
          transactionPushed.unshift(transactionFormatter);
          this.transactionsService.setTransactionsUnConfirmed$(transactionPushed);
          audio.play();
        }, err => {
          // console.error(err);
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
  getSocketStatusError(connector: Listener, audio: HTMLAudioElement) {
    connector.status(this.walletService.address).subscribe(error => {
      this.setTransactionStatus({
        'type': 'error',
        'data': error
      });
      // this.sharedService.showWarning('Warning', error.status)
    }, err => {
      // console.error("err::::::", err);
      this.sharedService.showError('', err);
    });
  }

  /**
   *
   *
   * @returns {Observable<TransactionStatus>}
   * @memberof DataBridgeService
   */
  getTransactionStatus(): Observable<TransactionStatus> {
    return this.transaction$;
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
    this.openConnection();
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
   *
   *
   * @param {*} value
   * @returns
   * @memberof DataBridgeService
   */
  setTransactionStatus(value: any) {
    return this.transactionSubject.next(value);
  }
}
