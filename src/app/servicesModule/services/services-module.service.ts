import { Injectable } from '@angular/core';
import { Address, NamespaceId, PublicAccount } from 'tsjs-xpx-chain-sdk';
import { WalletService } from '../../wallet/services/wallet.service';
import { environment } from 'src/environments/environment';
import { TransactionsInterface } from '../../transactions/services/transactions.service';

@Injectable({
  providedIn: 'root'
})


export class ServicesModuleService {

  itemBook = ``;
  constructor(
    private walletService: WalletService
  ) { }

  /**
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
   * @param {string} nameContact
   * @param {string} addressContact
   * @memberof ServicesModuleService
   */
  saveContacts(params: ContactsStorageInterface) {
    // const booksStorage =
    const dataStorage = (params.nameItem === '') ? this.getBooksAddress() : localStorage.getItem(`${environment.itemBooksAddress}-${params.nameItem}`);
    const books = { label: params.name, value: params.address.split('-').join(''), walletContact: params.walletContact };
    if (params.update) {

      const contactsFiltered = dataStorage.filter(element =>
        element.label !== params.dataComparate.name &&
        element.value !== params.dataComparate.address
      );

      const issetData = contactsFiltered.find(element =>
        element.label === params.name ||
        element.value === params.address
      );

      if (issetData === undefined) {
        contactsFiltered.push(books);
        this.setBookAddress(contactsFiltered, params.nameItem);
        return true;
      }

      return false;
    } else {
      // console.log('Aquiiii lleggfaaaaaa', books);
      // console.log('Aquiiii dataStorage', dataStorage);


      if (dataStorage === null) {
        // console.log('Aquiiii lleggfaaaaaa', books);
      // console.log('Aquiiii dataStorage', dataStorage);
        this.setBookAddress([books], params.nameItem);
        return true;
      }

      let issetData = undefined;
      try {
        issetData = dataStorage.find(element =>
          element.label === params.name ||
          element.value === params.address
        );
      } catch (error) {

      }

      if (issetData === undefined) {
        dataStorage.push(books);
        this.setBookAddress(dataStorage, params.nameItem);
        return true;
      }

      return false;
    }
  }

  /**
   *
   *
   * @param {Address} address
   * @memberof ServicesModuleService
   */
  changeBooksItem() {
    this.itemBook = `${environment.itemBooksAddress}-${this.walletService.getCurrentWallet().name}`;
    // console.log(this.itemBook);
  }

  /**
     *
     *
     *
     * @param {string} itemEnvironment
     * @param {string} nameWallet
     * @memberof ServicesModuleService
     */
  removeItemStorage(itemEnvironment: string, nameWallet: string) {
    localStorage.removeItem(`${itemEnvironment}-${nameWallet}`);
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
  setBookAddress(contacts: any, nameItem: string) {
    if (nameItem === '') {
      localStorage.setItem(this.itemBook, JSON.stringify(contacts));
    } else {
      localStorage.setItem(`${environment.itemBooksAddress}-${nameItem}`, JSON.stringify(contacts));
    }
  }

  /**
   * Get books address
   *
   * @returns
   * @memberof ServiceModuleService
   */
  getBooksAddress() {
    return JSON.parse(localStorage.getItem(this.itemBook));
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

export interface ContactsStorageInterface {
  name: string;
  address: string;
  walletContact: boolean;
  nameItem: string;
  update?: boolean;
  dataComparate?: {
    name: string;
    address: string;
  }
};

export interface HeaderServicesInterface {
  moduleName: string,
  componentName: string,
  routerBack?: string,
  extraButton?: string,
  routerExtraButton?: string
}

export interface ResultAuditInterface {
  filename: string,
  owner: Address | NamespaceId | string,
  fileHash: string,
  result: string,
  hash: string,
  date?: string,
  method?: string,
  transaction?: TransactionsInterface
}
