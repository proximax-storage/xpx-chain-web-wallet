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
  buildStructureService(
    titleParam: string,
    showParam: boolean,
    descriptionParam?: string,
    imageParam?: string,
    routeParam?: string,
    childrenParam?: {},
    viewChildrenParam: boolean = false
  ): StructureService {
    return {
      title: titleParam,
      show: showParam,
      description: descriptionParam,
      image: imageParam,
      route: routeParam,
      children: childrenParam,
      viewChildren: viewChildrenParam
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
  show: boolean;
  description?: string;
  image?: string;
  route?: string;
  children?: {};
  viewChildren?: boolean;
}
