import { Injectable } from '@angular/core';
import { first } from "rxjs/operators";
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { Listener, TransactionStatus, BlockInfo, UInt64, Address, AggregateTransactionCosignature } from "tsjs-xpx-chain-sdk";
import { environment } from '../../../environments/environment';
import { NodeService } from '../../servicesModule/services/node.service';
import { SharedService } from './shared.service';
import { WalletService, CurrentWalletInterface } from '../../wallet/services/wallet.service';
import { TransactionsService } from '../../transactions/services/transactions.service';
import { ProximaxProvider } from './proximax.provider';
import { NamespacesService } from '../../servicesModule/services/namespaces.service';

@Injectable({
  providedIn: 'root'
})
export class DataBridgeService {
  block: number;
  url: any
  connector: Listener[] = [];
  currentWallet: CurrentWalletInterface = null;
  destroyConection = false;

  blockInfo: BlockInfo;

  blockSubject: BehaviorSubject<number> = new BehaviorSubject<number>(this.block);
  block$: Observable<number> = this.blockSubject.asObservable();

  blockInfoSubject: BehaviorSubject<BlockInfo> = new BehaviorSubject<BlockInfo>(this.blockInfo);
  blockInfo$: Observable<BlockInfo> = this.blockInfoSubject.asObservable();

  transactionSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  transaction$: Observable<any> = this.transactionSubject.asObservable();

  reconnectNode = 0;
  subscription: Subscription[] = [];
  audio: HTMLAudioElement;
  audio2: HTMLAudioElement;

  constructor(
    private walletService: WalletService,
    private transactionsService: TransactionsService,
    private nodeService: NodeService,
    private sharedService: SharedService,
    private proximaxProvider: ProximaxProvider,
    private namespaces: NamespacesService
  ) { }


  /**
   *
   *
   * @memberof DataBridgeService
   */
  async searchBlockInfo() {
    this.proximaxProvider.getBlockchainHeight().subscribe(
      (blockchainHeight: UInt64) => {
        this.proximaxProvider.getBlockInfo().subscribe(
          (blockInfo: BlockInfo) => {
            this.setblockInfo(blockInfo);
            this.saveBlockInfo(blockInfo);
          }
        );
      }
    );
  }

  /**
   * Connect to websocket
   *
   * @param {string} node
   * @returns
   * @memberof DataBridgeService
   */
  connectnWs(node?: string) {
    this.connector = [];
    const route = (node === undefined) ? this.nodeService.getNodeSelected() : node;
    this.url = `${environment.protocolWs}://${route}`;
    this.currentWallet = Object.assign({}, this.walletService.getCurrentWallet());
    this.currentWallet.accounts.forEach(element => {
      const ad = this.proximaxProvider.createFromRawAddress(element.address);
      const b = new Listener(this.url, WebSocket);
      this.connector.push(b);
      b.open().then(() => {
        this.audio = new Audio('assets/audio/ding.ogg');
        this.audio2 = new Audio('assets/audio/ding2.ogg');
        this.getBlockSocket(b);
        this.getAggregateBondedAddedSocket(b, this.audio, ad);
        this.getAggregateBondedRemovedSocket(b, this.audio2, ad);
        this.getCosignatureAddedSocket(b, this.audio, ad);
        this.getConfirmedSocket(b, this.audio, ad);
        this.getStatusSocket(b, this.audio2, ad);
        this.getUnConfirmedAddedSocket(b, this.audio2, ad);
        this.getUnConfirmedRemovedSocket(b, this.audio2, ad);
      }, (error) => {
        setTimeout(() => {
          this.sharedService.showWarning('', 'Error connecting to the node');
        }, 500);
      });
    });
    return;
  }

  /**
   * Close connection websocket
   *
   * @memberof DataBridgeService
   */
  closeConection(destroyTransactions = true) {
    this.destroySubscriptions();
    this.destroyConection = true;
    if (destroyTransactions) {
      this.saveBlockInfo(null);
      this.setTransactionStatus(null);
      this.transactionsService.destroyAllTransactions();
    }

    if (this.connector.length > 0) {
      // console.log("Destruye conexion con el websocket");
      this.connector.forEach(element => {
        element.close();
        element.terminate();
      });
    }
  }


  /**
   *
   */
  destroySubscriptions() {
    this.subscription.forEach(subscription => {
      subscription.unsubscribe();
    });
  }


