import { Component, OnInit } from '@angular/core';
import { AppConfig } from "../../../config/app.config";
import { SharedService } from "../../../shared";
import { NodeService } from "../../../servicesModule/services/node.service";

@Component({
  selector: 'app-add-node',
  templateUrl: './add-node.component.html',
  styleUrls: ['./add-node.component.scss']
})
export class AddNodeComponent implements OnInit {

  ngMNode = '';
  msgNodeCreated = 'Your node has be created';
  route = { goToExplorer: `/${AppConfig.routes.explorer}` };

  constructor(
    private sharedService: SharedService,
    private nodeService: NodeService
  ) {
  }

  ngOnInit() {
  }

  /**
   * Verify and save node array
   *
   * @returns
   * @memberof AddNodeComponent
   */
  saveNode() {
    if (this.ngMNode !== '') {
      const dataStorage = this.nodeService.existArrayNodes();
      const data = { value: this.ngMNode, label: this.ngMNode };
      if (dataStorage === null) {
        this.setNode([data]);
        return;
      }

      const issetData = dataStorage.find(element => element.value === this.ngMNode);

      if (issetData === undefined) {
        dataStorage.push(data);
        this.setNode(dataStorage);
        return;
      }

      this.sharedService.showError('Node repeated', `The '${this.ngMNode}' node already exists`);
    }
  }


  /**
   * Set array node
   *
   * @param {any} data
   * @memberof AddNodeComponent
   */
  setNode(data) {
    this.ngMNode = '';
    this.nodeService.setArrayNode(data);
    this.sharedService.showSuccess('Congratulations!', this.msgNodeCreated);
  }
}
