import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ServiceModuleService {

  booksAddress = 'books-address'
  constructor() {

  }

  /**
   * Structure of services array
   *
   * @param {any} icon
   * @param {any} title
   * @param {any} text
   * @param {any} route
   * @param {any} show
   * @returns
   * @memberof ServiceModuleService
   */
  structureServices(icon, title, text, route, show) {
    return {
      icon: icon,
      title: title,
      text: text,
      route: route,
      show: show
    }
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
