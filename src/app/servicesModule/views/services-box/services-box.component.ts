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
        'Manage your accounts.',
        'icon-account-green-60h-proximax-sirius-wallet.svg',
        '',
        {
          details: this.services.buildStructureService(
            'ACCOUNTS',
            true,
            '',
            '',
            AppConfig.routes.MultiSign,
          ), multiSign: this.services.buildStructureService(
            'MULTISIGN',
            true,
            '',
            '',
            AppConfig.routes.MultiSign,
          ), restrinctions: this.services.buildStructureService(
            'RESTRICTIONS',
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
          ), delegate: this.services.buildStructureService(
            'DELEGATE',
            false,
            '',
            '',
            ''
          ), aliasToNamespace: this.services.buildStructureService(
            'LINK TO NAMESPACE',
            true,
            '',
            '',
            AppConfig.routes.aliasAddressToNamespace
          )
        },
        true,
      ),

      //Namespaces
      this.services.buildStructureService(
        'Namespaces',
        true,
        'Create namespaces and sub-namespaces',
        'icon-namespaces-green-60h-proximax-sirius-wallet.svg',
        '',
        {
          create: this.services.buildStructureService(
            'REGISTER',
            true,
            '',
            '',
            AppConfig.routes.createNamespace
          ), extend: this.services.buildStructureService(
            'EXTEND DURATION',
            true,
            '',
            '',
            AppConfig.routes.renewNamespace
          ), renew: this.services.buildStructureService(
            'RENEW',
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
          ), extend: this.services.buildStructureService(
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
        'Explore all transactions',
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

      // Storage
      this.services.buildStructureService(
        'Storage',
        true,
        'Upload and download your files and encrypt them',
        'icon-storage-green-60h-proximax-sirius-wallet.svg',
        '',
        {
          myFiles: this.services.buildStructureService(
            'FILES',
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
          ), shareFile: this.services.buildStructureService(
            'SEND/SHARE',
            true,
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
        'Assign labels to addresses',
        'icon-address-green-book-60h-proximax-sirius-wallet.svg',
        '',
        {
          addContact: this.services.buildStructureService(
            'ADD AND LIST CONTACTS',
            true,
            '',
            '',
            AppConfig.routes.addressBook
          )
        },
        true
      ),

      // Notarization
      this.services.buildStructureService(
        'Attestation',
        true,
        'Proof of existence / proof of origination',
        'icon-notarization-green-60h.svg',
        '',
        {
          notarize: this.services.buildStructureService(
            'CREATE',
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
        true,
        'disable-module'
      ),

      // Voting
      this.services.buildStructureService(
        'Voting',
        true,
        'Create polls and vew results',
        'icon-voting-green-60h.svg',
        '',
        {
          poll: this.services.buildStructureService(
            'CREATE POLL',
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
        true,
        'disable-module'
      ),

      // Agregate transactions
      this.services.buildStructureService(
        'Aggregate Transactions',
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
        true,
        'disable-module'
      ),

      // Cross-Chain Swaps
      this.services.buildStructureService(
        'Cross-Chain Swaps',
        true,
        'Atomic cross-chain swap between public and private networks',
        'icon-cross-chain-green-60h.svg',
        '',
        {
          secretLock: this.services.buildStructureService(
            'SWAP',
            false,
            '',
            '',
            ''
          )
        },
        true,
        'disable-module'
      ),

      // Nodes
      this.services.buildStructureService(
        'Nodes',
        true,
        'Add and edits nodes',
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
          ), streaming: this.services.buildStructureService(
            'STREAMING',
            false,
            '',
            '',
            ''
          )
        },
        true,
        'disable-module'
      ),

      // Message
      this.services.buildStructureService(
        'Messaging',
        true,
        'Send encrypted messages',
        'icon-messenger-green-16h-proximax-sirius-wallet.svg',
        '',
        {
          send: this.services.buildStructureService(
            'CHAT',
            false,
            '',
            '',
            ''
          )
        },
        true,
        'disable-module'
      ),

      // Invoice
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
        true,
        'disable-module'
      ),

      // VIDEO CONFERENCING
      this.services.buildStructureService(
        'Video Conferencing',
        true,
        'Encrypted face-to-face comunication',
        'icon-streaming-green-60h-proximax-sirius-wallet.svg',
        '',
        {
          schedule: this.services.buildStructureService(
            'SCHEDULE',
            false,
            '',
            '',
            ''
          ), start: this.services.buildStructureService(
            'START',
            false,
            '',
            '',
            ''
          )
        },
        true,
        'disable-module'
      ),

      // SUPERCONTRACTS
      this.services.buildStructureService(
        'Supercontracts',
        true,
        'Create supercontracts',
        'icon-supercontracts-green-60h-proximax-sirius-wallet.svg',
        '',
        {
          create: this.services.buildStructureService(
            'CREATE',
            false,
            '',
            '',
            ''
          ), status: this.services.buildStructureService(
            'STATUS',
            false,
            '',
            '',
            ''
          )
        },
        true,
        'disable-module'
      )
    ];
  }
}
