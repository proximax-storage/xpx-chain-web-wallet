import { Injectable } from '@angular/core';
import { first } from "rxjs/operators";
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { Listener, Transaction, TransactionStatus, CosignatureSignedTransaction, BlockInfo, SignedTransaction, UInt64 } from "tsjs-xpx-chain-sdk";
import { environment } from '../../../environments/environment';
import { NodeService } from '../../servicesModule/services/node.service';
import { SharedService } from './shared.service';
import { WalletService, CurrentWalletInterface } from '../../wallet/services/wallet.service';
import { TransactionsInterface, TransactionsService } from '../../transactions/services/transactions.service';
import { ProximaxProvider } from './proximax.provider';
import { NamespacesService } from 'src/app/servicesModule/services/namespaces.service';

@Injectable({
  providedIn: 'root'
})
export class DataBridgeService {
  block: number;
  url: any
  connector: Listener;
  currentWallet: CurrentWalletInterface = null;
  destroyConection = false;
  blockSubject: BehaviorSubject<number> = new BehaviorSubject<number>(this.block);
  blockInfo: BlockInfo;
  blockInfoSubject: BehaviorSubject<BlockInfo> = new BehaviorSubject<BlockInfo>(this.blockInfo);
  block$: Observable<number> = this.blockSubject.asObservable();
  blockInfo$: Observable<BlockInfo> = this.blockInfoSubject.asObservable();
  transactionSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  transaction$: Observable<any> = this.transactionSubject.asObservable();
  reconnectNode = 0;
  subscription: Subscription[] = [];
  transactionSigned: SignedTransaction[] = [];
  transactionReady: SignedTransaction[] = [];


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
          (BlockInfo: BlockInfo) => {
            this.setblock(blockchainHeight.compact());
            this.setblockInfo(BlockInfo);
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
    const route = (node === undefined) ? this.nodeService.getNodeSelected() : node;
    this.url = `${environment.protocolWs}://${route}`;
    this.currentWallet = Object.assign({}, this.walletService.getCurrentWallet());
    this.connector = new Listener(this.url, WebSocket);
    this.destroyConection = false;
    this.openConnection();
    return;
  }

