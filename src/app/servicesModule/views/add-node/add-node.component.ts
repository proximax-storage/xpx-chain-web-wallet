import { Component, OnInit } from '@angular/core';
import { AppConfig } from "../../../config/app.config";
import { SharedService } from "../../../shared";
import { ServiceModuleService } from "../../../servicesModule/services/service-module.service";

@Component({
  selector: 'app-add-node',
  templateUrl: './add-node.component.html',
  styleUrls: ['./add-node.component.scss']
})
export class AddNodeComponent implements OnInit {

  node = '';
  msgNodeCreated = 'Your node has be created';
  route = { goToExplorer: `/${AppConfig.routes.explorer}` };

  constructor(
    private sharedService: SharedService,
    private serviceModuleService: ServiceModuleService
  ) {
  }

  ngOnInit() {
  }

  saveNode() {
    if (this.node !== '') {
      const dataStorage = this.serviceModuleService.issetNodesStorage();
      const data = { value: this.node, label: this.node };
      if (dataStorage === null) {
        this.setNode([data]);
        return;
      }

      const issetData = dataStorage.find(element => element === this.node);
      if (issetData === undefined) {
        dataStorage.push(data);
        this.setNode(dataStorage);
        return;
      }
    }
  }

  setNode(data) {
    this.serviceModuleService.setNode(data);
    this.node = '';
    this.sharedService.showSuccess('Congratulations!', this.msgNodeCreated);
  }
}
