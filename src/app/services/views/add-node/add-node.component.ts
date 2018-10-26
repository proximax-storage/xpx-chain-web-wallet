import { Component, OnInit } from '@angular/core';
import { AppConfig } from "../../../config/app.config";

@Component({
  selector: 'app-add-node',
  templateUrl: './add-node.component.html',
  styleUrls: ['./add-node.component.scss']
})
export class AddNodeComponent implements OnInit {

  node = '';
  route = { goToExplorer: `/${AppConfig.routes.explorer}` };
  constructor() {
  }

  ngOnInit() {
  }

  saveNode() {
    if (this.node !== '') {
      const nameItem = 'proxi-nodes';
      let dataStorage = JSON.parse(localStorage.getItem(nameItem));
      if (dataStorage === null) {
        const data = {
          value: this.node,
          label: this.node
        };
        localStorage.setItem(nameItem, JSON.stringify([data]));
        dataStorage = JSON.parse(localStorage.getItem(nameItem));
        this.node = '';
        return;
      }

      const issetData = dataStorage.find(element => element === this.node);
      if (issetData === undefined) {
        const data = {
          value: this.node,
          label: this.node
        };
        dataStorage.push(data);
        localStorage.setItem(nameItem, JSON.stringify(dataStorage));
      }
      this.node = '';
      return;
    }
  }
}
