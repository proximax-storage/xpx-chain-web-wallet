import { Component, OnInit, ViewChild, HostListener, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { MdbTablePaginationComponent, MdbTableService } from 'ng-uikit-pro-standard';
import { MosaicId, Transaction } from 'nem2-sdk';
import { AppConfig } from '../../../config/app.config';
import { NemProvider } from '../../../shared/services/nem.provider';
import { ServiceModuleService } from "../../../servicesModule/services/service-module.service";

@Component({
  selector: 'app-explorer',
  templateUrl: './explorer.component.html',
  styleUrls: ['./explorer.component.scss']
})
export class ExplorerComponent implements OnInit, AfterViewInit {

    @ViewChild(MdbTablePaginationComponent) mdbTablePagination: MdbTablePaginationComponent;
    firstItemIndex;
    lastItemIndex;
    typeNode = '';
    route = { addNode: `/${AppConfig.routes.addNode}` };
    headElements = ['Account', 'Amount', 'Mosaic', 'Date'];
    hash = 'B8C4C21C31BBF87FED9FEE080C66C67C46D051F7507E8B368909E4E77E80545D';
    previous: any;
    searchText: string;
    elements: any = [];
    dataSelected: Transaction;
    nodes: Array<string>;

    constructor(
      private tableService: MdbTableService,
      private cdRef: ChangeDetectorRef,
      private nemProvider: NemProvider,
      private serviceModule: ServiceModuleService
    ) {
      console.log('explorer component is working...');
      this.nodes = JSON.parse(localStorage.getItem('proxi-nodes'));
    }

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
      if (this.hash !== '') {
        console.log('xx');
        this.nemProvider.getTransactionInformation(this.hash, this.serviceModule.getNode()).subscribe(
          resp => {
            console.log(resp);
            const mosaicId = resp['mosaics'][0].id;
            const mosaic = new MosaicId([mosaicId.id.higher, mosaicId.id.lower]);
            const date = `${resp.deadline.value.monthValue()}/${resp.deadline.value.dayOfMonth()}/${resp.deadline.value.year()}`;
            this.elements = [];
            this.elements.push({
              address: resp.signer.address['address'],
              amount: resp['mosaics'][0].amount.compact(),
              message: resp['message'],
              transactionInfo: resp.transactionInfo,
              fee: resp.fee.compact(),
              mosaic: 'xem',
              date: date,
              recipient: resp['recipient'],
              signer: resp.signer
            });

            this.tableService.setDataSource(this.elements);
            this.elements = this.tableService.getDataSource();
            this.previous = this.tableService.getDataSource();

            // for (let i = 1; i <= 15; i++) {
            //   this.elements.push({
            //     blockh: '1857576',
            //     harv: 'NDS7AWXL36QVNHAXJ7F7JCFBSD23IPFJ2VAZLAM5 ',
            //     txes: '0',
            //     fee: '0.6',
            //     timestamp: '2018-10-20 07:19:27',
            //     age: '1d, 5h, 45m, 14s',
            //   });
            // }
          }
        );
      }
    }
  }
