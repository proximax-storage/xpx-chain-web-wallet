import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { TransactionsInterface, TransactionsService } from '../../../transactions/services/transactions.service';
import { MosaicService, MosaicsStorage } from 'src/app/servicesModule/services/mosaic.service';
import { ProximaxProvider } from 'src/app/shared/services/proximax.provider';
import { environment } from '../../../../environments/environment';
import { SharedService } from 'src/app/shared/services/shared.service';
import { EncryptedMessage } from 'tsjs-xpx-chain-sdk'
import { WalletService } from "../../../wallet/services/wallet.service";

@Component({
  selector: 'app-transfer-type',
  templateUrl: './transfer-type.component.html',
  styleUrls: ['./transfer-type.component.css']
})
export class TransferTypeComponent implements OnInit {

  @Input() transferTransaction: TransactionsInterface;
  searching = true;
  simple = null;
  typeTransactionHex: string;
  msg = '';
  typeMsg = null
  amountTwoPart: { part1: string; part2: string; };
  nis1hash: any;
  routeNis1Explorer = environment.nis1.urlExplorer;
  // E7620BC08F46B1B56A9DF29541513318FD51965229D4A4B3B3DAAFE82819DE46
  message: any;
  panelDecrypt: number = 0;
  password = null
  passwordMain = 'password'
  recipientPublicAccount = null

  constructor(
    public transactionService: TransactionsService,
    public sharedService: SharedService,
    public proximaxProvider: ProximaxProvider,
    public walletService: WalletService
  ) { }

  ngOnInit() {
    console.log(this.walletService.currentAccount);
    this.verifyRecipientInfo()
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    this.searching = true;
    this.typeTransactionHex = `${this.transferTransaction.data['type'].toString(16).toUpperCase()}`;
    this.message = this.transferTransaction.data.message
    console.log(this.message);
    if (this.transferTransaction.data.transactionInfo) {
      const height = this.transferTransaction.data.transactionInfo.height.compact();
      // console.log(typeof(height));
    }
    if (this.transferTransaction.data['message'].payload !== '') {
      try {
        const simple = false;
        const addressAccountMultisig = environment.swapAccount.addressAccountMultisig;
        const addressAccountSimple = environment.swapAccount.addressAccountSimple;
        const addressSender = this.transferTransaction.sender.address.plain();
        if ((addressSender === addressAccountMultisig) || (addressSender === addressAccountSimple)) {
          const msg = JSON.parse(this.transferTransaction.data['message']);
          if (msg && msg['type'] === 'Swap') {
            this.msg = msg['message'];
            this.nis1hash = msg['nis1Hash'];
            if (this.transferTransaction.data['mosaics'].length > 0) {
              // console.log(this.transferTransaction.data['mosaics'][0].amount.compact());
              const amount = this.transactionService.amountFormatterSimple(this.transferTransaction.data['mosaics'][0].amount.compact());
              this.amountTwoPart = this.transactionService.getDataPart(amount.toString(), 6);
              // console.log('----> ', this.amountTwoPart);
              this.simple = false;
            } else {
              this.simple = false;
            }
          } else {
            this.simple = true;
          }
        } else {
          this.simple = true;
        }
      } catch (error) {
        // console.log(error);
        this.simple = true;
      }
    } else {
      this.simple = true;
    }
  }

  changeInputType(inputType) {
    let newType = this.sharedService.changeInputType(inputType)
    this.passwordMain = newType;
  }

  decryptMessage() {
    let firstAcount = this.walletService.currentAccount
    let account = this.walletService.decrypt(this.password, firstAcount)
    console.log(this.password, account, firstAcount);

    //let message = EncryptedMessage.decrypt()
  }

  async verifyRecipientInfo() {
    let address = this.proximaxProvider.createFromRawAddress(this.transferTransaction.recipient['address'])
    try {
      let accountInfo = await this.proximaxProvider.getAccountInfo(address).toPromise()
      console.log(accountInfo);
      this.recipientPublicAccount = accountInfo.publicAccount
    } catch (e) {

    }
  }

}
