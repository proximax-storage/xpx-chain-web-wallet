import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { HeaderServicesInterface } from '../../../../servicesModule/services/services-module.service';
import { NodeService } from '../../../../servicesModule/services/node.service';
import { environment } from '../../../../../environments/environment';
import { DataBridgeService } from '../../../../shared/services/data-bridge.service';
import { SharedService } from '../../../../shared/services/shared.service';
import { NemProviderService } from 'src/app/swap/services/nem-provider.service';
import { Address } from 'tsjs-xpx-chain-sdk';
import { WalletService } from 'src/app/wallet/services/wallet.service';
import { ProximaxProvider } from 'src/app/shared/services/proximax.provider';
import { MosaicService } from 'src/app/servicesModule/services/mosaic.service';
import { NamespacesService } from 'src/app/servicesModule/services/namespaces.service';
import { TransactionsService } from 'src/app/transactions/services/transactions.service';
import { DashboardService } from 'src/app/dashboard/services/dashboard.service';

@Component({
  selector: 'app-blockchain',
  templateUrl: './blockchain.component.html',
  styleUrls: ['./blockchain.component.css']
})
export class BlockchainComponent implements OnInit {

  paramsHeader: HeaderServicesInterface = {
    moduleName: 'Nodes',
    componentName: 'Blockchain'
  };
  // arrayNodes: Array<object> = [{
  //   value: '',
  //   label: 'Select node',
  //   selected: true,
  //   disabled: false
  // }];

  arrayNodes: Array<object> = []
  nodeForm: FormGroup;
  getNodeSelected: string;
  constructor(
    private fb: FormBuilder,
    private nodeService: NodeService,
    private dataBridgeService: DataBridgeService,
    private sharedService: SharedService,
    private walletService: WalletService,
    private nemProvider: NemProviderService,
    private proximaxProvider: ProximaxProvider,
    private transactionService: TransactionsService,
    private namespaces: NamespacesService,
    private mosaicService: MosaicService,
    private dashboardService: DashboardService
  ) { }

  ngOnInit() {


    this.getNodeSelected = `${environment.protocol}://${this.nodeService.getNodeSelected()}`
    this.createForm();
    this.getAllNodes();

  }


  /**
    * Get Block ws
    * @memberof BlockchainComponent
    */
  getBlock() {
    this.dataBridgeService.getBlock().subscribe(block => {
      this.nodeForm.get('blockHeigh').patchValue(block)
    })
  }
  /**
    * Get all nodes
    * @memberof BlockchainComponent
    */
  getAllNodes() {
    this.arrayNodes = [];
    // const listNodeStorage = Json.
    const listNodeStorage: any = this.nodeService.getAllNodes();


    // environment.protocol + "://" + `${this.nodeService.getNodeSelected()}`
    if (listNodeStorage.length > 0) {
      for (let element of listNodeStorage) {
        this.arrayNodes.push({
          label: `${environment.protocol}://${element.label}`,
          value: element.value,
          disabled: Boolean(`${environment.protocol}://${element.label}` === `${environment.protocol}://${this.nodeService.getNodeSelected()}`),
          isDefault: element.isDefault
        })
      }
    }
  }
  createForm() {
    //Form namespace default
    this.nodeForm = this.fb.group({
      nodeSelect: [this.getNodeSelected],
      blockHeigh: ['0'],
      customNode: ['', [
        Validators.minLength(6),
        Validators.maxLength(10)
      ]],

    });
    this.getBlock();
  }


  nodeSelect(event) {
    this.nodeService.addNewNodeSelected(event.value);
    this.nodeForm.get('nodeSelect').patchValue(`${environment.protocol}://${this.nodeService.getNodeSelected()}`)
    // this.getBlock();
    this.getAllNodes();
    this.dashboardService.destroySubscription();
    this.dataBridgeService.reconnect();
    this.nemProvider.validaTransactionsSwap();
    const address: Address[] = [];
    for (let account of this.walletService.currentWallet.accounts) {
      address.push(this.proximaxProvider.createFromRawAddress(account.address));
    }

    this.mosaicService.getMosaicXPX();
    this.namespaces.searchNamespacesFromAccounts(address);
    this.transactionService.searchAccountsInfo(this.walletService.currentWallet.accounts);
    this.dataBridgeService.searchBlockInfo();
    this.sharedService.showSuccess('', 'Node Updated');
  }

  changeNode() {
    // console.log('change node');

  }
}
