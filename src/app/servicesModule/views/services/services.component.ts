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

    const explorerTransaction = this.service.structureServices('icon-transactions-dark-green.svg', 'Explorer', `Search All available transactions`,
      {
        createPoll: this.structureServiceRoute('Explorer', `/${AppConfig.routes.explorer}`)
      }, true
    );

    const voting = this.service.structureServices('fa fa-4x fa-pie-chart', 'Voting', `Create and vote on polls`,
      {
        createPoll: this.structureServiceRoute('Create a Poll', `/${AppConfig.routes.createPoll}`),
        polls: this.structureServiceRoute('Vote and See Polls', `/${AppConfig.routes.polls}`),
      }, false
    );

    const apostille = this.service.structureServices('img-apostille', 'Apostille',
      'Use Apostille service to create blockchain based notarizations to time stamp, follow and audit file authenticity.',
      {
        addApostille: this.structureServiceRoute('Apostille create', `/${AppConfig.routes.apostille}`),
        audiApostille: this.structureServiceRoute('Apostille audit', `/${AppConfig.routes.audiApostille}`),
      }, false
    );

    const nameSpace = this.service.structureServices('icon-namespaces-dark-green.svg', 'Namespaces & Subnamespaces',
      'Namespaces are domain names. Each namespaces is unique and authenticates mosaics (assets).',
      {
        createNamespace: this.structureServiceRoute('Create Namespaces', `/${AppConfig.routes.createNamespace}`),
        linkNamespaceToMosaic: this.structureServiceRoute('Linking to namespace to a mosaic', `/${AppConfig.routes.LinkingNamespaceMosaic}`),
        renewNamespace: this.structureServiceRoute('Renovate namespace', `/${AppConfig.routes.renovateNamespace}`),
        linkTheNamespaceToAnAddress: this.structureServiceRoute('Link the namespace to an address', `/${AppConfig.routes.linkTheNamespaceToAnAddress}`),
      }, true
    );

    const mosaics = this.service.structureServices('icon-mosaics-dark-green.svg', 'Mosaics',
      'The mosaics service, are assets that expose additional properties and other features.',
      {
        createMosaic: this.structureServiceRoute('Create mosaic', `/${AppConfig.routes.createMosaic}`),
        editMosaic: this.structureServiceRoute('Mosaic supply change', `/${AppConfig.routes.MosaicSupplyChange}`),
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
        manageAddress: this.structureServiceRoute('Directory', `/${AppConfig.routes.addressBook}`),
      }, true
    );


    this.services = {
      //explorerFile: explorerFile,
      //addNode: addNode,
      multisignature: multisignature,
      explorerTransaction: explorerTransaction,
      nameSpace: nameSpace,
      mosaics: mosaics,
      delegatedHarvesting: delegatedHarvesting,
      apostille: apostille,
      changellyInstantExchange: changellyInstantExchange,
      voting: voting,
      addressBook: addressBook,
      storage: storage
    }
  }
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
