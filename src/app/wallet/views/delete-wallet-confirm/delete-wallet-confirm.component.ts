import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, Validators, AbstractControl, FormBuilder } from '@angular/forms';
import { HeaderServicesInterface, ServicesModuleService } from '../../../servicesModule/services/services-module.service';
import { WalletService, WalletAccountInterface } from '../../services/wallet.service';
import { ConfigurationForm, SharedService } from '../../../shared/services/shared.service';
import { AppConfig } from '../../../config/app.config';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-delete-wallet-confirm',
  templateUrl: './delete-wallet-confirm.component.html',
  styleUrls: ['./delete-wallet-confirm.component.css']
})
export class DeleteWalletConfirmComponent implements OnInit {
  paramsHeader: HeaderServicesInterface = {
    moduleName: 'Wallet',
    componentName: 'Confirm Delete'
  };

  passwordMain: string = 'password';

  routes = {
    viewAllWallets: `/${AppConfig.routes.viewAllWallets}`,
  };
  wallet: WalletAccountInterface;
  tittle = 'will be deleted from your device.';
  Information = `This action will delete this wallet.  It cannot be undone.  If you have not saved your private keys, access to the accounts contained in this wallet will be permanently lost.`
  configurationForm: ConfigurationForm;
  validatingForm: FormGroup;
  ban: boolean = false;
  texAlert = 'I have read the warning, understand the consequences, and wish to proceed.'

  constructor(private activateRoute: ActivatedRoute,
    private sharedService: SharedService,
    private walletService: WalletService,
    private fb: FormBuilder,
    private router: Router,
    private servicesModuleService: ServicesModuleService) {

    this.configurationForm = this.sharedService.configurationForm;
    this.createForm();
  }

  ngOnInit() {
    let name = this.activateRoute.snapshot.paramMap.get('name');
    this.wallet = this.walletService.getWalletStorageName(name)[0];
    if (this.wallet == undefined)
      this.router.navigate([`/${AppConfig.routes.viewAllWallets}`]);
  }

  changeInputType(inputType) {
    let newType = this.sharedService.changeInputType(inputType)
    this.passwordMain = newType;
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
      const accountDecrypt = this.wallet.accounts.find(x => x.firstAccount === true);
      let common: any = { password: this.validatingForm.get("password").value };
      if (this.walletService.decrypt(common, accountDecrypt)) {
        const value = this.walletService.removeWallet(this.wallet.name);
        if (value) {
          this.servicesModuleService.removeItemStorage(environment.itemBooksAddress, this.wallet.name)
          this.sharedService.showSuccess('', 'Wallet Removed');
          this.clearForm();
          this.router.navigate([`/${AppConfig.routes.viewAllWallets}`]);
        }
      } else {
        this.ban = false;
      }
    }




  }

}
