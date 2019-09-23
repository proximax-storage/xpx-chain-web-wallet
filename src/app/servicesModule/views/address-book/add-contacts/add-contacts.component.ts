import { Component, OnInit } from '@angular/core';
import { AppConfig } from 'src/app/config/app.config';
import { FormGroup, Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { ServicesModuleService, ContactsStorageInterface, HeaderServicesInterface } from '../../../services/services-module.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { WalletService } from 'src/app/wallet/services/wallet.service';
import { ProximaxProvider } from 'src/app/shared/services/proximax.provider';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-add-contacts',
  templateUrl: './add-contacts.component.html',
  styleUrls: ['./add-contacts.component.css']
})
export class AddContactsComponent implements OnInit {
  paramsHeader: HeaderServicesInterface = {
    moduleName: 'Address Book',
    componentName: 'ADD CONTACTS',
    extraButton: 'List',
    routerExtraButton: `/${AppConfig.routes.addressBook}`
  };

  contactForm: FormGroup;
  blockSendButton: boolean;
  msgErrorUnsupported: string;
  dataStorage: any;
  contact: any;

  constructor(
    private fb: FormBuilder,
    private serviceModuleService: ServicesModuleService,
    private sharedService: SharedService,
    private walletService: WalletService,
    private proximaxProvider: ProximaxProvider,
    private activateRoute: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.createFormContact();
    this.subscribe();
    let param = this.activateRoute.snapshot.paramMap.get('name');
    if (param && param !== null) {
      const dataStorage = this.serviceModuleService.getBooksAddress();
      this.contact = dataStorage.find(el => el.label === param);
      if (this.contact) {
        this.dataStorage = dataStorage.filter(element => element.label !== this.contact.label);
        this.contactForm.get('user').setValue(this.contact.label);
        this.contactForm.get('address').setValue(this.contact.value);
      }
    }    
  }

  createFormContact() {
    this.contactForm = this.fb.group({
      user: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
      address: ['', [Validators.required, Validators.minLength(40), Validators.maxLength(46)]]
    });
  }

  /**
   *
   *
   * @param {(string | (string | number)[])} [custom]
   * @param {(string | number)} [formControl]
   * @returns
   * @memberof AddContactsComponent
   */
  clearForm(custom?: string | (string | number)[], formControl?: string | number) {
    if (custom !== undefined) {
      if (formControl !== undefined) {
        this.contactForm.controls[formControl].get(custom).reset();
        return;
      }
      this.contactForm.get(custom).reset();
      return;
    }

    this.contactForm.reset();
    return;
  }

  /**
   * Save contact
   *
   * @returns
   * @memberof AddressBookComponent
   */
  saveContact() {
    if (this.contactForm.valid) {
      console.log('Esta es una prueba', this.contactForm.get('address').value.length);
      if (this.contactForm.get('address').value.length === 40 || this.contactForm.get('address').value.length === 46) {
        const isUpdate = this.activateRoute.snapshot.paramMap.get('name');
        const paramsStorage: ContactsStorageInterface = {
          name: this.contactForm.get('user').value,
          address: this.contactForm.get('address').value.split('-').join('').toUpperCase(),
          walletContact: false,
          nameItem: '',
          update: (isUpdate) ? true : false,
          dataComparate: (isUpdate) ? {
            name: this.contact.label,
            address: this.contact.value
          } : null
        }  
        const saved = this.serviceModuleService.saveContacts(paramsStorage);
        if (saved) {
          this.contactForm.reset();
          this.sharedService.showSuccess('', `Successfully saved contact`);
          this.router.navigate([`/${AppConfig.routes.addressBook}`]);
          return;
        }
  
        this.sharedService.showError('User repeated', `Address or name already exists`);
      } else {
        this.sharedService.showError('', 'Invalid address');
      }
    }
  }

  /**
   *
   *
   * @param {string} [nameInput='']
   * @param {string} [nameControl='']
   * @param {string} [nameValidation='']
   * @returns
   * @memberof CreateNamespaceComponent
   */
  validateInput(nameInput: string = '', nameControl: string = '', nameValidation: string = '') {
    let validation: AbstractControl = null;
    if (nameInput !== '' && nameControl !== '') {
      validation = this.contactForm.controls[nameControl].get(nameInput);
    } else if (nameInput === '' && nameControl !== '' && nameValidation !== '') {
      validation = this.contactForm.controls[nameControl].getError(nameValidation);
    } else if (nameInput !== '') {
      validation = this.contactForm.get(nameInput);
    }
    return validation;
  }

  subscribe() {
    this.contactForm.get('address').valueChanges.subscribe(
      value => {
        const address = (value !== undefined && value !== null && value !== '') ? value.split('-').join('') : '';
        if (address !== null && address !== undefined && address.length === 40) {
          const currentAccount = Object.assign({}, this.walletService.getCurrentAccount());
          if (!this.proximaxProvider.verifyNetworkAddressEqualsNetwork(
            this.proximaxProvider.createFromRawAddress(currentAccount.address).plain(), address)
          ) {
            this.blockSendButton = true;
            this.msgErrorUnsupported = 'Recipient Address Network unsupported';
          } else {
            this.blockSendButton = false;
            this.msgErrorUnsupported = '';
          }
        } else if (!this.contactForm.get('address').getError("required") && this.contactForm.get('address').valid) {
          this.blockSendButton = true;
          this.msgErrorUnsupported = 'Recipient Address Network unsupported';
        } else {
          this.blockSendButton = false;
          this.msgErrorUnsupported = '';
        }
      }
    );
  }

}