  /**
   * Close connection websocket
   *
   * @memberof DataBridgeService
   */
  closeConection(destroyTransactions = true) {
    console.log("Destruye conexion con el websocket");
    this.destroySubscriptions();
    this.destroyConection = true;
    if (destroyTransactions) {
      this.setblock(null);
      this.transactionSigned = [];
      this.setTransactionStatus(null);
      this.transactionsService.destroyAllTransactions();
    }

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
  destroyUnconfirmedTransaction(incomingTransaction: TransactionsInterface) {
    // Destroy unconfirmed transactions
    this.transactionsService.getUnconfirmedTransactions$().pipe(first()).subscribe(
      response => {
        if (response.length > 0) {
          let allTransactionUnConfirmed = response.slice(0);
          let unconfirmed = allTransactionUnConfirmed.filter((elementUnconfirmed) =>
            elementUnconfirmed.data.transactionInfo.hash !==
            incomingTransaction.data.transactionInfo.hash
          );

          this.transactionsService.setTransactionsUnConfirmed$(unconfirmed);
        }
      }
    );

    // Destroy aggregateTransactions transactions
    this.transactionsService.getAggregateBondedTransactions$().pipe(first()).subscribe(
      response => {
        if (response.length > 0) {
          let allAggregateTransactions = response.slice(0);
          let aggregateBonded = allAggregateTransactions.filter((elmAggregate) =>
            elmAggregate.data.transactionInfo.hash !==
            incomingTransaction.data.transactionInfo.hash
          );

          this.transactionsService.setAggregateBondedTransactions$(aggregateBonded);
        }
      }
    );
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
      // console.log('new block -->', res);
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
  getSocketTransactionsAggreateBondedRemoved(connector: Listener, audio: HTMLAudioElement) {
    const currentWallet = Object.assign({}, this.walletService.getCurrentWallet());
    currentWallet.accounts.forEach(element => {
      connector.aggregateBondedRemoved(this.proximaxProvider.createFromRawAddress(element.address)).subscribe((aggregateBondedRemoved: string) => {
        console.log('=== CONNECTOR ===', connector);
        const address = this.proximaxProvider.createFromRawAddress(element.address);
        console.log('\n=== CONNECTED TO ===', address.plain().slice(36, 40));
        console.log('=== NEW TRANSACTION AGGREGATE_BONDED_REMOVED === ', aggregateBondedRemoved, '\n\n');
        this.setTransactionStatus({
          'type': 'aggregateBondedRemoved',
          'data': aggregateBondedRemoved
        });
      }, err => {
        // console.error(err)
      });
    });
  }


  /**
   *
   *
   * @memberof DataBridgeService
   */
  getSocketTransactionsAggreateBonded(connector: Listener, audio: HTMLAudioElement) {
    this.currentWallet.accounts.forEach(element => {
      connector.aggregateBondedAdded(this.proximaxProvider.createFromRawAddress(element.address)).subscribe((aggregateBondedAdded: Transaction) => {
        const address = this.proximaxProvider.createFromRawAddress(element.address);
        console.log('\n=== CONNECTED ===', address.plain().slice(36, 40));
        console.log('=== NEW TRANSACTION AGGREGATE_BONDED === ', aggregateBondedAdded, '\n\n');
        const builded = this.transactionsService.getStructureDashboard(aggregateBondedAdded);
        this.transactionsService.setAggregateBondedTransactions$([builded]);
        this.setTransactionStatus({
          'type': 'aggregateBondedAdded',
          'data': aggregateBondedAdded
        });
      }, err => {
        // console.error(err)
      });
    });
  }

  /**
   *
   *
   * @param {Listener} connector
   * @param {HTMLAudioElement} audio
   * @memberof DataBridgeService
   */
  getSocketTransactionsCosignatureAdded(connector: Listener, audio: HTMLAudioElement) {
    const currentWallet = Object.assign({}, this.walletService.getCurrentWallet());
    currentWallet.accounts.forEach(element => {
      connector.cosignatureAdded(this.proximaxProvider.createFromRawAddress(element.address)).subscribe((cosignatureSignedTransaction: CosignatureSignedTransaction) => {
        const address = this.proximaxProvider.createFromRawAddress(element.address);
        console.log('\n=== CONNECTED ===', address.plain().slice(36, 40));
        console.log('=== COSIGNATURE ADDED TRANSACTION === ', cosignatureSignedTransaction, '\n\n');
        this.setTransactionStatus({
          'type': 'cosignatureSignedTransaction',
          'data': cosignatureSignedTransaction
        });
        audio.play();
      }, err => {
        // console.error(err)
      });
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
    const currentWallet = Object.assign({}, this.walletService.getCurrentWallet());
    currentWallet.accounts.forEach(element => {
      connector.confirmed(this.proximaxProvider.createFromRawAddress(element.address)).subscribe((confirmed: Transaction) => {
        this.setTransactionStatus({
          'type': 'confirmed',
          'data': confirmed
        });

        const address = this.proximaxProvider.createFromRawAddress(element.address);
        console.log('\n=== CONNECTED ===', address.plain().slice(36, 40));
        console.log('=== CONFIRMED TRANSACTION === ', confirmed, '\n\n');

        this.transactionsService.getTransactionsConfirmed$().pipe(first()).subscribe(allTransactionConfirmed => {
          const transactionPushed = allTransactionConfirmed.slice(0);
          const transactionFormatter = this.transactionsService.getStructureDashboard(confirmed, transactionPushed);
          if (transactionFormatter !== null) {
            transactionPushed.unshift(transactionFormatter);
            this.destroyUnconfirmedTransaction(transactionFormatter);
            this.transactionsService.setTransactionsConfirmed$(transactionPushed);
            audio.play();
            this.transactionsService.searchAccountsInfo(this.walletService.currentWallet.accounts);
            this.namespaces.searchNamespacesFromAccounts([this.proximaxProvider.createFromRawAddress(this.walletService.getCurrentAccount().address)]);
            // this.transactionsService.validateTypeTransaction(confirmed.type);
            // this.namespaceService.buildNamespaceStorage();
            // this.transactionsService.updateBalance();
          }
        });
      }, err => {
        // console.error(err)
      });
    });
  }

  /**
   * Get the unconfirmed transactions from the socket
   *
   * @param {Listener} connector
   * @param {HTMLAudioElement} audio
   * @memberof DataBridgeService
   */
  getSocketUnconfirmedTransactions(connector: Listener, audio: HTMLAudioElement) {
    const currentWallet = Object.assign({}, this.walletService.getCurrentWallet());
    currentWallet.accounts.forEach(element => {
      connector.unconfirmedAdded(this.proximaxProvider.createFromRawAddress(element.address)).subscribe(unconfirmedTransaction => {
        // Aqui las que tengo por confirmar en mi variable
        const address = this.proximaxProvider.createFromRawAddress(element.address);
        console.log('\n=== CONNECTED ===', address.plain().slice(36, 40));
        console.log('=== UNCONFIRMED TRANSACTION === ', unconfirmedTransaction, '\n\n');
        this.validateTransactions(unconfirmedTransaction.transactionInfo.hash);
        this.transactionsService.getUnconfirmedTransactions$().pipe(first()).subscribe(
          async transactionsUnconfirmed => {
            const transactionPushed = transactionsUnconfirmed.slice(0);
            const transactionFormatter = this.transactionsService.getStructureDashboard(unconfirmedTransaction, transactionPushed);
            if (transactionFormatter !== null) {
              transactionPushed.unshift(transactionFormatter);
              this.transactionsService.setTransactionsUnConfirmed$(transactionPushed);
              audio.play();
              // aqui las que me llegan del WS
              this.setTransactionStatus({
                'type': 'unconfirmed',
                'data': unconfirmedTransaction
              });
            }
          }, err => {
            // console.error(err);
          });
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
    const currentWallet = Object.assign({}, this.walletService.getCurrentWallet());
    currentWallet.accounts.forEach(element => {
      connector.status(this.proximaxProvider.createFromRawAddress(element.address)).subscribe(error => {
        const address = this.proximaxProvider.createFromRawAddress(element.address);
        console.log('\n=== CONNECTED ===', address.plain().slice(36, 40));
        console.log('=== STATUS TRANSACTION === ', error, '\n\n');
        this.setTransactionStatus({
          'type': 'error',
          'data': error
        });
      }, err => {
        this.sharedService.showError('', err);
      });
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
        this.getSocketTransactionsAggreateBonded(this.connector, audio2);
        this.getSocketTransactionsCosignatureAdded(this.connector, audio);
        this.getSocketTransactionsConfirmed(this.connector, audio2);
        this.getSocketUnconfirmedTransactions(this.connector, audio);
        this.getSocketStatusError(this.connector, audio);
        this.getBlockSocket(this.connector);
      }, (error) => {
        this.sharedService.showWarning('', 'Error connecting to the node');
      });
    }
  }

  /**
   * Reconnect
   *
   * @param {Listener} connector
   * @returns
   * @memberof DataBridgeService
   */
  reconnect(connector: Listener) {
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
  * Set a BlockInfo for a given block height
  *
  * @param {BlockInfo} params
  * @memberof DataBridgeService
  */
  setblockInfo(params: BlockInfo) { //Update-sdk-dragon
    this.blockInfo = params;
    this.transactionsService.generationHash = this.blockInfo.generationHash;
    this.namespaces.generationHash = this.blockInfo.generationHash;
    this.blockInfoSubject.next(this.blockInfo)
  }

  /**
   *
   */
  searchTransactionStatus() {
    console.log(this.subscription);
    // Get transaction status
    this.subscription.push(this.getTransactionStatus().pipe(first()).subscribe(
      statusTransaction => {
        console.log('=== STATUS TRANSACTION ===', statusTransaction);
        if (statusTransaction !== null && statusTransaction !== undefined && this.transactionSigned !== null) {
          for (let element of this.transactionSigned) {
            console.log('element ', element);
            const statusTransactionHash = (statusTransaction['type'] === 'error') ? statusTransaction['data'].hash : statusTransaction['data'].transactionInfo.hash;
            const match = statusTransactionHash === element.hash;
            if (match) {
              this.transactionReady.push(element);
            }

            if (statusTransaction['type'] === 'confirmed' && match) {
              this.transactionSigned = this.transactionSigned.filter(el => el.hash !== statusTransactionHash);
              this.sharedService.showSuccess('', 'Transaction confirmed');
            } else if (statusTransaction['type'] === 'unconfirmed' && match) {
              this.sharedService.showInfo('', 'Transaction unconfirmed');
            } else if (match) {
              this.transactionSigned = this.transactionSigned.filter(el => el.hash !== statusTransactionHash);
              this.sharedService.showWarning('', statusTransaction['data'].status.split('_').join(' '));
            }
          }
        }
      }
    ));
  }

  /**
   *
   */
  setTransactionSigned(signedTransaction: SignedTransaction, add = true) {
    console.log('signedTransaction----> ', signedTransaction);
    if (add) {
      this.transactionSigned.push(signedTransaction);
    } else {
      this.transactionSigned = this.transactionSigned.filter(x => x.hash !== signedTransaction.hash);
    }
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
   * @memberof DataBridgeService
   */
  validateTransactions(hash: string) {
    console.log('=== TENGO UNA LLAMADA A VALIDAR TRANSACCION ===');
    this.transactionsService.getAggregateBondedTransactions$().pipe(first()).subscribe(
      next => {
        next.forEach(element => {
          if (element.data['transactionInfo']) {
            console.log('=== HASH CACHE TRANSACTION ===', element.data['transactionInfo'].hash);
            console.log('=== HASH UNCONFIRMED TRANSACTION ===', hash);
            if (hash === element.data['transactionInfo'].hash) {
              console.log('=== SOME HASH === ', hash);
              const newData = next.filter(x => x.data['transactionInfo'].hash !== hash);
              this.transactionsService.setAggregateBondedTransactions$(newData);
            }
          }
        })
      }
    );
  }
}
