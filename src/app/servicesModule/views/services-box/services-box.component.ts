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
            'Link to Namespace',
            true,
            '',
            '',
            AppConfig.routes.aliasAddressToNamespace
          ), multiSign: this.services.buildStructureService(
            'Multi-Sign',
            false,
            '',
            '',
            ''
          ), metadata: this.services.buildStructureService(
            'Metadata',
            false,
            '',
            '',
            ''
          ), restrinctions: this.services.buildStructureService(
            'Restictions',
            false,
            '',
            '',
            ''
          ),
          delegate: this.services.buildStructureService(
            'Delegate',
            false,
            '',
            '',
            ''
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
        '',
        {
          explorer: this.services.buildStructureService(
            'Explorer',
            true,
            '',
            '',
            AppConfig.routes.explorer
          )
        },
        true
      ),

      //Namespaces
      this.services.buildStructureService(
        'Namespaces',
        true,
        'Create a namespaces and sub-namespaces',
        'icon-namespaces-green-60h-proximax-sirius-wallet.svg',
        '',
        {
          create: this.services.buildStructureService(
            'Register',
            true,
            '',
            '',
            AppConfig.routes.createNamespace
          ), renew: this.services.buildStructureService(
            'Renew',
            true,
            '',
            '',
            AppConfig.routes.renewNamespace
          ), extend: this.services.buildStructureService(
            'Extend Duration',
            false,
            '',
            '',
            AppConfig.routes.renewNamespace
          )
        },
        true
      ),

      //Mosaics
      this.services.buildStructureService(
        'Mosaics',
        true,
        'Create digital assets with unique properties',
        'icon-mosaics-green-60h-proximax-sirius-wallet.svg',
        '',
        {
          create: this.services.buildStructureService(
            'Create',
            true,
            '',
            '',
            AppConfig.routes.createMosaic
          ), changeSupply: this.services.buildStructureService(
            'Change Supply',
            true,
            '',
            '',
            AppConfig.routes.MosaicSupplyChange
          ), linkToNamespace: this.services.buildStructureService(
            'Link to namespace',
            true,
            '',
            '',
            AppConfig.routes.LinkingNamespaceMosaic
          ), renew: this.services.buildStructureService(
            'Renew',
            false,
            '',
            '',
            ''
          ), extend: this.services.buildStructureService(
            'Extend Duration',
            false,
            '',
            '',
            ''
          )
        },
        true
      ),

      // Address Book
      this.services.buildStructureService(
        'Address Book',
        true,
        'Assign labels to addresses to easily keep track of your contacts',
        'icon-address-green-book-60h-proximax-sirius-wallet.svg',
        '',
        {
          addContact: this.services.buildStructureService(
            'My Contacts',
            true,
            '',
            '',
            AppConfig.routes.addressBook
          ), open: this.services.buildStructureService(
            'Add Contact',
            false,
            '',
            '',
            ''
          )
        },
        true
      ),

      // Storage
      this.services.buildStructureService(
        'Storage',
        true,
        'Upload and download your files and encrypt them',
        'icon-storage-green-60h-proximax-sirius-wallet.svg',
        '',
        {
          myFiles: this.services.buildStructureService(
            'My files',
            false,
            '',
            '',
            ''
          ), upload: this.services.buildStructureService(
            'Upload File',
            false,
            '',
            '',
            ''
          )
        },
        true
      ),

      // Nodes
      this.services.buildStructureService(
        'Nodes',
        true,
        'Add and edits nodes.',
        'icon-nodes-green-60h-proximax-sirius-wallet.svg',
        '',
        {
          blockchain: this.services.buildStructureService(
            'Blockchain',
            false,
            '',
            '',
            ''
          ), storage: this.services.buildStructureService(
            'Storage',
            false,
            '',
            '',
            ''
          )
        },
        true
      ),

      // Notarization
      this.services.buildStructureService(
        'Notarization',
        true,
        'Create digital assets with unique properties',
        'icon-mosaics-green-60h-proximax-sirius-wallet.svg',
        '',
        {
          notarize: this.services.buildStructureService(
            'Notarize',
            false,
            '',
            '',
            ''
          ),
          audit: this.services.buildStructureService(
            'Audit',
            false,
            '',
            '',
            ''
          )
        },
        true
      ),

      // Voting
      this.services.buildStructureService(
        'Voting',
        true,
        'Create digital assets with unique properties',
        'icon-mosaics-green-60h-proximax-sirius-wallet.svg',
        '',
        {
          poll: this.services.buildStructureService(
            'Create Poll',
            false,
            '',
            '',
            ''
          ),
          view: this.services.buildStructureService(
            'View Result',
            false,
            '',
            '',
            ''
          )
        },
        true
      ),

      // Agregate transactions
      this.services.buildStructureService(
        'Agregate Transactions',
        true,
        'Create digital assets with unique properties',
        'icon-mosaics-green-60h-proximax-sirius-wallet.svg',
        '',
        {
          complete: this.services.buildStructureService(
            'Complete',
            false,
            '',
            '',
            ''
          ),
          bonded: this.services.buildStructureService(
            'Bonded',
            false,
            '',
            '',
            ''
          )
        },
        true
      ),

      // Cross-Chain Swaps
      this.services.buildStructureService(
        'Cross-Chain Swaps',
        true,
        'Create digital assets with unique properties',
        'icon-mosaics-green-60h-proximax-sirius-wallet.svg',
        '',
        {
          secretLock: this.services.buildStructureService(
            'SecretLock',
            false,
            '',
            '',
            ''
          ),
          secretProof: this.services.buildStructureService(
            'SecretProof',
            false,
            '',
            '',
            ''
          )
        },
        true
      ),

      // Message
      this.services.buildStructureService(
        'Message',
        true,
        'Create digital assets with unique properties',
        'icon-mosaics-green-60h-proximax-sirius-wallet.svg',
        '',
        {
          send: this.services.buildStructureService(
            'Send',
            false,
            '',
            '',
            ''
          )
        },
        true
      ),

      // Message
      this.services.buildStructureService(
        'Invoice',
        true,
        'Create digital assets with unique properties',
        'icon-mosaics-green-60h-proximax-sirius-wallet.svg',
        '',
        {
          create: this.services.buildStructureService(
            'Create',
            false,
            '',
            '',
            ''
          )
        },
        true
      )
    ];
  }
}
