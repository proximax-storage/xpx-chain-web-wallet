import { Component, OnInit, ViewChild, ChangeDetectorRef, HostListener } from '@angular/core';
import { MdbTableDirective, ModalDirective } from 'ng-uikit-pro-standard';
import { ServicesModuleService, HeaderServicesInterface } from "../../../services/services-module.service";
import { AppConfig } from '../../../../config/app.config';
import { Router } from '@angular/router';
import { SharedService } from 'src/app/shared/services/shared.service';
import { ProximaxProvider } from 'src/app/shared/services/proximax.provider';

@Component({
  selector: 'app-list-contacts',
  templateUrl: './list-contacts.component.html',
  styleUrls: ['./list-contacts.component.css']
})
export class ListContactsComponent {

  @ViewChild('basicModal', { static: true }) basicModal: ModalDirective;
  paramsHeader: HeaderServicesInterface = {
    moduleName: 'Address Book',
    componentName: 'List',
    extraButton: 'Add new contact',
    routerExtraButton: `/${AppConfig.routes.addContacts}`
  };
  //Pagination
  @ViewChild(MdbTableDirective, { static: true }) mdbTable: MdbTableDirective;
  @HostListener('input') oninput() {
    this.searchItems();
  }

  previous: any = [];
  headElements = ['Label', 'Account address', 'Actions'];
  contacts = [];
  searchContact = '';
  searching = false;
  hideTable = false;
  labelRemove = '';
  p = 1;

  constructor(
    private serviceModuleService: ServicesModuleService,
    private router: Router,
    private sharedService: SharedService,
    private proximaxProvider: ProximaxProvider
  ) {
    this.hideTable = false;
  }

  ngOnInit() {
    this.hideTable = false;
    const contacts = this.serviceModuleService.getBooksAddress();
    console.log(contacts);
    for (let index = 0; index < contacts.length; index++) {
      contacts[index].value = this.proximaxProvider.createFromRawAddress(contacts[index].value).pretty();
    }
    this.contacts = (contacts !== null && contacts !== undefined) ? contacts : [];
    this.mdbTable.setDataSource(this.contacts);
    this.contacts = this.mdbTable.getDataSource();
    this.previous = this.mdbTable.getDataSource();
  }

  navigate(name) {
    this.router.navigate([`${AppConfig.routes.addContacts}/${name}`]);
  }

  /**
   * Filter contacts
   *
   * @memberof AddressBookComponent
   */
  searchItems() {
    const prev = this.mdbTable.getDataSource();
    if (!this.searchContact) {
      this.mdbTable.setDataSource(this.previous);
      this.contacts = this.mdbTable.getDataSource();
    }

    if (this.searchContact) {
      this.contacts = this.mdbTable.searchLocalDataBy(this.searchContact);
      this.mdbTable.setDataSource(prev);
    }
  }

  /**
   * Method to open basic modal
   *
   * @param {string} label
   * @memberof AddressBookComponent
   */
  remove(label: string) {
    this.basicModal.show();
    this.labelRemove = label;
  }

  /**
   * Method to delete contacts
   *
   * @memberof AddressBookComponent
   */
  deleteContact() {
    const newContacts = this.contacts.filter(element => element.label !== this.labelRemove);
    this.serviceModuleService.setBookAddress(newContacts, '');
    this.basicModal.hide();
    this.sharedService.showSuccess('', 'The contact has been successfully deleted');
    this.contacts = newContacts;
    this.mdbTable.setDataSource(this.contacts);
    this.contacts = this.mdbTable.getDataSource();
    this.previous = this.mdbTable.getDataSource();
  }
}

