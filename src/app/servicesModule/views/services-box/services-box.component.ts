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
            'ACCOUNTS',
            true,
            '',
            '',
            AppConfig.routes.viewAllAccount,
          ), multiSign: this.services.buildStructureService(
            'MULTISIG',
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
        'icon-namespace-full-color-80h-proximax-sirius-wallet.svg',
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
          )
          // , renew: this.services.buildStructureService(
          //   'RENEW',
          //   false,
          //   '',
          //   '',
          //   ''
          // )
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
            'TRANSFER ASSETS',
            true,
            '',
            '',
            AppConfig.routes.nis1AccountList
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
            'LIST',
            showItems.listContact,
            '',
            '',
            AppConfig.routes.addressBook
          ),
          addContact: this.services.buildStructureService(
            'ADD CONTACTS',
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
            'CHANGE PASSWORD',
            false,
            '',
            '',
            ''
          ), export: this.services.buildStructureService(
            'EXPORT',
            true,
            '',
            '',
            AppConfig.routes.exportWallet
          ), delete: this.services.buildStructureService(
            'DELETE',
            true,
            '',
            '',
            AppConfig.routes.deleteWallet
          )
        },
        true
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
            'ATTEST',
            true,
            '',
            '',
            AppConfig.routes.createApostille
          ),
          audit: this.services.buildStructureService(
            'AUDIT',
            true,
            '',
            '',
            AppConfig.routes.audiApostille
          )
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
            'CREATE POLL',
            true,
            '',
            '',
            AppConfig.routes.createPoll
          )
          ,
          poll: this.services.buildStructureService(
            'VOTE',
            true,
            '',
            '',
            AppConfig.routes.polls
          ),
          view: this.services.buildStructureService(
            'VIEW RESULTS',
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
        'icon-transaction-explorer-full-color-80h-proximax-sirius-wallet.svg',
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

      //STORAGE
      this.services.buildStructureService(
        'Storage',
        true,
        'Upload and download your files and encrypt them',
        'icon-storage-full-color-80h-proximax-sirius-wallet.svg',
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
        true,
        // 'disable-module'
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
        false,
        'Atomic cross-chain swap between public and private networks',
        'icon-cross-chain-swap-full-color-80h-proximax-sirius-wallet.svg',
        '',
        {
          secretLock: this.services.buildStructureService(
            'SECRED LOCK',
            false,
            '',
            '',
            ''
          ),
          secretProof: this.services.buildStructureService(
            'SECRED PROOF',
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
        'Add and edit nodes',
        'icon-nodes-full-color-80h-proximax-sirius-wallet.svg',
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
        'Chat',
        true,
        'Encrypted live chat',
        'icon-chat-full-color-80h-proximax-sirius-wallet.svg',
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
        'Create and manage invoices',
        'icon-invoice-full-color-80h-proximax-sirius-wallet.svg',
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
        'Encrypted live video streaming',
        'icon-streaming-full-color-80h-proximax-sirius-wallet.svg',
        '',
        {
         start: this.services.buildStructureService(
            'START',
            false,
            '',
            '',
            ''
          ), schedule: this.services.buildStructureService(
            'SCHEDULE',
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
