import { Component, OnInit, Input, SimpleChanges, OnChanges } from '@angular/core';
import { TransferTransaction } from 'tsjs-xpx-chain-sdk';
import { TransactionsService, TransactionsInterface } from '../../../transactions/services/transactions.service';
import { ProximaxProvider } from '../../../shared/services/proximax.provider';
import { SharedService } from '../../../shared/services/shared.service';
import { EncryptedMessage } from 'tsjs-xpx-chain-sdk';
import { WalletService } from '../../../wallet/services/wallet.service';
import { NamespacesService } from '../../../servicesModule/services/namespaces.service';
import { environment } from '../../../../environments/environment';

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
  isSwap = null;
  namespaceName = '';
  amountTwoPart: { part1: string; part2: string; };

  constructor(
    public transactionService: TransactionsService,
    public sharedService: SharedService,
    public proximaxProvider: ProximaxProvider,
    public walletService: WalletService,
    private namesapceService: NamespacesService
  ) { }

  ngOnInit() {

  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    this.isSwap = null;
    this.transactionBuilder = this.transactionService.getStructureDashboard(this.transferTransactionBonded);
    this.message = this.transactionBuilder.data.message;
    if (this.transactionBuilder.nameType === 'ProximaX Swap') {
      if (this.transactionBuilder.data['mosaics'].length > 0) {
        const id = this.transactionBuilder.data['mosaics'][0].id;
        this.build(id);
      }
    } else {
      this.isSwap = false;
      this.verifyRecipientInfo();
    }
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
      this.recipientPublicAccount = accountInfo.publicAccount;
    } catch (e) {
      console.warn(e);
    }

    if (this.recipientPublicAccount) {
      const firstAccount = this.walletService.currentAccount;
      const availableAddress = [
        this.recipientPublicAccount.address.address,
        this.senderPublicAccount.address.address
      ];

      if (availableAddress.includes(firstAccount.address)) {
        this.showEncryptedMessage = true;
      }
    }
  }

  /**
   *
   * @param id
   */
  async build(id: any) {
    let d = 6;
    const n = await this.namesapceService.getNamespaceFromId([id]);
    this.namespaceName = id.toHex();
    if ((n.length > 0)) {
      this.namespaceName = (n[0].namespaceName.name === 'prx.xpx') ? 'XPX' : n[0].namespaceName.name;
      const x = environment.swapAllowedMosaics.find(r => `${r.namespaceId}.${r.name}` === n[0].namespaceName.name);
      if (x) { d = x.divisibility; }
    }
    const amount = this.transactionService.amountFormatterSimple(this.transactionBuilder.data['mosaics'][0].amount.compact(), d);
    this.amountTwoPart = this.transactionService.getDataPart(amount.toString(), d);
    this.isSwap = true;
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
