import { Injectable } from '@angular/core';
import { ToastService } from 'ng-uikit-pro-standard';
import { FormGroup, AbstractControl } from "@angular/forms";

declare var $: any;
@Injectable({
  providedIn: 'root'
})
export class SharedService {

  constructor(
    private toastrService: ToastService
  ) { }


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

  closeAlertMsg(type: string = "") {

  }

  passwordConfirming(c: AbstractControl): { noMatch: boolean } {
    if (c.get('password').value !== c.get('confirm_password').value) {
      return { 
        noMatch: true 
      };
    }
  }

}
