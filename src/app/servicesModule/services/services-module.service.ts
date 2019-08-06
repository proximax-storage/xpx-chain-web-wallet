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
   * @param {boolean} showParam
   * @param {string} descriptionParam
   * @param {string} imageParam
   * @param {string} routeParam
   * @param {StructureService} childrenParam
   * @param {boolean} viewChildrenParam
   * @param {string} classNameParam
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
    viewChildrenParam: boolean = false,
    classNameParam?: string
  ): StructureService {
    return {
      title: titleParam,
      show: showParam,
      description: descriptionParam,
      image: imageParam,
      route: routeParam,
      children: childrenParam,
      viewChildren: viewChildrenParam,
      className: classNameParam
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
   * @param {any} class
   * @returns
   * @memberof ServiceModuleService
   */
  structureServices(icon, title, text, route, show, className) {
    return {
      icon: icon,
      title: title,
      text: text,
      route: route,
      show: show,
      className: className
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
  className?: string;
}
