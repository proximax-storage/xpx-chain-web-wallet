import { Component, OnInit } from '@angular/core';
import { NetworkType } from 'tsjs-xpx-chain-sdk';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SharedService, ConfigurationForm } from 'src/app/shared/services/shared.service';

@Component({
  selector: 'app-create-wallet',
  templateUrl: './create-wallet.component.html',
  styleUrls: ['./create-wallet.component.css']
})
export class CreateWalletComponent implements OnInit {

  createWalletForm: FormGroup;
  configurationForm: ConfigurationForm = {};
  description = 'This wallet makes it easy to access your crypto and interact with blockchain. ProximaX does not have access to your funds.';
  title = 'Create Wallet';
  typeNetwork = [{
    value: NetworkType.TEST_NET,
    label: 'TEST NET'
  }];



  constructor(
    private fb: FormBuilder,
    private sharedService: SharedService
  ) { }

  ngOnInit() {
    this.configurationForm = this.sharedService.configurationForm;
    this.createForm();
  }

  /**
   *
   *
   * @memberof CreateWalletComponent
   */
  createForm() {
    this.createWalletForm = this.fb.group({
      nameWallet: ['', [
        Validators.required,
        Validators.minLength(this.configurationForm.nameWallet.minLength),
        Validators.maxLength(this.configurationForm.nameWallet.maxLength)
      ]],
      network: [
        NetworkType.TEST_NET, [Validators.required]
      ],
      passwords: this.fb.group(
        {
          password: [
            '', [
              Validators.required,
              Validators.minLength(this.configurationForm.passwordWallet.minLength),
              Validators.maxLength(this.configurationForm.passwordWallet.maxLength)
            ]
          ],
          confirm_password: [
            '',
            [
              Validators.required,
              Validators.minLength(this.configurationForm.passwordWallet.minLength),
              Validators.maxLength(this.configurationForm.passwordWallet.maxLength)
            ]
          ],
        }, {
          validator: this.sharedService.equalsPassword
        }),
    });
  }

  createSimpleWallet() {
    if (this.createWalletForm.valid) {
      const name = this.createWalletForm.get('nameWallet').value;
      const network = this.createWalletForm.get('network').value;
      const password = this.createWalletForm.controls.passwords.get('password').value;
      console.log('---- name', name);
      console.log('---- network', network);
      console.log('----- password ', password);
      // const walletsStorage = this.walletService.getWalletStorage();
    }
  }

  validateInput(nameInput: string, nameControl: string = '') {
    const validation = (nameControl !== '') ? this.createWalletForm.controls[nameControl].get(nameInput) : this.createWalletForm.get(nameInput);
    return validation;
  }

}
