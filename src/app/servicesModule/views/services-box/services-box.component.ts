import { Component, OnInit } from '@angular/core';
import { AppConfig } from '../../../config/app.config';
import { ServicesModuleService, StructureService } from '../../services/services-module.service';
import { environment } from '../../../../environments/environment';

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
  disableModules = environment.activeModulesBox;

  constructor(
    private services: ServicesModuleService
  ) { }

  ngOnInit() {
    const contacts = this.services.getBooksAddress();
    const showItems = {
      listContact: (contacts !== null && contacts !== undefined && contacts.length > 0) ? true : false
    };

    // Accounts
    const accounts = {
      title: 'Accounts',
      show: true,
      description: 'Manage your accounts',
      image: 'icon-accounts-full-color-80h-proximax-sirius-wallet.svg',
      route: '',
      children: {
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
        ), multiSign2: this.services.buildStructureService(
          'Multi-level multisig account (MLMA)',
          true,
          '',
          '',
          AppConfig.routes.MultisigMultiLevel,
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
      viewChildren: true,
      className: ''
    };

    // Namespaces
    const namespaces = {
      title: 'Namespaces',
      show: true,
      description: 'Create namespaces and sub-namespaces',
      image: 'icon-namespace-full-color-80h-proximax-sirius-wallet.svg',
      route: '',
      children: {
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
      },
      viewChildren: true,
      className: ''
    };

    // Mosaics
    const mosaics = {
      title: 'Mosaics',
      show: true,
      description: 'Create digital representations with customized properties',
      image: 'icon-mosaics-full-color-80h-proximax-sirius-wallet.svg',
      route: '',
      children: {
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
      },
      viewChildren: true,
      className: ''
    };

    // SWAP PROCESS
    const swapProcess = {
      title: 'Mainnet Swap',
      show: true,
      description: 'Swap from NEM to Sirius',
      image: 'icon-swap-process-color-80h-proximax-sirius-wallet.svg',
      route: '',
      children: {
        transfer: this.services.buildStructureService(
          'Transfer Assets',
          true,
          '',
          '',
          AppConfig.routes.swapAccountList
        ),
      },
      viewChildren: true,
      className: ''
    };

    // Address Book
    const addressBook = {
      title: 'Address Book',
      show: true,
      description: 'Assign labels to addresses',
      image: 'icon-address-book-full-color-80h-proximax-sirius-wallet.svg',
      route: '',
      children: {
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
      viewChildren: true,
      className: ''
    };

    // Export wallet
    const exportWallet = {
      title: 'Wallets',
      show: true,
      description: 'Manage your wallets',
      image: 'icon-wallet-full-color-80h.svg',
      route: '',
      children: {
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
      viewChildren: true,
      className: ''
    };

    // Transactions Explorer
    const transactionExplorer = {
      title: 'Transactions',
      show: true,
      description: 'Explorer all transactions',
      image: 'icon-transaction-explorer-full-color-80h-proximax-sirius-wallet.svg',
      route: '',
      children: {
        explorer: this.services.buildStructureService(
          'Explorer',
          true,
          '',
          '',
          AppConfig.routes.explorer
        ),
        partial: this.services.buildStructureService(
          'Partial',
          true,
          '',
          '',
          AppConfig.routes.partial
        )
      },
      viewChildren: true,
      className: ''
    };

    // Nodes
    const nodes = {
      title: 'Nodes',
      show: true,
      description: 'Add and edit nodes',
      image: 'icon-nodes-full-color-80h-proximax-sirius-wallet.svg',
      route: '',
      children: {
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
      viewChildren: true,
      className: ''
    };

    // Notarization
    const notarization = {
      title: 'Attestation',
      show: true,
      description: 'Proof of existence and origination',
      image: 'icon-attestation-full-color-80h-proximax-sirius-wallet.svg',
      route: '',
      children: {
        create: this.services.buildStructureService(
          'Attest',
          this.disableModules.notarization.attest,
          '',
          '',
          AppConfig.routes.createApostille
        ),
        audit: this.services.buildStructureService(
          'Audit',
          this.disableModules.notarization.audit,
          '',
          '',
          AppConfig.routes.audiApostille
        )
      },
      viewChildren: this.disableModules.notarization.viewChildrenParam,
      className: this.disableModules.notarization.classNameParam
    };

    // Notifications
    const notifications = {
      title: 'Notifications',
      show: true,
      description: 'Check alerts and information about your accounts',
      image: 'icon-notifications-full-color-80h-proximax-sirius-wallet.svg',
      route: '',
      children: {
        view: this.services.buildStructureService(
          'Notifications',
          true,
          '',
          '',
          AppConfig.routes.notification
        ),
      },
      viewChildren: true,
      className: ''
    };

    // Voting
    const voting = {
      title: 'Voting',
      show: true,
      description: 'Create, vote, and view results',
      image: 'icon-voting-full-color-80h-proximax-sirius-wallet.svg',
      route: '',
      children: {
        create: this.services.buildStructureService(
          'Create Poll',
          this.disableModules.voting.createPoll,
          '',
          '',
          AppConfig.routes.createPoll
        )
        ,
        poll: this.services.buildStructureService(
          'Vote',
          this.disableModules.voting.vote,
          '',
          '',
          AppConfig.routes.polls
        ),
        view: this.services.buildStructureService(
          'View Results',
          this.disableModules.voting.viewResult,
          '',
          '',
          ''
        )
      },
      viewChildren: this.disableModules.voting.viewChildrenParam,
      className: this.disableModules.voting.classNameParam
    };

    // storage
    const storage = {
      title: 'Storage',
      show: true,
      description: 'Upload and download your files and encrypt them',
      image: 'icon-storage-full-color-80h-proximax-sirius-wallet.svg',
      route: '',
      children: {
        myFiles: this.services.buildStructureService(
          'Files',
          this.disableModules.storage.files,
          '',
          '',
          AppConfig.routes.myFile,
        ), upload: this.services.buildStructureService(
          'Upload File',
          this.disableModules.storage.uploadFiles,
          '',
          '',
          AppConfig.routes.uploadFile
        ), shareFile: this.services.buildStructureService(
          'Send / Share',
          this.disableModules.storage.sendShare,
          '',
          '',
          ''
        )
      },
      viewChildren: this.disableModules.storage.viewChildrenParam,
      className: this.disableModules.storage.classNameParam
    };

    // gift
    const gift = {
      title: 'Sirius Gift',
      show: true,
      description: 'Create a redeemable gift',
      image: 'icon-gift-sirius-full-color-80h-proximax-sirius-wallet.svg',
      route: '',
      children: {
        create: this.services.buildStructureService(
          'Create',
          true,
          '',
          '',
          AppConfig.routes.createGift
        ),
        redeem: this.services.buildStructureService(
          'Redeem',
          true,
          '',
          '',
          AppConfig.routes.redeemGiftCard
        )
      },
      viewChildren: true,
      className: ''
    };

    // Agregate transactions
    const aggregateTxn = {
      title: 'Aggregate Transactions',
      show: true,
      description: 'Merge multiple transactions into one',
      image: 'icon-aggregate-transactions-full-color-80h-proximax-sirius-wallet.svg',
      route: '',
      children: {
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
      viewChildren: true,
      className: 'disable-module'
    };

    // Cross-Chain Swaps
    const crossChainSwaps = {
      title: 'Cross-Chain Swaps',
      show: false,
      description: 'Atomic Cross-Chain Swap between public and private networks',
      image: 'icon-cross-chain-swap-full-color-80h-proximax-sirius-wallet.svg',
      route: '',
      children: {
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
      viewChildren: true,
      className: 'disable-module'
    };

    // Invoice
    const invoice = {
      title: 'Invoice',
      show: true,
      description: 'Create and manage invoices',
      image: 'icon-invoice-full-color-80h-proximax-sirius-wallet.svg',
      route: '',
      children: {
        create: this.services.buildStructureService(
          'Create',
          false,
          '',
          '',
          ''
        )
      },
      viewChildren: true,
      className: 'disable-module'
    };

    // SUPERCONTRACTS
    const supercontracts = {
      title: 'Supercontracts',
      show: true,
      description: 'Create and execute logical flows for digital contract obligations',
      image: 'icon-supercontracts-full-color-80h-proximax-sirius-wallet.svg',
      route: '',
      children: {
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
      viewChildren: true,
      className: 'disable-module'
    };

    // Message
    const message = {
      title: 'Chat',
      show: true,
      description: 'Encrypted live chat',
      image: 'icon-chat-full-color-80h-proximax-sirius-wallet.svg',
      route: '',
      children: {
        send: this.services.buildStructureService(
          'Start',
          false,
          '',
          '',
          ''
        )
      },
      viewChildren: true,
      className: 'disable-module'
    };

    // Video Conferencing
    const videoConferencing = {
      title: 'Video Conferencing',
      show: true,
      description: 'Encrypted live video streaming',
      image: 'icon-streaming-full-color-80h-proximax-sirius-wallet.svg',
      route: '',
      children: {
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
      viewChildren: true,
      className: 'disable-module'
    };


    // Services List
    this.servicesList = [
      this.services.buildServiceBox(accounts),
      this.services.buildServiceBox(namespaces),
      this.services.buildServiceBox(mosaics),
      this.services.buildServiceBox(swapProcess),
      this.services.buildServiceBox(addressBook),
      this.services.buildServiceBox(exportWallet),
      this.services.buildServiceBox(transactionExplorer),
      this.services.buildServiceBox(nodes),
      this.services.buildServiceBox(notarization),
      this.services.buildServiceBox(notifications),
      this.services.buildServiceBox(voting),
      this.services.buildServiceBox(storage),
      this.services.buildServiceBox(gift),
      this.services.buildServiceBox(aggregateTxn),
      this.services.buildServiceBox(crossChainSwaps),
      this.services.buildServiceBox(invoice),
      this.services.buildServiceBox(supercontracts),
      this.services.buildServiceBox(message),
      this.services.buildServiceBox(videoConferencing)
    ];
  }
}
