import { Component, OnInit } from '@angular/core';
import { AppConfig } from "../../../config/app.config";
import { ServiceModuleService } from "../../services/service-module.service";

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss']
})
export class ServicesComponent implements OnInit {
  keyObject = Object.keys;
  coin = 'XPX';
  services: Service;
  constructor(
    private service: ServiceModuleService
  ) { }

  ngOnInit() {
    const account = this.service.structureServices(
      'icon-account-green.svg',
      'ACCOUNT',
      ``,
      {
        linkTheNamespaceToAnAddress: this.structureServiceRoute('Alias to address', `/${AppConfig.routes.linkTheNamespaceToAnAddress}`)
      }, true
    );

    const multisignature = this.service.structureServices(
      'fa fa-user-plus',
      'Multisignature and Multi-User Accounts',
      'Mutisig accounts are editable on-chain contracts, the most powerful way to secure funds, enable join accounts, and are the foundation of DAOs.',
      {
        convertAccountToMultisig: this.structureServiceRoute('Convert an account to multisig', `/${AppConfig.routes.createMultisignature}`),
        editAnExistingContract: this.structureServiceRoute('Edit an existing contract', `/${AppConfig.routes.editMultisignatureContract}`),
        signMultisigTransactions: this.structureServiceRoute('Sign multisig transactions', `/${AppConfig.routes.signMultiSigTransactions}`),
      }, false
    );

    const storage = this.service.structureServices('img-explorer-file', 'Storage', `Storage`,
      {
        explorerFile: this.structureServiceRoute('Storage', `/${AppConfig.routes.storage}`)
      }, false
    );

    const explorerTransaction = this.service.structureServices(
      'icon-transactions-dark-green.svg',
      'Transactions explorer',
      `Search all available transactions`,
      {
        createPoll: this.structureServiceRoute('Explorer all transactions', `/${AppConfig.routes.explorer}`)
      }, true
    );

    const voting = this.service.structureServices(
      'icon-voting-dark-green.svg',
      'Voting',
      `Create polls and vote`,
      {
        createPoll: this.structureServiceRoute('Create a poll', `/${AppConfig.routes.createPoll}`),
        polls: this.structureServiceRoute('Vote and see polls', `/${AppConfig.routes.polls}`),
      }, false
    );

    const apostille = this.service.structureServices('icon-notary-dark-green.svg', 'Apostille',
      'Verify and authenticate documents',
      {
        addApostille: this.structureServiceRoute('Create New', `/${AppConfig.routes.apostille}`),
        audiApostille: this.structureServiceRoute('Audit', `/${AppConfig.routes.audiApostille}`),
      }, false
    );

    const namespace = this.service.structureServices('icon-namespaces-dark-green.svg', 'Namespaces & Sub-namespaces',
      'Namespaces are domain names. Each namespaces is unique and authenticates mosaics (assets).',
      {
        createNamespace: this.structureServiceRoute('Create', `/${AppConfig.routes.createNamespace}`),
        renewNamespace: this.structureServiceRoute('Renew', `/${AppConfig.routes.renovateNamespace}`)
      }, true
    );

    const mosaics = this.service.structureServices('icon-mosaics-dark-green.svg', 'Mosaics',
      'The mosaics service, are assets that expose additional properties and other features.',
      {
        createMosaic: this.structureServiceRoute('Create', `/${AppConfig.routes.createMosaic}`),
        editMosaic: this.structureServiceRoute('Change Supply', `/${AppConfig.routes.MosaicSupplyChange}`),
        linkNamespaceToMosaic: this.structureServiceRoute('ALIAS TO NAMESPACE', `/${AppConfig.routes.LinkingNamespaceMosaic}`),
      }, true
    );


    const delegatedHarvesting = this.service.structureServices('fa fa-compress', 'Delegated Harvesting',
      'Delegated haversting is the feature that allows "mining" even while your account is closed',
      {}, false
    );

    const changellyInstantExchange = this.service.structureServices('fa fa-compress', 'Changelly Instant Exchange',
      `Use the changelly widget to buy ${this.coin} at the best rates!`,
      {}, false
    );

    const addressBook = this.service.structureServices('icon-directory-dark-green.svg', 'Directory',
      `Assign labels to addresses to easily keep track of your contacts`,
      {
        manageAddress: this.structureServiceRoute('Open Directory', `/${AppConfig.routes.addressBook}`),
      }, true
    );


    this.services = {
      //explorerFile: explorerFile,
      //addNode: addNode,
      account: account,
      multisignature: multisignature,
      explorerTransaction: explorerTransaction,
      nameSpace: namespace,
      mosaics: mosaics,
      delegatedHarvesting: delegatedHarvesting,
      apostille: apostille,
      changellyInstantExchange: changellyInstantExchange,
      voting: voting,
      addressBook: addressBook,
      storage: storage
    }
  }

  /**
   *
   *
   * @param {*} name
   * @param {*} link
   * @returns
   * @memberof ServicesComponent
   */
  structureServiceRoute(name, link) {
    return {
      name: name,
      link: link
    }
  }

}

export interface Service {
  //explorerFile: ItemService;
  //addNode: ItemService;
  account: ItemService;
  multisignature: ItemService;
  explorerTransaction: ItemService;
  nameSpace: ItemService;
  mosaics: ItemService;
  delegatedHarvesting: ItemService;
  apostille: ItemService;
  changellyInstantExchange: ItemService;
  addressBook: ItemService;
  voting: ItemService;
  storage: ItemService;
}

export interface ItemService {
  icon: string;
  title: string;
  text: string;
  route: object;
  show: boolean;
}
