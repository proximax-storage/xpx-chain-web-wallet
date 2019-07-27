import { Component, OnInit } from '@angular/core';
import { ServicesService, StructureService } from '../../../services/services/services.service';
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
    private services: ServicesService
  ) { }

  ngOnInit() {
    this.servicesList = [
      this.services.buildStructureService('Transactions', 'Search all available transactions', 'icon-transactions-dark-green.svg', true),
      this.services.buildStructureService('Notary', 'Verify and authenticate documents', 'icon-notary-dark-green.svg', true),
      this.services.buildStructureService('Voting', 'Create polls and vote', 'icon-voting-dark-green.svg', true),
      this.services.buildStructureService(
        'Directory', 'Assign labels to addresses to easily keep track of your contacts', 'icon-directory-dark-green.svg', true
      )
    ];
  }

}
