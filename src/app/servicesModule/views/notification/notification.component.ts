import { Component, OnInit, ViewChild } from '@angular/core';
import { HeaderServicesInterface } from '../../services/services-module.service';
import { AppConfig } from 'src/app/config/app.config';
import { NamespacesService } from '../../services/namespaces.service';
import { TransactionsService } from 'src/app/transactions/services/transactions.service';
import { MdbTableDirective, ModalDirective } from 'ng-uikit-pro-standard';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit {
  @ViewChild(MdbTableDirective, { static: true }) mdbTable: MdbTableDirective;
  @ViewChild('modalNamespace', { static: true }) modalNamespace: ModalDirective;

  paramsHeader: HeaderServicesInterface = {
    moduleName: 'Notifications',
    componentName: 'View All',
  };
  routePartial = `/${AppConfig.routes.partial}`
  viewNamespaces: boolean;
  namespacesExpired: object[];
  viewNotifications: boolean;
  constructor(
    private namespaces: NamespacesService,
    private transactionService: TransactionsService,
    private route: Router,

  ) { }

  ngOnInit() {
    this.viewNamespaces = this.namespaces.view;
    this.namespacesExpired = this.namespaces.expired;
    // console.log(this.namespacesExpired);

  }

  calculateDuration(durationCompact) {
    let seconds = durationCompact * 15;
    let days = Math.floor(seconds / (3600 * 24));
    seconds -= days * 3600 * 24;
    let hrs = Math.floor(seconds / 3600);
    seconds -= hrs * 3600;
    let mnts = Math.floor(seconds / 60);
    seconds -= mnts * 60;
    const response = days + " days, " + hrs + " Hrs, " + mnts + " Minutes, " + seconds + " Seconds";
    return response;
  }

  viewNamespace() {
    this.transactionService.setViewNotifications$(false);
    this.modalNamespace.show();
  }

  extendDuration(val) {
    // console.log('extendiendo la duracion', val.namespace.idToHex);
    // console.log(`/${AppConfig.routes.extendNamespace}/${val.namespace.idToHex}`);
    
    this.route.navigate([`/${AppConfig.routes.extendNamespace}`]);
  }

  deleteNamespace() {
    this.viewNamespaces = false;
    this.transactionService.setViewNotifications$(false)
  }
}
