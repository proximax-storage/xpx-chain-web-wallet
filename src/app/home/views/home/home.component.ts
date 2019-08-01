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
        'Blockchain',
        true,
        'Multisg, aggregated tx, cross chain, meta data',
        'icon-transactions-green-60h-proximax-sirius-wallet.svg',
      ),
      this.services.buildStructureService(
        'Storage',
        true,
        'P2P decentralised storage for any type file',
        'icon-storage-green-60h-proximax-sirius-wallet.svg',
      ),
        this.services.buildStructureService(
        'Streaming',
        true,
        'P2P decentralised streaming for video and chat',
        'icon-streaming-gradient-80h-proximax-sirius-wallet.svg',
      ),
      this.services.buildStructureService(
        'Supercontracts',
        true,
        'Easily modifiable digital contracts',
        'icon-supercontracts-gradient-80h-proximax-sirius-wallet',
      )
    ];
  }

}