  /**
   *
   *
   * @param {string} height
   * @returns {BlockInfo}
   * @memberof DataBridgeService
   */
  filterBlockStorage(height: number): BlockInfo {
    const blocksStorage = localStorage.getItem(environment.nameKeyBlockStorage);
    if (blocksStorage) {
      // console.log('blocksStorage', blocksStorage);
      const parsedData: BlockInfo[] = JSON.parse(blocksStorage);
      return parsedData.find(x => new UInt64([x.height.lower, x.height.higher]).compact() === height);
    }

    return null;
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
    connector.newBlock().subscribe((blockInfo: BlockInfo) => {
      /*console.log('new block -->', blockInfo.numTransactions);
      console.log('new block -->', blockInfo.height.compact());*/
      this.saveBlockInfo(blockInfo);
    }, err => {
      this.sharedService.showError('Error', err);
    });
  }


  /**
   *
   *
   * @param {Listener} connector
   * @param {HTMLAudioElement} audio
   * @memberof DataBridgeService
   */
  getAggregateBondedAddedSocket(connector: Listener, audio: HTMLAudioElement, address: Address) {
    connector.aggregateBondedAdded(address).subscribe(async aggregateBondedAdded => {
      /*console.log("\n\n--------------------AGGREGATE_BONDED_ADDED------------------------")
      console.log(aggregateBondedAdded.transactionInfo.hash)
      console.log("------------------------------------------------------------------\n\n")*/
      this.setTransactionStatus({
        'type': 'aggregateBondedAdded',
        'hash': aggregateBondedAdded.transactionInfo.hash
      });

      const aggregateBondedSubject = await this.transactionsService.getAggregateBondedTransactions$().pipe(first()).toPromise();
      const transactionPushed = aggregateBondedSubject.slice(0);
      const transactionFormatter = this.transactionsService.getStructureDashboard(aggregateBondedAdded, transactionPushed);
      if (transactionFormatter !== null) {
        audio.play();
        this.transactionsService.setTransactionReady(aggregateBondedAdded.transactionInfo.hash);
        this.sharedService.showInfo('', 'Transaction aggregate bonded added');
        transactionPushed.unshift(transactionFormatter);
        this.transactionsService.setTransactionsAggregateBonded$(transactionPushed);
      }
    });
  }

  /**
   *
   *
   * @param {Listener} connector
   * @param {HTMLAudioElement} audio
   * @memberof DataBridgeService
   */
  getAggregateBondedRemovedSocket(connector: Listener, audio: HTMLAudioElement, address: Address) {
    connector.aggregateBondedRemoved(address).subscribe(async aggregateBondedRemoved => {
      /* console.log("\n\n-----------------------AGGREGATE_BONDED_REMOVED--------------------------")
       console.log(aggregateBondedRemoved)
       console.log("------------------------------------------------------------------\n\n")*/
      this.setTransactionStatus({
        'type': 'aggregateBondedRemoved',
        'hash': aggregateBondedRemoved
      });

      const agregateBondedTransactions = await this.transactionsService.getAggregateBondedTransactions$().pipe(first()).toPromise();
      if (agregateBondedTransactions && agregateBondedTransactions.length > 0) {
        this.transactionsService.setTransactionReady(aggregateBondedRemoved);
        const filtered = agregateBondedTransactions.filter(next => next.data.transactionInfo.hash !== aggregateBondedRemoved);
        this.transactionsService.setTransactionsAggregateBonded$(filtered);
      }
    });
  }

  /**
   *
   *
   * @param {Listener} connector
   * @param {HTMLAudioElement} audio
   * @memberof DataBridgeService
   */
  getCosignatureAddedSocket(connector: Listener, audio: HTMLAudioElement, address: Address) {
    // ----------------------------------COSIGNATURE_ADDED--------------------------------------------//
    connector.cosignatureAdded(address).subscribe(async cosignatureAdded => {
      /*console.log("\n\n-----------------------COSIGNATURE_ADDED--------------------------")
      console.log(cosignatureAdded.parentHash)
      console.log("------------------------------------------------------------------\n\n")*/
      this.setTransactionStatus({
        'type': 'cosignatureAdded',
        'hash': cosignatureAdded.parentHash
      });

      const allAggregateBondedSubject = await this.transactionsService.getAggregateBondedTransactions$().pipe(first()).toPromise();
      // const allAggregateBondedSubject = data.slice(0);
      if (allAggregateBondedSubject && allAggregateBondedSubject.length > 0) {
        const currentTransaction = allAggregateBondedSubject.find(d => d.data.transactionInfo.hash === cosignatureAdded.parentHash);
        if (currentTransaction) {
          this.transactionsService.setTransactionReady(cosignatureAdded.parentHash);
          if (currentTransaction.data.cosignatures.length > 0) {
            const exist = currentTransaction.data.cosignatures.find(d => d.signature === cosignatureAdded.signature);
            if (!exist) {
              audio.play();
              this.sharedService.showInfo('', 'Cosignature added');
              currentTransaction.data.cosignatures.push(
                new AggregateTransactionCosignature(
                  cosignatureAdded.signature,
                  this.proximaxProvider.createPublicAccount(cosignatureAdded.signer, this.walletService.currentAccount.network)
                )
              );
            }
          } else {
            audio.play();
            this.sharedService.showInfo('', 'Cosignature added');
            currentTransaction.data.cosignatures.push(
              new AggregateTransactionCosignature(
                cosignatureAdded.signature,
                this.proximaxProvider.createPublicAccount(cosignatureAdded.signer, this.walletService.currentAccount.network)
              )
            );
          }
        }
      } else {
        audio.play();
        this.sharedService.showInfo('', 'Cosignature added');
      }
    });
  }

