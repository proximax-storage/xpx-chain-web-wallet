import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { TransferTransaction } from 'tsjs-xpx-chain-sdk';
import { TransactionsService, TransactionsInterface } from '../../../transactions/services/transactions.service';
import { ProximaxProvider } from 'src/app/shared/services/proximax.provider';
import { environment } from '../../../../environments/environment';
import { SharedService } from 'src/app/shared/services/shared.service';
import { EncryptedMessage } from 'tsjs-xpx-chain-sdk'
import { WalletService } from "../../../wallet/services/wallet.service";

@Component({
  selector: 'app-transfer-type-bonded',
  templateUrl: './transfer-type-bonded.component.html',
  styleUrls: ['./transfer-type-bonded.component.css']
})
export class TransferTypeBondedComponent implements OnInit {

  @Input() transferTransactionBonded: TransferTransaction = null;
  @Input() msg: string = '';
  @Input() signer: any;
  transactionBuilder: TransactionsInterface = null;

  message: any;
  panelDecrypt: number = 0;
  password = null
  passwordMain = 'password'
  recipientPublicAccount = null
  senderPublicAccount = null
  decryptedMessage: any;

  constructor(
    public transactionService: TransactionsService,
    public sharedService: SharedService,
    public proximaxProvider: ProximaxProvider,
    public walletService: WalletService
  ) { }

  ngOnInit() {
    this.verifyRecipientInfo()
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    console.log(this.transferTransactionBonded);
    this.transactionBuilder = this.transactionService.getStructureDashboard(this.transferTransactionBonded);
    console.log('----build---', this.transactionBuilder);
    this.message = this.transactionBuilder.data.message
    console.log(this.signer);
  }

  changeInputType(inputType) {
    let newType = this.sharedService.changeInputType(inputType)
    this.passwordMain = newType;
  }

  decryptMessage() {
    let common = { password: this.password }
    let firstAccount = this.walletService.currentAccount
    console.clear();
    console.log(this.transactionBuilder)
    console.log(firstAccount);
    console.log(this.walletService.decrypt(common, firstAccount));

    if (this.walletService.decrypt(common, firstAccount)) {
      console.log('Message', this.message);
      console.log('PrivateKey', common['privateKey']);
      console.log('SenderRecipientPublicAccount', this.senderPublicAccount);
      console.log('RecipientPublicAccount', this.recipientPublicAccount);
      console.log('PanelDecrypt', this.panelDecrypt);

      let recipientMsg = EncryptedMessage.decrypt(this.message, common['privateKey'], this.senderPublicAccount)
      let senderMsg = EncryptedMessage.decrypt(this.message, common['privateKey'], this.recipientPublicAccount)

      console.log('recipient', recipientMsg);
      console.log('sender', senderMsg);

      // if (recipientMsg.payload && recipientMsg.payload !== '') {
      //   console.log(`/// RECIPIENT ///`)
      //   this.decryptedMessage = recipientMsg
      // } else if (senderMsg.payload && senderMsg.payload !== '') {
      //   console.log(`/// SENDER ///`)
      //   this.decryptedMessage = senderMsg
      // }

      console.log(firstAccount.address === this.recipientPublicAccount.address.address)

      if (firstAccount.address === this.recipientPublicAccount.address.address) {
        recipientMsg = EncryptedMessage.decrypt(this.message, common['privateKey'], this.senderPublicAccount)
        this.decryptedMessage = recipientMsg
      } else {
        senderMsg = EncryptedMessage.decrypt(this.message, common['privateKey'], this.recipientPublicAccount)
        this.decryptedMessage = senderMsg
      }


      console.log('DecryptedMessage', this.decryptedMessage);
      this.panelDecrypt = 2
    } else {
      this.sharedService.showError('', 'Password Invalid');
      this.panelDecrypt = 0
    }
  }

  hideMessage() {
    this.password = ''
    this.decryptedMessage = null
    this.panelDecrypt = 0
  }

  async verifyRecipientInfo() {
    let address = this.proximaxProvider.createFromRawAddress(this.transactionBuilder.recipient['address'])
    this.senderPublicAccount = this.signer.sender
    try {
      let accountInfo = await this.proximaxProvider.getAccountInfo(address).toPromise()
      console.log('ALERTA');

      console.log(accountInfo);
      this.recipientPublicAccount = accountInfo.publicAccount
    } catch (e) {
      console.log(e);
    }
  }

}
