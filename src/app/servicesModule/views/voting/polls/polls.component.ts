import { Component, OnInit } from '@angular/core';
import { CreatePollStorageService } from 'src/app/servicesModule/services/create-poll-storage.service';
import { environment } from 'src/environments/environment';
import { PublicAccount } from 'tsjs-xpx-chain-sdk';
import { WalletService } from 'src/app/wallet/services/wallet.service';
import { AppConfig } from 'src/app/config/app.config';
import { PaginationInstance } from 'ngx-pagination';

@Component({
  selector: 'app-polls',
  templateUrl: './polls.component.html',
  styleUrls: ['./polls.component.css']
})
export class PollsComponent implements OnInit {
  subscription: any;
  showBarProgress: boolean;
  cantPolls = 0;
  resultLength = 0;
  progressBar: number = 0;
  routes = {
    backToService: `/${AppConfig.routes.service}`,
    voteInpoll : `/${AppConfig.routes.voteInPoll}/`
  };
  configAdvance: PaginationInstance = {
    id: 'advanced',
    itemsPerPage: 5,
    currentPage: 1
  };
  headElements = ['Name', 'Poll type', 'Start date ', 'Status'];
  pollResult: PollInterface[] = [];
  filter: string = '';
  constructor(

    private createPollStorageService: CreatePollStorageService,
    private walletService: WalletService,
    
  ) {
    this.progressBar = 0
    this.showBarProgress = false;
  }

  ngOnInit() {

    const publicAccount = PublicAccount.createFromPublicKey(environment.pollsContent.public_key, this.walletService.currentAccount.network)
    this.createPollStorageService.loadTransactions(publicAccount).then(resp => {
      this.getPollStorage();
    });
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
    // this.sub.unsubscribe();
  }



  /**
 * get the storage poll
 *
 * 
 * @memberof PollsComponent
 */
  getPollStorage() {
    const resultData: PollInterface[] = [];
    this.subscription = this.createPollStorageService.getPolls$().subscribe(data => {
      resultData.push(data.result);
      if (resultData.length > 0) {
        console.log("resultData", resultData)
        this.showBarProgress = true;
        this.resultLength = resultData.length;
        this.cantPolls = data.size;
        const progress = this.resultLength * 100 / this.cantPolls;
        this.progressBar = Math.round(progress * 100) / 100;
        this.pollResult = resultData;
        if (resultData.length === this.cantPolls) {
          this.showBarProgress = false;
        }
      } else {


      }

    });
  }

  filterType(type:number){
    console.log('type',type)
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
  options: optionsPoll[];
  witheList?: Object[];
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