  /**
   *
   *
   * @param {Listener} connector
   * @param {HTMLAudioElement} audio
   * @memberof DataBridgeService
   */
  getConfirmedSocket(connector: Listener, audio: HTMLAudioElement, address: Address) {
    connector.confirmed(address).subscribe(async confirmedTransaction => {
      /*console.log("\n\n -----------------------CONFIRMED---------------------------------")
      console.log(confirmedTransaction.transactionInfo.hash)
      console.log("------------------------------------------------------------------ \n\n")*/
      this.setTransactionStatus({
        'type': 'confirmed',
        'hash': confirmedTransaction.transactionInfo.hash
      });

      const confirmedSubject = await this.transactionsService.getConfirmedTransactions$().pipe(first()).toPromise();
      const transactionPushed = confirmedSubject.slice(0);
      const transactionFormatter = this.transactionsService.getStructureDashboard(confirmedTransaction, transactionPushed);
      if (transactionFormatter !== null) {
        audio.play();
        this.sharedService.showInfo('', 'Transaction confirmed');
        transactionPushed.unshift(transactionFormatter);
        this.transactionsService.setTransactionReady(confirmedTransaction.transactionInfo.hash);
        this.transactionsService.setTransactionsConfirmed$(transactionPushed);
        this.transactionsService.searchAccountsInfo(this.walletService.currentWallet.accounts);
        this.namespaces.searchNamespacesFromAccounts([this.proximaxProvider.createFromRawAddress(this.walletService.getCurrentAccount().address)]);
      }
    });
  }

  /**
   *
   *
   * @param {Listener} connector
   * @param {HTMLAudioElement} audio
   * @memberof DataBridgeService
   */
  getStatusSocket(connector: Listener, audio: HTMLAudioElement, address: Address) {
    connector.status(address).subscribe(status => {
      /*console.log("\n\n-----------------------STATUS--------------------------")
       // console.log(status.hash)
       console.log(status)
       console.log("------------------------------------------------------------------\n\n")*/
      this.sharedService.showWarning('', status.status.split('_').join(' '));
      this.setTransactionStatus({
        'type': 'status',
        'hash': status.hash
      });

      this.transactionsService.setTransactionReady(status.hash);
    });
    //});
  }

  /**
   *
   *
   * @param {Listener} connector
   * @param {HTMLAudioElement} audio
   * @memberof DataBridgeService
   */
  getUnConfirmedAddedSocket(connector: Listener, audio: HTMLAudioElement, address: Address) {
    // ----------------------------------UNCONFIRMED_ADDED--------------------------------------------//
    connector.unconfirmedAdded(address).subscribe(async unconfirmedAdded => {
      /*console.log("\n\n-----------------------UNCONFIRMED_ADDED--------------------------");
      console.log(unconfirmedAdded)
      console.log("------------------------------------------------------------------\n\n");*/
      this.setTransactionStatus({
        'type': 'unconfirmed',
        'hash': unconfirmedAdded.transactionInfo.hash
      });

      const unconfirmedSubject = await this.transactionsService.getUnconfirmedTransactions$().pipe(first()).toPromise();
      const transactionPushed = unconfirmedSubject.slice(0);
      const transactionFormatter = this.transactionsService.getStructureDashboard(unconfirmedAdded, transactionPushed);
      if (transactionFormatter !== null) {
        audio.play();
        this.sharedService.showInfo('', 'Transaction unconfirmed');
        transactionPushed.unshift(transactionFormatter);
        this.transactionsService.setTransactionReady(unconfirmedAdded.transactionInfo.hash);
        this.transactionsService.setTransactionsUnConfirmed$(transactionPushed);
      }
    });
  }

