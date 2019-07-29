import { Injectable } from '@angular/core';
import { Address } from 'tsjs-xpx-chain-sdk';

@Injectable({
  providedIn: 'root'
})


export class ServicesModuleService {

  booksAddress = ``;
  constructor() { }


  /**
   *
   *
   * @param {string} titleParam
   * @param {string} descriptionParam
   * @param {string} imageParam
   * @param {boolean} showParam
   * @returns {StructureService}
   * @memberof ServicesModuleService
   */
  buildStructureService(titleParam: string, descriptionParam: string, imageParam: string, showParam: boolean): StructureService {
    return {
      title: titleParam,
      description: descriptionParam,
      image: imageParam,
      show: showParam
    };
  }


  /**
   *
   *
   * @param {Address} address
   * @memberof ServicesModuleService
   */
  changeBooksItem(address: Address) {
    this.booksAddress = `books-address-${address.pretty()}`;
  }


  /******************************************************/

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


export interface StructureService {
  title: string;
  description: string;
  image: string;
  show: boolean;
}
