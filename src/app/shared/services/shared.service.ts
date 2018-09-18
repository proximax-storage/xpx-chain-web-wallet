import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

declare var $: any;
@Injectable({
  providedIn: 'root'
})
export class SharedService {

  constructor(
    private toastrService: ToastrService
  ) { }

  showToastr(type, title: string = '', msg: string, timeOutParam: number = 5000, position: string = 'toast-top-right', progressParam: boolean = true) {
    console.log(typeof(type));
    switch (type) {
      case "1": {
        setTimeout(() => this.toastrService.success(msg, title, {
          timeOut: timeOutParam,
          closeButton: true,
          enableHtml: true,
          progressBar: progressParam,
          progressAnimation: 'decreasing',
          positionClass: position
        }));
        break;
      }
      case "2": {
        setTimeout(() => this.toastrService.info(msg, title, {
          timeOut: timeOutParam,
          closeButton: true,
          enableHtml: true,
          progressBar: progressParam,
          progressAnimation: 'decreasing',
          positionClass: position
        }));
        break;
      }
      case "3": {
        setTimeout(() => this.toastrService.error(msg, title, {
          timeOut: timeOutParam,
          closeButton: true,
          enableHtml: true,
          progressBar: progressParam,
          progressAnimation: 'decreasing',
          positionClass: position
        }));
        break;
      }
      case "4": {
        setTimeout(() => this.toastrService.warning(msg, title, {
          timeOut: timeOutParam,
          closeButton: true,
          enableHtml: true,
          progressBar: progressParam,
          progressAnimation: 'decreasing',
          positionClass: position
        }));
        break;
      }
    }
  }

  closeAlertMsg(type: string = "") {
    switch (type) {
      case "error": {
        $(".toast-error").trigger("click");
        break;
      }
      case "success": {
        $(".toast-success").trigger("click");
        break;
      }
      case "info": {
        $(".toast-info").trigger("click");
        break;
      }
      default: {
        $(".toast-info").trigger("click");
        $(".toast-success").trigger("click");
        $(".toast-error").trigger("click");
        break;
      }
    }
  }
}
