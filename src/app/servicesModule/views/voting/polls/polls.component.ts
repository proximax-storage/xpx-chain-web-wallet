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
    backToService: `/${AppConfig.routes.service}`
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
        return 'blackList';
      case 2:
        return 'Public';
    }
  }

}
export interface PollInterface {
  name: string;
  desciption: string;
  id: number;
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