import { Component, OnInit } from '@angular/core';
import { ServiceModuleService } from "../../../servicesModule/services/service-module.service";
import { SharedService } from "../../../shared";

@Component({
  selector: 'app-address-book',
  templateUrl: './address-book.component.html',
  styleUrls: ['./address-book.component.scss']
})
export class AddressBookComponent implements OnInit {

  elementsConfirmed = [];
  headElements = ['Label', 'Account address', 'Actions'];
  contacts = [];

  personList: Array<any> = [
    { id: 1, name: 'Aurelia Vega', age: 30, companyName: 'Deepends', country: 'Spain', city: 'Madrid' },
    { id: 2, name: 'Guerra Cortez', age: 45, companyName: 'Insectus', country: 'USA', city: 'San Francisco' },
    { id: 3, name: 'Guadalupe House', age: 26, companyName: 'Isotronic', country: 'Germany', city: 'Frankfurt am Main' },
    { id: 4, name: 'Aurelia Vega', age: 30, companyName: 'Deepends', country: 'Spain', city: 'Madrid' },
    { id: 5, name: 'Elisa Gallagher', age: 31, companyName: 'Portica', country: 'United Kingdom', city: 'London' },
  ];

  constructor(
    private serviceModuleService: ServiceModuleService,
    private sharedService: SharedService
  ) {
    this.contacts = this.serviceModuleService.getBooksAddress();
    console.log(this.contacts);
  }

  ngOnInit() {
    this.elementsConfirmed.push({
      label: 'asdasd',
      address: 'asdasd'
    });
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
