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
            'DETAILS',
            true,
            '',
            '',
            AppConfig.routes.account
          ), aliasToNamespace: this.services.buildStructureService(
            'LINK TO NAMESPACE',
            true,
            '',
            '',
            AppConfig.routes.aliasAddressToNamespace
          ), multiSign: this.services.buildStructureService(
            'MULTISIGN',
            false,
            '',
            '',
            ''
          ), metadata: this.services.buildStructureService(
            'METADATA',
            false,
            '',
            '',
            ''
          ), restrinctions: this.services.buildStructureService(
            'RESTRICTIONS',
            false,
            '',
            '',
            ''
          ),
          delegate: this.services.buildStructureService(
            'DELEGATE',
            false,
            '',
            '',
            ''
          ),
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
            'REGISTER',
            true,
            '',
            '',
            AppConfig.routes.createNamespace
          ), renew: this.services.buildStructureService(
            'RENEW',
            true,
            '',
            '',
            AppConfig.routes.renewNamespace
          ), extend: this.services.buildStructureService(
            'EXTEND DURATION',
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
            'CREATE',
            true,
            '',
            '',
            AppConfig.routes.createMosaic
          ), changeSupply: this.services.buildStructureService(
            'MODIFY SUPPLY',
            true,
            '',
            '',
            AppConfig.routes.MosaicSupplyChange
          ), linkToNamespace: this.services.buildStructureService(
            'LINK TO NAMESPACE',
            true,
            '',
            '',
            AppConfig.routes.LinkingNamespaceMosaic
          ),extend: this.services.buildStructureService(
            'EXTEND DURATION',
            false,
            '',
            '',
            ''
          ), renew: this.services.buildStructureService(
            'RENEW',
            false,
            '',
            '',
            ''
          )
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
            'EXPLORE',
            true,
            '',
            '',
            AppConfig.routes.explorer
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
            'LIST',
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
            'MY FILES',
            true,
            '',
            '',
            AppConfig.routes.myFile,
          ), upload: this.services.buildStructureService(
            'UPLOAD FILE',
            true,
            '',
            '',
            AppConfig.routes.uploadFile
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
            'BLOCKCHAIN',
            false,
            '',
            '',
            ''
          ), storage: this.services.buildStructureService(
            'STORAGE',
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
        'Notarization documents',
        'icon-notarization-green-60h.svg',
        '',
        {
          notarize: this.services.buildStructureService(
            'NOTARIZE',
            false,
            '',
            '',
            ''
          ),
          audit: this.services.buildStructureService(
            'AUDIT',
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
        'Create votes and see your results',
        'icon-voting-green-60h.svg',
        '',
        {
          poll: this.services.buildStructureService(
            'CREATE POOL',
            false,
            '',
            '',
            ''
          ),
          view: this.services.buildStructureService(
            'VIEW RESULT',
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
        'Merge multiple transactions into one',
        'icon-aggregated-transactions-green-60h.svg',
        '',
        {
          complete: this.services.buildStructureService(
            'COMPLETE',
            false,
            '',
            '',
            ''
          ),
          bonded: this.services.buildStructureService(
            'BONDED',
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
        'Atomic cross-chain swap between public and private network',
        'icon-cross-chain-green-60h.svg',
        '',
        {
          secretLock: this.services.buildStructureService(
            'SECRETLOCK',
            false,
            '',
            '',
            ''
          ),
          secretProof: this.services.buildStructureService(
            'SECRETPROOF',
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
        'Send personalized and encrypted messages',
        'icon-messenger-green-16h-proximax-sirius-wallet.svg',
        '',
        {
          send: this.services.buildStructureService(
            'SEND',
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
        'Create invoices',
        'icon-invoice-green-60h.svg',
        '',
        {
          create: this.services.buildStructureService(
            'CREATE',
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
