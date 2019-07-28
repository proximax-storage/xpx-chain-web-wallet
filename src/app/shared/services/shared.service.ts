import { Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  configurationForm: ConfigurationForm = {
    nameWallet: {
      minLength: 2, maxLength: 30
    },
    passwordWallet: {
      minLength: 8,
      maxLength: 30
    }
  };

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

  /**
   *
   *
   * @param {AbstractControl} abstractControl
   * @returns {{ noMatch: boolean }}
   * @memberof SharedService
   */
  equalsPassword(abstractControl: AbstractControl): { noMatch: boolean } {
    if (abstractControl.get('password').value !== abstractControl.get('confirm_password').value) {
      return {
        noMatch: true
      };
    }
  }
}

export interface ConfigurationForm {
  nameWallet?: {
    minLength: number;
    maxLength: number;
  };
  passwordWallet?: {
    minLength: number;
    maxLength: number;
  };
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
  wallet?: StructureHeader;
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
