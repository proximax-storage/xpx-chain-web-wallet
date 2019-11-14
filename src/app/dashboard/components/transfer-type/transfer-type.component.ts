import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { EncryptedMessage } from 'tsjs-xpx-chain-sdk'
import { TransactionsInterface, TransactionsService } from '../../../transactions/services/transactions.service';
import { ProximaxProvider } from '../../../shared/services/proximax.provider';
import { environment } from '../../../../environments/environment';
import { SharedService } from '../../../shared/services/shared.service';
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
  decryptedMessage: any;
  nis1hash: any;
  routeNis1Explorer = environment.nis1.urlExplorer;
  message: any;
  panelDecrypt: number = 0;
  password = null;
  passwordMain = 'password';
  recipientPublicAccount = null;
  senderPublicAccount = null;

  constructor(
    public transactionService: TransactionsService,
    public sharedService: SharedService,
    public proximaxProvider: ProximaxProvider,
    public walletService: WalletService
  ) { }

  ngOnInit() {
    this.verifyRecipientInfo();
  }


  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    this.searching = true;
    this.typeTransactionHex = `${this.transferTransaction.data['type'].toString(16).toUpperCase()}`;
    this.message = null;
    this.message = this.transferTransaction.data.message;
    this.hideMessage();
    if (this.transferTransaction.data.transactionInfo) {
      const height = this.transferTransaction.data.transactionInfo.height.compact();
    }

    if (this.transferTransaction.data['message'].payload !== '') {
      try {
        const simple = false;
        const addressAccountMultisig = environment.swapAccount.addressAccountMultisig;
        const addressAccountSimple = environment.swapAccount.addressAccountSimple;
        const addressSender = this.transferTransaction.sender.address.plain();
        if ((addressSender === addressAccountMultisig) || (addressSender === addressAccountSimple)) {
          const msg = JSON.parse(this.transferTransaction.data['message'].payload);
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

  /**
   *
   *
   * @memberof TransferTypeComponent
   */
  async verifyRecipientInfo() {
    let address = this.proximaxProvider.createFromRawAddress(this.transferTransaction.recipient['address']);
    try {
      let accountInfo = await this.proximaxProvider.getAccountInfo(address).toPromise();
      this.recipientPublicAccount = accountInfo.publicAccount;
    } catch (e) {}

    this.senderPublicAccount = this.transferTransaction.data.signer;
  }

  /**
   *
   *
   * @param {*} inputType
   * @memberof TransferTypeComponent
   */
  changeInputType(inputType: string) {
    let newType = this.sharedService.changeInputType(inputType);
    this.passwordMain = newType;
  }

  /**
   *
   *
   * @memberof TransferTypeComponent
   */
  decryptMessage() {
    let common = { password: this.password };
    let firstAccount = this.walletService.currentAccount;
    if (this.walletService.decrypt(common, firstAccount)) {
      let recipientMsg = EncryptedMessage.decrypt(this.message, common['privateKey'], this.senderPublicAccount);
      let senderMsg = EncryptedMessage.decrypt(this.message, common['privateKey'], this.recipientPublicAccount);
      if (firstAccount.address === this.recipientPublicAccount.address.address) {
        recipientMsg = EncryptedMessage.decrypt(this.message, common['privateKey'], this.senderPublicAccount);
        this.decryptedMessage = recipientMsg;
      } else {
        senderMsg = EncryptedMessage.decrypt(this.message, common['privateKey'], this.recipientPublicAccount);
        this.decryptedMessage = senderMsg;
      }

      this.panelDecrypt = 2;
    } else {
      this.panelDecrypt = 0;
    }
  }

  /**
   *
   *
   * @memberof TransferTypeComponent
   */
  hideMessage() {
    this.password = '';
    this.decryptedMessage = null;
    this.panelDecrypt = 0;
  }
}
