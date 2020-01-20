import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DataDececode, RecipientData } from '../../services/gift.service';
import { TransactionsService } from '../../../transactions/services/transactions.service';
import { DataBridgeService } from '../../../shared/services/data-bridge.service';
import { Subscription } from 'rxjs';
import { SignedTransaction, TransferTransaction, Deadline, Mosaic, Address, MosaicId, PlainMessage, UInt64, Account } from 'tsjs-xpx-chain-sdk';
import { environment } from '../../../../environments/environment';
import { SharedService } from '../../../shared/services/shared.service';

@Component({
  selector: 'app-confirm-redeem-gitf-card',
  templateUrl: './confirm-redeem-gitf-card.component.html',
  styleUrls: ['./confirm-redeem-gitf-card.component.css']
})
export class ConfirmRedeemGitfCardComponent implements OnInit {
  @Input() recipientConfirm: RecipientData;
  @Input() giftDecodeConfirm: DataDececode;
  @Output() cancel = new EventEmitter<string>();
  @Output() accept = new EventEmitter<string>();
  subscription: Subscription[] = [];
  transactionSigned: SignedTransaction[] = [];
  transactionReady: SignedTransaction[] = [];
  nameAccount: string
  amount: any
  descrip: string
  reloadBtn: boolean
  blockSendButton: boolean;
  mosaicXpx: { id: string; name: string; divisibility: number; };
  constructor(private transactionService: TransactionsService,
    private dataBridge: DataBridgeService,
    private sharedService: SharedService, ) {
    this.reloadBtn = false;
    this.blockSendButton = false;
    this.mosaicXpx = {
      id: environment.mosaicXpxInfo.id,
      name: environment.mosaicXpxInfo.name,
      divisibility: environment.mosaicXpxInfo.divisibility
    };
  }

  ngOnInit() {
    this.nameAccount = this.recipientConfirm.name;
    this.amount = this.amountFormatterSimple(this.giftDecodeConfirm.amount.compact())
    this.descrip = this.giftDecodeConfirm.des
  }
  /**
  * @memberof CreateGiftComponent
  */
  ngOnDestroy(): void {
    this.subscription.forEach(subscription => {
      subscription.unsubscribe();
    });
  }

  cancelGitf(event) {
    this.cancel.emit(event)
  }
  acceptEvent(event) {
    this.accept.emit(event)
  }

  acceptGitf() {
    // console.log('envio')
    // console.log('recipientConfirm', this.recipientConfirm)
    // console.log('giftDecodeConfirm', this.giftDecodeConfirm)
    if (!this.blockSendButton) {
      this.reloadBtn = true;
      this.blockSendButton = true;
      const moisacID = this.mosaicXpx.id
      const address: Address = Address.createFromPublicKey(this.recipientConfirm.publicAccount.publicKey, this.recipientConfirm.publicAccount.address.networkType)
      const transferTransaction = TransferTransaction.create(
        Deadline.create(environment.deadlineTransfer.deadline, environment.deadlineTransfer.chronoUnit),
        address,
        [new Mosaic(new MosaicId(moisacID), UInt64.fromUint(Number(this.giftDecodeConfirm.amount.compact())))],
        PlainMessage.create(''),
        this.recipientConfirm.publicAccount.address.networkType);
      const account: Account = Account.createFromPrivateKey(this.giftDecodeConfirm.privatekey, this.recipientConfirm.publicAccount.address.networkType);
      const signedTransaction = account.sign(
        transferTransaction,
        this.dataBridge.blockInfo.generationHash
      )
      this.transactionSigned.push(signedTransaction);
      this.transactionService.buildTransactionHttp().announce(signedTransaction).subscribe(
        async () => {
          this.getTransactionStatus();
          this.dataBridge.setTimeOutValidateTransaction(signedTransaction.hash);
        }, err => {
          this.reloadBtn = false;
          this.blockSendButton = false;
          this.cancelGitf(err)
          this.sharedService.showError('', err);
        }
      );
    }
  }

  /**
   *
   *
   * @memberof CreateTransferComponent
   */
  getTransactionStatus() {
    // Get transaction status
    if (!this.subscription['transactionStatus']) {
      this.subscription['transactionStatus'] = this.dataBridge.getTransactionStatus().subscribe(
        statusTransaction => {
          if (statusTransaction !== null && statusTransaction !== undefined && this.transactionSigned !== null) {
            for (const element of this.transactionSigned) {
              const match = statusTransaction['hash'] === element.hash;
              if (match) {
                this.transactionReady.push(element);
              }
              if (statusTransaction['type'] === 'confirmed' && match) {
                this.reloadBtn = false;
                this.blockSendButton = false;
                // this.builGitf()
                this.transactionSigned = this.transactionSigned.filter(el => el.hash !== statusTransaction['hash']);
              } else if (statusTransaction['type'] === 'unconfirmed' && match) {
                this.acceptEvent('unconfirmed')
                this.reloadBtn = false;
                this.blockSendButton = false;
              } else if (statusTransaction['type'] === 'aggregateBondedAdded' && match) {
                this.reloadBtn = false;
                this.blockSendButton = false;
              } else if (statusTransaction['type'] === 'cosignatureSignedTransaction' && match) {
                this.reloadBtn = false;
                this.blockSendButton = false;
              } else if (statusTransaction['type'] === 'status' && match) {
                this.cancelGitf('status')
                this.reloadBtn = false;
                this.blockSendButton = false;
                this.transactionSigned = this.transactionSigned.filter(el => el.hash !== statusTransaction['hash']);
              }
            }
          }
        }
      );
    }
  }

  amountFormatterSimple(amount): string {
    return this.transactionService.amountFormatterSimple(amount)
  }
}
