import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { WalletService, AccountsInterface, AccountsInfoInterface } from "../../../../wallet/services/wallet.service";
import { SharedService, ConfigurationForm } from "../../../../shared/services/shared.service"
import { AppConfig } from '../../../../config/app.config';
import { ActivatedRoute } from '@angular/router';
import { ProximaxProvider } from 'src/app/shared/services/proximax.provider';
import { ServicesModuleService, ContactsStorageInterface, HeaderServicesInterface } from '../../../services/services-module.service';
import { NemServiceService } from 'src/app/shared/services/nem-service.service';
import { environment } from 'src/environments/environment';
import * as qrcode from 'qrcode-generator';
import * as jsPDF from 'jspdf';

@Component({
  selector: 'app-detail-account',
  templateUrl: './detail-account.component.html',
  styleUrls: ['./detail-account.component.css']
})
export class DetailAccountComponent implements OnInit {

  paramsHeader: HeaderServicesInterface = {
    moduleName: 'Accounts',
    componentName: 'Details',
    extraButton: 'View All Accounts',
    routerExtraButton: `/${AppConfig.routes.viewAllAccount}`
  };
  address = '';
  accountName = '';
  accountInfo: AccountsInfoInterface = null;
  accountValid: boolean = false;
  configurationForm: ConfigurationForm;
  currenAccount: AccountsInterface = null;
  checked: boolean;
  descriptionPrivateKey = `Make sure you store your Private Key in a safe place.
  Access to your digital assets cannot be recovered without it.`;
  editNameAccount = false;
  newNameAccount: string = '';
  passwordMain: string = 'password';
  privateKey = '';
  publicKey = '';
  routes = {
    backToService: `/${AppConfig.routes.service}`,
    viewAllAccounts: `/${AppConfig.routes.viewAllAccount}`
  };
  showPassword: boolean = true;
  subscribeAccount = null;
  titleAddress = 'Address:';
  titlePrivateKey = 'Private Key:';
  titlePublickey = 'Public Key:';
  validatingForm: FormGroup;
  valueInitNis: boolean;
  valueInitShow: boolean = false;
  showPrivateKey: boolean = false;
  saveNis1Account: any;
  imgBackground: string = '';


  constructor(
    private activateRoute: ActivatedRoute,
    private proximaxProvider: ProximaxProvider,
    private sharedService: SharedService,
    private walletService: WalletService,
    private serviceModuleService: ServicesModuleService,
    private nemProvider: NemServiceService
  ) {
    this.imgBackground = this.sharedService.walletCreatedCertified();
    this.configurationForm = this.sharedService.configurationForm;
    let param = this.activateRoute.snapshot.paramMap.get('name');
    this.currenAccount = (param) ? this.walletService.filterAccountWallet(param) : this.walletService.filterAccountWallet('', true);
    this.checked = (this.currenAccount.nis1Account !== null);
    this.valueInitNis = (this.currenAccount.nis1Account !== null);
  }

  ngOnInit() {
    this.buildData();
    this.createForm();
    this.subscribeAccount = this.walletService.getAccountsInfo$().subscribe(
      async accountInfo => {
        if (accountInfo && !this.accountInfo) {
          this.accountInfo = this.walletService.filterAccountInfo(this.currenAccount.name);
          this.accountValid = (
            this.accountInfo !== null &&
            this.accountInfo !== undefined &&
            this.accountInfo.accountInfo &&
            this.accountInfo.accountInfo.publicKey !== "0000000000000000000000000000000000000000000000000000000000000000"
          );

          if (this.subscribeAccount) {
            this.subscribeAccount.unsubscribe();
          }
        }
      }
    );
  }

  /**
   *
   *
   * @memberof DetailAccountComponent
   */
  ngOnDestroy(): void {
    if (this.subscribeAccount) {
      this.subscribeAccount.unsubscribe();
    }
  }

  /**
   *
   *
   * @memberof DetailAccountComponent
   */
  buildData() {
    this.accountName = this.currenAccount.name;
    this.address = this.proximaxProvider.createFromRawAddress(this.currenAccount.address).pretty();
    this.publicKey = this.currenAccount.publicAccount.publicKey;
  }

  /**
   *
   * @param message
   */
  copyMessage(message: string) {
    this.sharedService.showSuccess('', `${message} copied`);
  }

  changeInputType(inputType) {
    let newType = this.sharedService.changeInputType(inputType)
    this.passwordMain = newType;
  }

