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
    importWallet: AppConfig.routes.importWallet,
    selectTypeCreationWallet: AppConfig.routes.selectTypeCreationWallet
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
        'Multisig, aggregated tx, cross chain, metadata',
        'icon-blockchain-full-color-80h-proximax-sirius-wallet.svg',
      ),
      this.services.buildStructureService(
        'Storage',
        true,
        'P2P decentralised storage for any type of file',
        'icon-storage-full-color-80h-proximax-sirius-wallet.svg',
      ),
        this.services.buildStructureService(
        'Streaming',
        true,
        'P2P decentralised streaming for video and chat',
        'icon-streaming-full-color-80h-proximax-sirius-wallet.svg',
      ),
      this.services.buildStructureService(
        'Supercontracts',
        true,
        'Easily modifiable digital contracts',
        'icon-supercontracts-full-color-80h-proximax-sirius-wallet.svg',
      )
    ];
  }

}
