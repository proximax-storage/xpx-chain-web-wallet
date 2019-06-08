import { Component, OnInit } from '@angular/core';
import { AppConfig } from "../../../config/app.config";
import { SharedService } from "../../../shared";
import { NodeService } from "../../services/node.service";

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
      this.nodeService.addNode(this.ngMNode, true, this.msgNodeCreated);
      this.ngMNode = '';
    }
  }
}
