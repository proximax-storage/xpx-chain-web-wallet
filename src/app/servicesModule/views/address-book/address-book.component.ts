import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from "@angular/forms";
import { ServiceModuleService } from "../../../servicesModule/services/service-module.service";
import { SharedService } from "../../../shared";

@Component({
  selector: 'app-address-book',
  templateUrl: './address-book.component.html',
  styleUrls: ['./address-book.component.scss']
})
export class AddressBookComponent implements OnInit {

  headElements = ['Label', 'Account address', 'Actions'];
  contactForm: FormGroup;
  contacts = [];

  constructor(
    private fb: FormBuilder,
    private serviceModuleService: ServiceModuleService,
    private sharedService: SharedService
  ) {
    this.contacts = this.serviceModuleService.getBooksAddress();
  }

  ngOnInit() {
    this.createFormContact();
  }

  createFormContact() {
    this.contactForm = this.fb.group({
      user: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
      address: ['', [Validators.required, Validators.minLength(46), Validators.maxLength(46)]]
    });
  }


  getError(control, typeForm? ,formControl?) {
    const form = this.contactForm;
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

  saveContact() {
    if (this.contactForm.valid) {
      const dataStorage = this.serviceModuleService.getBooksAddress();
      const books = { value: this.contactForm.get('address').value, label: this.contactForm.get('user').value };
      if (dataStorage === null) {
        this.serviceModuleService.setBookAddress([books]);
        this.contactForm.reset();
        this.sharedService.showSuccess('', `Successfully created user`);
        this.contacts = this.serviceModuleService.getBooksAddress();
        return;
      }

      const issetData = dataStorage.find(element => element.label === this.contactForm.get('user').value);
      if (issetData === undefined) {
        dataStorage.push(books);
        this.serviceModuleService.setBookAddress(dataStorage);
        this.contactForm.reset();
        this.sharedService.showSuccess('', `Successfully created contact`);
        this.contacts = this.serviceModuleService.getBooksAddress();
        return;
      }

      this.sharedService.showError('User repeated', `The contact "${this.contactForm.get('user').value}" already exists`);
    }
  }

  remove(label){
    const newContacts = [];
    this.contacts.forEach(element => {
      if (element.label !== label) {
        newContacts.push(element);
      }
    });
    this.serviceModuleService.setBookAddress(newContacts);
    this.contacts = newContacts;
  }

}
