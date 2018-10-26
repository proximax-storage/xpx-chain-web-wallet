import { Component, OnInit } from '@angular/core';
import { WalletService } from '../../../shared';
import { NemProvider } from '../../../shared/services/nem.provider';
import { mergeMap } from 'rxjs/operators'
import {
  TransferTransaction, Deadline, XEM, PlainMessage, NetworkType, Account, TransactionHttp, PublicAccount

} from 'nem2-sdk';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  isLinear = false;
  constructor(
    private walletService: WalletService,
    private nemProvider: NemProvider

  ) {
  }

  ngOnInit() {
      //  this.enviarTrasferencia();
    //obtener balance de la cuenta d
    this.nemProvider.getBalance(this.walletService.address).pipe(
      mergeMap((_) => _)
    ).subscribe(mosaic => console.log('You have', mosaic, mosaic.fullName()),
      err => console.error(err));
  }
   enviarTrasferencia() {
     //9E8A529894129F737C40560DCAE25E99C91C18F55E2417C1188398DB0D3D09BD  private key
     const recipientAddress = this.nemProvider.createFromRawAddress('SB3RWA-5O4EHD-64WZU3-5C3FTC-5QFYSN-P64VCV-NDX3');

    const transferTransaction = TransferTransaction.create(
      Deadline.create(),
       recipientAddress,
     [XEM.createRelative(10000000)],
       PlainMessage.create('Welcome To NEM'),
       NetworkType.MIJIN_TEST);
     const account = Account.createFromPrivateKey('0F3CC33190A49ABB32E7172E348EA927F975F8829107AAA3D6349BB10797D4F6', NetworkType.MIJIN_TEST);
     const signedTransaction = account.sign(transferTransaction);

     const transactionHttp = new TransactionHttp('http://192.168.10.38:3000/');

     transactionHttp
       .announce(signedTransaction)
       .subscribe(
        x => console.log(x),
        err => console.error(err));


  }
}
