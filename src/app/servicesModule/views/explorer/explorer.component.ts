import { Component, OnInit, ViewChild, HostListener, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { MdbTablePaginationComponent, MdbTableService, MdbTableDirective, ModalDirective } from 'ng-uikit-pro-standard';
import { Address, UInt64 } from 'tsjs-xpx-chain-sdk';
import { first } from "rxjs/operators";
import { AppConfig } from '../../../config/app.config';
import { ProximaxProvider } from '../../../shared/services/proximax.provider';
import { NodeService } from "../../services/node.service";
import { TransactionsInterface, TransactionsService } from '../../../transactions/services/transactions.service';
import { WalletService } from '../../../wallet/services/wallet.service';
import { SharedService } from '../../../shared/services/shared.service';
import { HeaderServicesInterface } from '../../services/services-module.service';
import { DataBridgeService } from 'src/app/shared/services/data-bridge.service';
import { PaginationInstance } from 'ngx-pagination';

@Component({
  selector: 'app-explorer',
  templateUrl: './explorer.component.html',
  styleUrls: ['./explorer.component.css']
})
export class ExplorerComponent implements OnInit, AfterViewInit {

  @ViewChild(MdbTablePaginationComponent, { static: true }) mdbTablePagination: MdbTablePaginationComponent;
  @ViewChild(MdbTableDirective, { static: true }) mdbTable: MdbTableDirective;
  @ViewChild('modalExplorer', { static: true }) modalExplorer: ModalDirective;

  configExplorer: PaginationInstance = {
    id: 'explorer',
    itemsPerPage: 10,
    currentPage: 1
  };
  paramsHeader: HeaderServicesInterface = {
    moduleName: 'Transaction explorer',
    componentName: 'Explore'
  };
  searching = false;
  objectKeys = Object.keys;
  firstItemIndex;
  lastItemIndex;
  typeTransactions: any;
  typeNode = '';
  typeSearch = '';
  paramSearch = '';
  previous: any = '';
  searchText: string = '';
  elements: any = [];
  dataSelected: TransactionsInterface = null;
  headElements = ['Type', '', 'Sender', 'Recipient'];
  optionTypeSearch = [
    {
      'value': 'address',
      'label': 'Address'
    }, {
      'value': 'publickey',
      'label': 'Public Key'
    }, {
      'value': 'hash',
      'label': 'Hash'
    }
  ];



  constructor(
    private tableService: MdbTableService,
    private cdRef: ChangeDetectorRef,
    private walletService: WalletService,
    private proximaxProvider: ProximaxProvider,
    private nodeService: NodeService,
    private sharedService: SharedService,
    private transactionService: TransactionsService,
    private dataBridge: DataBridgeService
  ) { }

  ngOnInit() {
    this.typeTransactions = this.transactionService.arraTypeTransaction;
  }

  searchData() {
    if (!this.searching) {
      this.elements = [];
      if (this.typeSearch === '') {
        this.sharedService.showError('', 'Please, select a type search');
        return;
      } else if (this.paramSearch === '') {
        var tp = '';
        if (this.typeSearch === 'address') {
          tp = 'a address';
        } else if (this.typeSearch === 'hash') {
          tp = 'a hash';
        } else if (this.typeSearch === 'publickey') {
          tp = 'a publickey';
        }

        this.sharedService.showError('', `Please, add ${tp}`);
        return;
      }

      this.mdbTable.setDataSource(this.elements);
      this.elements = this.mdbTable.getDataSource();
      this.searching = true;
      if (this.typeSearch === 'address') {
        //from address
        if (this.paramSearch.length === 40 || this.paramSearch.length === 46) {
          this.proximaxProvider.getAccountInfo(Address.createFromRawAddress(this.paramSearch)).pipe(first()).subscribe(
            accountInfo => {
              this.proximaxProvider.getTransactionsFromAccount(accountInfo.publicAccount).subscribe(
                resp => {
                  // console.log('with address info ', resp);
                  this.buildTransaction(resp);
                  this.searching = false;
                },
                error => {
                  // console.log(error);
                  this.searching = false;
                }
              );
            }
          );
        } else {
          this.paramSearch = '';
          this.searching = false;
        }

      } else if (this.typeSearch === 'publickey') {
        //From publickey
        if (this.paramSearch.length === 64) {
          const publicAccount = this.proximaxProvider.createPublicAccount(this.paramSearch, this.walletService.currentAccount.network);
          this.proximaxProvider.getTransactionsFromAccount(publicAccount, this.nodeService.getNodeSelected()).subscribe(
            resp => {
              this.searching = false;
              this.buildTransaction(resp);
            },
            error => {
              this.searching = false;
              // console.log(error);
            }
          );
        } else {
          this.paramSearch = '';
          this.searching = false;
        }
      } else if (this.typeSearch === 'hash') {
        //From hash
        if (this.paramSearch.length === 64) {
          this.proximaxProvider.getTransactionInformation(this.paramSearch, this.nodeService.getNodeSelected()).subscribe(
            resp => {
              // console.log('with hash info', resp);
              this.searching = false;
              this.buildTransaction([resp]);
            },
            error => {
              this.searching = false;
              // console.log(error);
            }
          );
        } else {
          this.paramSearch = '';
          this.searching = false;
        }
      }
    }

  }


  buildTransaction(param) {
    const data = [];
    param.forEach(element => {
      const builderTransactions = this.transactionService.getStructureDashboard(element);
      if (builderTransactions !== null) {
        data.push(builderTransactions);
      }

      this.elements = data;
      this.mdbTable.setDataSource(data);
      this.elements = this.mdbTable.getDataSource();
    });
  }

  searchItems() {
    const prev = this.mdbTable.getDataSource();
    if (!this.searchText) {
      this.mdbTable.setDataSource(this.previous);
      this.elements = this.mdbTable.getDataSource();
    }

    if (this.searchText) {
      this.elements = this.mdbTable.searchLocalDataBy(this.searchText);
      this.mdbTable.setDataSource(prev);
    }
  }


  openModal(transaction: TransactionsInterface) {
    const height = transaction.data['transactionInfo'].height.compact();
    if (typeof (height) === 'number') {
      const existBlock = this.dataBridge.filterBlockStorage(height);
      if (existBlock) {
        transaction.timestamp = this.transactionService.dateFormatUTC(new UInt64([existBlock.timestamp.lower, existBlock.timestamp.higher]));
        const calculateEffectiveFee = this.transactionService.amountFormatterSimple(existBlock.feeMultiplier * transaction.data.size)
        transaction.effectiveFee = this.transactionService.getDataPart(calculateEffectiveFee, 6);
      }else {
        this.proximaxProvider.getBlockInfo(height).subscribe(
          next => {
            this.dataBridge.validateBlock(next);
            transaction.timestamp = this.transactionService.dateFormatUTC(next.timestamp);
            const calculateEffectiveFee = this.transactionService.amountFormatterSimple(next.feeMultiplier * transaction.data.size);
            transaction.effectiveFee = this.transactionService.getDataPart(calculateEffectiveFee, 6);
          }
        );
      }
    } else {
      transaction.effectiveFee = this.transactionService.getDataPart('0.00000', 6);
    }

    this.dataSelected = transaction;
    this.modalExplorer.show();
  }
}
