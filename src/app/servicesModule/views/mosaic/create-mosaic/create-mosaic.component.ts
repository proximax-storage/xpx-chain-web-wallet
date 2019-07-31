import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { UInt64, Deadline, AggregateTransaction, NetworkType, MosaicSupplyType, AliasActionType, SignedTransaction } from 'tsjs-xpx-chain-sdk';
import { ProximaxProvider } from '../../../../shared/services/proximax.provider';
import { WalletService } from '../../../../shared/services/wallet.service';
import { SharedService } from '../../../../shared/services/shared.service';
import { DataBridgeService } from '../../../../shared/services/data-bridge.service';
import { TransactionsService } from 'src/app/transactions/service/transactions.service';

@Component({
  selector: 'app-create-mosaic',
  templateUrl: './create-mosaic.component.html',
  styleUrls: ['./create-mosaic.component.scss']
})
export class CreateMosaicComponent implements OnInit {

  @BlockUI() blockUI: NgBlockUI;
  isOwner = false;
  mosaicForm: FormGroup;

  mosaicSupplyType: any = [{
    value: MosaicSupplyType.Increase,
    label: 'Increase',
    selected: true,
    disabled: false
  }, {
    value: MosaicSupplyType.Decrease,
    label: 'Decrease',
    selected: false,
    disabled: false
  }];
  durationByBlock = '5760';
  blockSend: boolean = false;
  transactionSigned: SignedTransaction[] = [];
  transactionReady: SignedTransaction[] = [];
  subscribe = ['transactionStatus'];

  constructor(
    private fb: FormBuilder,
    private proximaxProvider: ProximaxProvider,
    private walletService: WalletService,
    private dataBridge: DataBridgeService,
    private sharedService: SharedService,
    private transactionService: TransactionsService
  ) {
  }

  ngOnInit() {
    this.createForm();
    this.mosaicForm.get('duration').valueChanges.subscribe(next => {
      this.durationByBlock = this.transactionService.calculateDurationforDay(next).toString();
    });
  }

  ngOnDestroy(): void {
    this.subscribe.forEach(element => {
      if (this.subscribe[element] !== undefined) {
        this.subscribe[element].unsubscribe();
      }
    });
  }



  /**
   * Create form namespace
   *
   * @memberof CreateMosaicComponent
   */
  createForm() {
    this.mosaicForm = this.fb.group({
      deltaSupply: [1000000, [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(30)]],
      duration: [1, [Validators.required]],
      divisibility: [1, [Validators.required]],
      transferable: [false],
      supplyMutable: [false],
      levyMutable: [false]
    });
  }

  /**
   *
   *
   * @memberof CreateMosaicComponent
   */
  clearForm() {
    this.mosaicForm.get('deltaSupply').patchValue(1000000);
    this.mosaicForm.get('password').patchValue('');
    this.mosaicForm.get('duration').patchValue(1);
    this.mosaicForm.get('divisibility').patchValue(1);
    this.mosaicForm.get('transferable').patchValue(false);
    this.mosaicForm.get('supplyMutable').patchValue(false);
    this.mosaicForm.get('levyMutable').patchValue(false);
  }

  send() {
    if (this.mosaicForm.valid && !this.blockSend) {
      const common = {
        password: this.mosaicForm.get('password').value,
        privateKey: ''
      }

      if (this.walletService.decrypt(common)) {
        this.blockSend = true;
        const account = this.proximaxProvider.getAccountFromPrivateKey(common.privateKey, this.walletService.network);
        const nonce = this.proximaxProvider.createNonceRandom();

        //BUILD TRANSACTION
        const mosaicDefinitionTransaction = this.proximaxProvider.buildMosaicDefinition(
          nonce,
          account,
          this.mosaicForm.get('supplyMutable').value,
          this.mosaicForm.get('transferable').value,
          this.mosaicForm.get('levyMutable').value,
          this.mosaicForm.get('divisibility').value,
          parseFloat(this.durationByBlock),
          this.walletService.network
        );

        const mosaicSupplyChangeTransaction = this.proximaxProvider.buildMosaicSupplyChange(
          mosaicDefinitionTransaction.mosaicId,
          MosaicSupplyType.Increase,
          UInt64.fromUint(this.mosaicForm.get('deltaSupply').value),
          this.walletService.network
        );

        const aggregateTransaction = AggregateTransaction.createComplete(
          Deadline.create(),
          [
            mosaicDefinitionTransaction.toAggregate(account.publicAccount),
            mosaicSupplyChangeTransaction.toAggregate(account.publicAccount)
          ],
          this.walletService.network,
          []
        );


        this.dataBridge.setTransactionStatus(null);
        // I SIGN THE TRANSACTION
        const signedTransaction = account.sign(aggregateTransaction);
        this.transactionSigned.push(signedTransaction);
        //ANNOUNCEMENT THE TRANSACTION-
        this.proximaxProvider.announce(signedTransaction).subscribe(
          async x => {
            this.blockSend = false;
            this.mosaicForm.reset();
            this.mosaicForm.patchValue({ duration: 1 });
            this.mosaicForm.patchValue({ divisibility: 10 });
            this.mosaicForm.patchValue({ deltaSupply: 1000000 });
            if (this.subscribe['transactionStatus'] === undefined || this.subscribe['transactionStatus'] === null) {
              this.getTransactionStatus();
            }

            this.setTimeOutValidate(signedTransaction.hash);
          }, error => {
            this.blockSend = false;
          }
        );
      } else {
        this.blockSend = false;
      }
    }
  }

  setTimeOutValidate(hash: string) {
    setTimeout(() => {
      let exist = false;
      for (let element of this.transactionReady) {
        if (hash === element.hash) {
          exist = true;
        }
      }

      (exist) ? '' : this.sharedService.showWarning('', 'Error connecting to the node');
    }, 5000);
  }

  getTransactionStatus() {
    // Get transaction status
    this.subscribe['transactionStatus'] = this.dataBridge.getTransactionStatus().subscribe(
      statusTransaction => {
        if (statusTransaction !== null && statusTransaction !== undefined && this.transactionSigned.length > 0) {
          for(let element of this.transactionSigned) {
            if (statusTransaction['data'].transactionInfo.hash === element.hash) {
              this.transactionReady.push(element);
              if (statusTransaction['type'] === 'confirmed') {
                this.transactionSigned = this.transactionSigned.filter(el => el.hash !== statusTransaction['data'].transactionInfo.hash);
                this.sharedService.showSuccess('', 'Transaction confirmed');
              } else if (statusTransaction['type'] === 'unconfirmed') {
                this.sharedService.showInfo('', 'Transaction unconfirmed');
              } else {
                this.transactionSigned = this.transactionSigned.filter(el => el.hash !== statusTransaction['data'].transactionInfo.hash);
                this.sharedService.showWarning('', statusTransaction['type'].status);
              }
            }
          }
        }
      }
    );
  }

  /**
   *
   * @param param
   * @param formControl
   */
  getError(param: any, customMsg = '') {
    if (this.mosaicForm.get(param).getError('required')) {
      return `This field is required`;
    } else if (this.mosaicForm.get(param).getError('minlength')) {
      return `This field must contain minimum ${this.mosaicForm.get(param).getError('minlength').requiredLength} characters`;
    } else if (this.mosaicForm.get(param).getError('maxlength')) {
      return `This field must contain maximum ${this.mosaicForm.get(param).getError('maxlength').requiredLength} characters`;
    } else if (customMsg !== '') {
      return customMsg;
    } else {
      return `Invalid input`;
    }
  }
}
