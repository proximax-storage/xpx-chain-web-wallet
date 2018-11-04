import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ServiceModuleService {

  booksAddress = 'books-address'
  constructor() {

  }


  /**
   * Set book address
   *
   * @memberof ServiceModuleService
   */
  setBookAddress(contacts) {
    localStorage.setItem(this.booksAddress, JSON.stringify(contacts));
  }

  /**
   * Get books address
   *
   * @returns
   * @memberof ServiceModuleService
   */
  getBooksAddress() {
    return JSON.parse(localStorage.getItem(this.booksAddress));
  }
}
