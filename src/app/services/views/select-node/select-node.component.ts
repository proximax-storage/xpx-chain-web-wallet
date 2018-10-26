import { Component, OnInit } from '@angular/core';
import { ServiceModuleService } from '../../service-module.service';

@Component({
  selector: 'app-select-node',
  templateUrl: './select-node.component.html',
  styleUrls: ['./select-node.component.scss']
})
export class SelectNodeComponent implements OnInit {
  node: Array<any>;
  nodeSelect: any;

  constructor(private serviceModuleService: ServiceModuleService) { }

  ngOnInit() {


    this.node = JSON.parse(localStorage.getItem('proxi-nodes'))
  }
  optionSelected(nodeSelect) {

    this.nodeSelect = nodeSelect.value;

    this.serviceModuleService.nodeSelected(this.nodeSelect);

  }
}
