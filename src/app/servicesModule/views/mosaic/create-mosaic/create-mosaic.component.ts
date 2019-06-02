import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { ProximaxProvider } from '../../../../shared/services/proximax.provider';
import { WalletService } from '../../../../shared/services/wallet.service';
import { MosaicService } from '../../../services/mosaic.service';
import { SharedService } from '../../../../shared/services/shared.service';
import { AppConfig } from '../../../../config/app.config';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { UInt64, Deadline, AggregateTransaction, NetworkType, MosaicSupplyType, AliasActionType } from 'tsjs-xpx-catapult-sdk';

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

  constructor(
    private fb: FormBuilder,
    private proximaxProvider: ProximaxProvider,
    private walletService: WalletService,
    private sharedService: SharedService
  ) {
  }

  ngOnInit() {
    this.createForm();
  }



  /**
   * Create form namespace
   *
   * @memberof CreateMosaicComponent
   */
  createForm() {
    this.mosaicForm = this.fb.group({
      deltaSupply: [1000000, [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
      duration: [1000, [Validators.required]],
      divisibility: [0, [Validators.required]],
      transferable: [false],
      supplyMutable: [false],
      levyMutable: [false]
    });
  }

  send() {
    if (this.mosaicForm.valid) {
      const common = {
        password: this.mosaicForm.get('password').value,
        privateKey: ''
      }
      if (this.walletService.decrypt(common)) {
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
          this.mosaicForm.get('duration').value,
          this.walletService.network
        );

        const mosaicSupplyChangeTransaction = this.proximaxProvider.buildMosaicSupplyChange(
          mosaicDefinitionTransaction.mosaicId,
          MosaicSupplyType.Increase,
          // this.mosaicForm.get('mosaicSupplyType').value,
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


        // I SIGN THE TRANSACTION
        const signedTransaction = account.sign(aggregateTransaction);
        //ANNOUNCEMENT THE TRANSACTION-
        this.proximaxProvider.announce(signedTransaction).subscribe(
          async x => {
            this.mosaicForm.reset();
            this.mosaicForm.patchValue({ duration: 1000 });
            this.mosaicForm.patchValue({ divisibility: 0 });
            this.sharedService.showSuccess('', 'Transaction sent')
            const statusTransaction = await this.proximaxProvider.getTransactionStatusError(signedTransaction.hash).toPromise();
            console.log(statusTransaction);
          },
          error => {
            // console.log(error);
          }
        );
      }
    }
  }

  /**
   *
   * @param param
   * @param formControl
   */
  getError(param: string | (string | number)[], formControl?: any) {
    if (this.mosaicForm.get(param).getError('required')) {
      return `This field is required`;
    } else if (this.mosaicForm.get(param).getError('minlength')) {
      return `This field must contain minimum ${this.mosaicForm.get(param).getError('minlength').requiredLength} characters`;
    } else if (this.mosaicForm.get(param).getError('maxlength')) {
      return `This field must contain maximum ${this.mosaicForm.get(param).getError('maxlength').requiredLength} characters`;
    }
  }
}
