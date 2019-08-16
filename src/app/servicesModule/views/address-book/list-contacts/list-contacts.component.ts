import { Component, OnInit, ViewChild, ChangeDetectorRef, HostListener } from '@angular/core';
import { FormBuilder } from "@angular/forms";
import { MdbTablePaginationComponent, MdbTableDirective } from 'ng-uikit-pro-standard';
import { SharedService } from 'src/app/shared/services/shared.service';
import { ServicesModuleService } from "../../../services/services-module.service";
import { AppConfig } from '../../../../config/app.config';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list-contacts',
  templateUrl: './list-contacts.component.html',
  styleUrls: ['./list-contacts.component.css']
})
export class ListContactsComponent {

  moduleName = 'Address Book';
  componentName = 'LIST';
  goBack = `/${AppConfig.routes.service}`;
  addContacts = `/${AppConfig.routes.addContacts}`;
  //Pagination
  @ViewChild(MdbTablePaginationComponent, { static: true }) mdbTablePagination: MdbTablePaginationComponent;
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


  constructor(
    private cdRef: ChangeDetectorRef,
    private serviceModuleService: ServicesModuleService,
    private router: Router
  ) {
    this.hideTable = false;
  }

  ngOnInit() {
    this.hideTable = false;
    const contacts = this.serviceModuleService.getBooksAddress();
    this.contacts = (contacts !== null && contacts !== undefined) ? contacts : [];
    this.mdbTable.setDataSource(this.contacts);
    this.contacts = this.mdbTable.getDataSource();
    this.previous = this.mdbTable.getDataSource();
  }

  ngAfterViewInit() {
    this.mdbTablePagination.setMaxVisibleItemsNumberTo(5);
    this.mdbTablePagination.calculateFirstItemIndex();
    this.mdbTablePagination.calculateLastItemIndex();
    this.cdRef.detectChanges();
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
   * Remove contacts
   *
   * @param {string} label
   * @memberof AddressBookComponent
   */
  remove(label: string) {
    const newContacts = [];
    this.contacts.forEach(element => {
      if (element.label !== label) {
        newContacts.push(element);
      }
    });
    this.serviceModuleService.setBookAddress(newContacts, '');
    this.contacts = newContacts;
    this.mdbTable.setDataSource(this.contacts);
    this.contacts = this.mdbTable.getDataSource();
    this.previous = this.mdbTable.getDataSource();
  }
}

