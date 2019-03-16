import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from "@angular/forms"
import { WalletService, SharedService } from '../../../../shared';
import { BlockUI, NgBlockUI } from 'ng-block-ui';

@Component({
  selector: 'app-create-multisignature',
  templateUrl: './create-multisignature.component.html',
  styleUrls: ['./create-multisignature.component.scss']
})
export class CreateMultisignatureComponent implements OnInit {
  @BlockUI() blockUI: NgBlockUI;
  createMultisignForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private walletService: WalletService,
    private sharedService: SharedService,
  ) { }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.createMultisignForm = this.fb.group({
      addressPrivatekey: ['', [Validators.required, Validators.minLength(64), Validators.maxLength(64), Validators.pattern('^(0x|0X)?[a-fA-F0-9]+$')]],
      cosignatory: ['', [Validators.required]],
      minsignatures: [1, [Validators.required]],
    });
  }

  /**
  *
  * @param param
  * @param formControl
  */
  getError(param, formControl?) {
    if (this.createMultisignForm.get(param).getError('required')) {
      return `This field is required`;
    } else if (this.createMultisignForm.get(param).getError('minlength')) {
      return `This field must contain minimum ${this.createMultisignForm.get(param).getError('minlength').requiredLength} characters`;
    } else if (this.createMultisignForm.get(param).getError('maxlength')) {
      return `This field must contain maximum ${this.createMultisignForm.get(param).getError('maxlength').requiredLength} characters`;
    } else if (this.createMultisignForm.get(param).getError('pattern')) {
      return `This field content characters not permited`;
    }
  }

}
