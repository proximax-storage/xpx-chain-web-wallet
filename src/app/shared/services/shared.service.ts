import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SharedService {


  constructor() { }

  /**
   *
   *
   * @param {string} typeParam
   * @param {string} nameParam
   * @param {string} classParam
   * @param {string} iconParam
   * @param {string} linkParam
   * @param {boolean} viewParam
   * @param {object} subMenuParam
   * @returns
   * @memberof SharedService
   */
  buildHeader(
    typeParam: 'default' | 'dropdown',
    nameParam: string,
    classParam: string,
    iconParam: string,
    rolParam: boolean,
    linkParam: string,
    viewParam: boolean,
    subMenuParam: object,
    selectedParam: boolean
  ): StructureHeader {
    return {
      type: typeParam,
      name: nameParam,
      class: classParam,
      icon: iconParam,
      rol: rolParam,
      link: linkParam,
      show: viewParam,
      submenu: subMenuParam,
      selected: selectedParam
    }
  }


}

export interface ItemsHeaderInterface {
  home?: StructureHeader;
  node?: StructureHeader;
  dashboard?: StructureHeader;
  nodeSelected?: StructureHeader;
  createWallet?: StructureHeader;
  importWallet?: StructureHeader;
  transactions?: StructureHeader;
  auth?: StructureHeader;
  account?: StructureHeader;
  services?: StructureHeader;
  signout?: StructureHeader;
}

export interface StructureHeader {
  type: string;
  name: string;
  class: string;
  icon: string;
  rol: boolean;
  link: string;
  show: boolean;
  submenu: object;
  selected: boolean;
}
