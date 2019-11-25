import { Component, OnInit, Input, SimpleChanges, OnChanges } from '@angular/core';
import { TransferTransaction } from 'tsjs-xpx-chain-sdk';
import { TransactionsService, TransactionsInterface } from '../../../transactions/services/transactions.service';
import { ProximaxProvider } from 'src/app/shared/services/proximax.provider';
import { SharedService } from 'src/app/shared/services/shared.service';
import { EncryptedMessage } from 'tsjs-xpx-chain-sdk';
import { WalletService } from '../../../wallet/services/wallet.service';

@Component({
  selector: 'app-transfer-type-bonded',
  templateUrl: './transfer-type-bonded.component.html',
  styleUrls: ['./transfer-type-bonded.component.css']
})
export class TransferTypeBondedComponent implements OnInit, OnChanges {

  @Input() transferTransactionBonded: TransferTransaction = null;
  @Input() msg = '';
  @Input() signer: any;
  transactionBuilder: TransactionsInterface = null;

  message: any;
  panelDecrypt = 0;
  password = null;
  passwordMain = 'password';
  recipientPublicAccount = null;
  senderPublicAccount = null;
  decryptedMessage: any;
  showEncryptedMessage = false;

  constructor(
    public transactionService: TransactionsService,
    public sharedService: SharedService,
    public proximaxProvider: ProximaxProvider,
    public walletService: WalletService
  ) { }

  ngOnInit() {

  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    this.transactionBuilder = this.transactionService.getStructureDashboard(this.transferTransactionBonded);
    this.message = this.transactionBuilder.data.message;
    this.verifyRecipientInfo();
  }

  /**
   *
   *
   * @memberof TransferTypeBondedComponent
   */
  async verifyRecipientInfo() {
    const address = this.proximaxProvider.createFromRawAddress(this.transactionBuilder.recipient['address']);
    this.senderPublicAccount = this.signer.sender;
    try {
      const accountInfo = await this.proximaxProvider.getAccountInfo(address).toPromise();
      // console.log(accountInfo);
      this.recipientPublicAccount = accountInfo.publicAccount;
    } catch (e) {
      console.warn(e);
    }

    const firstAccount = this.walletService.currentAccount;
    const availableAddress = [
      this.recipientPublicAccount.address.address,
      this.senderPublicAccount.address.address
    ];

    if (availableAddress.includes(firstAccount.address)) {
      this.showEncryptedMessage = true;
    }
  }


  /**
   *
   *
   * @param {*} inputType
   * @memberof TransferTypeBondedComponent
   */
  changeInputType(inputType) {
    const newType = this.sharedService.changeInputType(inputType);
    this.passwordMain = newType;
  }

  /**
   *
   *
   * @memberof TransferTypeBondedComponent
   */
  decryptMessage() {
    const common = { password: this.password };
    const firstAccount = this.walletService.currentAccount;
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
      this.sharedService.showError('', 'Password Invalid');
      this.panelDecrypt = 0;
    }
  }

  /**
   *
   *
   * @memberof TransferTypeBondedComponent
   */
  hideMessage() {
    this.password = '';
    this.decryptedMessage = null;
    this.panelDecrypt = 0;
  }
}
