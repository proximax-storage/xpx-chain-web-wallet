import { Component, OnInit } from '@angular/core';
import { AppConfig } from "../../../config/app.config";
import { ServicesModuleService, StructureService } from "../../services/services-module.service";

@Component({
  selector: 'app-services-box',
  templateUrl: './services-box.component.html',
  styleUrls: ['./services-box.component.css']
})
export class ServicesBoxComponent implements OnInit {

  coin = 'XPX';
  link = {
    createWallet: AppConfig.routes.createWallet,
    importWallet: AppConfig.routes.importWallet
  };
  objectKeys = Object.keys;
  servicesList: StructureService[] = [];

  constructor(
    private services: ServicesModuleService
  ) { }

  ngOnInit() {
    this.servicesList = [
      //Account
      this.services.buildStructureService(
        'Accounts',
        true,
        'Accounts details, link address to namespace, smart rules restrictions.',
        'icon-account-green-60h-proximax-sirius-wallet.svg',
        '',
        {
          details: this.services.buildStructureService(
            'Details',
            true,
            '',
            '',
            AppConfig.routes.account
          ), aliasToNamespace: this.services.buildStructureService(
            'Alias to Namespace',
            true,
            '',
            '',
            AppConfig.routes.linkTheNamespaceToAnAddress
          ), multiSign: this.services.buildStructureService(
            'Multi-Sign',
            false,
            '',
            '',
            AppConfig.routes.linkTheNamespaceToAnAddress
          ), metadata: this.services.buildStructureService(
            'Metadata',
            false,
            '',
            '',
            AppConfig.routes.linkTheNamespaceToAnAddress
          ),
        },
        true
      ),

      //Transactions Explorer
      this.services.buildStructureService(
        'Transactions Explorer',
        true,
        'Explore all transactions, network stats, and node locations',
        'icon-transactions-green-60h-proximax-sirius-wallet.svg',
      ),

      //Namespaces
      this.services.buildStructureService(
        'Namespaces',
        true,
        'Create a domain and subdmains',
        'icon-streaming-gradient-80h-proximax-sirius-wallet.svg',
      ),

      //Mosaics
      this.services.buildStructureService(
        'Mosaics',
        true,
        'Create digital assets with unique properties',
        'icon-storage-green-60h-proximax-sirius-wallet.svg',
      ),

      // Address Book
      this.services.buildStructureService(
        'Address Book',
        true,
        'Assign labels to addresses to easily keep track of your contacts',
        'icon-address-green-book-60h-proximax-sirius-wallet.svg',
      ),

      // Storage
      this.services.buildStructureService(
        'Storage',
        true,
        'Upload and download your files and encrypt them',
        'icon-address-green-book-60h-proximax-sirius-wallet.svg',
      ),

      // NOdes
      this.services.buildStructureService(
        'Nodes',
        true,
        'Add and edits nodes.',
        'icon-address-green-book-60h-proximax-sirius-wallet.svg',
      ),

      // Services 08
      this.services.buildStructureService(
        'Address Book',
        true,
        'Create digital assets with unique properties',
        'icon-address-green-book-60h-proximax-sirius-wallet.svg',
      )
    ];

    console.log(this.servicesList);
  }
}
