import { Component, OnInit, ViewChild, HostListener, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { MdbTablePaginationComponent, MdbTableService, MdbTableDirective } from 'ng-uikit-pro-standard';
import { MosaicId, Transaction, Address, TransactionType } from 'tsjs-xpx-catapult-sdk';
import { AppConfig } from '../../../config/app.config';
import { ProximaxProvider } from '../../../shared/services/proximax.provider';
import { NodeService } from "../../services/node.service";
import { SharedService, WalletService } from "../../../shared";
import { TransactionsService } from "../../../transactions/service/transactions.service";
import { first } from "rxjs/operators";

@Component({
  selector: 'app-explorer',
  templateUrl: './explorer.component.html',
  styleUrls: ['./explorer.component.scss']
})
export class ExplorerComponent implements OnInit, AfterViewInit {

  @ViewChild(MdbTablePaginationComponent) mdbTablePagination: MdbTablePaginationComponent;
  @ViewChild(MdbTableDirective) mdbTable: MdbTableDirective;
  searching = false;
  objectKeys = Object.keys;
  firstItemIndex;
  lastItemIndex;
  typeNode = '';
  typeSearch = '';
  paramSearch = '';
  previous: any = '';
  searchText: string = '';
  elements: any = [];
  dataSelected: Transaction | any;
  headElements = ['Account', 'Amount', 'Mosaic', 'Date'];
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
    private transactionsService: TransactionsService
  ) { }

  @HostListener('input') oninput() {
    // this.searchItems();
    this.mdbTablePagination.searchText = this.searchText;
  }

  ngOnInit() {

  }

  ngAfterViewInit() {
    this.mdbTablePagination.setMaxVisibleItemsNumberTo(5);
    this.firstItemIndex = this.mdbTablePagination.firstItemIndex;
    this.lastItemIndex = this.mdbTablePagination.lastItemIndex;

    this.mdbTablePagination.calculateFirstItemIndex();
    this.mdbTablePagination.calculateLastItemIndex();
    this.cdRef.detectChanges();
  }

  onNextPageClick(data: any) {
    this.firstItemIndex = data.first;
    this.lastItemIndex = data.last;
  }

  onPreviousPageClick(data: any) {
    this.firstItemIndex = data.first;
    this.lastItemIndex = data.last;
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
      this.previous = this.mdbTable.getDataSource();
      this.searching = true;
      if (this.typeSearch === 'address') {
        //from address
        if (this.paramSearch.length === 40) {
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
        const publicAccount = this.proximaxProvider.createPublicAccount(this.paramSearch, this.walletService.network);
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
        //From hash
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
      }
    }

  }


  buildTransaction(param) {
    param.forEach(element => {
      if (element.type === TransactionType.TRANSFER) {
        const date = `${element.deadline.value.monthValue()}/${element.deadline.value.dayOfMonth()}/${element.deadline.value.year()}`;
        this.elements.push({
          address: element.signer.address['address'],
          amount: element['mosaics'][0].amount.compact(),
          message: element['message'],
          transactionInfo: element.transactionInfo,
          fee: element.fee.compact(),
          mosaic: this.proximaxProvider.mosaicXpx.mosaic,
          date: date,
          recipient: element['recipient'],
          signer: element.signer
        });

        this.mdbTable.setDataSource(this.elements);
        this.elements = this.mdbTable.getDataSource();
        this.previous = this.mdbTable.getDataSource();
      }
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
}
