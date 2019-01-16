import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from "@angular/forms";
import { WalletService, SharedService } from "../../../shared";
import { TransactionsService } from "../../../transactions/service/transactions.service";
import { NemProvider } from "../../../shared/services/nem.provider";
import { ServiceModuleService } from "../../../servicesModule/services/service-module.service";
import { MessageService } from 'src/app/shared/services/message.service';

@Component({
  selector: 'app-transfer',
  templateUrl: './transfer.component.html',
  styleUrls: ['./transfer.component.scss']
})
export class TransferComponent implements OnInit {

  showContacts = false;
  inputBLocked: boolean;
  contacts = [];
  transferForm: FormGroup;
  contactForm: FormGroup;
  transferIsSend = false;

  constructor(
    private fb: FormBuilder,
    private walletService: WalletService,
    private nemProvider: NemProvider,
    private sharedService: SharedService,
    private transactionService: TransactionsService,
    private ServiceModuleService: ServiceModuleService,

  ) { }

  ngOnInit() {
    this.contacts = this.ServiceModuleService.getBooksAddress();
    this.createForm();
    this.createFormContact();
  }

  createForm() {
    this.transferForm = this.fb.group({
      acountRecipient: [null, [Validators.required, Validators.minLength(46), Validators.maxLength(46)]],
      amount: [null, [Validators.maxLength(20)]],
      message: [null, [Validators.maxLength(80)]],
      password: [null, [Validators.required, Validators.minLength(8), Validators.maxLength(30)]]
    });
  }

  createFormContact() {
    this.contactForm = this.fb.group({
      user: [null, [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
      address: [null, [Validators.required, Validators.minLength(46), Validators.maxLength(46)]]
    });
  }


  cleanForm(custom?: string | (string | number)[], formControl?: string | number) {
    if (custom !== undefined) {
      if (formControl !== undefined) {
        this.transferForm.controls[formControl].get(custom).reset();
        return;
      }
      this.transferForm.get(custom).reset();
      return;
    }
    this.transferForm.reset();
    return;
  }

  getError(control: string | (string | number)[], typeForm?: any, formControl?: string | number) {
    const form = (typeForm === undefined) ? this.transferForm : this.contactForm;
    if (formControl === undefined) {
      if (form.get(control).getError('required')) {
        return `This field is required`;
      } else if (form.get(control).getError('minlength')) {
        return `This field must contain minimum ${form.get(control).getError('minlength').requiredLength} characters`;
      } else if (form.get(control).getError('maxlength')) {
        return `This field must contain maximum ${form.get(control).getError('maxlength').requiredLength} characters`;
      }
    } else {
      if (form.controls[formControl].get(control).getError('required')) {
        return `This field is required`;
      } else if (form.controls[formControl].get(control).getError('minlength')) {
        return `This field must contain minimum ${form.controls[formControl].get(control).getError('minlength').requiredLength} characters`;
      } else if (form.controls[formControl].get(control).getError('maxlength')) {
        return `This field must contain maximum ${form.controls[formControl].get(control).getError('maxlength').requiredLength} characters`;
      } else if (form.controls[formControl].getError('noMatch')) {
        return `Password doesn't match`;
      }
    }
  }

  sendTransfer() {
    if (this.transferForm.invalid) {
      this.validateAllFormFields(this.transferForm);
      this.inputBLocked = false;
    } else {
      this.inputBLocked = true;
      const acountRecipient = this.transferForm.get('acountRecipient').value;
      const amount = this.transferForm.get('amount').value;
      const message = this.transferForm.get('message').value;
      const password = this.transferForm.get('password').value;
      const common = { password: password };
      if (this.walletService.decrypt(common)) {
        const rspBuildSend = this.transactionService.buildToSendTransfer(common, acountRecipient, message, amount, this.walletService.network);
        rspBuildSend.transactionHttp
          .announce(rspBuildSend.signedTransaction)
          .subscribe(
            rsp => {
              console.log("Guarda la transacción y no hago más nada...");
              this.inputBLocked = false;
              this.cleanForm();
            },
            err => {
              this.inputBLocked = false;
              this.cleanForm();
              this.sharedService.showError('Error', err);
              console.error(err);
            });
      }
    }
  }

  saveContact() {
    if (this.contactForm.valid) {
      const dataStorage = this.ServiceModuleService.getBooksAddress();
      const books = { value: this.contactForm.get('address').value, label: this.contactForm.get('user').value };
      if (dataStorage === null) {
        this.ServiceModuleService.setBookAddress([books]);
        this.contactForm.reset();
        this.sharedService.showSuccess('', `Successfully created user`);
        this.contacts = this.ServiceModuleService.getBooksAddress();
        return;
      }

      const issetData = dataStorage.find((element: { label: any; }) => element.label === this.contactForm.get('user').value);
      if (issetData === undefined) {
        dataStorage.push(books);
        this.ServiceModuleService.setBookAddress(dataStorage);
        this.contactForm.reset();
        this.sharedService.showSuccess('', `Successfully created contact`);
        this.contacts = this.ServiceModuleService.getBooksAddress();
        return;
      }

      this.sharedService.showError('User repeated', `The contact "${this.contactForm.get('user').value}" already exists`);
    }
  }

  optionSelected(event: { value: any; }) {
    console.log(event);
    this.transferForm.get('acountRecipient').patchValue(event.value);
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }


}
