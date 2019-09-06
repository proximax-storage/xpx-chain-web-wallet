import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { ToastService } from 'ng-uikit-pro-standard';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  configurationForm: ConfigurationForm = {
    address: {
      minLength: 40,
      maxLength: 46
    },
    amount: {
      maxLength: 20
    },
    content: {
      minLength: 0,
      maxLength: 240
    },
    documentTitle: {
      minLength: 1,
      maxLength: 64
    },
    nameWallet: {
      minLength: 2,
      maxLength: 30
    },
    namespaceName: {
      minLength: 3,
      maxLength: 16
    },
    subNamespaceName: {
      minLength: 3,
      maxLength: 64
    },
    privateKey: {
      minLength: 64,
      maxLength: 64
    },
    publicKey: {
      minLength: 64,
      maxLength: 64
    },
    passwordWallet: {
      minLength: 8,
      maxLength: 30
    },
    message: {
      maxLength: 1024
    },
    tags: {
      minLength: 1,
      maxLength: 240
    },
    mosaicWallet: {
      maxSupply: 9000000000
    }
  };

  constructor(
    private toastrService: ToastService
  ) { }


  /**
   *
   *
   * @param {MenuInterface} params
   * @returns {StructureHeader}
   * @memberof SharedService
   */
  buildHeader(params: MenuInterface): StructureHeader {
    return {
      type: params.type,
      name: params.name,
      class: params.class,
      icon: params.icon,
      rol: params.rol,
      link: params.link,
      show: params.view,
      submenu: params.subMenu,
      selected: params.selected
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

  /**
   *
   *
   * @param {*} filename
   * @returns
   * @memberof SharedService
   */
  getFileExtension(filename: string) {
    return (/[.]/.exec(filename)) ? /[^.]+$/.exec(filename)[0] : undefined;
  }

  /**
   *
   *
   * @param {string} title
   * @param {string} bodyMessage
   * @memberof SharedService
   */
  showSuccess(title: string, bodyMessage: string) {
    const options = { closeButton: true, tapToDismiss: false, toastClass: 'toastSuccess', timeOut: 4000, messageClass: 'messageClass' };
    this.toastrService.success(bodyMessage, '', options);
  }

  /**
   *
   *
   * @param {string} title
   * @param {string} bodyMessage
   * @param {number} timeout
   * @memberof SharedService
   */
  showSuccessTimeout(title: string, bodyMessage: string, timeout: number) {
    const options = { closeButton: true, tapToDismiss: false, toastClass: 'toastSuccess', timeOut: 4000, messageClass: 'messageClass' };
    this.toastrService.success(bodyMessage, '', options);
  }

  /**
   *
   *
   * @param {string} title
   * @param {string} bodyMessage
   * @memberof SharedService
   */
  showError(title: string, bodyMessage: string) {
    const options = { closeButton: true, tapToDismiss: false, toastClass: 'toastError', timeOut: 4000, messageClass: 'messageClass' };
    this.toastrService.error(bodyMessage, '', options);
  }

  /**
   *
   *
   * @param {string} title
   * @param {string} bodyMessage
   * @memberof SharedService
   */
  showWarning(title: string, bodyMessage: string) {
    const options = { closeButton: true, tapToDismiss: false, toastClass: 'toastWarning', timeOut: 4000, messageClass: 'messageClass' };
    this.toastrService.warning(bodyMessage, '', options);
  }

  /**
   *
   *
   * @param {string} title
   * @param {string} bodyMessage
   * @memberof SharedService
   */
  showInfo(title: string, bodyMessage: string) {
    const options = { closeButton: true, tapToDismiss: false, toastClass: 'toastInfo', timeOut: 4000, messageClass: 'messageClass' };
    this.toastrService.info(bodyMessage, '', options);
  }
}


export interface MenuInterface {
  type: 'default' | 'dropdown',
  name: string,
  class: string,
  icon: string,
  rol: boolean,
  link: string,
  view: boolean,
  subMenu: object,
  selected: boolean
}

export interface ConfigurationForm {
  address?: {
    minLength: number;
    maxLength: number;
  };
  amount?: {
    maxLength: number;
  };
  content?: {
    minLength: number;
    maxLength: number;
  };
  documentTitle?: {
    minLength: number;
    maxLength: number;
  };
  tags?: {
    minLength: number;
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
  subNamespaceName?: {
    minLength: number;
    maxLength: number;
  };
  privateKey?: {
    minLength: number;
    maxLength: number;
  };
  publicKey?: {
    minLength: number;
    maxLength: number;
  };
  passwordWallet?: {
    minLength: number;
    maxLength: number;
  };
  mosaicWallet?: {
    maxSupply: number;
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
