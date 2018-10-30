import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from "@angular/forms";
import { WalletService } from '../../../../shared/services/wallet.service';
import { NemProvider } from '../../../../shared/services/nem.provider';
import { SharedService } from '../../../../shared';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Address, UInt64, Account, TransferTransaction, Transaction } from 'nem2-sdk';
@Component({
  selector: 'app-polls',
  templateUrl: './polls.component.html',
  styleUrls: ['./polls.component.scss']
})
export class PollsComponent implements OnInit {
  privateKey: string = '01E4B2794BD5EAC9A2A20C1F8380EF79EBB7F369A5A6040291DB3875867F4727';
  listPoll: Array<any>;
  listPolloption: Array<any>;
  showDetail = false;
  address: string;
  doe: string;
  publicKey: string;
  title: string;
  type: string;
  description: string;
  keyObject = Object.keys;
  @BlockUI() blockUI: NgBlockUI;
  constructor(

    private fb: FormBuilder,
    private walletService: WalletService,
    private nemProvider: NemProvider,
    private sharedService: SharedService,
  ) {

  }

  ngOnInit() {
    this.blockUI.start('Loading...'); // Start blocking

    this.nemProvider.getAllTransactionsFromAccount(this.nemProvider.getPublicAccountFromPrivateKey(this.privateKey, this.walletService.network)
    ).subscribe(
      (infTrans: Transaction[]) => {

        this.listPoll = infTrans.map((tran: any) => {
          return JSON.parse(tran.message.payload);
        });
        this.blockUI.stop();

      },
      error => {
        this.sharedService.showError('Error', '¡unexpected error!');
        this.blockUI.stop(); // Stop blocking
        console.error(error);
      })
  }

  getDataPull(data) {
    this.blockUI.start('Loading...'); // Start blocking
    this.address = data['address']
    this.doe = data['doe']

    console.log(this.doe);
    this.publicKey = data['publicKey']
    this.title = data['title']
    this.type = data['type']

    const publicAccount = this.nemProvider.createPublicAccount(this.publicKey, this.walletService.network);

    this.nemProvider.getAllTransactionsFromAccount(publicAccount).subscribe(
      (infTrans: Transaction[]) => {

        console.log(infTrans)
        this.listPolloption = infTrans.map((tran: any) => {

          return JSON.parse(tran.message.payload);
        })


        this.listPolloption.forEach(element => {

          console.log(element)

        });
        //  console.log( this.description['description'] )
        this.blockUI.stop();
        this.showDetail = true;
        // 


      },
      error => {
        this.sharedService.showError('Error', '¡unexpected error!');
        this.blockUI.stop(); // Stop blocking
        console.error(error);;
      }
    );




  }



}
