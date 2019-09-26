import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderServicesInterface } from 'src/app/servicesModule/services/services-module.service';
import { WalletService, WalletAccountInterface } from '../../services/wallet.service';
import { ConfigurationForm, SharedService } from 'src/app/shared/services/shared.service';
import { FormGroup, FormControl, Validators, AbstractControl, FormBuilder } from '@angular/forms';
import { AppConfig } from 'src/app/config/app.config';

@Component({
  selector: 'app-delete-wallet-confirm',
  templateUrl: './delete-wallet-confirm.component.html',
  styleUrls: ['./delete-wallet-confirm.component.css']
})
export class DeleteWalletConfirmComponent implements OnInit {
  paramsHeader: HeaderServicesInterface = {
    moduleName: 'Wallet',
    componentName: 'CONFIRM DELETE'
  };

  routes = {
    viewAllWallets: `/${AppConfig.routes.viewAllWallets}`,
  };
  wallet: WalletAccountInterface;
  tittle1 = 'will be delete from your device.'
  tittle2 = `it's very important do you make  a backup for  this wallet to segure all you assets.`;
  tittle3 = `if already have a backop or you don't need recover any  assets of this wallet in the future, please complete
  this action with your wallet password.`;
  Information = `This action cannot be undone. Please, be sure of take this action.`
  configurationForm: ConfigurationForm;
  validatingForm: FormGroup;
  ban: boolean = false;

  constructor(private activateRoute: ActivatedRoute,
    private sharedService: SharedService,
    private walletService: WalletService,
    private fb: FormBuilder,
    private router: Router, ) {

    this.configurationForm = this.sharedService.configurationForm;
    this.createForm();
  }

  ngOnInit() {
    let name = this.activateRoute.snapshot.paramMap.get('name');
    this.wallet = this.walletService.getWalletStorageName(name)[0];
    if (this.wallet == undefined)
      this.router.navigate([`/${AppConfig.routes.viewAllWallets}`]);
  }

  /**
 *
 *
 * @memberof DeleteWalletConfirmComponent
 */
  createForm() {
    this.validatingForm = this.fb.group({
      password: ['', [
        Validators.required,
        Validators.minLength(this.configurationForm.passwordWallet.minLength),
        Validators.maxLength(this.configurationForm.passwordWallet.maxLength)
      ]],
      checked: [false, [Validators.requiredTrue]]
    });
  }


  /**
 *
 *
 * @param {string} [nameInput='']
 * @param {string} [nameControl='']
 * @param {string} [nameValidation='']
 * @returns
 * @memberof AuthComponent
 */
  validateInput(nameInput: string = '', nameControl: string = '', nameValidation: string = '') {
    let validation: AbstractControl = null;
    if (nameInput !== '' && nameControl !== '') {
      validation = this.validatingForm.controls[nameControl].get(nameInput);
    } else if (nameInput === '' && nameControl !== '' && nameValidation !== '') {
      validation = this.validatingForm.controls[nameControl].getError(nameValidation);
    } else if (nameInput !== '') {
      validation = this.validatingForm.get(nameInput);
    }
    return validation;
  }

  /**
  * @memberof DeleteWalletConfirmComponent
  */
  clearForm() {
    this.ban = false;
    this.validatingForm.reset({
      checked: false,

      password: ''
    }, {
      emitEvent: false
    }
    );
  }
  /**
 *
 *
 * @memberof DeleteWalletConfirmComponent
 */
  deleteWallet() {
    if (this.validatingForm.valid && !this.ban) {
      this.ban = true;
      const accountDecrypt = this.wallet.accounts[0]
      let common: any = { password: this.validatingForm.get("password").value };
      if (this.walletService.decrypt(common, accountDecrypt)) {
        const value = this.walletService.removeWallet(this.wallet.name);
        if (value) {
          this.sharedService.showSuccess('', 'Wallet removed');
          this.clearForm();
          this.router.navigate([`/${AppConfig.routes.viewAllWallets}`]);
        }
      } else {
        this.ban = false;
      }
    }




  }

}
