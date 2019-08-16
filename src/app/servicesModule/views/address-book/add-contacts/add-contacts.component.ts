import { Component, OnInit } from '@angular/core';
import { AppConfig } from 'src/app/config/app.config';
import { FormGroup, Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { ServicesModuleService } from 'src/app/servicesModule/services/services-module.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { WalletService } from 'src/app/wallet/services/wallet.service';
import { ProximaxProvider } from 'src/app/shared/services/proximax.provider';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-add-contacts',
  templateUrl: './add-contacts.component.html',
  styleUrls: ['./add-contacts.component.css']
})
export class AddContactsComponent implements OnInit {
  moduleName = 'Address Book';
  componentName = 'ADD CONTACTS';
  list = `/${AppConfig.routes.addressBook}`;
  goBack = `/${AppConfig.routes.service}`;

  contactForm: FormGroup;
  blockSendButton: boolean;
  msgErrorUnsupported: string;
  dataStorage: any;

  constructor(
    private fb: FormBuilder,
    private serviceModuleService: ServicesModuleService,
    private sharedService: SharedService,
    private walletService: WalletService,
    private proximaxProvider: ProximaxProvider,
    private activateRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.createFormContact();
    this.subscribe();
    let param = this.activateRoute.snapshot.paramMap.get('name');
    if (param && param !== null) {
      const dataStorage = this.serviceModuleService.getBooksAddress();
      const contact = dataStorage.find(el => el.label === param);
      if (contact) {
        this.dataStorage = dataStorage.filter(element => element.label !== contact.label);
        this.contactForm.get('user').setValue(contact.label);
        this.contactForm.get('address').setValue(contact.value);
      }
    } else {
      this.dataStorage = this.serviceModuleService.getBooksAddress();
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
      const params = {
        name: this.contactForm.get('user').value,
        address: this.contactForm.get('address').value,
        walletContact: false,
        nameItem: ''
      }
      const saved = this.serviceModuleService.saveContacts(params);
      if (saved) {
        this.contactForm.reset();
        this.sharedService.showSuccess('', `Successfully saved contact`);
        return;
      }

      this.sharedService.showError('User repeated', `The contact "${this.contactForm.get('user').value}" already exists`);
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
        // const accountSelected = (this.contactForm.get('contact').value) ? this.contactForm.get('contact').value.split('-').join('') : '';
        // if ((accountSelected !== '') && (accountSelected !== address)) {
        //   this.contactForm.get('contact').patchValue('');
        // }

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
