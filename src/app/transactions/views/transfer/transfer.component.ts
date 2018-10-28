import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { NetworkType, Account } from "nem2-sdk";
import { WalletService } from "../../../shared";
import { TransactionsService } from "../../../transactions/service/transactions.service";
import { NemProvider } from "../../../shared/services/nem.provider";

@Component({
  selector: 'app-transfer',
  templateUrl: './transfer.component.html',
  styleUrls: ['./transfer.component.scss']
})
export class TransferComponent implements OnInit {

  transferForm: FormGroup;
  transferIsSend = false;

  constructor(
    private fb: FormBuilder,
    private walletService: WalletService,
    private nemProvider: NemProvider,
    private transactionService: TransactionsService
  ) { }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.transferForm = this.fb.group({
      acountRecipient: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(46)]],
      amount: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(20)]],
      message: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(30)]]
    });
  }


  cleanForm(custom?, formControl?) {
    if (custom !== undefined) {
      if (formControl !== undefined) {
        this.transferForm.controls[formControl].get(custom).reset();
        return;
      }
      this.transferForm.get(custom).reset();
      return;
    }
    this.transferForm.reset();
    this.transferForm.get('network').setValue(NetworkType.TEST_NET);
    return;
  }

  getError(control, formControl?) {
    if (formControl === undefined) {
      if (this.transferForm.get(control).getError('required')) {
        return `This field is required`;
      } else if (this.transferForm.get(control).getError('minlength')) {
        return `This field must contain minimum ${this.transferForm.get(control).getError('minlength').requiredLength} characters`;
      } else if (this.transferForm.get(control).getError('maxlength')) {
        return `This field must contain maximum ${this.transferForm.get(control).getError('maxlength').requiredLength} characters`;
      }
    } else {
      if (this.transferForm.controls[formControl].get(control).getError('required')) {
        return `This field is required`;
      } else if (this.transferForm.controls[formControl].get(control).getError('minlength')) {
        return `This field must contain minimum ${this.transferForm.controls[formControl].get(control).getError('minlength').requiredLength} characters`;
      } else if (this.transferForm.controls[formControl].get(control).getError('maxlength')) {
        return `This field must contain maximum ${this.transferForm.controls[formControl].get(control).getError('maxlength').requiredLength} characters`;
      } else if (this.transferForm.controls[formControl].getError('noMatch')) {
        return `Password doesn't match`;
      }
    }
  }

  sendTransfer() {
    if (this.transferForm.valid) {
      const acountRecipient = this.transferForm.get('acountRecipient').value;
      const amount = this.transferForm.get('amount').value;
      const message = this.transferForm.get('message').value;
      const password = this.transferForm.get('password').value;
      const common = { password: password }
      if (this.walletService.decrypt(common)) {
        const responseTransfer = this.transactionService.sendTransfer(common, acountRecipient, message, amount, this.walletService.network);
        responseTransfer.transactionHttp
        .announce(responseTransfer.signedTransaction)
        .subscribe(
        x => {
          //console.error(x);
        },
        err => {
          console.error(err);
        });
      }
    }
  }
}
