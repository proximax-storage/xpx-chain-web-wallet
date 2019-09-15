import { Component, OnInit } from '@angular/core';
import { CreatePollStorageService } from 'src/app/servicesModule/services/create-poll-storage.service';
import { environment } from 'src/environments/environment';
import { PublicAccount, Account } from 'tsjs-xpx-chain-sdk';
import { WalletService } from 'src/app/wallet/services/wallet.service';
import { AppConfig } from 'src/app/config/app.config';
import { PaginationInstance } from 'ngx-pagination';
import { Router } from '@angular/router';
import { SharedService } from 'src/app/shared/services/shared.service';
import { Subscription } from 'rxjs';
import { ProximaxProvider } from 'src/app/shared/services/proximax.provider';
@Component({
  selector: 'app-polls',
  templateUrl: './polls.component.html',
  styleUrls: ['./polls.component.css']
})
export class PollsComponent implements OnInit {
  getPoll = true;
  showBarProgress: boolean;
  showBarProgressone = false;
  showRefresh = false;
  cantPolls = 0;
  resultLength = 0;
  publicKeyNotFound = '0000000000000000000000000000000000000000000000000000000000000000';

  progressBar: number = 0;
  objectValue: object;
  keyObjectValue: string;
  placeholderText = 'Enter search text'
  selectedSearch = 'All'
  routes = {
    backToService: `/${AppConfig.routes.service}`,
    voteInpoll: `/${AppConfig.routes.voteInPoll}/`,
    createpoll: `/${AppConfig.routes.createPoll}/`

  };
  configAdvance: PaginationInstance = {
    id: 'advanced',
    itemsPerPage: 10,
    currentPage: 1
  };
  headElements = ['Name', 'Poll type', 'End date', 'Status'];
  pollResult: PollInterface[] = [];


  filter: string = '';
  promosePoadTransactions: Promise<void>;
  subscription: Subscription
  filterObjectSelect: any = [];
  showSearch: boolean;

  constructor(
    private router: Router,
    private createPollStorageService: CreatePollStorageService,
    private walletService: WalletService,
    private sharedService: SharedService,
    private proximaxProvider: ProximaxProvider,

  ) {
    this.progressBar = 0
    this.showBarProgress = false;
    this.showSearch = false;
    this.objectValue = null
    this.setSelectFilter();
  }

  ngOnInit() {
    this.showBarProgressone = true;
    const publicAccount = PublicAccount.createFromPublicKey(environment.pollsContent.public_key, this.walletService.currentAccount.network)

    this.loadTransactionsStorage(publicAccount, '')

  }

  loadTransactionsStorage(publicAccount?: PublicAccount, address?: string) {
    this.promosePoadTransactions = this.createPollStorageService.loadTransactions(publicAccount, address).then(resp => {

      this.showBarProgressone = false;
      if (this.getPoll) {
        if (resp) {
          this.getPollStorage();
        }
      }
    });


  }
  setSelectFilter() {
    this.filterObjectSelect = [
      { value: 'All', label: 'All', disabled: false, selected: true },
      { value: 'name', label: 'name', disabled: false },
      { value: 'typeName', label: 'type', disabled: false },
      { value: 'statusPoll', label: 'status', disabled: false },
      { value: 'address', label: 'ID Address (private poll)', disabled: false, selected: true }

    ]

  }
  ngOnDestroy() {
    this.getPoll = false;
    if (this.subscription) {
      this.subscription.unsubscribe();
    }


    this.promosePoadTransactions.finally()
    // this.sub.unsubscribe();
  }

  filterSelected(event) {
    this.placeholderText = 'Enter search text'
    this.showSearch = false;
    this.keyObjectValue = (event) ? event.value : 'All';
    this.filterChange(this.filter)
  }
  filterChange(event) {


    let key = this.keyObjectValue;
    if (key !== 'address') {
      this.objectValue = {}
      if (key !== '' && key !== 'All' && key !== undefined) {
        this.objectValue[key] = event
      } else {
        this.objectValue['All'] = event
      }
    } else if (key === 'address') {
      this.showSearch = true;
      this.placeholderText = 'Enter address private poll'
      this.searchAddress(event)

    }
  }
  searchAddress(address: string) {
    const addressTrimAndUpperCase = address
      .trim()
      .toUpperCase()
      .replace(/-/g, '');
    if (!address)
      return
  
    if (new String(addressTrimAndUpperCase).length < 40 || new String(addressTrimAndUpperCase).length > 40)
      return this.sharedService.showError('', 'Address has to be 40 characters long');
    const currentAccount = Object.assign({}, this.walletService.getCurrentAccount());
    if (!this.proximaxProvider.verifyNetworkAddressEqualsNetwork(
      this.proximaxProvider.createFromRawAddress(currentAccount.address).plain(), address)
    )
      return this.sharedService.showError('', 'Invalid  address');
    this.showBarProgressone = true;
    return this.proximaxProvider.getAccountInfo(this.proximaxProvider.createFromRawAddress(address)).subscribe(
      accountInfo => {
        this.showBarProgressone = false;
        this.filter = ''
        if (accountInfo.publicKey === this.publicKeyNotFound) {
          return this.sharedService.showError('', `Address ${this.proximaxProvider.createFromRawAddress(address).plain()} has no public key yet on blockchain`);
          // this.proximaxProvider.
        } else {
          const publicAccount: PublicAccount = PublicAccount.createFromPublicKey(accountInfo.publicKey, accountInfo.address.networkType)
          this.loadTransactionsStorage(publicAccount, '')
        }

      }, erro => {
        this.showBarProgressone = false;
        this.filter = ''
        return this.sharedService.showError('', 'Invalid account address');
      });


  }

 

