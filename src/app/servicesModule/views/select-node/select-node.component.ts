import { Component, OnInit } from '@angular/core';
import { ServiceModuleService } from '../../services/service-module.service';
import { SharedService } from "../../../shared";

@Component({
  selector: 'app-select-node',
  templateUrl: './select-node.component.html',
  styleUrls: ['./select-node.component.scss']
})
export class SelectNodeComponent implements OnInit {
  node: Array<any>;
  nodeSelect: any;

  constructor(
    private serviceModuleService: ServiceModuleService,
    private sharedService: SharedService
  ) { }

  ngOnInit() {
    this.node = JSON.parse(localStorage.getItem('proxi-nodes'))
  }
  optionSelected(nodeSelect) {
    this.nodeSelect = nodeSelect.value;
    this.serviceModuleService.nodeSelected(this.nodeSelect);
    this.sharedService.showInfo('Node selected', this.nodeSelect);
  }
}
