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
    const contacts = this.services.getBooksAddress();
    const showItems = {
      listContact: (contacts !== null && contacts !== undefined && contacts.length > 0) ? true : false
    }

    this.servicesList = [
      //Account
      this.services.buildStructureService(
        'Accounts',
        true,
        'Manage your accounts',
        'icon-accounts-full-color-80h-proximax-sirius-wallet.svg',
        '',
        {
          details: this.services.buildStructureService(
            'Accounts',
            true,
            '',
            '',
            AppConfig.routes.viewAllAccount,
          ), multiSign: this.services.buildStructureService(
            'Multisig',
            true,
            '',
            '',
            AppConfig.routes.MultiSign,
          ), restrinctions: this.services.buildStructureService(
            'Restrictions',
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
          ), delegate: this.services.buildStructureService(
            'Delegate',
            false,
            '',
            '',
            ''
          ), aliasToNamespace: this.services.buildStructureService(
            'Link to Namespace',
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
        'icon-namespace-full-color-80h-proximax-sirius-wallet.svg',
        '',
        {
          create: this.services.buildStructureService(
            'Register',
            true,
            '',
            '',
            AppConfig.routes.createNamespace
          ), extend: this.services.buildStructureService(
            'Extend Duration',
            true,
            '',
            '',
            AppConfig.routes.extendNamespace
          )
          // , renew: this.services.buildStructureService(
          //   'RENEW',
          //   false,
          //   '',
          //   '',
          //   AppConfig.routes.renewNamespace
          // )
        },
        true
      ),

      //Mosaics
      this.services.buildStructureService(
        'Mosaics',
        true,
        'Create digital representations with customized properties',
        'icon-mosaics-full-color-80h-proximax-sirius-wallet.svg',
        '',
        {
          create: this.services.buildStructureService(
            'Create',
            true,
            '',
            '',
            AppConfig.routes.createMosaic
          ), changeSupply: this.services.buildStructureService(
            'Modify Supply',
            true,
            '',
            '',
            AppConfig.routes.MosaicSupplyChange
          ), linkToNamespace: this.services.buildStructureService(
            'Link to Namespace',
            true,
            '',
            '',
            AppConfig.routes.LinkingNamespaceMosaic
          )
          /*  , extend: this.services.buildStructureService(
              'EXTEND DURATION',
              true,
              '',
              '',
              AppConfig.routes.extendMosaics
            )
            , renew: this.services.buildStructureService(
              'RENEW',
              false,
              '',
              '',
              ''
            )*/
        },
        true
      ),

      // SWAP PROCESS
      this.services.buildStructureService(
        'Mainnet Swap',
        true,
        'Swap from NEM to Sirius',
        'icon-swap-process-color-80h-proximax-sirius-wallet.svg',
        '',
        {
          transfer: this.services.buildStructureService(
            'Transfer Assets',
            true,
            '',
            '',
            AppConfig.routes.swapAccountList
          ),
        },
        true,
        ''
      ),

      // Address Book
      this.services.buildStructureService(
        'Address Book',
        true,
        'Assign labels to addresses',
        'icon-address-book-full-color-80h-proximax-sirius-wallet.svg',
        '',
        {
          list: this.services.buildStructureService(
            'List',
            showItems.listContact,
            '',
            '',
            AppConfig.routes.addressBook
          ),
          addContact: this.services.buildStructureService(
            'Add Contacts',
            true,
            '',
            '',
            AppConfig.routes.addContacts
          )
        },
        true
      ),

      // Export Wallet
      this.services.buildStructureService(
        'Wallets',
        true,
        'Manage your wallets',
        'icon-wallet-full-color-80h.svg',
        '',
        {
          changePassword: this.services.buildStructureService(
            'Change Password',
            false,
            '',
            '',
            ''
          ), export: this.services.buildStructureService(
            'Export',
            true,
            '',
            '',
            AppConfig.routes.exportWallet
          ), delete: this.services.buildStructureService(
            'Delete',
            true,
            '',
            '',
            AppConfig.routes.deleteWallet
          )
        },
        true
      ),

      //Transactions Explorer
      this.services.buildStructureService(
        'Transactions Explorer',
        true,
        'Explore all transactions',
        'icon-transaction-explorer-full-color-80h-proximax-sirius-wallet.svg',
        '',
        {
          explorer: this.services.buildStructureService(
            'Explore',
            true,
            '',
            '',
            AppConfig.routes.explorer
          )
        },
        true
      ),

      // Nodes
      this.services.buildStructureService(
        'Nodes',
        true,
        'Add and edit nodes',
        'icon-nodes-full-color-80h-proximax-sirius-wallet.svg',
        '',
        {
          blockchain: this.services.buildStructureService(
            'Blockchain',
            true,
            '',
            '',
            AppConfig.routes.blockchain
          ), storage: this.services.buildStructureService(
            'Storage',
            false,
            '',
            '',
            ''
          ), streaming: this.services.buildStructureService(
            'Streaming',
            false,
            '',
            '',
            ''
          )
        },
        true,
        // 'disable-module'
      ),

      // Notarization
      this.services.buildStructureService(
        'Attestation',
        true,
        'Proof of existence and origination',
        'icon-attestation-full-color-80h-proximax-sirius-wallet.svg',
        '',
        {
          create: this.services.buildStructureService(
            'Attest',
            true,
            '',
            '',
            AppConfig.routes.createApostille
          ),
          audit: this.services.buildStructureService(
            'Audit',
            true,
            '',
            '',
            AppConfig.routes.audiApostille
          )
        },
        true,
        ''
      ),

      // Notifications
      this.services.buildStructureService(
        'Notifications',
        true,
        'Check alerts and information about your accounts',
        'icon-notifications-full-color-80h-proximax-sirius-wallet.svg',
        '',
        {
          view: this.services.buildStructureService(
            'Notifications',
            true,
            '',
            '',
            AppConfig.routes.notification
          ),
        },
        true,
        ''
      ),

      // Voting
      this.services.buildStructureService(
        'Voting',
        true,
        'Create, vote, and view results',
        'icon-voting-full-color-80h-proximax-sirius-wallet.svg',
        '',
        {
          create: this.services.buildStructureService(
            'Create Poll',
            false,
            '',
            '',
            AppConfig.routes.createPoll
          )
          ,
          poll: this.services.buildStructureService(
            'Vote',
            false,
            '',
            '',
            AppConfig.routes.polls
          ),
          view: this.services.buildStructureService(
            'View Results',
            false,
            '',
            '',
            ''
          )
        },
        true,
        'disable-module'
      ),

      //STORAGE
      this.services.buildStructureService(
        'Storage',
        true,
        'Upload and download your files and encrypt them',
        'icon-storage-full-color-80h-proximax-sirius-wallet.svg',
        '',
        {
          myFiles: this.services.buildStructureService(
            'Files',
            false,
            '',
            '',
            AppConfig.routes.myFile,
          ), upload: this.services.buildStructureService(
            'Upload File',
            false,
            '',
            '',
            AppConfig.routes.uploadFile
          ), shareFile: this.services.buildStructureService(
            'Send / Share',
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
        'icon-aggregate-transactions-full-color-80h-proximax-sirius-wallet.svg',
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
        true,
        'disable-module'
      ),

      // Cross-Chain Swaps
      this.services.buildStructureService(
        'Cross-Chain Swaps',
        false,
        'Atomic Cross-Chain Swap between public and private networks',
        'icon-cross-chain-swap-full-color-80h-proximax-sirius-wallet.svg',
        '',
        {
          secretLock: this.services.buildStructureService(
            'Secred Lock',
            false,
            '',
            '',
            ''
          ),
          secretProof: this.services.buildStructureService(
            'Secred Proof',
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
        'Create and manage invoices',
        'icon-invoice-full-color-80h-proximax-sirius-wallet.svg',
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
        true,
        'disable-module'
      ),

      // SUPERCONTRACTS
      this.services.buildStructureService(
        'Supercontracts',
        true,
        'Create and execute logical flows for digital contract obligations',
        'icon-supercontracts-full-color-80h-proximax-sirius-wallet.svg',
        '',
        {
          create: this.services.buildStructureService(
            'Create',
            false,
            '',
            '',
            ''
          ), status: this.services.buildStructureService(
            'Status',
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
        'Chat',
        true,
        'Encrypted live chat',
        'icon-chat-full-color-80h-proximax-sirius-wallet.svg',
        '',
        {
          send: this.services.buildStructureService(
            'Start',
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
        'Encrypted live video streaming',
        'icon-streaming-full-color-80h-proximax-sirius-wallet.svg',
        '',
        {
          start: this.services.buildStructureService(
            'Start',
            false,
            '',
            '',
            ''
          ), schedule: this.services.buildStructureService(
            'Schedule',
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
        'Sirius Gift',
        true,
        'Create a redeemable gift',
        'icon-gift-sirius-full-color-80h-proximax-sirius-wallet.svg',
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
        true,
        'disable-module'
      ),
    ];
  }
}
