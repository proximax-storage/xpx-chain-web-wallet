import { Component, OnInit } from '@angular/core';
import {
  MosaicInfo, Deadline, TransactionType, Transaction, Mosaic
} from 'proximax-nem2-sdk';
import { DashboardService } from '../../services/dashboard.service';
import { TransactionsService } from '../../../transactions/service/transactions.service';
import { WalletService } from 'src/app/shared';
import { NemProvider } from 'src/app/shared/services/nem.provider';
import { first } from 'rxjs/operators';
import { ProximaxProvider } from 'src/app/shared/services/proximax.provider';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  count = 0;
  cantConfirmed = 0;
  elementsConfirmed: any = [];

  elementsUnconfirmed: any;
  confirmedSelected = true;
  unconfirmedSelected = false;
  cantUnconfirmed = 0;
  dataSelected: any;
  searching = false;

  headElements = ['Type', 'Timestamp', 'Fee', 'Sender', 'Recipient'];
  subscriptions = [
    'getConfirmedTransactionsCache',
    'transactionsUnconfirmed',
    'getAllTransactions',
    'transactionsConfirmed'
  ];
  infoMosaic: MosaicInfo;
  arraTypeTransaction = {
    transfer: {
      id: TransactionType.TRANSFER,
      name: 'Transfer'
    },
    registerNameSpace: {
      id: TransactionType.REGISTER_NAMESPACE,
      name: 'Register namespace'
    },
    mosaicDefinition: {
      id: TransactionType.MOSAIC_DEFINITION,
      name: 'Mosaic definition'
    },
    mosaicSupplyChange: {
      id: TransactionType.MOSAIC_SUPPLY_CHANGE,
      name: 'Mosaic supply change'
    },
    modifyMultisigAccount: {
      id: TransactionType.MODIFY_MULTISIG_ACCOUNT,
      name: 'Modify multisig account'
    },
    aggregateComplete: {
      id: TransactionType.AGGREGATE_COMPLETE,
      name: 'Aggregate complete'
    },
    aggregateBonded: {
      id: TransactionType.AGGREGATE_BONDED,
      name: 'Aggregate bonded'
    },
    lock: {
      id: TransactionType.LOCK,
      name: 'Lock'
    },
    secretLock: {
      id: TransactionType.SECRET_LOCK,
      name: 'Secret lock'
    },
    secretProof: {
      id: TransactionType.SECRET_PROOF,
      name: 'Secret proof'
    }
  };

  constructor(
    private dashboardService: DashboardService,
    private transactionsService: TransactionsService,
    private walletService: WalletService,
    private nemProvider: NemProvider,
    private proximaxProvider: ProximaxProvider
  ) {

    console.log(this.arraTypeTransaction);
  }

  async ngOnInit() {
    this.dashboardService.loadedDashboard();
    this.dashboardService.subscribeLogged();
    // this.getConfirmedTransactions();
    // this.getUnconfirmedTransactions();
    // this.transactionsConfirmed();
    this.getTransactions();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(element => {
      if (this.subscriptions[element] !== undefined && this.subscriptions[element] !== 'isLogged') {
        console.log("Destruye: ", element);
        this.subscriptions[element].unsubscribe();
      }
    });
  }

  async getTransactions() {
    //Gets all transactions confirmed in cache
    this.subscriptions['transactionsConfirmed'] = this.transactionsService.getConfirmedTransactionsCache$().subscribe(
      async transactionsConfirmedCache => {
        if (transactionsConfirmedCache.length > 0) {
          console.log("Transacciones en cache..", transactionsConfirmedCache);
          this.elementsConfirmed = transactionsConfirmedCache.slice(0, 10);
          this.cantConfirmed = this.elementsConfirmed.length;
          this.searching = false;
          this.getUnconfirmedTransactionsCache();
        } else if (this.dashboardService.isLoadedDashboard == 1) {
          const allTrasactions = await this.getAllTransactions();
        }
      }, error => {
        console.log("Has ocurred a error", error);
      });
  }

  /**
   * Get unconfirmed transactions in cache
   *
   * @memberof DashboardComponent
   */
  getUnconfirmedTransactionsCache() {
    this.subscriptions['transactionsUnconfirmed'] = this.transactionsService.getTransactionsUnconfirmedCache$().subscribe(
      resp => {
        this.cantUnconfirmed = resp.length;
        this.elementsUnconfirmed = resp;
      }
    );
  }

  async getAllTransactions() {
    console.log("======= Consulta todas las transacciones =========");
    this.subscriptions['getAllTransactions'] = this.nemProvider.getAllTransactionsFromAccount(this.walletService.publicAccount, this.walletService.network).pipe(first()).subscribe(
      async allTrasactions => {
        console.log("RESULTADO DE TODAS LAS TRANSACCIONES ---> ", allTrasactions);
        const elementsConfirmed = [];
        if (allTrasactions.length > 0) {
          for (let element of allTrasactions) {
            element['date'] = this.transactionsService.dateFormat(element.deadline);
            if (element['recipient'] !== undefined) {
              // me quede validando si es remitente o no y pintarlo en el html. Ya le dije fino, todo bien ni ada
              element['isRemitent'] = this.walletService.address.pretty() === element['recipient'].pretty();
            }
            Object.keys(this.arraTypeTransaction).forEach(elm => {
              if (this.arraTypeTransaction[elm].id === element.type) {
                element['name_type'] = this.arraTypeTransaction[elm].name;
              }
            });

            if (element['mosaics'] !== undefined) {
              // Crea un nuevo array con los id de mosaicos
              const mosaicsId = element['mosaics'].map((mosaic: Mosaic) => { return mosaic.id; });
              // Busca la información de los mosaicos, retorna una promesa
              await this.proximaxProvider.getInfoMosaics(mosaicsId).then((mosaicsInfo: MosaicInfo[]) => {
                element['mosaicsInfo'] = mosaicsInfo;
                element['mosaics'].forEach(mosaic => {
                  // Da formato al monto de la transacción
                  mosaic['amountFormatter'] = this.transactionsService.amountFormatter(mosaic.amount, mosaic.id, element['mosaicsInfo']);
                });
              });


              console.log(element);
              elementsConfirmed.push(element);
            } else {
              console.log("***** ESTO NO TIENE MOSAICO *****");
              elementsConfirmed.push(element);
            }

            // console.log("TRANSACTION --> ", element);
            //            this.buildTransaction(element);
            // if (element['mosaics'] !== undefined) {
            //   await this.proximaxProvider.getInfoMosaic(element['mosaics'][0].id).then((mosaicInfo: MosaicInfo) => {
            //     this.infoMosaic = mosaicInfo;
            //     element['amount'] = this.nemProvider.formatterAmount(element['mosaics'][0].amount.compact(), this.infoMosaic.divisibility);
            //     elementsConfirmed.push(this.transactionsService.formatTransaction(element));
            //   });
            // };
          }
          // console.log("RESPONDIO TODO", elementsConfirmed);
          // this.transactionsService.setConfirmedTransaction$(elementsConfirmed);
        }

        this.elementsConfirmed = elementsConfirmed;
        this.cantConfirmed = elementsConfirmed.length;
        this.searching = false;
      }, error => {
        this.searching = false;
        console.error("Has ocurred a error", error);
      });
  }

  /*******************************/


  /**
   * Get all confirmed transactions
   *
   * @memberof DashboardComponent
   */
  getConfirmedTransactions() {
    this.searching = true;
    this.subscriptions['getTransConfirm'] = this.transactionsService.getConfirmedTransactionsCache$().subscribe(
      async cacheTransactions => {
        console.log("HAY ALGO EN CACHE DE LAS TRANSACCIONES CONFIRMADAS?", cacheTransactions);
        if (cacheTransactions.length > 0) {
          if (cacheTransactions.length > 10) {
            this.elementsConfirmed = cacheTransactions.slice(0, 10);
            this.cantConfirmed = this.elementsConfirmed.length;
            this.searching = false;
          } else {
            console.log("IGUALA LAS VARIABLES Y PINTALAS PUES");
            this.cantConfirmed = cacheTransactions.length;
            this.elementsConfirmed = cacheTransactions;
            this.searching = false;
          }
        } else {
          if (this.dashboardService.isLoadedDashboard == 1) {
            // const allTrasactions = await this.getAllTransactions();
          }
        }
      }
    );
  }

  getUnconfirmedTransactions2() {
    this.subscriptions['transactionsUnconfirmed'] = this.transactionsService.getTransactionsUnconfirmedCache$().subscribe(
      resp => {
        this.cantUnconfirmed = resp.length;
        this.elementsUnconfirmed = resp;
      }
    );
  }

  /**
  * Get all transactions http and
  * Foreach and assign to elementsConfirmed, to then add it to the observable
  *
  * @memberof DashboardComponent
  */
  async getAllTransactions2() {
    this.count++;


    const promise = new Promise(async (resolve, reject) => {
      if (this.count < 5) {
        this.subscriptions['getAllTransactions'] = this.nemProvider.getAllTransactionsFromAccount(this.walletService.publicAccount, this.walletService.network).pipe(first()).subscribe(
          async allTrasactions => {
            console.log("All transactions", allTrasactions);
            const elementsConfirmed = [];
            if (allTrasactions.length > 0) {
              for (let element of allTrasactions) {
                if (element['mosaics'] !== undefined) {
                  await this.proximaxProvider.getInfoMosaic(element['mosaics'][0].id).then((mosaicInfo: MosaicInfo) => {
                    this.infoMosaic = mosaicInfo;
                    element['amount'] = this.nemProvider.formatterAmount(element['mosaics'][0].amount.compact(), this.infoMosaic.divisibility);
                    elementsConfirmed.push(this.transactionsService.formatTransaction(element));
                  });
                };
              }
              this.transactionsService.setConfirmedTransaction$(elementsConfirmed);
            }
            this.searching = false;
            resolve(true);
          }, error => {
            this.searching = false;
            console.error("Has ocurred a error", error);
            reject(false);
          });
      } else {
        resolve(false);
      }

    });
    return await promise;
  }


  /**
   *
   *
   * @param {any} param
   * @memberof DashboardComponent
   */
  selectTab(param: any) {
    if (param === 1) {
      this.confirmedSelected = true;
      this.unconfirmedSelected = false;
    } else {
      this.confirmedSelected = false;
      this.unconfirmedSelected = true;
    }
  }
}
