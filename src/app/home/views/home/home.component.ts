import { Component, OnInit } from '@angular/core';
import { ServiceModuleService } from "../../../servicesModule/services/service-module.service";
import { AppConfig } from "../../../config/app.config";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  link = AppConfig.routes;
  arrayServices = {};
  description = '';
  keyObject = Object.keys;
  constructor(
    private service: ServiceModuleService
  ) { }

  ngOnInit() {
    //const explorerFile = this.service.structureServices('img-explorer-file', 'File explorer', `File explorer`, '', true);
    //const addNode = this.service.structureServices('img-add-node', 'Nodes', `Add and select node`, '', true);
    const explorerTransaction = this.service.structureServices('icon-transactions-dark-green.svg', 'Transactions', `Search All available transactions`, '', true);
    const voting = this.service.structureServices('icon-voting-dark-green.svg', 'Voting', `Create and vote on polls`, '', true);
    const apostille = this.service.structureServices('icon-notary-dark-green.svg', 'Notary', 'Use notarizations service to create blockchain based notarizations to time stamp, follow and audit file authenticity.', '', true);
    const multisignature = this.service.structureServices('fa fa-user-plus', 'Multisignature and Multi-User Accounts', 'Mutisig accounts are editable on-chain contracts, the most powerful way to secure funds, enable join accounts, and are the foundation of DAOs.', '', false);
    const nameSpace = this.service.structureServices('img-node', 'Namespaces & Subdomains', 'Namespaces are domain names. Each namespaces is unique and authenticates mosaics (assets) issued on it or on its subdomains', '', false);
    const delegatedHarvesting = this.service.structureServices('fa fa-compress', 'Delegated Harvesting', 'Delegated haversting is the feature that allows "mining" even while your account is closed', '', false);
    const mosaics = this.service.structureServices('fa fa-compres', 'Mosaics', 'The mosaics service, are assets that expose additional properties and other features. To be able to create a mosaic, an account must rent at least one root namespace.', '', false);
    const addressBook = this.service.structureServices('icon-directory-dark-green.svg', 'Directory', `Assign labels to addresses to easily keep track of your contacts`, '', true);

    this.arrayServices = {
      //explorerFile: explorerFile,
      explorerTransaction: explorerTransaction,
      //addNode: addNode,
      multisignature: multisignature,
      nameSpace: nameSpace,
      delegatedHarvesting: delegatedHarvesting,
      apostille: apostille,
      mosaics: mosaics,
      voting: voting,
      addressBook: addressBook
    }
  }
}