  routerRouterLink(link: string) {
    // Create Book logic
    if (this.walletService.canVote) {
      this.router.navigate([link]);
    } else {
      this.sharedService.showInfo('', `We are validating your vote, please wait a few seconds`);
    }
  }


  /**
  * get the storage poll
  *
  * 
  * @memberof PollsComponent
  */
  getPollStorage() {
    this.showRefresh = false;
    this.pollResult = []

    const resultData: PollInterface[] = [];


    this.subscription = this.createPollStorageService.getPolls$().subscribe(data => {
      // let endDate = new Date(data.result.endDate).getTime();
      // let starDate = new Date(data.result.startDate).getTime();
      // const now = new Date().getTime();

      resultData.push(data.result);
      if (resultData.length > 0) {
        resultData.map(elemt => {
          elemt.createdDate = new Date(elemt.createdDate);
          elemt.typeName = this.filterType(elemt.type);
          elemt.statusPoll = this.statusPoll(elemt.endDate, elemt.startDate)
        });
        resultData.sort((date1, date2) => {
          return date2.createdDate.getTime() - date1.createdDate.getTime();
        });
        this.showBarProgress = true;
        this.resultLength = resultData.length;
        this.cantPolls = data.size;
        const progress = this.resultLength * 100 / this.cantPolls;
        this.progressBar = Math.round(progress * 100) / 100;
        this.pollResult = resultData

        if (resultData.length === this.cantPolls) {

          setTimeout(() => {
            this.objectValue = undefined;
            this.filter = '';
          });
          // this.subscription.unsubscribe();
          this.showRefresh = true;
          this.showBarProgress = false;
        }
      }
    });
  }



  refreshData(event) {
    this.filter = ''
    // this.filterChange('')
    // this.setSelectFilter()
    if (this.showRefresh) {
      this.showRefresh = false;
      const publicAccount = PublicAccount.createFromPublicKey(environment.pollsContent.public_key, this.walletService.currentAccount.network)
      this.createPollStorageService.loadTransactions(publicAccount).then(resp => {
        this.showBarProgressone = false;
        this.getPollStorage();
      });
    }
  }

  /**
   *
   * @param format
   */
  formtDate(format: string | number | Date) {
    const datefmt = new Date(format);
    const day = (datefmt.getDate() < 10) ? `0${datefmt.getDate()}` : datefmt.getDate();
    const month = (datefmt.getMonth() + 1 < 10) ? `0${datefmt.getMonth() + 1}` : datefmt.getMonth() + 1;
    const hours = (datefmt.getHours() < 10) ? `0${datefmt.getHours()}` : datefmt.getHours();
    const minutes = (datefmt.getMinutes() < 10) ? `0${datefmt.getMinutes()}` : datefmt.getMinutes();
    const seconds = (datefmt.getSeconds() < 10) ? `0${datefmt.getSeconds()}` : datefmt.getSeconds();
    return `${datefmt.getFullYear()}-${month}-${day}  ${hours}:${minutes}:${seconds}`;
  }

  /**
   *
   * @param type
   */
  filterType(type: number) {
    switch (type) {
      case 0:
        return 'witheList';
      case 1:
        return 'Open';
    }
  }

  search() {

  }

  /**
  * validate status date poll 
  *
  * @param {any} obj
  * @memberof PollsComponent
  */
  statusPoll(endDate: string | number | Date, starDate: string | number | Date) {
    endDate = new Date(endDate).getTime();
    starDate = new Date(starDate).getTime();
    const now = new Date().getTime();
    if (starDate <= now && endDate >= now) {
      return 'Ongoing';
    } else if (starDate > now) {
      return 'Future';
    } else {
      return 'Ended';
    }
  }


}
export interface PollInterface {
  name: string;
  desciption: string;
  id: string;
  type: number;
  typeName: string;
  isPrivate: boolean,
  isMultiple: boolean,
  options: optionsPoll[];
  witheList: Object[];
  blacklist?: Object[];
  startDate: Date;
  endDate: Date;
  createdDate: Date;
  quantityOption: number;
  statusPoll: string
}

export interface optionsPoll {
  name: string;
  publicAccount: PublicAccount
}
export interface FileInterface {
  name: string;
  content: any;
  type: string;
  extension: string;
}
