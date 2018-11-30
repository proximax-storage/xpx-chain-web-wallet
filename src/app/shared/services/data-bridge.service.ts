import { Injectable } from '@angular/core';
import { first } from "rxjs/operators";
import { Listener, Address, Transaction } from "proximax-nem2-sdk";
import { environment } from '../../../environments/environment';
import { WalletService } from "./wallet.service";
import { TransactionsService } from "../../transactions/service/transactions.service";
import { NodeService } from '../../servicesModule/services/node.service';

@Injectable({
  providedIn: 'root'
})
export class DataBridgeService {

  url: any
  constructor(
    private walletService: WalletService,
    private _transactionsService: TransactionsService,
    private nodeService: NodeService) { }


  /**
   *   Set default socket connect
   *
   * @returns
   * @memberof DataBridgeService
   */
  connectnWs() {
    this.url = `ws://${this.nodeService.getNodeSelected()}`;
    const connector = new Listener(this.url, WebSocket);
    // Try to open the connection
    console.log( this.url);
    this.openConnection(connector);
    return;
  }

  /**
   * Open websocket connection
   *
   * @param {*} connector
   * @memberof DataBridgeService
   */
  openConnection(connector) {
    connector.open().then(() => {
      //Get transactions confirmed
      connector.confirmed(this.walletService.address).subscribe((
        transaction: Transaction[]) => {
        this._transactionsService.getTransConfirm$().pipe(first()).subscribe(
          resp => {
            var allTransactionConfirmed = resp;
            if (allTransactionConfirmed.length > 0) {
              //return with format
              const format = this._transactionsService.formatTransaction(transaction);
              //subscribe to transactions unconfirmed to valid if isset and delete
              this._transactionsService.getTransactionsUnconfirmed$().pipe(first()).subscribe(
                resp => {
                  let allTransactionUnConfirmed = resp;
                  let unconfirmed = [];
                  allTransactionUnConfirmed.forEach(element => {
                    if (element.transactionInfo.hash !== format.transactionInfo.hash) {
                      unconfirmed.push(element);
                    }
                  });
                  this._transactionsService.setTransactionsUnconfirmed$(unconfirmed);
                });
              allTransactionConfirmed.push(format);
              this._transactionsService.setTransConfirm$(allTransactionConfirmed);
            } else {
              this._transactionsService.setTransConfirm$([this._transactionsService.formatTransaction(transaction)]);
            }
          });
        const audio = new Audio('assets/audio/ding2.ogg');
        audio.play();
      }, err => {
        console.error(err)
      });

      //Get transactions unconfirmed
      connector.unconfirmedAdded(this.walletService.address).subscribe((
        transaction: Transaction[]) => {
        this._transactionsService.getTransactionsUnconfirmed$().pipe(first()).subscribe(
          resp => {
            let myObject = resp;
            if (myObject.length > 0) {
              myObject.push(this._transactionsService.formatTransaction(transaction));
              this._transactionsService.setTransactionsUnconfirmed$(myObject);
            } else {
              this._transactionsService.setTransactionsUnconfirmed$([this._transactionsService.formatTransaction(transaction)]);
            }
          });
        const audio = new Audio('assets/audio/ding.ogg');
        audio.play();
      }, err => {
        console.error(err)
      });

      connector.status(this.walletService.address).subscribe(status => {

      }, err => {
        console.error("err::::::", err)
      });

    }, (error) => {
      console.error("errroooor de soquer", error);
      this.reconnect(connector);
    });


  }

  /**
   *  reconnection to the  websocket
   *
   * @param {*} connector
   * @returns
   * @memberof DataBridgeService
   */
  reconnect(connector) {
    // Close connector
    connector.close();
    this.openConnection(connector);
    return;
  }


}