  /**
   *
   */
  createForm() {
    this.validatingForm = new FormGroup({
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(this.configurationForm.passwordWallet.minLength),
        Validators.maxLength(this.configurationForm.passwordWallet.maxLength)
      ])
    });
  }

  /**
   *
   *
   * @memberof DetailAccountComponent
   */
  changeNameAccount() {
    if (this.newNameAccount !== '') {
      if (!this.walletService.validateNameAccount(this.newNameAccount)) {
        const paramsStorage: ContactsStorageInterface = {
          name: this.newNameAccount,
          address: this.address,
          walletContact: true,
          nameItem: '',
          update: true,
          dataComparate: {
            name: this.accountName,
            address: this.address
          }
        }
        const saved = this.serviceModuleService.saveContacts(paramsStorage);

        if (!saved) {
          this.sharedService.showError('', `Contact or account name already exists`);
          return;
        }
        this.walletService.changeName(this.accountName, this.newNameAccount);
        this.editNameAccount = !this.editNameAccount;
        this.currenAccount = this.walletService.filterAccountWallet(this.newNameAccount);
        this.newNameAccount = '';
        this.buildData();
        this.sharedService.showSuccess('', 'Your account and contact name has been updated');
      } else {
        this.sharedService.showWarning('', 'This name is already in use');
      }
    }
  }

  /**
   *
   *
   * @returns
   * @memberof DetailAccountComponent
   */
  decryptWallet() {
    if (this.validatingForm.get('password').value !== '') {
      const common = { password: this.validatingForm.get('password').value };
      if (this.walletService.decrypt(common, this.currenAccount)) {
        this.privateKey = common['privateKey'].toUpperCase();
        this.validatingForm.get('password').patchValue('')
        this.showPassword = false;
        this.showPrivateKey = false;
        return;
      }
      this.validatingForm.get('password').patchValue('');
      this.privateKey = '';
      return;
    } else {
      this.sharedService.showError('', 'Please, enter a password');
    }
  }

  get input() { return this.validatingForm.get('password'); }

  /**
   *
   *
   * @memberof DetailAccountComponent
   */
  hidePrivateKey() {
    this.privateKey = '';
    this.showPassword = true;
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
   *
   */
  aceptChanges() {
    if (!this.checked && this.valueInitNis !== this.checked) {
      if (this.currenAccount.nis1Account !== null) {
        this.sharedService.showSuccess('', 'Nis1 account remove');
      }
      this.currenAccount.nis1Account = null;
      this.valueInitNis = (this.currenAccount.nis1Account !== null);
      const accounts = this.walletService.getCurrentWallet().accounts.filter(el => el.address !== this.currenAccount.address.split('-').join(''));
      accounts.push(this.currenAccount);
      this.walletService.currentWallet.accounts = accounts;

      let allWallets = JSON.parse(localStorage.getItem(environment.nameKeyWalletStorage));
      const walletsStorage = allWallets.filter(el => el.name !== this.walletService.currentWallet.name);
      walletsStorage.push(this.walletService.currentWallet);
      localStorage.setItem(environment.nameKeyWalletStorage, JSON.stringify(walletsStorage));
    } else if (this.checked && this.valueInitNis !== this.checked) {
      if (this.validatingForm.get('password').value !== '') {
        const common = { password: this.validatingForm.get('password').value };
        if (this.walletService.decrypt(common, this.currenAccount)) {

          if (this.currenAccount.nis1Account === null) {
            this.sharedService.showSuccess('', 'Nis1 account added');
          }
          const nis1Wallet = this.nemProvider.createAccountPrivateKey(common['privateKey'].toUpperCase());

          this.currenAccount.nis1Account = {
            address: nis1Wallet.address,
            publicKey: nis1Wallet.publicKey
          };

          this.valueInitNis = (this.currenAccount.nis1Account !== null);

          const accounts = this.walletService.getCurrentWallet().accounts.filter(el => el.address !== this.address.split('-').join(''));
          accounts.push(this.currenAccount);
          this.walletService.currentWallet.accounts = accounts;

          let allWallets = JSON.parse(localStorage.getItem(environment.nameKeyWalletStorage));
          const walletsStorage = allWallets.filter(el => el.name !== this.walletService.currentWallet.name);
          walletsStorage.push(this.walletService.currentWallet);
          localStorage.setItem(environment.nameKeyWalletStorage, JSON.stringify(walletsStorage));
          this.validatingForm.reset({
            password: ''
          }, {
              emitEvent: false
            });
        }
        return;
      } else {
        this.sharedService.showError('', 'Please, enter a password');
      }
    }

    if (this.showPrivateKey) {
      this.decryptWallet();
    }
    this.validatingForm.reset({
      password: ''
    }, {
        emitEvent: false
      });
  }

  qrConstruntion(url, size = 2, margin = 0) {
    let qr = qrcode(10, 'H');
    qr.addData(url);
    qr.make();
    return qr.createDataURL(size, margin);
  }

  printAccountInfo() {
    // console.log('Run PDF');
    // console.log(this.privateKey);
    // console.log(this.address);

    let doc = new jsPDF({
      unit: 'px'
    });
    doc.addImage(this.imgBackground, 'JPEG', 120, 60, 205, 132);

    // QR Code Address
    doc.addImage(this.qrConstruntion(this.privateKey, 1, 0), 151.5, 105);

    // Addres number
    doc.setFontSize(8);
    doc.setTextColor('#000000');
    doc.text(this.address, 146, 164, { maxWidth: 132 });

    doc.save('Your_Paper_Wallet');
  }
}
