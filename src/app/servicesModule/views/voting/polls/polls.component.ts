import { Component, OnInit } from '@angular/core';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { NemProvider } from '../../../../shared/services/nem.provider';
import { WalletService } from '../../../../shared/services/wallet.service';
import { Transaction } from 'proximax-nem2-sdk';

@Component({
  selector: 'app-polls',
  templateUrl: './polls.component.html',
  styleUrls: ['./polls.component.scss']
})
export class PollsComponent implements OnInit {

  @BlockUI() blockUI: NgBlockUI;
  privateKey: string = '6453DE5D725067F04FC013880AE3E8E817B576FA9F0C15FDDE18A883FEACF681';


  constructor(
    private nemProvider: NemProvider,
    private walletService: WalletService
  ) { }


  ngOnInit() {
    this.blockUI.start('Loading...'); // Start blocking
    const publicAccount = this.nemProvider.getPublicAccountFromPrivateKey(this.privateKey, this.walletService.network);
    const queryP = { pageSize: 0, id: '' };
    this.nemProvider.getAllTransactionsFromAccount(publicAccount, queryP).subscribe(
      (transactionInfo: Transaction[]) => {
        console.log(transactionInfo);
        this.blockUI.stop();
        // this.listPoll = infTrans.map((tran: any) => {
        //   return JSON.parse(tran.message.payload);
        // });
        // this.blockUI.stop();
      },
      error => {
        // this.sharedService.showError('Error', '¡unexpected error!');
        // this.blockUI.stop(); // Stop blocking
        console.error(error);
        this.blockUI.stop();
      })
  }
}
