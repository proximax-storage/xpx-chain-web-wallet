import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { ToastService } from 'ng-uikit-pro-standard';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  configurationForm: ConfigurationForm = {
    accountRecipient: {
      minLength: 40, maxLength: 46
    },
    nameWallet: {
      minLength: 2, maxLength: 30
    },
    namespaceName: {
      minLength: 3, maxLength: 64
    },
    privateKey: {
      minLength: 64, maxLength: 64
    },
    passwordWallet: {
      minLength: 8,
      maxLength: 30
    },
    amount: {
      maxLength: 20
    },
    message: {
      maxLength: 1024
    }
  };

  constructor(
    private toastrService: ToastService
  ) { }

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

  showSuccess(title: string, bodyMessage: string) {
    const options = { closeButton: true, tapToDismiss: false, toastClass: 'toastSuccess', timeOut: 4000 };
    this.toastrService.success(bodyMessage, '', options);
  }

  showSuccessTimeout(title: string, bodyMessage: string, timeout:number) {
    const options = { closeButton: true, tapToDismiss: false, toastClass: 'toastSuccess', timeOut: timeout };
    this.toastrService.success(bodyMessage, '', options);
  }

  showError(title: string, bodyMessage: string) {
    const options = { closeButton: true, tapToDismiss: false, toastClass: 'toastError', timeOut: 4000 };
    this.toastrService.error(bodyMessage, '', options);
  }

  showWarning(title: string, bodyMessage: string) {
    const options = { closeButton: true, tapToDismiss: false, toastClass: 'toastWarning', timeOut: 4000 };
    this.toastrService.warning(bodyMessage, '', options);
  }

  showInfo(title: string, bodyMessage: string) {
    const options = { closeButton: true, tapToDismiss: false, toastClass: 'toastInfo', timeOut: 4000 };
    this.toastrService.info(bodyMessage, '', options);
  }
}



export interface ConfigurationForm {
  accountRecipient?: {
    minLength: number;
    maxLength: number;
  };
  amount?: {
    maxLength: number;
  };
  message?: {
    maxLength: 1024
  }
  nameWallet?: {
    minLength: number;
    maxLength: number;
  };
  namespaceName?: {
    minLength: number;
    maxLength: number;
  };
  privateKey?: {
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
  transfer?: StructureHeader;
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
