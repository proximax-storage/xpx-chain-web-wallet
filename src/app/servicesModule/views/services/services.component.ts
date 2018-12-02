import { Component, OnInit } from '@angular/core';
import { AppConfig } from "../../../config/app.config";
import { ServiceModuleService } from "../../../servicesModule/services/service-module.service";

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

    // const addNode = this.service.structureServices('img-add-node', 'Nodes', `Add and select node`,
    //   {
    //     createPo    // const addNode = this.service.structureServices('img-add-node', 'Nodes', `Add and select node`,
    //     //   {
    //     //     createPoll: this.structureServiceRoute('Add node', `/${AppConfig.routes.addNode}`),
    //     //     selectNode: this.structureServiceRoute('Select node', `/${AppConfig.routes.selectNode}`)
    //     //   }, true
    //     // );ll: this.structureServiceRoute('Add node', `/${AppConfig.routes.addNode}`),
    //     selectNode: this.structureServiceRoute('Select node', `/${AppConfig.routes.selectNode}`)
    //   }, true
    // );

    const explorerFile = this.service.structureServices('img-explorer-file', 'File explorer', `File explorer`,
      {
        explorerFile: this.structureServiceRoute('File explorer', `/${AppConfig.routes.explorerFile}`)
      }, true
    );

    const explorerTransaction = this.service.structureServices('img-transaction', 'Transaction explorer', `Explorer transaction`,
      {
        createPoll: this.structureServiceRoute('Transaction explorer', `/${AppConfig.routes.explorer}`)
      }, true
    );

    const voting = this.service.structureServices('fa fa-4x fa-pie-chart', 'Voting', `Create and vote on polls`,
      {
        createPoll: this.structureServiceRoute('Create a Poll', `/${AppConfig.routes.createPoll}`),
        polls: this.structureServiceRoute('Vote and See Polls', `/${AppConfig.routes.polls}`),
      }, true
    );

    const apostille = this.service.structureServices('img-apostille', 'Apostille',
      'Use Apostille service to create blockchain based notarizations to time stamp, follow and audit file authenticity.',
      {
        addApostille: this.structureServiceRoute('Apostille create', `/${AppConfig.routes.apostille}`),
        audiApostille: this.structureServiceRoute('Apostille audit', `/${AppConfig.routes.audiApostille}`),
      }, true
    );

    const multisignature = this.service.structureServices('fa fa-user-plus', 'Multisignature and Multi-User Accounts',
      'Mutisig accounts are editable on-chain contracts, the most powerful way to secure funds, enable join accounts, and are the foundation of DAOs.',
      {
        convertAccountToMultisig: this.structureServiceRoute('Convert an account to multisig', ''),
        editAnExistingContract: this.structureServiceRoute('Edit an existing contract', ''),
        signMultisigTransactions: this.structureServiceRoute('Sign multisig transactions', ''),
      }, false
    );

    const nameSpace = this.service.structureServices('img-node', 'Namespaces & Subdomains',
      'Namespaces are domain names. Each namespaces is unique and authenticates mosaics (assets) issued on it or on its subdomains',
      {
        createNamespace: this.structureServiceRoute('Create namespace', ''),
        renewNamespace: this.structureServiceRoute('Renew namespace', '')
      }, false
    );

    const delegatedHarvesting = this.service.structureServices('fa fa-compress', 'Delegated Harvesting',
      'Delegated haversting is the feature that allows "mining" even while your account is closed',
      {}, false
    );

    const mosaics = this.service.structureServices('fa fa-compres', 'Mosaics',
      'The mosaics service, are assets that expose additional properties and other features. To be able to create a mosaic, an account must rent at least one root namespace.',
      {}, false
    );

    const changellyInstantExchange = this.service.structureServices('fa fa-compress', 'Changelly Instant Exchange',
      `Use the changelly widget to buy ${this.coin} at the best rates!`,
      {}, false
    );

    const addressBook = this.service.structureServices('fa fa-address-card', 'Address book',
      `Assign labels to addresses to easily keep track of your contacts`,
      {
        manageAddress: this.structureServiceRoute('Manage address book', `/${AppConfig.routes.addressBook}`),
      }, true
    );


    this.services = {
      //explorerFile: explorerFile,
      explorerTransaction: explorerTransaction,
      //addNode: addNode,
      //multisignature: multisignature,
      nameSpace: nameSpace,
      delegatedHarvesting: delegatedHarvesting,
      apostille: apostille,
      mosaics: mosaics,
      changellyInstantExchange: changellyInstantExchange,
      voting: voting,
      addressBook: addressBook
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
  explorerTransaction: ItemService;
  //multisignature: ItemService;
  nameSpace: ItemService;
  delegatedHarvesting: ItemService;
  apostille: ItemService;
  mosaics: ItemService;
  changellyInstantExchange: ItemService;
  addressBook: ItemService;
  voting: ItemService;
}

export interface ItemService {
  icon: string;
  title: string;
  text: string;
  route: object;
  show: boolean;
}
