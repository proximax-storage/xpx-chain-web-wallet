import { Component, OnInit } from '@angular/core';
import { NodeService } from '../../services/node.service';
import { SharedService } from '../../../shared/services/shared.service';

@Component({
  selector: 'app-select-node',
  templateUrl: './select-node.component.html',
  styleUrls: ['./select-node.component.scss']
})
export class SelectNodeComponent implements OnInit {
  nodes: Array<any>;
  nodeSelect: any;

  constructor(
    private nodeService: NodeService,
    private sharedService: SharedService
  ) { }

  ngOnInit() {
    this.nodes = this.nodeService.getAllNodes();
  }

  optionSelected(nodeSelect: { value: any; }) {
    this.nodeSelect = nodeSelect.value;
    this.nodeService.addNewNodeSelected(this.nodeSelect);
    this.sharedService.showInfo('Node selected', this.nodeSelect);
  }
}
