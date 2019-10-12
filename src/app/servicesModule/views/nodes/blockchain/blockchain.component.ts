import { Component, OnInit } from '@angular/core';
import { HeaderServicesInterface } from 'src/app/servicesModule/services/services-module.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NodeService } from 'src/app/servicesModule/services/node.service';
import { environment } from 'src/environments/environment';
import { DataBridgeService } from 'src/app/shared/services/data-bridge.service';
import { SharedService } from 'src/app/shared/services/shared.service';

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
    private sharedService : SharedService
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
    this.arrayNodes=[];
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
    this.dataBridgeService.reconnect();
    this.sharedService.showSuccess('','Update node');
  }

  changeNode() {
    // console.log('change node');

  }
}
