import { Component, OnInit, ViewChild, HostListener, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { MdbTablePaginationComponent, MdbTableService } from 'ng-uikit-pro-standard';
import { MosaicId, Transaction, Address, TransactionType } from 'proximax-nem2-sdk';
import { AppConfig } from '../../../config/app.config';
import { ProximaxProvider } from '../../../shared/services/proximax.provider';
import { NodeService } from "../../../servicesModule/services/node.service";
import { SharedService, WalletService } from "../../../shared";
import { TransactionsService } from "../../../transactions/service/transactions.service";
import { first } from "rxjs/operators";

@Component({
  selector: 'app-explorer',
  templateUrl: './explorer.component.html',
  styleUrls: ['./explorer.component.scss']
})
export class ExplorerComponent implements OnInit, AfterViewInit {
  blockInput: boolean;

  @ViewChild(MdbTablePaginationComponent) mdbTablePagination: MdbTablePaginationComponent;
  firstItemIndex;
  lastItemIndex;
  typeNode = '';
  typeSearch = '';
  paramSearch = '';
  previous: any;
  searchText: string;
  elements = [];
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

    if (this.typeSearch === 'address') {
      //from address
      this.blockInput = true;
      this.proximaxProvider.getAccountInfo(Address.createFromRawAddress(this.paramSearch)).pipe(first()).subscribe(
        accountInfo => {

          this.proximaxProvider.getAllTransactionsFromAccount(accountInfo.publicAccount).subscribe(
            resp => {
              // console.log('with address info ', resp);
              this.buildTransaction(resp);
            },
            error => {
              this.blockInput = false;
              // console.log(error);
            }
          );
        }
      );
    } else if (this.typeSearch === 'publickey') {
      //From publickey
      this.blockInput = true;
      const publicAccount = this.proximaxProvider.createPublicAccount(this.paramSearch, this.walletService.network);
      this.proximaxProvider.getAllTransactionsFromAccount(publicAccount, this.nodeService.getNodeSelected()).subscribe(
        resp => {

          this.buildTransaction(resp);
        },
        error => {
          this.blockInput = false;
          // console.log(error);
        }
      );
    } else {
      //From hash
      this.blockInput = true;
      this.proximaxProvider.getTransactionInformation(this.paramSearch, this.nodeService.getNodeSelected()).subscribe(
        resp => {
          // console.log('with hash info', resp);
          this.buildTransaction([resp]);
        },
        error => {
          this.blockInput = false;
          // console.log(error);
        }
      );
    }
  }


  buildTransaction(param) {
    this.blockInput = false;
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
      }
    });
  }
}
