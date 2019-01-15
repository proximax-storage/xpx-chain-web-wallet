import { Injectable } from '@angular/core';
import { first } from "rxjs/operators";
import { Listener, MosaicInfo } from "proximax-nem2-sdk";
import { WalletService } from "./wallet.service";
import { TransactionsService } from "../../transactions/service/transactions.service";
import { NodeService } from '../../servicesModule/services/node.service';
import { environment } from '../../../environments/environment';
import { NemProvider } from './nem.provider';
import { ProximaxProvider } from './proximax.provider';


@Injectable({
  providedIn: 'root'
})
export class DataBridgeService {

  infoMosaic: MosaicInfo;
  url: any
  constructor(
    private walletService: WalletService,
    private _transactionsService: TransactionsService,
    private nodeService: NodeService,
    private nemProvider: NemProvider,
    private proximaxProvider: ProximaxProvider
  ) { }


  /**
   *   Set default socket connect
   *
   * @returns
   * @memberof DataBridgeService
   */
  connectnWs() {
    this.url = environment.socketProtocol + '://' + `${this.nodeService.getNodeSelected()}`;
    const connector = new Listener(this.url, WebSocket);
    // Try to open the connection
    console.log(this.url);
    this.openConnection(connector);
    return;
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
      //Get transactions confirmed
      const audio = new Audio('assets/audio/ding2.ogg');
      connector.confirmed(this.walletService.address).subscribe(incomingTransaction => {
        console.log("Transacciones confirmadas entrantes", incomingTransaction);
        audio.play();

        //Search transactions in cache
        this._transactionsService.getConfirmedTransactionsCaché$().pipe(first()).subscribe(
          allTransactionConfirmed => {
            const transactionPushed = allTransactionConfirmed.slice(0);
            //return with format
            this.proximaxProvider.getInfoMosaic(incomingTransaction['mosaics'][0].id).then((mosaicInfo: MosaicInfo) => {
              this.infoMosaic = mosaicInfo;
              incomingTransaction['amount'] = this.nemProvider.formatterAmount(incomingTransaction['mosaics'][0].amount.compact(), this.infoMosaic.divisibility);
              const transactionFormated = this._transactionsService.formatTransaction(incomingTransaction);
              transactionPushed.unshift(transactionFormated);
              this._transactionsService.setConfirmedTransaction$(transactionPushed);



              //subscribe to transactions unconfirmed to valid if isset and delete
              // this._transactionsService.getTransactionsUnconfirmed$().pipe(first()).subscribe(
              //   response => {
              //     let allTransactionUnConfirmed = response;
              //     let unconfirmed = [];
              //     allTransactionUnConfirmed.forEach((element: { transactionInfo: { hash: any; }; }) => {
              //       if (element.transactionInfo.hash !== format.transactionInfo.hash) {
              //         unconfirmed.unshift(element);
              //       }
              //     });
              //     this._transactionsService.setTransactionsUnconfirmed$(unconfirmed);
              //   });
            });

            // this._transactionsService.setConfirmedTransaction$(allTransactionConfirmed);


            console.log("se fueeeee......");
          });
      }, err => {
        console.error(err)
      });

      //Get transactions unconfirmed
      connector.unconfirmedAdded(this.walletService.address).subscribe(transaction => {
        audio.play();
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
