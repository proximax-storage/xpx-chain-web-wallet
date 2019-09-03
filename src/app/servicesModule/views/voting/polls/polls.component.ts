import { Component, OnInit } from '@angular/core';
import { CreatePollStorageService } from 'src/app/servicesModule/services/create-poll-storage.service';
import { environment } from 'src/environments/environment';
import { PublicAccount } from 'tsjs-xpx-chain-sdk';
import { WalletService } from 'src/app/wallet/services/wallet.service';
import { AppConfig } from 'src/app/config/app.config';
import { PaginationInstance } from 'ngx-pagination';
import { Router } from '@angular/router';
import { SharedService } from 'src/app/shared/services/shared.service';
import { Subscription } from 'rxjs';
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
  progressBar: number = 0;
  routes = {
    backToService: `/${AppConfig.routes.service}`,
    voteInpoll: `/${AppConfig.routes.voteInPoll}/`,
    createpoll: `/${AppConfig.routes.createPoll}/`
    
  };
  configAdvance: PaginationInstance = {
    id: 'advanced',
    itemsPerPage: 5,
    currentPage: 1
  };
  headElements = ['Name', 'Poll type', 'Start date ', 'Status'];
  pollResult: PollInterface[] = [];
  filter: string = '';
  promosePoadTransactions: Promise<void>;
  subscription: Subscription

  constructor(
    private router: Router,
    private createPollStorageService: CreatePollStorageService,
    private walletService: WalletService,
    private sharedService: SharedService,

  ) {
    this.progressBar = 0
    this.showBarProgress = false;
  }

  ngOnInit() {
    this.showBarProgressone = true;
    const publicAccount = PublicAccount.createFromPublicKey(environment.pollsContent.public_key, this.walletService.currentAccount.network)
    this.promosePoadTransactions = this.createPollStorageService.loadTransactions(publicAccount).then(resp => {
      console.log('resprespresprespresp', resp)


      this.showBarProgressone = false;
      if (this.getPoll) {
        if (resp) {
          this.getPollStorage();
        }
      }
    });



  }
  ngOnDestroy() {
    this.getPoll = false;
    console.log(this.subscription)
    if (this.subscription) {
      this.subscription.unsubscribe();
    }


    this.promosePoadTransactions.finally()
    // this.sub.unsubscribe();
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
      console.log(data.size)
      resultData.push(data.result);
      if (resultData.length > 0) {
        resultData.map(elemt => {
          return elemt.createdDate = new Date(elemt.createdDate)
        });
        resultData.sort((date1, date2) => {
          return date2.createdDate.getTime() - date1.createdDate.getTime();
        });
        this.showBarProgress = true;
        this.resultLength = resultData.length;
        this.cantPolls = data.size;
        const progress = this.resultLength * 100 / this.cantPolls;
        this.progressBar = Math.round(progress * 100) / 100;
        this.pollResult = resultData;
        if (resultData.length === this.cantPolls) {
          // this.subscription.unsubscribe();
          this.showRefresh = true;
          this.showBarProgress = false;
        }
      } else {


      }

    });
    console.log("me suscribi", this.subscription)
  }

  refreshData(event) {
    if (this.showRefresh) {
      this.showRefresh = false;
      const publicAccount = PublicAccount.createFromPublicKey(environment.pollsContent.public_key, this.walletService.currentAccount.network)
      this.createPollStorageService.loadTransactions(publicAccount).then(resp => {
        this.showBarProgressone = false;
        this.getPollStorage();
      });
    }
  }
  filterType(type: number) {
    switch (type) {
      case 0:
        return 'witheList';
      case 1:
        return 'Public';
    }
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
  formtDate(format: string | number | Date) {
    const datefmt = new Date(format);
    const day = (datefmt.getDate() < 10) ? `0${datefmt.getDate()}` : datefmt.getDate();
    const month = (datefmt.getMonth() + 1 < 10) ? `0${datefmt.getMonth() + 1}` : datefmt.getMonth() + 1;
    const hours = (datefmt.getHours() < 10) ? `0${datefmt.getHours()}` : datefmt.getHours();
    const minutes = (datefmt.getMinutes() < 10) ? `0${datefmt.getMinutes()}` : datefmt.getMinutes();
    const seconds = (datefmt.getSeconds() < 10) ? `0${datefmt.getSeconds()}` : datefmt.getSeconds();
    return `${datefmt.getFullYear()}-${month}-${day}  ${hours}:${minutes}:${seconds}`;
  }

}
export interface PollInterface {
  name: string;
  desciption: string;
  id: string;
  type: number;
  isPrivate: boolean,
  isMultiple: boolean,
  options: optionsPoll[];
  witheList: Object[];
  blacklist?: Object[];
  startDate: Date;
  endDate: Date;
  createdDate: Date;
  quantityOption: number;
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