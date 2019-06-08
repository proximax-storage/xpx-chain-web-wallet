import { Injectable } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { ToastService } from 'ng-uikit-pro-standard';


export interface StructureHeader {
  type: string;
  name: string;
  class: string;
  icon: string;
  rol: boolean;
  link: string;
  show: boolean;
  submenu: object;
}

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  constructor(
    private toastrService: ToastService
  ) { }


  buildStructureHeader(
    typeP: string, nameP: string, classP: string,
    iconP: string, rolP: boolean, linkP: string,
    showP: boolean, submenuP: object
  ) {
    return {
      type: typeP,
      name: nameP,
      class: classP,
      icon: iconP,
      rol: rolP,
      link: linkP,
      show: showP,
      submenu: submenuP,
      selected: false
    }
  }

  logError(message: any) {
    console.log(`%c ${message}`, 'background: red; color: white; margin: 0.5rem;');
  }

  logSuccess(message: any) {
    console.log(`%c ${message}`, 'background: green; color: white; margin: 0.5rem;');
  }

  logInfo(message: any) {
    console.log(`%c ${message}`, 'background: #00b8ff; color: black; margin: 0.5rem;');
  }

  logWarn(message: any) {
    console.log(`%c ${message}`, 'background: #ffd817; color: black; margin: 0.5rem;');
  }

  showSuccess(title: string, bodyMessage: string) {
    const options = { closeButton: true, tapToDismiss: false, toastClass: 'toastSuccess' };
    this.toastrService.success(bodyMessage, title, options);
  }

  showError(title: string, bodyMessage: string) {
    const options = { closeButton: true, tapToDismiss: false, toastClass: 'toastError' };
    this.toastrService.error(bodyMessage, title, options);
  }

  showWarning(title: string, bodyMessage: string) {
    const options = { closeButton: true, tapToDismiss: false, toastClass: 'toastWarning' };
    this.toastrService.warning(bodyMessage, title, options);
  }

  showInfo(title: string, bodyMessage: string) {
    const options = { closeButton: true, tapToDismiss: false, toastClass: 'toastWarning' };
    this.toastrService.info(bodyMessage, title, options);
  }

  closeAlertMsg(type: string = '') { }

  passwordConfirming(c: AbstractControl): { noMatch: boolean } {
    if (c.get('password').value !== c.get('confirm_password').value) {
      return {
        noMatch: true
      };
    }
  }

  removeItemFromArr(arr, item) {
    var i = arr.indexOf(item);
    arr.splice(i, 1);
    return arr;
  }

}