  /**
   *
   *
   * @param {Listener} connector
   * @param {HTMLAudioElement} audio
   * @memberof DataBridgeService
   */
  getUnConfirmedRemovedSocket(connector: Listener, audio: HTMLAudioElement, address: Address) {
    connector.unconfirmedRemoved(address).subscribe(async unconfirmedRemoved => {
      /*console.log("\n\n-----------------------UNCONFIRMED_REMOVED--------------------------")
      console.log(unconfirmedRemoved)
      console.log("------------------------------------------------------------------\n\n")*/
      this.setTransactionStatus({
        'type': 'removedTransaction',
        'hash': unconfirmedRemoved
      });

      const unconfirmedSubject = await this.transactionsService.getUnconfirmedTransactions$().pipe(first()).toPromise();
      if (unconfirmedSubject && unconfirmedSubject.length > 0) {
        const unconfirmedFiltered = unconfirmedSubject.filter(next => next.data.transactionInfo.hash !== unconfirmedRemoved);
        this.transactionsService.setTransactionReady(unconfirmedRemoved);
        this.transactionsService.setTransactionsUnConfirmed$(unconfirmedFiltered);
      }
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
  reconnect() {
    if (this.connector) {
      // console.log("Destruye conexion con el websocket");
      this.connector.forEach(element => {
        element.close();
        element.terminate();
      });
    }

    this.connectnWs();
    return;
  }


  /**
  * Set a BlockInfo for a given block height
  *
  * @param {BlockInfo} params
  * @memberof DataBridgeService
  */
  saveBlockInfo(blockInfo: BlockInfo) { //Update-sdk-dragon
    if (blockInfo !== null) {
      this.block = blockInfo.height.compact();
      this.blockSubject.next(this.block);
      this.validateBlock(blockInfo);
      return;
    }

    this.block = null;
    return;
  }

  /**
   *
   *
   * @param {BlockInfo} params
   * @memberof DataBridgeService
   */
  setblockInfo(blockInfo: BlockInfo) {
    this.blockInfo = blockInfo;
    this.transactionsService.generationHash = this.blockInfo.generationHash;
    this.namespaces.generationHash = this.blockInfo.generationHash;
    this.blockInfoSubject.next(this.blockInfo)
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

  /**
   *
   *
   * @param {string} hash
   * @memberof DataBridgeService
   */
  setTimeOutValidateTransaction(hash: string): void {
    setTimeout(async () => {
      const exist = (this.transactionsService.transactionsReady.find(x => x === hash)) ? true: false;
      console.log(exist);
      if (!exist) {
        this.sharedService.showWarning(
          "",
          "An error has occurred with your transaction"
        );
      }

      this.proximaxProvider.getTransactionStatus(hash).subscribe(
        async next => {
          if (next) {
            switch (next.group) {
              case 'unconfirmed':
                this.setTransactionStatus({
                  'type': 'unconfirmed',
                  'hash': hash
                });

                this.proximaxProvider.getTransaction(hash).subscribe(
                  async unconfirmedAdded => {
                    console.log(unconfirmedAdded);
                    const unconfirmedSubject = await this.transactionsService.getUnconfirmedTransactions$().pipe(first()).toPromise();
                    const transactionPushed = unconfirmedSubject.slice(0);
                    const transactionFormatter = this.transactionsService.getStructureDashboard(unconfirmedAdded, transactionPushed);
                    if (transactionFormatter !== null) {
                      this.audio.play();
                      this.sharedService.showInfo('', 'Transaction unconfirmed');
                      transactionPushed.unshift(transactionFormatter);
                      this.transactionsService.setTransactionReady(unconfirmedAdded.transactionInfo.hash);
                      this.transactionsService.setTransactionsUnConfirmed$(transactionPushed);
                    }
                  }
                );
                /*const unconfirmedSubject = await this.transactionsService.getUnconfirmedTransactions$().pipe(first()).toPromise();
                const transactionPushed = unconfirmedSubject.slice(0);
                const transactionFormatter = this.transactionsService.getStructureDashboard(unconfirmedAdded, transactionPushed);
                if (transactionFormatter !== null) {
                  this.audio.play();
                  this.sharedService.showInfo('', 'Transaction unconfirmed');
                  transactionPushed.unshift(transactionFormatter);
                  this.transactionsService.setTransactionReady(unconfirmedAdded.transactionInfo.hash);
                  this.transactionsService.setTransactionsUnConfirmed$(transactionPushed);
                }*/
                break;

              default:
                break;
            }
          }
        }, error => {
          console.log('error');
          this.sharedService.showWarning("", "An error has occurred with your transaction");
        }
      );
    }, 10000);
  }

  /**
   *
   *
   * @param {BlockInfo} blockInfo
   * @memberof DataBridgeService
   */
  validateBlock(blockInfo: BlockInfo) {
    if (blockInfo.numTransactions && blockInfo.numTransactions >= 1) {
      const blocksStorage = localStorage.getItem(environment.nameKeyBlockStorage);
      if (blocksStorage) {
        const parsedData = JSON.parse(blocksStorage);
        parsedData.unshift(blockInfo);
        localStorage.setItem(environment.nameKeyBlockStorage, JSON.stringify(parsedData.slice(0, 100)));
      } else {
        localStorage.setItem(environment.nameKeyBlockStorage, JSON.stringify([blockInfo]));
      }
    }
  }
}
