import { Address } from 'tsjs-xpx-chain-sdk';
import { Component, OnInit } from '@angular/core';
import { WalletService } from '../../../../wallet/services/wallet.service';
import { SharedService, ConfigurationForm } from '../../../../../app/shared/services/shared.service';
import { FormGroup, FormControl, Validators, AbstractControl, FormBuilder } from '@angular/forms';
import { environment } from '../../../../../environments/environment';
import { HeaderServicesInterface, ServicesModuleService } from '../../../../servicesModule/services/services-module.service';
import { DashboardService } from '../../../../dashboard/services/dashboard.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { AppConfig } from '../../../../config/app.config';

@Component({
  selector: 'app-delete-wallet',
  templateUrl: './delete-wallet.component.html',
  styleUrls: ['./delete-wallet.component.css']
})
export class DeleteWalletComponent implements OnInit {

  configurationForm: ConfigurationForm;
  checkAlert: string;
  currentView: number;
  deleteConfirmed: boolean;
  description: string;
  selectedWallet: any;
  textAlert: string;
  title: string;
  validatingForm: FormGroup;
  wallets: Array<any>;

  paramsHeader: HeaderServicesInterface = {
    moduleName: 'Wallet',
    componentName: 'Delete Wallet',
    extraButton: 'Export Wallet',
    routerExtraButton: `/${AppConfig.routes.exportWallet}`
  };

  passwordMain: string = 'password';

  constructor(
    private walletService: WalletService,
    private sharedService: SharedService,
    private fb: FormBuilder,
    private servicesModuleService: ServicesModuleService,
    private authService: AuthService,
    private dashboardService: DashboardService,
    private route: Router
  ) { }

  ngOnInit() {
    this.checkAlert = 'I have read the warning, understand the consequences and wish to proceed';
    this.currentView = 0;
    this.deleteConfirmed = false;
    this.description = 'Select the wallet you want to delete';
    this.textAlert = 'Would you like to permanently delete this wallet?';
    this.title = 'Delete Wallet';
    this.wallets = this.walletService.getWalletStorage();
    this.configurationForm = this.sharedService.configurationForm;
    this.createForm();
  }

  changeInputType(inputType) {
    let newType = this.sharedService.changeInputType(inputType)
    this.passwordMain = newType;
  }

  changeView(view = 0) {
    if (view === 0) {
      this.description = 'Select the wallet you want to delete';
      this.textAlert = 'Would you like to permanently delete this wallet?';
    } else if (view === 2) {
      this.description = 'will be deleted from your device.';
      this.textAlert = 'This action will delete this Wallet.  It cannot be undone.  If you have not saved your Private Keys, access to the Accounts contained in this Wallet will be permanently lost.';
    }

    this.currentView = view;
  }

  clearForm() {
    this.validatingForm.reset({
      checked: false,

      password: ''
    }, {
      emitEvent: false
    }
    );
  }

  confirmAction(selectedItem) {
    this.selectedWallet = selectedItem;
    this.changeView(1);
  }

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

  createFromRawAddress(address: string): string {
    return Address.createFromRawAddress(address).pretty();
  }

  deleteWallet() {
    if (this.validatingForm.valid) {
      let decryptAccount = this.selectedWallet.accounts[0];
      let common: any = { password: this.validatingForm.get("password").value };
      if (this.walletService.decrypt(common, decryptAccount)) {
        if (this.selectedWallet.name === this.walletService.currentWallet.name) {
          let value = this.walletService.removeWallet(this.selectedWallet.name);
          this.wallets = this.walletService.getWalletStorage();
          this.servicesModuleService.removeItemStorage(environment.itemBooksAddress, this.selectedWallet.name)
          this.sharedService.showSuccess('', 'Wallet removed');
          this.changeView();
          this.clearForm();
          this.logOut();
        } else {
          let value = this.walletService.removeWallet(this.selectedWallet.name);
          this.wallets = this.walletService.getWalletStorage();
          this.servicesModuleService.removeItemStorage(environment.itemBooksAddress, this.selectedWallet.name)
          this.sharedService.showSuccess('', 'Wallet removed');
          this.changeView();
          this.clearForm();
        }
      } else {
        this.sharedService.showError('', 'Invalid password');
        this.clearForm();
      }
    }
  }

  logOut() {
    this.walletService.destroyDataWalletAccount();
    this.dashboardService.processComplete = false;
    this.authService.setLogged(false);
    this.authService.destroyNodeSelected();
    this.walletService.clearNis1AccounsWallet();
    this.walletService.setAccountSelectedWalletNis1(null);
    this.walletService.setAccountInfoNis1(null);
    this.walletService.setNis1AccountSelected(null);
    this.walletService.setSwapTransactions$([]);
    this.walletService.setNis1AccountsWallet$([]);
    this.route.navigate([`/${AppConfig.routes.home}`]);
  }

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
}
