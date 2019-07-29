import { Component, OnInit } from '@angular/core';
import { ServicesModuleService, StructureService } from '../../../servicesModule/services/services-module.service';
import { AppConfig } from '../../../config/app.config';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  link = {
    createWallet: AppConfig.routes.createWallet,
    importWallet: AppConfig.routes.importWallet
  };
  objectKeys = Object.keys;
  servicesList: StructureService[]  = [];


  constructor(
    private services: ServicesModuleService
  ) { }

  ngOnInit() {
    this.servicesList = [
      this.services.buildStructureService(
        'Transactions',
        'Search all available transactions',
        'icon-transactions-green-60h-proximax-sirius-wallet.svg',
        true
      ),
      this.services.buildStructureService(
        'Streaming',
        '',
        'icon-streaming-gradient-80h-proximax-sirius-wallet.svg',
        true
      ),
      this.services.buildStructureService(
        'Storage',
        '',
        'icon-storage-green-60h-proximax-sirius-wallet.svg',
        true
      ),
      this.services.buildStructureService(
        'Address Book',
        'Assign labels to addresses to easily keep track of your contacts',
        'icon-address-green-book-60h-proximax-sirius-wallet.svg',
        true
      )
    ];
  }

}
