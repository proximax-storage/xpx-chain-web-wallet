import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderServicesInterface, ServicesModuleService } from 'src/app/servicesModule/services/services-module.service';
import { ConfigurationForm, SharedService } from 'src/app/shared/services/shared.service';
import { FormGroup, FormControl, Validators, AbstractControl, FormBuilder } from '@angular/forms';
import { AppConfig } from 'src/app/config/app.config';
import { WalletService, AccountsInterface } from 'src/app/wallet/services/wallet.service';
import { TransactionsService } from 'src/app/transactions/services/transactions.service';

@Component({
  selector: 'app-account-delete-confirm',
  templateUrl: './account-delete-confirm.component.html',
  styleUrls: ['./account-delete-confirm.component.css']
})
export class AccountDeleteConfirmComponent implements OnInit {
  paramsHeader: HeaderServicesInterface = {
    moduleName: 'Accounts',
    componentName: 'Confirm delete',
    extraButton: 'View All Accounts',
    routerExtraButton: `/${AppConfig.routes.viewAllAccount}`

  };
  routes = {
    viewAllAccount: `/${AppConfig.routes.viewAllAccount}`,
  };
  tittle = 'will be deleted from your device.';
  currenAccount: AccountsInterface = null;
  Information = `Warning! This action will delete this account. It cannot be undone.  If you have not
   saved your private keys, access to the account and contained will be permanently lost.`
  configurationForm: ConfigurationForm;
  validatingForm: FormGroup;
  ban: boolean = false;
  texAlert = 'I have read the warning, understand the consequences, and wish to proceed'

  constructor(private activateRoute: ActivatedRoute,
    private serviceModuleService: ServicesModuleService,
    private sharedService: SharedService,
    private walletService: WalletService,
    private fb: FormBuilder,
    private router: Router,
    private transactionsService: TransactionsService) {
    this.configurationForm = this.sharedService.configurationForm;
    this.createForm();

  }
  ngOnInit() {
    let name = this.activateRoute.snapshot.paramMap.get('name');
    this.currenAccount = this.walletService.filterAccountWallet(name);
  }
  /**
   * @memberof AccountDeleteConfirmComponent
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
* @memberof AccountDeleteConfirmComponent
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
* @memberof AccountDeleteConfirmComponent
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
*
*
* @memberof AccountDeleteConfirmComponent
*/
  deleteAccount() {
    if (this.validatingForm.valid && !this.ban) {
      this.ban = true;
      const accountDecrypt = this.currenAccount
      let common: any = { password: this.validatingForm.get("password").value };
      if (this.walletService.decrypt(common, accountDecrypt)) {
        const revalidateMultisig = true;
        this.walletService.removeAccountWallet(this.currenAccount.name, revalidateMultisig);
        this.transactionsService.updateBalance();
        this.clearForm();
        this.sharedService.showInfo('', 'Your account has be deleted');
        this.router.navigate([`/${AppConfig.routes.viewAllAccount}`]);

        // Delete contact of current account
        let contacts = this.serviceModuleService.getBooksAddress();
        let newContacts = contacts.filter(element => element.value !== this.currenAccount.address);
        this.serviceModuleService.setBookAddress(newContacts, '');
      } else {
        this.ban = false;
      }
    }




  }

}
